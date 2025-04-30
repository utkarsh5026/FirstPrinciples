# Redis Backup and Restore: From First Principles

Redis is an in-memory data structure store that's commonly used as a database, cache, and message broker. Because Redis primarily operates in memory, having robust backup and restore procedures is crucial for data persistence and disaster recovery. Let's explore this topic from first principles.

## 1. Understanding Redis Data Persistence

Before diving into backup and restore processes, we need to understand how Redis persists data in the first place.

Redis offers two primary persistence mechanisms:

### RDB (Redis Database)

RDB creates point-in-time snapshots of your dataset at specified intervals.

Think of RDB like taking a photograph of your entire database at specific moments. The photograph captures everything exactly as it was at that instant, but misses anything that happens between photographs.

```
# In redis.conf, configure RDB snapshots
save 900 1    # Save if at least 1 key changes in 900 seconds (15 minutes)
save 300 10   # Save if at least 10 keys change in 300 seconds (5 minutes)
save 60 10000 # Save if at least 10,000 keys change in 60 seconds
```

When these conditions are met, Redis automatically creates a `dump.rdb` file containing the dataset snapshot.

### AOF (Append Only File)

AOF logs every write operation received by the server, allowing you to replay these operations when restarting the server.

Think of AOF like a detailed journal where Redis writes down every single change that happens. It's more comprehensive than RDB but can grow larger over time.

```
# In redis.conf, configure AOF
appendonly yes
appendfsync everysec  # Options: always, everysec, no
```

The `appendfsync` parameter determines how often Redis writes operations to the AOF file:

* `always`: Most secure but slowest (writes after every command)
* `everysec`: Good compromise (writes once per second)
* `no`: Fastest but least secure (OS decides when to write)

## 2. Backup Principles

Now that we understand persistence, let's examine the principles behind Redis backups.

### 2.1. Types of Backups

#### Physical Backups

Physical backups involve copying the actual persistence files (RDB and/or AOF). These are straightforward but must be handled carefully to ensure consistency.

#### Logical Backups

Logical backups involve extracting the data from Redis using commands like `SAVE` or tools like `redis-cli`. These backups represent the logical structure of the data rather than physical files.

### 2.2. Backup Consistency

When backing up Redis, we need to ensure the backup is consistent (represents a valid state of the database).

For RDB files, this is simple as they represent a consistent snapshot at a point in time. For AOF files, consistency is more complex as they continuously log operations.

## 3. Redis Backup Methods

Let's explore practical backup methods with examples:

### 3.1. Using Redis Commands

#### SAVE Command

The `SAVE` command creates an RDB snapshot synchronously, blocking the Redis server until complete.

```
127.0.0.1:6379> SAVE
OK
```

This is simple but can cause downtime in production environments because Redis can't process other commands while saving.

#### BGSAVE Command

The `BGSAVE` command creates an RDB snapshot in the background, allowing Redis to continue serving requests.

```
127.0.0.1:6379> BGSAVE
Background saving started
```

Redis forks a child process to create the snapshot while the parent process continues serving clients. This is much more suitable for production use.

### 3.2. Automatic RDB Snapshots

Redis can be configured to automatically create RDB snapshots based on time and change thresholds as shown earlier in the persistence section.

### 3.3. Using redis-cli for Logical Backups

We can create a logical backup using `redis-cli`:

```bash
redis-cli --rdb /path/to/backup.rdb
```

This instructs Redis to initiate a `BGSAVE` and stream the RDB file to the specified location.

For specific keys or databases:

```bash
# Backup specific keys
redis-cli -h localhost -p 6379 KEYS "user:*" > user_keys.txt
redis-cli -h localhost -p 6379 -n 0 --csv DUMP key1 key2 > keys_dump.csv

# Backup using SCAN for large datasets (better than KEYS)
redis-cli -h localhost -p 6379 --scan --pattern "user:*" > user_keys.txt
```

### 3.4. Physical Backup of Persistence Files

You can directly copy the RDB and AOF files when Redis creates them. However, this requires careful handling to ensure consistency.

```bash
# Example of copying RDB file
cp /var/lib/redis/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb

# Example of copying AOF file
cp /var/lib/redis/appendonly.aof /backup/redis-aof-backup-$(date +%Y%m%d).aof
```

To ensure consistency, you have two main approaches:

1. **Stop Redis before backup** : Safe but causes downtime

```bash
   redis-cli SHUTDOWN SAVE
   cp /var/lib/redis/dump.rdb /backup/
   # Restart Redis afterward
```

1. **Use BGSAVE and wait for completion** : No downtime, but requires monitoring

```bash
   redis-cli BGSAVE
   # Wait for BGSAVE to complete
   redis-cli INFO Persistence | grep rdb_bgsave_in_progress
   # Once it shows "0", copy the file
   cp /var/lib/redis/dump.rdb /backup/
```

### 3.5. Using Redis Replication for Backups

Redis replication can be used for backups by:

1. Setting up a replica (slave) server
2. Stopping the replica when you want to create a backup
3. Copying the RDB/AOF files from the stopped replica
4. Restarting the replica

This approach allows you to perform backups without affecting your primary Redis server.

```bash
# On replica
redis-cli SLAVEOF NO ONE  # Disconnect from master
redis-cli SAVE            # Create snapshot
cp /var/lib/redis/dump.rdb /backup/  # Copy the file
redis-cli SLAVEOF master_host master_port  # Reconnect to master
```

## 4. Backup Scheduling and Automation

For production environments, backups should be automated. Here's a simple example of a bash script that could be run as a cron job:

```bash
#!/bin/bash
# Redis backup script

# Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
redis-cli -h $REDIS_HOST -p $REDIS_PORT BGSAVE
# Wait for BGSAVE to complete
while [ $(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO Persistence | grep rdb_bgsave_in_progress | cut -d ":" -f2 | tr -d "\r\n") -eq 1 ]; do
  sleep 1
done

# Copy RDB file
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis-backup-$DATE.rdb

# Optional: Compress the backup
gzip $BACKUP_DIR/redis-backup-$DATE.rdb

# Delete old backups
find $BACKUP_DIR -name "redis-backup-*.rdb.gz" -type f -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/redis-backup-$DATE.rdb.gz"
```

This script:

1. Initiates a background save
2. Waits for the save to complete
3. Copies the RDB file to a backup directory with a timestamp
4. Compresses the backup to save space
5. Deletes backups older than the specified retention period

## 5. Redis Restore Procedures

Now let's examine how to restore Redis data from backups.

### 5.1. Restoring from RDB Files

Restoring from an RDB file is straightforward:

1. Stop Redis if it's running
2. Copy the RDB file to Redis's data directory (usually specified in redis.conf)
3. Rename the file to `dump.rdb` (or whatever name is specified in redis.conf)
4. Start Redis

```bash
# Example restore procedure
systemctl stop redis
cp /backup/redis-backup-20240430.rdb /var/lib/redis/dump.rdb
chown redis:redis /var/lib/redis/dump.rdb  # Ensure proper ownership
systemctl start redis
```

When Redis starts, it automatically loads the data from the RDB file.

### 5.2. Restoring from AOF Files

The process for AOF files is similar:

1. Stop Redis
2. Copy the AOF file to Redis's data directory
3. Rename the file to `appendonly.aof` (or as specified in redis.conf)
4. Start Redis

```bash
systemctl stop redis
cp /backup/redis-aof-backup-20240430.aof /var/lib/redis/appendonly.aof
chown redis:redis /var/lib/redis/appendonly.aof
systemctl start redis
```

### 5.3. Fixing Corrupted AOF Files

If an AOF file gets corrupted, Redis provides a tool to fix it:

```bash
redis-check-aof --fix /var/lib/redis/appendonly.aof
```

This tool truncates the AOF file at the point where corruption begins, potentially losing some of the most recent operations but making the file valid again.

### 5.4. Using redis-cli for Logical Restores

For logical backups, you can restore data using `redis-cli`:

```bash
# Example of restoring specific keys
cat user_keys.txt | while read key; do
  # For each key, get its value from the source and set it in the destination
  redis-cli -h source_host GET "$key" | redis-cli -h destination_host -x SET "$key"
done
```

For more complex data types, you'll need appropriate commands (HSET for hashes, SADD for sets, etc.).

### 5.5. Partial Restores

One advantage of logical backups is the ability to perform partial restores:

```bash
# Restore only keys matching a pattern
cat backup_keys.txt | grep "user:1000:" | while read key; do
  redis-cli -h source_host GET "$key" | redis-cli -h destination_host -x SET "$key"
done
```

This allows you to restore specific portions of your dataset without affecting others.

## 6. Advanced Backup and Restore Techniques

### 6.1. Using Redis Enterprise Features

Redis Enterprise provides more advanced backup capabilities, including:

* Scheduled backups to remote storage (S3, GCS, etc.)
* Incremental backups
* Point-in-time recovery

Example of configuring a backup in Redis Enterprise (through its REST API):

```bash
curl -X POST https://redis-enterprise-host:9443/v1/bdbs/1/backup \
  -H "Content-Type: application/json" \
  -d '{"path": "s3://my-bucket/redis-backups"}'
```

### 6.2. Using Redis Modules for Backup

Some Redis modules provide specialized backup capabilities. For example, RediSearch has commands to dump and restore its indexes separately from the data.

```
# Export RediSearch index
redis-cli FT.DUMP myindex > search_index_backup.txt

# Import RediSearch index
cat search_index_backup.txt | redis-cli FT.RESTORE myindex 0
```

### 6.3. Using External Tools

Several third-party tools can help with Redis backup and restore:

* **redis-rdb-tools** : Parses RDB files and can convert them to different formats
* **redis-dump** : Creates JSON backups of Redis data
* **redis-copy** : Copies data between Redis instances

Example using redis-dump:

```bash
# Install redis-dump
gem install redis-dump

# Create a JSON backup
redis-dump -u redis://localhost:6379 > redis-backup.json

# Restore from JSON
cat redis-backup.json | redis-load -u redis://localhost:6379
```

## 7. Best Practices for Redis Backup and Restore

### 7.1. Combining RDB and AOF

For maximum data safety, use both RDB and AOF:

```
# In redis.conf
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

This gives you both the performance benefits of RDB and the durability of AOF.

### 7.2. Testing Backups Regularly

Always validate your backups by testing restore procedures regularly:

```bash
# Script to test a backup file
#!/bin/bash
TEST_PORT=6380  # Use a different port for testing
BACKUP_FILE=$1

# Start a temporary Redis instance
redis-server --port $TEST_PORT --dbfilename temp.rdb &
REDIS_PID=$!

# Give it time to start
sleep 2

# Stop the temporary instance
redis-cli -p $TEST_PORT SHUTDOWN SAVE

# Replace the temp RDB with our backup
cp $BACKUP_FILE /tmp/temp.rdb

# Restart and check
redis-server --port $TEST_PORT --dbfilename temp.rdb &
REDIS_PID=$!
sleep 2

# Check if data is accessible
KEY_COUNT=$(redis-cli -p $TEST_PORT DBSIZE)
echo "Restored database has $KEY_COUNT keys"

# Clean up
redis-cli -p $TEST_PORT SHUTDOWN
rm /tmp/temp.rdb
```

### 7.3. Monitoring Backup Processes

Set up monitoring to ensure backups are working properly:

```bash
# Check if recent backup file exists
if [ ! -f "/backup/redis-backup-$(date +%Y%m%d)*.rdb.gz" ]; then
  echo "ERROR: Today's Redis backup is missing!" | mail -s "Redis Backup Alert" admin@example.com
fi

# Check backup file size
BACKUP_SIZE=$(du -b /backup/redis-backup-$(date +%Y%m%d)*.rdb.gz | cut -f1)
MIN_SIZE=1000  # Minimum expected size in bytes
if [ $BACKUP_SIZE -lt $MIN_SIZE ]; then
  echo "ERROR: Redis backup file is too small ($BACKUP_SIZE bytes)" | mail -s "Redis Backup Alert" admin@example.com
fi
```

### 7.4. Maintaining Backup Versioning

Keep multiple backup versions to allow for recovery from different points in time:

```bash
# Instead of overwriting, keep date-versioned backups
BACKUP_FILE="redis-backup-$(date +%Y%m%d-%H%M).rdb"
redis-cli BGSAVE
# Wait for completion
cp /var/lib/redis/dump.rdb /backup/$BACKUP_FILE
```

### 7.5. Off-site Storage

Always store backups in multiple locations:

```bash
# After creating local backup, copy to remote storage
aws s3 cp /backup/redis-backup-$(date +%Y%m%d).rdb.gz s3://my-company-backups/redis/

# Or using rsync to another server
rsync -avz /backup/redis-backup-$(date +%Y%m%d).rdb.gz backup-server:/remote/backup/
```

## 8. Disaster Recovery Scenarios

Let's explore a few disaster recovery scenarios and how to handle them:

### 8.1. Server Failure

If your Redis server fails completely:

1. Provision a new server with Redis installed
2. Copy the most recent backup to the new server
3. Restore the data as described earlier
4. Update application configurations to point to the new server

### 8.2. Data Corruption

If you discover data corruption:

1. Identify when the corruption occurred
2. Stop Redis to prevent further damage
3. Select a backup from before the corruption
4. Restore from that backup
5. If using AOF, replay transactions since the backup (if available and not corrupted)

### 8.3. Accidental Data Loss

If data is accidentally deleted:

1. Stop Redis immediately to prevent the next RDB save from overwriting your backup
2. Determine the extent of the data loss
3. Restore from the most recent backup
4. If using AOF with a recent backup, you might recover more recent data than with RDB alone

## 9. Redis Backup in Cloud Environments

Cloud providers often offer managed Redis services with built-in backup capabilities:

### 9.1. AWS ElastiCache

AWS ElastiCache automatically creates backups:

```bash
# Using AWS CLI to create a manual backup
aws elasticache create-snapshot --cache-cluster-id my-redis-cluster --snapshot-name manual-backup-20240430
```

### 9.2. Azure Cache for Redis

Azure provides automatic and manual backup options:

```bash
# Using Azure CLI to create a backup
az redis export --name my-redis-cache --resource-group my-resource-group --prefix backup --container backup-container --storage-account-name mystorageaccount
```

### 9.3. Google Cloud Memorystore

Google Cloud also offers managed Redis with export functionality:

```bash
# Using Google Cloud CLI to export Redis data
gcloud redis instances export my-redis-instance --location=us-central1 --destination=gs://my-bucket/redis-backup.rdb
```

## Conclusion

Redis backup and restore procedures are essential for ensuring data durability and business continuity. By understanding the underlying principles of Redis persistence and implementing robust backup strategies, you can protect your data against various failure scenarios.

Remember these key points:

1. Understand the differences between RDB and AOF persistence
2. Choose backup methods appropriate for your specific requirements
3. Test your restore procedures regularly
4. Automate your backup processes
5. Monitor backup execution and integrity
6. Maintain multiple backup versions in different locations
7. Document your backup and restore procedures for team access

With these strategies in place, you'll be well-prepared to recover from any Redis data loss scenario quickly and effectively.
