# Network Address Types in PostgreSQL: INET and CIDR

Network address data types in PostgreSQL provide specialized storage and manipulation capabilities for IP addresses and network ranges. Let's explore these types from first principles, understanding what they are, how they work, and when to use them.

> "A network address is more than just a string of numbers; it's a hierarchical identifier that embodies both location and routing information within digital networks."

## Foundation: Understanding IP Addresses

Before diving into PostgreSQL's implementation, let's establish what IP addresses are at their core.

An IP (Internet Protocol) address serves as a unique identifier for devices on a network. IP addresses come in two main versions:

1. **IPv4** : A 32-bit address displayed as four decimal numbers (0-255) separated by dots

* Example: `192.168.1.1`

1. **IPv6** : A 128-bit address displayed as eight groups of four hexadecimal digits separated by colons

* Example: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`

IP addresses can represent:

* Individual hosts (like a specific computer)
* Networks (groups of addresses that share a prefix)

## PostgreSQL Network Address Types

PostgreSQL provides two primary data types for storing network addresses:

1. **INET** : Stores IP addresses with optional subnet information
2. **CIDR** : Stores network addresses with mandatory subnet information

Let's examine each in detail.

### The INET Type

The INET data type stores an IPv4 or IPv6 host address with optional subnet information.

> "Think of INET as a flexible container that can hold either a single house address or an entire neighborhood's addressing scheme."

#### Structure of INET

An INET value consists of:

* An IP address (required)
* A subnet mask (optional)

The subnet mask is represented in CIDR notation (Classless Inter-Domain Routing), which appears as a suffix indicating how many bits of the address belong to the network portion.

For example: `192.168.1.5/24`

Here:

* `192.168.1.5` is the IP address
* `/24` indicates that the first 24 bits (the first three octets: 192.168.1) belong to the network portion

#### Examples of INET Values

```
192.168.1.5         (IPv4 address without subnet)
192.168.1.5/24      (IPv4 address with subnet)
::ffff:192.168.1.5  (IPv6-mapped IPv4 address)
2001:db8::1         (IPv6 address without subnet)
2001:db8::1/64      (IPv6 address with subnet)
```

#### INET in Action - SQL Example

Let's see how we might create a table with an INET column and use it:

```sql
-- Create a table to store server information
CREATE TABLE servers (
    server_id SERIAL PRIMARY KEY,
    hostname VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL,
    description TEXT
);

-- Insert some sample data
INSERT INTO servers (hostname, ip_address, description)
VALUES 
    ('web-server-1', '192.168.1.10', 'Primary web server'),
    ('db-server-1', '192.168.1.20/24', 'Primary database server'),
    ('backup-server', '192.168.2.5', 'Backup server');

-- Query servers on a specific subnet
SELECT hostname, ip_address 
FROM servers 
WHERE ip_address << '192.168.1.0/24';
```

In this example, the `<<` operator tests if an IP address is contained within a subnet.

### The CIDR Type

CIDR (Classless Inter-Domain Routing) is a data type specifically designed for storing network address ranges.

> "If INET is like an address that could refer to either a specific house or a neighborhood, CIDR is specifically about neighborhoods - it represents ranges of addresses, not individual ones."

#### Structure of CIDR

A CIDR value consists of:

* A network address (required)
* A subnet mask (required)

The critical difference from INET is that CIDR values must have all host bits set to zero. This means CIDR specifically represents networks, not individual hosts.

#### Examples of CIDR Values

```
192.168.1.0/24      (IPv4 network)
10.0.0.0/8          (IPv4 network)
2001:db8::/32       (IPv6 network)
```

#### CIDR in Action - SQL Example

Here's how we might use CIDR to manage network ranges:

```sql
-- Create a table to store network information
CREATE TABLE networks (
    network_id SERIAL PRIMARY KEY,
    network_range CIDR NOT NULL,
    location VARCHAR(100),
    description TEXT
);

-- Insert some sample data
INSERT INTO networks (network_range, location, description)
VALUES 
    ('192.168.1.0/24', 'Main Office', 'Primary office network'),
    ('192.168.2.0/24', 'Development', 'Development team network'),
    ('10.0.0.0/16', 'Data Center', 'Data center network');

-- Query to find which network a specific IP belongs to
SELECT location, network_range 
FROM networks 
WHERE '192.168.1.25'::inet << network_range;
```

Notice that I converted `'192.168.1.25'` to an INET type before using the containment operator (`<<`).

## Key Differences Between INET and CIDR

Understanding the distinctions between these types is crucial for proper usage:

1. **Host Bits** :

* INET allows non-zero host bits (can represent specific hosts)
* CIDR requires all host bits to be zero (represents only networks)

1. **Subnet Specification** :

* INET makes the subnet optional
* CIDR requires the subnet

1. **Input Validation** :

* If you try to input a value with non-zero host bits into a CIDR column, PostgreSQL will automatically set those bits to zero

Let's see an example of the automatic zeroing with CIDR:

```sql
-- Create a test table
CREATE TABLE cidr_test (
    id SERIAL PRIMARY KEY,
    network_range CIDR
);

-- Insert a value with non-zero host bits
INSERT INTO cidr_test (network_range)
VALUES ('192.168.1.5/24');

-- Check what was actually stored
SELECT network_range FROM cidr_test;
```

The result will show `192.168.1.0/24`, not `192.168.1.5/24`, because PostgreSQL automatically zeroed the host bits.

## Operations and Functions for Network Types

PostgreSQL provides various operators and functions for working with network address types.

### Common Operators

```
=       -- Equality
!=      -- Inequality
<       -- Less than
>       -- Greater than
<=      -- Less than or equal
>=      -- Greater than or equal
<<      -- Is contained within
>>      -- Contains
&&      -- Overlaps with
~       -- Bitwise NOT
&       -- Bitwise AND
|       -- Bitwise OR
+       -- Addition
-       -- Subtraction
```

### Practical Examples

Let's explore how these operators work in practice:

```sql
-- Check if an IP address is within a subnet
SELECT '192.168.1.5'::inet << '192.168.1.0/24'::cidr;  -- Returns true

-- Check if a network contains another network
SELECT '192.168.0.0/16'::cidr >> '192.168.1.0/24'::cidr;  -- Returns true

-- Check if networks overlap
SELECT '192.168.1.0/24'::cidr && '192.168.1.128/25'::cidr;  -- Returns true

-- Add a number to an IP address (increment)
SELECT '192.168.1.5'::inet + 5;  -- Returns 192.168.1.10

-- Subtract two IP addresses (get the distance between them)
SELECT '192.168.1.10'::inet - '192.168.1.5'::inet;  -- Returns 5
```

### Useful Functions

PostgreSQL provides several functions for working with network addresses:

```sql
-- Extract the network address portion of an INET value
SELECT network('192.168.1.5/24'::inet);  -- Returns 192.168.1.0/24

-- Extract the broadcast address for a network
SELECT broadcast('192.168.1.0/24'::cidr);  -- Returns 192.168.1.255

-- Extract the netmask
SELECT netmask('192.168.1.5/24'::inet);  -- Returns 255.255.255.0

-- Extract the host address
SELECT host('192.168.1.5/24'::inet);  -- Returns 192.168.1.5

-- Extract the CIDR mask length
SELECT masklen('192.168.1.0/24'::cidr);  -- Returns 24

-- Check if an address is within private network ranges
SELECT inet_client_addr() << '10.0.0.0/8'::cidr;  -- Example check for RFC1918 space

-- Convert text to INET/CIDR
SELECT '192.168.1.5'::inet;
```

## Practical Applications

Let's examine some real-world applications for these data types:

### 1. IP-Based Access Control

```sql
CREATE TABLE ip_access_rules (
    rule_id SERIAL PRIMARY KEY,
    network INET NOT NULL,
    permission VARCHAR(10) CHECK (permission IN ('allow', 'deny')),
    description TEXT
);

INSERT INTO ip_access_rules (network, permission, description)
VALUES 
    ('192.168.1.0/24', 'allow', 'Internal office network'),
    ('10.0.0.0/8', 'allow', 'VPN users'),
    ('203.0.113.0/24', 'deny', 'Known malicious range');

-- Function to check if access is allowed for a given IP
CREATE OR REPLACE FUNCTION is_ip_allowed(check_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
    has_allow BOOLEAN;
    has_deny BOOLEAN;
BEGIN
    -- Check if IP matches any deny rule
    SELECT EXISTS(
        SELECT 1 FROM ip_access_rules 
        WHERE permission = 'deny' AND check_ip << network
    ) INTO has_deny;
  
    IF has_deny THEN
        RETURN FALSE;
    END IF;
  
    -- Check if IP matches any allow rule
    SELECT EXISTS(
        SELECT 1 FROM ip_access_rules 
        WHERE permission = 'allow' AND check_ip << network
    ) INTO has_allow;
  
    RETURN has_allow;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT is_ip_allowed('192.168.1.5'::inet);  -- Should return true
SELECT is_ip_allowed('203.0.113.10'::inet);  -- Should return false
```

### 2. Network Inventory Management

```sql
CREATE TABLE network_segments (
    segment_id SERIAL PRIMARY KEY,
    network_range CIDR NOT NULL,
    vlan_id INTEGER,
    location VARCHAR(100),
    purpose TEXT
);

CREATE TABLE ip_allocation (
    allocation_id SERIAL PRIMARY KEY,
    segment_id INTEGER REFERENCES network_segments(segment_id),
    ip_address INET NOT NULL,
    hostname VARCHAR(100),
    allocated_to VARCHAR(100),
    allocation_date DATE DEFAULT CURRENT_DATE
);

-- Find free IP addresses in a segment
CREATE OR REPLACE FUNCTION find_free_ips(segment_cidr CIDR, count INTEGER DEFAULT 5)
RETURNS TABLE(free_ip INET) AS $$
DECLARE
    network_start INET;
    network_end INET;
    current_ip INET;
    found INTEGER := 0;
BEGIN
    -- Get network boundaries
    network_start := network(segment_cidr);
    network_end := broadcast(segment_cidr);
  
    -- Start from the beginning of the range (skipping network address)
    current_ip := network_start + 1;
  
    -- Loop through potential IPs until we find the requested count
    WHILE current_ip < network_end AND found < count LOOP
        -- Check if this IP is already allocated
        IF NOT EXISTS (
            SELECT 1 FROM ip_allocation WHERE ip_address = current_ip
        ) THEN
            -- This IP is free, return it
            free_ip := current_ip;
            found := found + 1;
            RETURN NEXT;
        END IF;
      
        -- Move to next IP
        current_ip := current_ip + 1;
    END LOOP;
  
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Usage example
SELECT * FROM find_free_ips('192.168.1.0/24', 10);
```

## Performance Considerations

Network address types offer several advantages over storing IP addresses as strings:

1. **Efficient Storage** : INET and CIDR types are stored more compactly than string representations
2. **Indexed Operations** : PostgreSQL can create specialized indexes for these types:

```sql
-- Create an index optimized for network operations
CREATE INDEX idx_network_range ON networks USING gist (network_range inet_ops);
```

3. **Range Queries** : CIDR and INET types allow for more efficient range queries than string comparisons

## Common Pitfalls and Best Practices

### Pitfalls to Avoid

1. **CIDR vs INET Confusion** : Remember that CIDR requires host bits to be zero. If you need to store specific host addresses, use INET.
2. **Improper Type Casting** : Always ensure proper type casting when comparing or operating on network types:

```sql
-- Incorrect (implicit conversion might not work as expected)
WHERE ip_column = '192.168.1.1'

-- Correct (explicit casting to INET)
WHERE ip_column = '192.168.1.1'::inet
```

3. **Overlooking Subnet Masks** : Remember that `192.168.1.0/24` and `192.168.1.0/16` are completely different networks.

### Best Practices

1. **Use the Right Type** :

* INET for host addresses or addresses with optional netmasks
* CIDR for network ranges

1. **Validation** : Implement additional validation as needed, especially for user input:

```sql
CREATE OR REPLACE FUNCTION is_valid_private_ip(ip INET)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN ip << '10.0.0.0/8'::cidr OR 
           ip << '172.16.0.0/12'::cidr OR 
           ip << '192.168.0.0/16'::cidr;
END;
$$ LANGUAGE plpgsql;

-- Usage
ALTER TABLE servers ADD CONSTRAINT check_private_ip 
CHECK (is_valid_private_ip(ip_address));
```

3. **Document Network Assumptions** : When defining schemas, document assumptions about network structure:

```sql
COMMENT ON COLUMN servers.ip_address IS 'Server IP address. Expected to be a private IP within company ranges.';
```

## Conclusion

PostgreSQL's INET and CIDR types offer powerful tools for handling network addresses in databases. Understanding the differences between these types and their appropriate use cases is essential for designing efficient network-related database schemas.

By using these specialized types instead of generic text fields, you gain not only semantic clarity but also performance benefits and the ability to use specialized operators and functions.

These types are particularly valuable in applications involving network management, access control, IP allocation, and any scenario where networking concepts are central to your data model.
