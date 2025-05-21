# IAM Policy Evaluation Workflow for S3 Requests in AWS

I'll explain how AWS evaluates IAM policies when processing S3 requests, starting from first principles and building up to the complete workflow. This is a fundamental security concept in AWS that determines whether a request is allowed or denied.

## Understanding the Foundations

> Before we dive into the specific workflow, let's establish some fundamental concepts about AWS security. Think of these as the building blocks that help us understand how everything fits together.

### What is AWS IAM?

AWS Identity and Access Management (IAM) is the security framework that controls who can access what resources in your AWS account. It's essentially a permissions management system that helps you maintain security by following the principle of least privilege - giving users only the access they need and nothing more.

IAM consists of several key components:

1. **Principals** : Entities that can make requests for actions or operations on AWS resources. These can be:

* IAM users (individual people or applications)
* IAM roles (temporary identities assumed by users, applications, or services)
* AWS services
* Federated users (users from external identity providers)

1. **Policies** : JSON documents that define permissions. They specify what actions are allowed or denied on what resources and under what conditions.
2. **Resources** : The AWS entities that users can work with, such as an S3 bucket or object.
3. **Actions** : The operations that can be performed on resources, like `s3:GetObject` or `s3:PutObject`.

### What is Amazon S3?

Amazon Simple Storage Service (S3) is AWS's object storage service. It stores data as objects within containers called buckets. Each object consists of data, a key (name), and metadata.

S3 has its own permission system that works alongside IAM:

1. **S3 Bucket Policies** : Resource-based policies attached directly to S3 buckets.
2. **S3 ACLs (Access Control Lists)** : Legacy mechanism that defines which AWS accounts or groups have access to buckets and objects.
3. **S3 Block Public Access** : Account-level and bucket-level settings that can override other policies to prevent public access.

## The Policy Evaluation Logic

> When you make a request to S3, AWS needs to determine whether to allow or deny that request. This is not a simple yes/no decision - it involves evaluating multiple policies at different levels.

### Policy Types in the Evaluation Process

When evaluating S3 access, AWS considers these policy types:

1. **Identity-based policies** : Attached to IAM users, groups, or roles.
2. **Resource-based policies** : Attached directly to resources like S3 buckets.
3. **Permission boundaries** : Set the maximum permissions an identity can have.
4. **Service control policies (SCPs)** : Apply to entire AWS Organizations.
5. **Session policies** : Used when assuming roles.
6. **S3 Block Public Access settings** : At the account and bucket level.
7. **S3 ACLs** : Object and bucket level access control lists.

### The Default Denial Principle

> One of the most crucial principles to understand is that by default, all requests are denied. This is called an "implicit deny."

In AWS, security follows a default "deny all" approach:

* All requests are implicitly denied unless explicitly allowed
* Any explicit deny overrides any allows
* Access must be granted by at least one policy and not denied by any policy

## The S3 Request Evaluation Workflow

Now, let's walk through the step-by-step process AWS follows when evaluating a request to an S3 resource:

### Step 1: Request Authentication

When a request arrives at S3, AWS first authenticates the requester:

```
Request --> Authentication --> Is Valid Signature? --> If No, Deny
                                |
                                v
                             If Yes, Continue to Authorization
```

Example:

```python
# Example S3 request using boto3 (Python AWS SDK)
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',     # These credentials are used
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'  # for authentication
)

# This request will be authenticated before proceeding
response = s3_client.get_object(
    Bucket='my-bucket',
    Key='my-object.txt'
)
```

The authentication step verifies the identity of the requester using their AWS credentials.

### Step 2: Evaluating Context

Next, AWS builds a context for the request, including:

* **Who** is making the request (principal)
* **What** action they're trying to perform (`s3:GetObject`, `s3:PutObject`, etc.)
* **Which** resource they're trying to access (bucket, object)
* **Environmental context** (time of day, IP address, SSL/TLS status, etc.)

Example context for an S3 request:

```json
{
  "principal": "arn:aws:iam::123456789012:user/alice",
  "action": "s3:GetObject",
  "resource": "arn:aws:s3:::my-bucket/confidential-data.txt",
  "conditions": {
    "aws:CurrentTime": "2023-05-21T14:30:00Z",
    "aws:SourceIp": "203.0.113.0/24",
    "aws:SecureTransport": "true"
  }
}
```

### Step 3: Policy Evaluation Order

> The order in which AWS evaluates different types of policies is crucial to understanding the final permission decision.

AWS evaluates policies in this specific order:

1. **Organization SCPs** (if your account is part of an AWS Organization)
2. **Resource-based policies** (S3 bucket policies)
3. **IAM permission boundaries** (if configured for the IAM entity)
4. **Identity-based policies** (policies attached to the user/role)
5. **S3-specific mechanisms** (Block Public Access, ACLs)

Let's look at examples of these different policies:

#### Example Service Control Policy (SCP):

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "s3:*",
    "Resource": "*",
    "Condition": {
      "StringNotEquals": {
        "aws:RequestedRegion": ["us-east-1", "us-west-1"]
      }
    }
  }]
}
```

This SCP restricts S3 operations to only the us-east-1 and us-west-1 regions.

#### Example S3 Bucket Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::123456789012:user/alice"},
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

This bucket policy allows user Alice to read any object in my-bucket.

#### Example Permission Boundary:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:Get*", "s3:List*"],
    "Resource": "*"
  }]
}
```

This permission boundary limits a user to only read and list operations, even if their identity-based policies grant more permissions.

#### Example Identity-based Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
```

This policy allows a user to read and write objects in my-bucket.

### Step 4: The Decision Flow

The actual decision flow is complex and follows these general steps:

1. Start with a default **implicit deny**
2. Evaluate all applicable policies
3. If any policy has an  **explicit deny** , the request is denied immediately
4. If no explicit deny and at least one explicit allow exists across all evaluated policies, the request is allowed
5. Otherwise, the request is denied (falling back to implicit deny)

Let's illustrate this with a flowchart:

```
Request Authentication --> Request Context
                                |
                                v
Organization SCP evaluation --> Any Deny? --> If Yes, Final Decision: DENY
                                |
                                v If No
Resource policy evaluation ----> Any Deny? --> If Yes, Final Decision: DENY
                                |           
                                v If No
Permission boundary evaluation-> Any Deny? --> If Yes, Final Decision: DENY
                                |
                                v If No
Identity policy evaluation -----> Any Deny? --> If Yes, Final Decision: DENY
                                |
                                v If No
S3-specific mechanisms ---------> Any Deny? --> If Yes, Final Decision: DENY
                                |
                                v If No
Check for any "Allow" across all policies --> If Yes, Final Decision: ALLOW
                                |
                                v If No
                          Final Decision: DENY (implicit)
```

## Complex Scenarios

Let's explore some specific scenarios to understand how this all works in practice:

### Scenario 1: Cross-Account Access

When a user from Account A tries to access a bucket in Account B:

1. Account A's user must have an identity-based policy allowing the action
2. Account B's bucket must have a resource-based policy allowing the specific principal from Account A

```json
// Identity-based policy in Account A (attached to user)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::account-b-bucket/*"
  }]
}

// Resource-based policy in Account B (attached to bucket)
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::ACCOUNT-A-ID:user/username"},
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::account-b-bucket/*"
  }]
}
```

In this scenario, both policies must explicitly allow the action for the request to succeed. This is different from same-account access, where only one policy needs to allow.

### Scenario 2: Role-Based Access with Conditions

Consider a scenario where an EC2 instance assumes a role to access S3, but only from a specific VPC:

```json
// Trust policy for the role
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Service": "ec2.amazonaws.com"},
    "Action": "sts:AssumeRole"
  }]
}

// Permission policy attached to the role
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "StringEquals": {
        "aws:SourceVpc": "vpc-12345678"
      }
    }
  }]
}
```

In this example, the EC2 instance can assume the role, but the role's permissions only allow S3 actions when the request comes from the specified VPC.

### Scenario 3: Block Public Access Overrides

Even if bucket policies or ACLs allow public access, S3 Block Public Access settings can override them:

```python
# Python code to set Block Public Access at the bucket level
import boto3

s3 = boto3.client('s3')
s3.put_public_access_block(
    Bucket='my-bucket',
    PublicAccessBlockConfiguration={
        'BlockPublicAcls': True,
        'IgnorePublicAcls': True,
        'BlockPublicPolicy': True,
        'RestrictPublicBuckets': True
    }
)
```

With these settings, even if a bucket policy tries to allow public access, the Block Public Access settings will override and deny the request.

## Understanding Policy Evaluation Context Variables

AWS provides many context variables that you can use in policy conditions to fine-tune access:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "IpAddress": {
        "aws:SourceIp": ["192.0.2.0/24", "203.0.113.0/24"]
      },
      "Bool": {
        "aws:SecureTransport": "true"
      },
      "DateGreaterThan": {
        "aws:CurrentTime": "2023-01-01T00:00:00Z"
      }
    }
  }]
}
```

This policy allows S3 GetObject actions only when:

* The request comes from specific IP ranges
* The request uses SSL/TLS
* The request happens after January 1, 2023

## Real-World Application

Let's apply all these concepts to a real-world scenario: creating a secure data processing pipeline.

Imagine you have:

* Data analysts who need read access to raw data
* Data engineers who need write access to processed data
* External auditors who need limited read access
* Automated processes that need specific access

Here's how you might set up the IAM policies:

### Step 1: Create IAM roles with appropriate permissions

```json
// Data Analyst Role Policy
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::raw-data-bucket",
      "arn:aws:s3:::raw-data-bucket/*"
    ]
  }]
}

// Data Engineer Role Policy
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::processed-data-bucket",
      "arn:aws:s3:::processed-data-bucket/*"
    ]
  }]
}
```

### Step 2: Add a bucket policy for external auditor access

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::AUDITOR-ACCOUNT-ID:role/AuditorRole"
    },
    "Action": [
      "s3:GetObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::processed-data-bucket",
      "arn:aws:s3:::processed-data-bucket/audit-reports/*"
    ],
    "Condition": {
      "Bool": {
        "aws:SecureTransport": "true"
      },
      "IpAddress": {
        "aws:SourceIp": "10.0.0.0/8"
      }
    }
  }]
}
```

### Step 3: Create an automated process with assumed role

```python
# Python code for an automated process that assumes a role and processes S3 data

import boto3
import json

# Create an STS client to assume the role
sts_client = boto3.client('sts')

# Assume the processing role
assumed_role = sts_client.assume_role(
    RoleArn="arn:aws:iam::ACCOUNT-ID:role/ProcessingRole",
    RoleSessionName="AutomatedDataProcessing"
)

# Get temporary credentials
credentials = assumed_role['Credentials']

# Create an S3 client using the temporary credentials
s3_client = boto3.client(
    's3',
    aws_access_key_id=credentials['AccessKeyId'],
    aws_secret_access_key=credentials['SecretAccessKey'],
    aws_session_token=credentials['SessionToken']
)

# Now use s3_client to process data
raw_data = s3_client.get_object(
    Bucket='raw-data-bucket',
    Key='incoming/data.csv'
)

# Process the data...

# Upload processed result
s3_client.put_object(
    Bucket='processed-data-bucket',
    Key='output/processed-data.csv',
    Body=processed_data
)
```

This code assumes a role with the necessary permissions, gets temporary credentials, and uses them to process S3 data.

## Common Troubleshooting Tips

When troubleshooting S3 access issues, consider these common problems:

1. **Missing permissions** : Ensure all necessary S3 actions are allowed (`s3:GetObject`, `s3:PutObject`, etc.)
2. **Conflicting policies** : Check for explicit denies that might override allows:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Action": "s3:*",
    "Resource": "*",
    "Condition": {
      "NotIpAddress": {
        "aws:SourceIp": "192.0.2.0/24"
      }
    }
  }]
}
```

This policy denies all S3 actions from any IP outside the specified range.

3. **Missing resource-based policies** : For cross-account access, ensure both identity and resource policies allow the access
4. **Block Public Access settings** : Check account and bucket level settings that might override other policies
5. **S3 Object Ownership settings** : If you're using ACLs, ensure Object Ownership settings aren't preventing them from working
6. **Permission boundaries** : Remember that permission boundaries limit the maximum permissions a user can have

## Conclusion

The IAM policy evaluation workflow for S3 requests is complex but follows logical principles:

1. By default, all requests start with an implicit deny
2. AWS evaluates different types of policies in a specific order
3. An explicit deny anywhere overrides any allows
4. For access to be granted, at least one policy must explicitly allow the action and no policy can explicitly deny it
5. For cross-account access, both accounts must explicitly allow the action

Understanding these foundational principles will help you design secure yet functional S3 access policies and troubleshoot permission issues when they arise.

Remember that AWS's approach to security is "default deny" - start with minimal permissions and gradually add what's needed rather than starting with broad permissions and trying to restrict later.
