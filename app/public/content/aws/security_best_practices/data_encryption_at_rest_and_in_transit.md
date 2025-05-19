# Data Encryption at Rest and in Transit in AWS

I'll explain data encryption in AWS from first principles, covering both encryption at rest and encryption in transit. Let's build our understanding from the ground up, exploring the fundamental concepts before diving into AWS-specific implementations.

## First Principles: What is Encryption?

> Encryption is the process of converting plain, readable data (plaintext) into a scrambled, unreadable format (ciphertext) using mathematical algorithms and keys. Only those with the proper decryption key can convert the ciphertext back to its original plaintext form.

The fundamental purpose of encryption is to protect data confidentiality, ensuring that sensitive information remains private even if unauthorized parties gain access to the encrypted data.

### Basic Elements of Encryption

1. **Plaintext** : The original, readable data
2. **Encryption Algorithm** : The mathematical function that transforms plaintext to ciphertext
3. **Encryption Key** : A piece of information that controls the encryption process
4. **Ciphertext** : The scrambled, unreadable output of the encryption process
5. **Decryption Key** : The information needed to reverse the encryption (may be the same as the encryption key in symmetric encryption)

Let's illustrate with a simple example:

Imagine a very basic encryption where each letter is shifted by 3 positions in the alphabet:

* Plaintext: "HELLO"
* After applying the algorithm (shift by 3): "KHOOR"
* The encryption key here is "3" (the shift value)

To decrypt, someone would need to know both the algorithm (shift letters) and the key (3 positions), then reverse the process.

## Understanding Encryption at Rest

> Encryption at rest refers to protecting data while it's stored (at rest) on persistent storage devices like hard drives, solid-state drives, or storage arrays.

When data is at rest, it isn't moving through networks—it's sitting in storage. Think of your files saved on a computer, database records stored on a server, or backups archived on tape drives.

### Why Encrypt Data at Rest?

If an unauthorized person gains physical access to storage devices or bypasses access controls to reach the underlying storage, encryption at rest ensures they still cannot read the actual data without the encryption keys.

 **Real-world analogy** : It's like keeping your valuables in a locked safe. Even if someone breaks into your house (bypasses access controls), they still can't access what's inside the safe without the combination (encryption key).

## Understanding Encryption in Transit

> Encryption in transit protects data as it moves between locations, such as from a user's device to a server, between servers, or between AWS services.

Data in transit (also called data in motion) is vulnerable to interception. Without encryption, this data travels in plaintext form that could be captured and read by malicious actors through various network eavesdropping techniques.

### Why Encrypt Data in Transit?

Without transit encryption, sending sensitive information over networks would be like sending a postcard through the mail—anyone handling it along the way could read its contents. Transit encryption is like putting that message in a locked envelope that only the recipient can open.

 **Real-world analogy** : It's similar to having a private conversation in a crowded room by whispering in code that only you and your friend understand, rather than speaking plainly where everyone can hear.

## Encryption Types: Symmetric vs. Asymmetric

Before diving into AWS implementations, we need to understand these two fundamental approaches to encryption:

### Symmetric Encryption

> In symmetric encryption, the same key is used for both encryption and decryption.

 **Example** : Think of a simple padlock—the same key locks and unlocks it.

```
Plaintext → [Encrypt with Key X] → Ciphertext
Ciphertext → [Decrypt with Key X] → Plaintext
```

 **Pros** : Fast and efficient for large amounts of data
 **Cons** : Key distribution problem—how do you securely share the key with authorized parties?

**Simple code example (pseudocode):**

```python
# Symmetric encryption example (simplified)
def encrypt(plaintext, symmetric_key):
    # Apply encryption algorithm using the key
    ciphertext = apply_encryption_algorithm(plaintext, symmetric_key)
    return ciphertext

def decrypt(ciphertext, symmetric_key):
    # Apply decryption algorithm using the same key
    plaintext = apply_decryption_algorithm(ciphertext, symmetric_key)
    return plaintext

# Usage
my_data = "Sensitive information"
my_key = generate_symmetric_key()  # Must be kept secret

# Encrypt
encrypted_data = encrypt(my_data, my_key)

# Later, decrypt
original_data = decrypt(encrypted_data, my_key)
```

### Asymmetric Encryption (Public Key Cryptography)

> In asymmetric encryption, different but mathematically related keys are used for encryption and decryption—typically called a public key and a private key.

 **Example** : The public key is like a padlock you can distribute widely. Anyone can lock (encrypt) something with it, but only you with the private key can unlock (decrypt) it.

```
Plaintext → [Encrypt with Public Key] → Ciphertext
Ciphertext → [Decrypt with Private Key] → Plaintext
```

 **Pros** : Solves the key distribution problem
 **Cons** : Computationally intensive, slower than symmetric encryption

**Simple code example (pseudocode):**

```python
# Asymmetric encryption example (simplified)
def generate_keypair():
    # Generate mathematically related public and private keys
    private_key = generate_private_key()
    public_key = derive_public_key_from(private_key)
    return public_key, private_key

def encrypt_with_public_key(plaintext, public_key):
    # Anyone can encrypt with the public key
    ciphertext = apply_public_key_encryption(plaintext, public_key)
    return ciphertext

def decrypt_with_private_key(ciphertext, private_key):
    # Only the private key holder can decrypt
    plaintext = apply_private_key_decryption(ciphertext, private_key)
    return plaintext

# Usage
public_key, private_key = generate_keypair()
# Share public_key widely, keep private_key secret

# Someone encrypts a message for you
message = "Confidential information"
encrypted_message = encrypt_with_public_key(message, public_key)

# Only you can decrypt it
original_message = decrypt_with_private_key(encrypted_message, private_key)
```

## Hybrid Encryption

In practice, most systems use hybrid approaches:

* Use asymmetric encryption to securely exchange a symmetric key
* Then use the faster symmetric encryption for the actual data

This combines the security advantages of asymmetric encryption with the performance benefits of symmetric encryption.

Now, let's apply these principles to AWS.

## Data Encryption at Rest in AWS

AWS offers several options for encrypting data at rest, which we can categorize into:

1. **AWS-managed encryption services**
2. **Client-side encryption**
3. **Server-side encryption**

### AWS Key Management Service (KMS)

> AWS KMS is a managed service that makes it easy to create and control the encryption keys used to encrypt your data.

KMS is the foundation of AWS's encryption strategy, providing centralized control over the entire lifecycle of cryptographic keys.

#### Key Components of AWS KMS:

1. **Customer Master Keys (CMKs)** : These are the primary resources in KMS, which can encrypt data up to 4KB in size and, more importantly, encrypt other data keys.
2. **Key Types** :

* **Customer-managed keys** : Created and managed by you
* **AWS-managed keys** : Created and managed by AWS on your behalf
* **AWS-owned keys** : Owned and managed by AWS (you don't see these in your account)

1. **Key Policies** : Resource policies that control access to your CMKs

Let's see a code example of how you might use KMS in Python:

```python
import boto3

# Initialize KMS client
kms_client = boto3.client('kms', region_name='us-east-1')

# Encrypting data directly with KMS (for small data < 4KB)
def encrypt_small_data(data, key_id):
    response = kms_client.encrypt(
        KeyId=key_id,
        Plaintext=data.encode('utf-8')
    )
    return response['CiphertextBlob']  # This is your encrypted data

# Decrypting data with KMS
def decrypt_data(ciphertext):
    response = kms_client.decrypt(
        CiphertextBlob=ciphertext
    )
    return response['Plaintext'].decode('utf-8')

# Example usage
my_key_id = 'arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
secret_message = "This is a secret message"

# Encrypt
encrypted_data = encrypt_small_data(secret_message, my_key_id)

# Decrypt
original_message = decrypt_data(encrypted_data)
```

For larger data, a common pattern is to use KMS to generate a data encryption key:

```python
# Generate a data key for larger data
def get_data_key(key_id):
    response = kms_client.generate_data_key(
        KeyId=key_id,
        KeySpec='AES_256'  # 256-bit key for AES encryption
    )
  
    # The response contains both plaintext key and encrypted key
    plaintext_key = response['Plaintext']       # Use this to encrypt data
    encrypted_key = response['CiphertextBlob']  # Store this alongside your encrypted data
  
    return plaintext_key, encrypted_key

# Later, to decrypt data:
def decrypt_data_key(encrypted_key):
    response = kms_client.decrypt(
        CiphertextBlob=encrypted_key
    )
    return response['Plaintext']  # This is the original plaintext key
```

### Server-Side Encryption in AWS Storage Services

Many AWS services offer built-in encryption capabilities that integrate with KMS:

#### 1. Amazon S3 (Simple Storage Service)

S3 offers several encryption options:

* **SSE-S3** : Server-Side Encryption with Amazon S3-Managed Keys
* **SSE-KMS** : Server-Side Encryption with KMS Keys
* **SSE-C** : Server-Side Encryption with Customer-Provided Keys
* **Client-Side Encryption** : Before uploading to S3

Example of enabling SSE-KMS when uploading an object to S3:

```python
import boto3

s3_client = boto3.client('s3')

# Upload a file with SSE-KMS encryption
def upload_encrypted_file(file_path, bucket, object_key, kms_key_id):
    with open(file_path, 'rb') as file:
        s3_client.put_object(
            Bucket=bucket,
            Key=object_key,
            Body=file,
            ServerSideEncryption='aws:kms',
            SSEKMSKeyId=kms_key_id
        )

# Example usage
upload_encrypted_file(
    '/path/to/my/file.pdf',
    'my-secure-bucket',
    'documents/file.pdf',
    'arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
)
```

You can also configure default encryption for an S3 bucket:

```python
# Set default encryption on a bucket
s3_client.put_bucket_encryption(
    Bucket='my-secure-bucket',
    ServerSideEncryptionConfiguration={
        'Rules': [
            {
                'ApplyServerSideEncryptionByDefault': {
                    'SSEAlgorithm': 'aws:kms',
                    'KMSMasterKeyID': 'arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
                },
                'BucketKeyEnabled': True  # Reduces KMS request costs
            }
        ]
    }
)
```

#### 2. Amazon EBS (Elastic Block Store)

EBS volumes can be encrypted using AWS KMS keys. When you create an encrypted EBS volume, AWS:

1. Uses your KMS key to generate a data key
2. Encrypts the data key and stores it with the volume metadata
3. Uses the plaintext data key in memory to encrypt/decrypt disk I/O

Example of creating an encrypted EBS volume:

```python
import boto3

ec2_client = boto3.client('ec2')

# Create an encrypted EBS volume
response = ec2_client.create_volume(
    AvailabilityZone='us-east-1a',
    Size=100,  # Size in GB
    VolumeType='gp3',
    Encrypted=True,
    KmsKeyId='arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
)

volume_id = response['VolumeId']
print(f"Created encrypted volume: {volume_id}")
```

You can also set account-wide EBS encryption by default:

```python
# Enable default EBS encryption for the account
ec2_client.enable_ebs_encryption_by_default()

# Optionally, set the default KMS key for EBS encryption
ec2_client.modify_ebs_default_kms_key_id(
    KmsKeyId='arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
)
```

#### 3. Amazon RDS (Relational Database Service)

RDS databases can be encrypted at rest, which encrypts:

* Underlying storage
* Automated backups
* Snapshots
* Read replicas

Example of creating an encrypted RDS instance:

```python
import boto3

rds_client = boto3.client('rds')

# Create an encrypted RDS instance
response = rds_client.create_db_instance(
    DBInstanceIdentifier='my-encrypted-db',
    AllocatedStorage=20,
    DBInstanceClass='db.t3.micro',
    Engine='mysql',
    MasterUsername='admin',
    MasterUserPassword='securepassword',
    StorageEncrypted=True,
    KmsKeyId='arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
)
```

### Client-Side Encryption

In client-side encryption, you encrypt data before sending it to AWS. This gives you complete control over the encryption process and keys.

#### AWS Encryption SDK

The AWS Encryption SDK is a client-side encryption library that makes it easier to implement client-side encryption correctly.

Example using the AWS Encryption SDK with Python:

```python
from aws_encryption_sdk import encrypt, decrypt
from aws_encryption_sdk.key_providers.kms import KMSMasterKeyProvider

# Set up a KMS master key provider
key_provider = KMSMasterKeyProvider(
    key_ids=['arn:aws:kms:us-east-1:123456789012:key/abcd1234-...']
)

# Data to encrypt
plaintext = b'This is my sensitive data'

# Encrypt the data
encrypted_data, encryptor_header = encrypt(
    source=plaintext,
    key_provider=key_provider
)

# Later, decrypt the data
decrypted_data, decryptor_header = decrypt(
    source=encrypted_data,
    key_provider=key_provider
)

# The decrypted data should match the original plaintext
assert decrypted_data == plaintext
```

## Data Encryption in Transit in AWS

For encryption in transit, AWS provides several mechanisms:

### 1. TLS/SSL Certificates with AWS Certificate Manager (ACM)

ACM lets you provision, manage, and deploy SSL/TLS certificates for use with AWS services.

Example of creating and using a certificate with an Application Load Balancer:

```python
import boto3

acm_client = boto3.client('acm')
elbv2_client = boto3.client('elbv2')

# Request a certificate
response = acm_client.request_certificate(
    DomainName='example.com',
    ValidationMethod='DNS',
    SubjectAlternativeNames=[
        '*.example.com',
    ]
)
certificate_arn = response['CertificateArn']

# Create an HTTPS listener for a load balancer that uses the certificate
response = elbv2_client.create_listener(
    LoadBalancerArn='arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-lb/...',
    Protocol='HTTPS',
    Port=443,
    Certificates=[
        {
            'CertificateArn': certificate_arn
        },
    ],
    DefaultActions=[
        {
            'Type': 'forward',
            'TargetGroupArn': 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/...'
        },
    ]
)
```

### 2. API Gateway with HTTPS Endpoints

API Gateway automatically enforces HTTPS for APIs, ensuring data is encrypted in transit:

```python
import boto3

apigw_client = boto3.client('apigateway')

# Create a REST API
api_response = apigw_client.create_rest_api(
    name='MySecureAPI',
    description='API with HTTPS enforcement',
    endpointConfiguration={
        'types': ['REGIONAL']
    }
)

api_id = api_response['id']

# Create a resource
resource_response = apigw_client.create_resource(
    restApiId=api_id,
    parentId='...',  # Parent resource ID
    pathPart='secure-endpoint'
)

resource_id = resource_response['id']

# Create a method
apigw_client.put_method(
    restApiId=api_id,
    resourceId=resource_id,
    httpMethod='GET',
    authorizationType='NONE',
    apiKeyRequired=False
)

# Configure TLS version
apigw_client.update_domain_name(
    domainName='api.example.com',
    securityPolicy='TLS_1_2'  # Enforce TLS 1.2 minimum
)
```

### 3. VPC Endpoints for Private Communication

VPC endpoints allow you to privately connect your VPC to supported AWS services without going over the public internet:

```python
import boto3

ec2_client = boto3.client('ec2')

# Create an S3 Gateway Endpoint
response = ec2_client.create_vpc_endpoint(
    VpcId='vpc-12345678',
    ServiceName='com.amazonaws.us-east-1.s3',
    RouteTableIds=[
        'rtb-12345678',
    ],
    VpcEndpointType='Gateway',
    PolicyDocument='{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":"*","Action":"s3:*","Resource":"*"}]}'
)

# Create an Interface Endpoint for DynamoDB
response = ec2_client.create_vpc_endpoint(
    VpcId='vpc-12345678',
    ServiceName='com.amazonaws.us-east-1.dynamodb',
    SubnetIds=[
        'subnet-12345678',
        'subnet-87654321'
    ],
    VpcEndpointType='Interface',
    PrivateDnsEnabled=True,
    SecurityGroupIds=[
        'sg-12345678',
    ]
)
```

### 4. AWS PrivateLink

PrivateLink provides private connectivity between VPCs, AWS services, and on-premises networks without exposing your traffic to the public internet:

```python
import boto3

ec2_client = boto3.client('ec2')

# Create a VPC Endpoint Service (Service Provider side)
response = ec2_client.create_vpc_endpoint_service_configuration(
    AcceptanceRequired=True,
    NetworkLoadBalancerArns=[
        'arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/my-nlb/...',
    ]
)

service_id = response['ServiceConfiguration']['ServiceId']
print(f"Created VPC Endpoint Service: {service_id}")

# Create a VPC Endpoint (Consumer side)
response = ec2_client.create_vpc_endpoint(
    VpcEndpointType='Interface',
    VpcId='vpc-12345678',
    ServiceName='com.amazonaws.vpce.us-east-1.vpce-svc-12345...',  # Service name from provider
    SubnetIds=[
        'subnet-12345678',
    ],
    SecurityGroupIds=[
        'sg-12345678',
    ]
)
```

## AWS Security Best Practices for Encryption

To maximize the security of your encrypted data in AWS, follow these best practices:

### 1. Key Management

> "The security of encrypted data ultimately depends on the security of the encryption keys."

* **Use CMK key rotation** : Enable automatic key rotation for customer-managed keys

```python
  kms_client.enable_key_rotation(
      KeyId='arn:aws:kms:us-east-1:123456789012:key/abcd1234-...'
  )
```

* **Implement least privilege access** : Use IAM policies and key policies to restrict who can use keys

```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "Allow use of the key",
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::123456789012:role/AppRole"
        },
        "Action": [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ],
        "Resource": "*",
        "Condition": {
          "StringEquals": {
            "kms:ViaService": "s3.us-east-1.amazonaws.com"
          }
        }
      }
    ]
  }
```

* **Monitor key usage** : Use AWS CloudTrail to audit key usage

```python
  # Example of reviewing KMS API calls in CloudTrail
  cloudtrail_client = boto3.client('cloudtrail')

  response = cloudtrail_client.lookup_events(
      LookupAttributes=[
          {
              'AttributeKey': 'EventSource',
              'AttributeValue': 'kms.amazonaws.com'
          },
      ],
      StartTime=datetime(2023, 1, 1),
      EndTime=datetime(2023, 1, 2)
  )
```

### 2. Encryption in Transit

* **Enforce HTTPS/TLS** : Configure security policies to require TLS 1.2 or higher

```python
  # Example: Updating S3 bucket policy to enforce HTTPS
  s3_client.put_bucket_policy(
      Bucket='my-secure-bucket',
      Policy=json.dumps({
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Sid": "EnforceHTTPS",
                  "Effect": "Deny",
                  "Principal": "*",
                  "Action": "s3:*",
                  "Resource": [
                      "arn:aws:s3:::my-secure-bucket",
                      "arn:aws:s3:::my-secure-bucket/*"
                  ],
                  "Condition": {
                      "Bool": {
                          "aws:SecureTransport": "false"
                      }
                  }
              }
          ]
      })
  )
```

* **Use VPC endpoints** : Keep traffic within AWS network
* **Implement certificate rotation** : Regularly rotate TLS certificates

### 3. Encryption at Rest

* **Enable default encryption** : Turn on default encryption for services like S3, EBS, etc.
* **Use envelope encryption** : For large datasets, encrypt data with a data key, then encrypt the data key with a master key
* **Separate key management** : Store encryption keys in a different security domain than the encrypted data

## Real-World AWS Encryption Scenarios

Let's explore a few practical scenarios to understand how encryption is applied in AWS:

### Scenario 1: Secure Healthcare Data Storage

A healthcare company needs to store patient records in compliance with HIPAA:

1. **Data at rest** :

* Store data in S3 with SSE-KMS encryption
* Use customer-managed keys with restricted access
* Enable default encryption on all buckets
* Implement bucket policies preventing unencrypted uploads

1. **Data in transit** :

* Configure CloudFront distribution with HTTPS-only
* Use secure TLS 1.2+ connections for all API communications
* Implement VPC endpoints for private access to S3

### Scenario 2: Financial Transaction Processing

A payment processing system handling credit card data:

1. **Data at rest** :

* Encrypt sensitive fields before storage (client-side)
* Store encrypted data in DynamoDB with encryption enabled
* Use different KMS keys for different data classifications

1. **Data in transit** :

* Use API Gateway with mutual TLS authentication
* Implement private VPC endpoints
* Configure security groups to limit connectivity

## Advanced Concepts in AWS Encryption

### Multi-Region Keys

AWS KMS now supports multi-region keys—KMS keys in different AWS Regions that can be used interchangeably because they have the same key material:

```python
# Create a multi-region primary key
response = kms_client.create_key(
    Description='Multi-region primary key',
    MultiRegion=True
)
primary_key_id = response['KeyMetadata']['KeyId']

# Replicate to another region
replica_kms_client = boto3.client('kms', region_name='us-west-2')
response = replica_kms_client.replicate_key(
    KeyId=primary_key_id,
    ReplicaRegion='us-west-2'
)
replica_key_id = response['ReplicaKeyMetadata']['KeyId']
```

### Custom Key Stores

For additional security, AWS KMS can integrate with AWS CloudHSM clusters to store your keys in dedicated hardware security modules:

```python
# Create a custom key store backed by CloudHSM
response = kms_client.create_custom_key_store(
    CustomKeyStoreName='my-cloudhsm-keystore',
    CloudHsmClusterId='cluster-1234567',
    TrustAnchorCertificate='-----BEGIN CERTIFICATE-----\n...',
    KeyStorePassword='password'
)

# Create a key in the custom key store
response = kms_client.create_key(
    Description='Key in custom key store',
    Origin='AWS_CLOUDHSM',
    CustomKeyStoreId=response['CustomKeyStoreId']
)
```

## End-to-End AWS Encryption Example

Let's put everything together with an end-to-end example of a secure web application:

1. **User data submission** :

* Frontend uses HTTPS (via ACM certificate)
* Data submitted via API Gateway (TLS)

1. **API processing** :

* Lambda function processes the request
* Uses KMS to encrypt sensitive fields

1. **Storage** :

* Encrypted data stored in DynamoDB (encryption at rest)
* S3 for larger files (SSE-KMS)

1. **Database backups** :

* Automated backups are encrypted
* Exported to S3 with separate encryption keys

Here's what the Lambda function code might look like:

```python
import boto3
import json
import os
import uuid

# Initialize clients
dynamodb = boto3.resource('dynamodb')
kms_client = boto3.client('kms')
s3_client = boto3.client('s3')

# Get environment variables
table_name = os.environ['TABLE_NAME']
bucket_name = os.environ['BUCKET_NAME']
kms_key_id = os.environ['KMS_KEY_ID']

table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    # Parse request body
    body = json.loads(event['body'])
  
    # Generate a unique ID for the record
    record_id = str(uuid.uuid4())
  
    # Encrypt sensitive data
    encrypted_ssn = kms_client.encrypt(
        KeyId=kms_key_id,
        Plaintext=body['ssn'].encode('utf-8')
    )['CiphertextBlob']
  
    # Convert binary to Base64 for storage
    import base64
    encrypted_ssn_b64 = base64.b64encode(encrypted_ssn).decode('utf-8')
  
    # Store record in DynamoDB
    table.put_item(
        Item={
            'id': record_id,
            'name': body['name'],
            'email': body['email'],
            'encrypted_ssn': encrypted_ssn_b64,
            'created_at': datetime.now().isoformat()
        }
    )
  
    # If there's a document, store it in S3
    if 'document' in body and body['document']:
        document_data = base64.b64decode(body['document'])
      
        # Upload to S3 with encryption
        s3_client.put_object(
            Bucket=bucket_name,
            Key=f"documents/{record_id}.pdf",
            Body=document_data,
            ServerSideEncryption='aws:kms',
            SSEKMSKeyId=kms_key_id
        )
  
    return {
        'statusCode': 200,
        'body': json.dumps({'id': record_id, 'message': 'Record created successfully'})
    }
```

## Conclusion

Data encryption in AWS is a multi-layered approach that protects information both at rest and in transit. By understanding the fundamental principles of encryption and how AWS implements them across its services, you can build secure architectures that protect sensitive data throughout its lifecycle.

Remember these key points:

> Encryption at rest protects your stored data from unauthorized physical access or compromised access controls.

> Encryption in transit protects your data as it moves across networks, preventing eavesdropping and interception.

> AWS Key Management Service (KMS) provides the foundation for most encryption scenarios in AWS, offering secure key management and integration with AWS services.

> A comprehensive security strategy combines encryption with other controls like IAM policies, monitoring, and network security.

By implementing both encryption at rest and encryption in transit in your AWS environment, you create multiple layers of protection that significantly enhance your overall security posture.
