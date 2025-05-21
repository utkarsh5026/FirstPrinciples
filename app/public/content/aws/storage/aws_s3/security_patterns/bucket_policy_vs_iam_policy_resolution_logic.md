# Bucket Policy vs. IAM Policy Resolution Logic in AWS S3: A First Principles Approach

I'll explain how AWS resolves access decisions when both S3 bucket policies and IAM policies are in play, starting from absolute first principles and building up systematically.

## The Foundation: Access Control in AWS

> At its core, access control is about answering a simple question: "Should this specific request be allowed or denied?"

To understand how AWS makes these decisions, we need to start with the fundamental building blocks of AWS's permission model.

### Core Principle 1: The Default Deny

The most fundamental principle in AWS security is that, by default, all access is denied. This is called an  *implicit deny* .

```
When AWS receives a request:
IF no applicable policy exists THEN
    DENY access
END IF
```

This creates a secure foundation—nothing is accessible unless explicitly permitted.

### Core Principle 2: Policy Types and Scope

AWS has different policy types that operate at different levels:

1. **IAM Policies** - Attached to identities (users, groups, roles)
2. **Resource Policies** - Attached to resources (like S3 buckets)
3. **Service Control Policies (SCPs)** - Applied at organization level
4. **Permission Boundaries** - Set maximum permissions

For our discussion, we'll focus on the interplay between the first two: IAM policies and S3 bucket policies (a type of resource policy).

## Understanding the Policy Elements

Before diving into resolution logic, let's understand the structure of these policies.

### Policy Structure

Both IAM and bucket policies share a similar JSON structure:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

Key elements:

* **Effect** : Either "Allow" or "Deny"
* **Action** : What operations are covered
* **Resource** : What AWS resources the statement applies to
* **Principal** : Who the statement applies to (in resource policies)
* **Condition** : Optional constraints on when the statement applies

### Identity vs. Resource-based Policies

> Think of IAM policies as being attached to the person knocking on the door, while bucket policies are attached to the door itself.

**IAM Policy (Identity-based):**

* Attached to IAM users, groups, or roles
* Defines what actions the identity can perform on what resources
* Does NOT specify the resource it's acting upon within the policy itself
* Can apply across multiple services and resources

**S3 Bucket Policy (Resource-based):**

* Attached directly to an S3 bucket
* Specifies which principals (users, roles) can perform what actions on the bucket
* Contains explicit principal elements
* Only applies to that specific bucket

## The Access Evaluation Process

Now let's examine how AWS evaluates these policies to make access decisions.

### The Decision Flow Logic

When a request is made to access an S3 resource, AWS follows this basic evaluation logic:

```
1. Gather all applicable policies
2. Check for explicit DENY statements
3. If any explicit DENY exists, DENY access
4. Check for explicit ALLOW statements
5. If any explicit ALLOW exists, ALLOW access
6. Otherwise, DENY access (implicit deny)
```

Let's break this down with examples.

### Example 1: Simple IAM Policy Only

Imagine a user with this IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::marketing-photos/*"
    }
  ]
}
```

This allows the user to download objects from the "marketing-photos" bucket. Since there's no bucket policy, only the IAM policy is evaluated, and the access is allowed.

### Example 2: Simple Bucket Policy Only

Now imagine a bucket policy on "financial-reports":

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789012:user/CFO"},
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::financial-reports/*"
    }
  ]
}
```

This allows only the CFO user to perform any S3 action on the bucket. If the CFO makes a request, it's allowed; anyone else is denied.

## Policy Resolution Logic: The Complex Interplay

When both IAM and bucket policies exist, the resolution becomes more nuanced. This is where many people get confused.

> Imagine access control as a series of gates. To get through, you need to pass through every gate. Each gate represents a different type of policy.

Here's the crucial principle:

### The Intersection Principle

**For a request to be allowed, it must be allowed by BOTH the applicable IAM policy AND the applicable resource policy.**

In other words:

* If either policy denies the request, the request is denied
* If either policy is missing (doesn't apply), the other policy alone determines access
* If both policies exist but neither explicitly allows the request, the request is denied

Let's explore this with examples.

### Example 3: Conflicting Policies

User Bob has this IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*"
    }
  ]
}
```

But the "confidential-data" bucket has this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::confidential-data/*"
    }
  ]
}
```

Even though Bob's IAM policy allows all S3 actions on all buckets, the bucket policy explicitly denies all access. Since explicit denies take precedence, Bob cannot access the bucket.

### Example 4: The "Allow from Either" Case

This is a special exception to the intersection principle! If one policy allows access and the other doesn't say anything (no applicable statements), the request is allowed.

User Alice has this IAM policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::public-data"
    }
  ]
}
```

The "public-data" bucket has no bucket policy at all.

Alice can list the contents of the bucket because her IAM policy allows it, and there's no bucket policy to contradict this.

Similarly, if the bucket had a policy allowing access to Alice, but Alice had no IAM policy for this bucket, she would still get access.

## Advanced Resolution: The Full Decision Tree

Here's the complete resolution logic as a more detailed algorithm:

```
IF request comes from account owner THEN
    ALLOW access (account owners always have full access to their resources)
ELSE
    Evaluate all applicable policies:
  
    IF any applicable policy has explicit DENY THEN
        DENY access
    ELSE IF resource has resource-based policy AND identity has identity-based policy THEN
        IF both policies ALLOW access THEN
            ALLOW access
        ELSE
            DENY access
    ELSE IF resource has resource-based policy but identity has no identity-based policy THEN
        IF resource-based policy ALLOWs access THEN
            ALLOW access
        ELSE
            DENY access
    ELSE IF identity has identity-based policy but resource has no resource-based policy THEN
        IF identity-based policy ALLOWs access THEN
            ALLOW access
        ELSE
            DENY access
    ELSE
        DENY access (implicit deny)
    END IF
END IF
```

### Example 5: Cross-Account Access

This is where the logic becomes particularly important. Let's say Account A owns a bucket, and Account B wants access.

Bucket policy in Account A:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::AccountB-ID:user/Analyst"},
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shared-data/*"
    }
  ]
}
```

IAM policy for Analyst in Account B:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shared-data/*"
    }
  ]
}
```

For this cross-account access to work, **both** policies must allow the access. The bucket policy must allow the external user, and the external user must have an IAM policy allowing them to act on the bucket.

## Special Considerations

### Public Access Block Settings

AWS has introduced additional guardrails through Public Access Block settings that can override both IAM and bucket policies:

```
IF PublicAccessBlock settings block public access THEN
    DENY access (regardless of IAM or bucket policies)
END IF
```

These settings can be applied at both the account level and the individual bucket level.

### ACLs (Access Control Lists)

S3 also has legacy ACLs that can grant permissions. While mostly replaced by bucket policies, they still factor into the access decision:

```
IF explicit DENY in any policy THEN
    DENY access
ELSE IF ALLOW in IAM policy OR bucket policy OR ACL THEN
    ALLOW access
ELSE
    DENY access
END IF
```

However, AWS recommends using bucket policies instead of ACLs for most use cases.

## Practical Application Guidelines

Based on these principles, here are practical recommendations:

1. **For same-account access** : Use IAM policies when possible, as they're centrally managed and easier to audit.
2. **For cross-account access** : You need both a bucket policy (on the resource side) and an IAM policy (on the identity side).
3. **For public access** : Use bucket policies, but be aware of Public Access Block settings.
4. **When in doubt about denies** : Remember that explicit denies always override allows.
5. **Testing complex scenarios** : Use AWS Policy Simulator to verify expected behavior.

## Real-World Example: Analytics Data Pipeline

Let's consider a practical example where a company has set up an analytics pipeline:

* Raw data bucket ("raw-data")
* Processing Lambda function
* Processed data bucket ("processed-data")
* Analytics team users

### The Raw Data Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789012:role/LambdaProcessingRole"},
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::raw-data/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::raw-data/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

This policy:

1. Allows the Lambda processing role to get objects
2. Denies all access that doesn't use HTTPS (SecureTransport)

### The IAM Policy for Lambda Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::raw-data/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::processed-data/*"
    }
  ]
}
```

This allows the Lambda to read from the raw bucket and write to the processed bucket.

### The Processed Data Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789012:role/LambdaProcessingRole"},
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::processed-data/*"
    },
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789012:group/AnalyticsTeam"},
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::processed-data/*"
    }
  ]
}
```

This allows:

1. The Lambda role to write objects
2. The Analytics team to read objects

### The Analytics Team IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::processed-data/*"
    },
    {
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::raw-data/*"
    }
  ]
}
```

This explicitly allows reading processed data but denies any action on raw data.

### Resolution Analysis

* The Lambda can read from raw-data because both the bucket policy and its IAM policy allow it
* The Lambda can write to processed-data for the same reason
* The Analytics team can read from processed-data because both policies allow it
* The Analytics team cannot access raw-data because their IAM policy explicitly denies it

If the analytics team tried to access the raw data, the explicit deny in their IAM policy would override any other permission.

## Summary: Key Principles

1. **Explicit Deny Principle** : An explicit deny in any policy always overrides any allows.
2. **Default Deny Principle** : By default, all access is denied unless explicitly allowed.
3. **Both-Must-Allow Principle** : When both identity-based and resource-based policies apply, both must allow the action.
4. **Either-Can-Allow Exception** : If only one policy type exists (either identity-based or resource-based), it alone determines access.
5. **Owner Override Principle** : The account that owns a resource always has full access to it (unless restricted by organization-level controls).

Understanding these principles will help you design robust and secure access controls for your AWS S3 resources, whether working within a single account or managing cross-account access scenarios.
