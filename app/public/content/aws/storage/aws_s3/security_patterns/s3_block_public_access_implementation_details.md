# AWS S3 Block Public Access: Implementation Details from First Principles

I'll explain AWS S3 Block Public Access (BPA) implementation details from first principles, going deep into how it works, why it exists, and its technical architecture.

> "Security is not a product, but a process." - Bruce Schneier

## Understanding the Foundation: Object Storage and Access Control

Before diving into Block Public Access, let's establish what Amazon S3 is at its core: a highly scalable object storage service. Each object in S3 has the following:

1. **Data** - The actual content being stored
2. **Metadata** - Information about the object (content-type, date created, etc.)
3. **Key** - A unique identifier within the bucket
4. **Access permissions** - Controls who can access the object

### Traditional S3 Access Control Mechanisms

S3 traditionally uses several mechanisms to control access:

1. **IAM Policies** - Identity-based policies attached to AWS users, groups, or roles
2. **Bucket Policies** - Resource-based policies attached directly to S3 buckets
3. **ACLs (Access Control Lists)** - Legacy method defining who can access objects and buckets
4. **Presigned URLs** - Time-limited URLs that grant temporary access

Each has a different purpose and hierarchy of evaluation.

## The Problem: Accidental Public Exposure

Despite these controls, organizations frequently experienced data breaches due to:

1. **Misconfigured bucket policies** - Overly permissive settings
2. **Public ACLs** - Legacy settings that made objects readable to anyone
3. **Configuration drift** - Settings changing over time
4. **Multiple access layers** - Confusion about which settings take precedence

> "The most dangerous phrase in the language is 'We've always done it this way.'" - Grace Hopper

## Enter Block Public Access: The Concept

Block Public Access was introduced in November 2018 as a "safety net" that operates as an additional layer of protection. It functions as a **negative permission model** - a hard block that overrides any attempts to make resources public, regardless of other settings.

## Implementation Architecture of Block Public Access

Block Public Access operates on four distinct levels:

1. **Account level** - Applied to all buckets in an AWS account
2. **Bucket level** - Applied to specific buckets
3. **Access point level** - Applied to S3 access points
4. **Object level** - Inherited from bucket settings

### The Four BPA Controls

Block Public Access consists of four distinct settings:

1. **BlockPublicAcls** - Blocks public ACLs during creation and via PUT operations
2. **IgnorePublicAcls** - Ignores existing public ACLs (they're still there but ineffective)
3. **BlockPublicPolicy** - Prevents public bucket policies
4. **RestrictPublicBuckets** - Restricts access to principals with specific permissions

Let's look at how these work with a practical example:

```json
{
  "BlockPublicAcls": true,
  "IgnorePublicAcls": true,
  "BlockPublicPolicy": true,
  "RestrictPublicBuckets": true
}
```

When applied at the account level, this JSON configuration ensures no buckets can be made public through any method.

## Technical Implementation

### The Evaluation Layer

Block Public Access works by adding an evaluation layer to the S3 authorization flow. Let's look at this step by step:

1. **Request arrives** - A client makes a request to access an S3 object
2. **Authentication** - AWS verifies the identity of the requester
3. **BPA evaluation** - Before checking bucket policies or ACLs, BPA rules are evaluated
4. **Access decision** - If BPA blocks the request, it's denied immediately with a 403 error
5. **Standard evaluation** - If BPA doesn't block, standard evaluation proceeds

Here's a simplified diagram of this process:

```
Client Request → Authentication → BPA Evaluation → [BLOCK/CONTINUE] → Standard Access Evaluation
```

### Implementation in API Calls

When a request comes in, here's what happens at the API level:

```
S3AccessRequest
  └── EvaluateBlockPublicAccess()
      ├── IF accountBPA == true OR bucketBPA == true
      │   └── CheckIfRequestIsPublic()
      │       ├── IF isPublic == true
      │       │   └── DENY with AccessDenied (403)
      │       └── ELSE
      │           └── Continue evaluation
      └── ELSE
          └── Continue standard access evaluation
```

Let's examine a concrete example. When a client tries to upload an object with a public ACL:

```python
# This operation would be blocked if BlockPublicAcls is enabled
s3_client.put_object(
    Bucket='example-bucket',
    Key='sensitive-file.txt',
    Body=b'My sensitive data',
    ACL='public-read'  # This would trigger the BPA block
)
```

The operation would be rejected with this error:

```
botocore.exceptions.ClientError: An error occurred (AccessDenied) when calling the PutObject operation: 
Access Denied: The public access block configuration doesn't allow this operation
```

### What "Public" Means in BPA Context

AWS has a specific definition of "public" in the BPA context:

> "Public" means granting access to AllUsers or AuthenticatedUsers groups, or via a bucket policy that allows access from "*" or {aws:PrincipalOrgID} conditions.

For example, this bucket policy would be blocked by BlockPublicPolicy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

## Implementation Details: BPA Settings in Depth

Let's explore each setting's implementation details:

### 1. BlockPublicAcls

This setting blocks:

* PUT requests that include public ACLs
* PUT bucket policy requests that include public ACLs
* PUT access point requests that include public ACLs

Example of what's blocked:

```python
# This would fail with BlockPublicAcls enabled
s3_client.put_bucket_acl(
    Bucket='example-bucket',
    ACL='public-read'
)
```

### 2. IgnorePublicAcls

This setting:

* Keeps existing public ACLs in place but renders them ineffective
* Does not modify the ACLs themselves
* Works at runtime by ignoring public grants during access evaluation

Let's see how this works internally:

```
AccessRequest
  └── EvaluateACLs()
      ├── IF IgnorePublicAcls == true
      │   └── FilterOutPublicAclGrants(aclGrants)
      │       └── EvaluateRemainingGrants()
      └── ELSE
          └── EvaluateAllGrants()
```

### 3. BlockPublicPolicy

This setting:

* Rejects bucket policy changes that would grant public access
* Operates during the PutBucketPolicy API operation
* Validates the policy document before applying it

The policy validation process looks like:

```
PutBucketPolicy(policy)
  └── IF BlockPublicPolicy == true
      ├── ValidatePolicyIsNotPublic(policy)
      │   ├── IF containsPublicStatement == true
      │   │   └── REJECT with PolicyValidationError
      │   └── ELSE
      │       └── ApplyPolicy()
      └── ELSE
          └── ApplyPolicy()
```

### 4. RestrictPublicBuckets

This setting:

* Restricts access to the bucket and objects to AWS service principals and authorized users
* Does not modify any policies
* Acts as a runtime evaluation layer

Example of this implementation:

```
AccessRequest
  └── IF RestrictPublicBuckets == true AND RequestFromPublicSource == true
      ├── CheckIfAuthenticatedIAMPrincipal()
      │   ├── IF isAuthenticatedIAMPrincipal == true
      │   │   └── ALLOW continue
      │   └── ELSE
      │       └── DENY with AccessDenied
      └── ELSE
          └── ALLOW continue
```

## Inheritance Model

BPA implements a restrictive inheritance model:

1. Account-level settings apply to all buckets in the account
2. Bucket-level settings can only be more restrictive, not less
3. New buckets inherit account-level settings by default
4. Objects inherit their bucket's settings

For example:

```
Account BPA: BlockPublicAcls=true, IgnorePublicAcls=true
Bucket BPA: BlockPublicPolicy=true
Effective Bucket BPA: BlockPublicAcls=true, IgnorePublicAcls=true, BlockPublicPolicy=true
```

## Default Settings and Evolution

AWS has evolved BPA defaults over time:

* **November 2018** : BPA introduced, disabled by default
* **April 2019** : BPA enabled by default for new buckets
* **October 2019** : S3 inventory includes BPA status
* **April 2023** : Account-level BPA enabled by default for new accounts

This represents the "security by default" approach that AWS has been adopting.

## Technical Implementation of BPA Enforcement

The enforcement mechanism for BPA operates at multiple points:

### Control Plane Enforcement

BPA settings affect the following API calls during bucket and object creation/modification:

1. **CreateBucket** - Applies account defaults to new buckets
2. **PutBucketPolicy** - Checks against BlockPublicPolicy
3. **PutBucketAcl** - Checks against BlockPublicAcls
4. **PutObject** with ACL - Checks against BlockPublicAcls
5. **PutObjectAcl** - Checks against BlockPublicAcls

Example of BPA enforcement at the API level:

```python
# AWS SDK pseudocode showing enforcement
def put_bucket_acl(bucket_name, acl):
    # Check BPA settings first
    bpa_settings = get_bpa_settings(bucket_name)
  
    if bpa_settings["BlockPublicAcls"] and is_public_acl(acl):
        raise AccessDeniedException("Operation blocked by Block Public Access")
  
    # Otherwise proceed with ACL change
    apply_acl(bucket_name, acl)
```

### Data Plane Enforcement

At runtime, when objects are requested:

1. **GetObject** - Checks against IgnorePublicAcls and RestrictPublicBuckets
2. **ListObjects** - Checks against RestrictPublicBuckets
3. **HeadObject** - Checks against RestrictPublicBuckets

### Reconciliation with Other Access Controls

When BPA conflicts with other access controls, BPA always wins. The evaluation order is:

1. **Block Public Access** - Evaluated first as a deny
2. **IAM Boundaries** - Evaluated next as a boundary
3. **Service Control Policies** - Organizational boundaries
4. **IAM Policies** - Identity permissions
5. **Resource Policies** - Bucket policies
6. **ACLs** - Object and bucket ACLs

An explicit deny at any level overrides any allows at lower levels.

## Practical Implementation Example

Let's walk through a complete implementation example:

### Step 1: Enable Account-Level BPA

```python
# Enable all BPA settings at account level
import boto3

s3_control = boto3.client('s3control')
account_id = '123456789012'  # Your AWS account ID

response = s3_control.put_public_access_block(
    PublicAccessBlockConfiguration={
        'BlockPublicAcls': True,
        'IgnorePublicAcls': True,
        'BlockPublicPolicy': True,
        'RestrictPublicBuckets': True
    },
    AccountId=account_id
)

print("Account-level BPA enabled:", response)
```

### Step 2: Check and Enable Bucket-Level BPA

```python
# Check and enable bucket-level BPA
import boto3

s3 = boto3.client('s3')
bucket_name = 'example-bucket'

# Get current settings
try:
    response = s3.get_public_access_block(Bucket=bucket_name)
    current_settings = response['PublicAccessBlockConfiguration']
    print("Current settings:", current_settings)
except s3.exceptions.NoSuchPublicAccessBlockConfiguration:
    print("No BPA configuration found for bucket")

# Enable all BPA settings for bucket
response = s3.put_public_access_block(
    Bucket=bucket_name,
    PublicAccessBlockConfiguration={
        'BlockPublicAcls': True,
        'IgnorePublicAcls': True,
        'BlockPublicPolicy': True,
        'RestrictPublicBuckets': True
    }
)

print("Bucket-level BPA enabled:", response)
```

### Step 3: Verify BPA Settings with Access Attempts

```python
# Try to make an object public (should fail)
import boto3
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
bucket_name = 'example-bucket'
object_key = 'test-file.txt'

# Upload object
s3.put_object(
    Bucket=bucket_name,
    Key=object_key,
    Body=b'This is a test file'
)

# Try to make it public (should fail)
try:
    s3.put_object_acl(
        Bucket=bucket_name,
        Key=object_key,
        ACL='public-read'
    )
    print("Object made public - BPA not working!")
except ClientError as e:
    if e.response['Error']['Code'] == 'AccessDenied':
        print("BPA blocked public ACL as expected")
    else:
        print("Error:", e)
```

## Important Edge Cases and Limitations

BPA has some important implementation details to be aware of:

1. **Cross-Account Access** - BPA doesn't block legitimate cross-account access configured through bucket policies
2. **Pre-Signed URLs** - BPA doesn't block access via pre-signed URLs as they represent authorized access
3. **Static Website Hosting** - Enabling static website hosting doesn't automatically make objects public; you still need appropriate permissions
4. **Legacy ACLs** - IgnorePublicAcls only ignores ACLs during evaluation but doesn't remove them
5. **Bucket Policy Size** - BPA enforcement is calculated regardless of bucket policy size (maximum 20KB)

## Performance Considerations

BPA implementation has minimal performance impact because:

1. **Evaluation Chain** - BPA checks occur early in the authorization process
2. **Caching** - BPA settings are cached for performance
3. **Distributed Implementation** - BPA enforcement is distributed across AWS infrastructure

## Monitoring and Auditing BPA

AWS provides several ways to monitor BPA:

1. **CloudTrail** - Logs all BPA configuration changes
2. **Config Rules** - Can check for BPA compliance
3. **S3 Storage Lens** - Shows BPA status across buckets
4. **Trusted Advisor** - Checks for public buckets

Example CloudTrail event for BPA change:

```json
{
  "eventTime": "2023-06-15T20:42:22Z",
  "eventName": "PutPublicAccessBlock",
  "sourceIPAddress": "203.0.113.1",
  "userAgent": "console.amazonaws.com",
  "requestParameters": {
    "publicAccessBlockConfiguration": {
      "blockPublicAcls": true,
      "ignorePublicAcls": true,
      "blockPublicPolicy": true,
      "restrictPublicBuckets": true
    },
    "bucket": "example-bucket"
  },
  "responseElements": null,
  "requestID": "1a2b3c4d-5e6f-7g8h-9i0j",
  "eventID": "a1b2c3d4-e5f6-g7h8-i9j0",
  "eventType": "AwsApiCall",
  "recipientAccountId": "123456789012"
}
```

## Example: AWS Organizations Implementation

For enterprise deployments, BPA is often implemented using AWS Organizations with Service Control Policies (SCPs):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RequireBPAOnAllBuckets",
      "Effect": "Deny",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketPublicAccessBlock"
      ],
      "Resource": "*",
      "Condition": {
        "Null": {
          "s3:PublicAccessBlockConfiguration": "true"
        }
      }
    },
    {
      "Sid": "RequireStrictBPA",
      "Effect": "Deny",
      "Action": "s3:PutBucketPublicAccessBlock",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "s3:PublicAccessBlockConfiguration/BlockPublicAcls": "true",
          "s3:PublicAccessBlockConfiguration/IgnorePublicAcls": "true",
          "s3:PublicAccessBlockConfiguration/BlockPublicPolicy": "true",
          "s3:PublicAccessBlockConfiguration/RestrictPublicBuckets": "true"
        }
      }
    }
  ]
}
```

This SCP ensures that all buckets created must have BPA enabled with all settings turned on.

## Conclusion

AWS S3 Block Public Access represents a critical defense-in-depth implementation that:

1. Operates at multiple levels (account, bucket, access point)
2. Provides four distinct controls for different access scenarios
3. Implements a negative permission model that overrides other settings
4. Has minimal performance impact due to its implementation architecture
5. Integrates with AWS's broader security ecosystem

> "Security is always excessive until it's not enough." - Robbie Sinclair

By implementing BPA across an organization, you create a strong security baseline that prevents the most common causes of data breaches with S3 - accidental public exposure.

Understanding the implementation details helps you make informed decisions about how to deploy and manage BPA across your AWS environment, ensuring both security and necessary accessibility.
