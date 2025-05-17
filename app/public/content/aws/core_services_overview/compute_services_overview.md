# AWS Compute Services: EC2 and Lambda

I'll explain AWS compute services, focusing on EC2 and Lambda, building from first principles. Let's start by understanding what "compute" means in cloud computing and then explore these core AWS services in depth.

## What is Compute?

> Compute, at its most fundamental level, is the processing power needed to run applications and perform calculations. It's essentially the "brain" that executes instructions in any computer system.

In traditional IT, compute meant physical servers in your data center. In cloud computing, compute refers to virtualized processing resources that execute your code, whether it's a web application, data processing task, or any other workload.

## Understanding Cloud Computing Fundamentals

Before diving into specific AWS compute services, let's understand the core idea behind cloud computing:

> Cloud computing is the on-demand delivery of IT resources over the internet with pay-as-you-go pricing, eliminating the need to buy, own, and maintain physical data centers and servers.

This approach dramatically shifts how computing resources are provisioned, accessed, and managed:

1. **Resources as a service** : Computing power, storage, and other resources are provided as services
2. **Elasticity** : Resources can scale up or down based on demand
3. **Pay-as-you-go** : You only pay for what you use, when you use it

## AWS EC2 (Elastic Compute Cloud)

### First Principles of EC2

EC2 is built on a fundamental concept: virtualization of physical hardware into configurable virtual machines.

> EC2 provides resizable virtual servers (called "instances") in the cloud that you can control as if they were physical computers, but with the flexibility of being virtual.

#### Key Concepts of EC2

1. **Virtualization** : EC2 uses virtualization technology to partition physical servers into multiple virtual servers
2. **Instances** : These are virtual servers with specific configurations of CPU, memory, storage, and networking capacity
3. **Amazon Machine Images (AMIs)** : Templates containing an operating system and software configurations
4. **Instance Types** : Different hardware configurations optimized for various use cases

### How EC2 Works

When you launch an EC2 instance, here's what happens behind the scenes:

1. You select an AMI (Amazon Machine Image) - a template containing the operating system and initial software
2. You choose an instance type, which determines the hardware of the host computer used for your instance
3. AWS provisions the virtual machine on its physical hardware
4. The instance boots up and becomes available for you to use

### EC2 Instance Types

EC2 offers specialized instance types optimized for different workloads:

* **General Purpose (T3, M5)** : Balanced compute, memory, and networking resources
* **Compute Optimized (C5)** : High CPU performance for compute-bound applications
* **Memory Optimized (R5)** : For applications that process large datasets in memory
* **Storage Optimized (I3, D2)** : For workloads requiring high sequential read/write access to large datasets
* **Accelerated Computing (P3, G4)** : Hardware GPU or FPGA accelerators for specific functions

### Example: Launching an EC2 Instance

Let's look at how you might launch an EC2 instance using the AWS CLI:

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t2.micro \
  --key-name MyKeyPair \
  --security-group-ids sg-903004f8 \
  --subnet-id subnet-6e7f829e
```

This command:

* Specifies an Amazon Linux AMI (ami-0c55b159cbfafe1f0)
* Launches a single instance (count 1)
* Uses the t2.micro instance type (1 vCPU, 1GB RAM)
* Configures security with a key pair and security group
* Places the instance in a specific subnet

### EC2 Pricing Models

EC2 offers several pricing models to match different usage patterns:

1. **On-Demand** : Pay by the hour or second with no long-term commitments
2. **Reserved Instances** : Purchase instances for a 1 or 3-year term at significant discounts
3. **Spot Instances** : Bid for unused EC2 capacity at up to 90% discount
4. **Dedicated Hosts** : Physical servers dedicated entirely to your use

> Think of these pricing models like different ways to pay for transportation: On-Demand is like taking a taxi (pay only when you ride, but more expensive per trip), Reserved is like leasing a car (upfront commitment but lower overall cost), and Spot is like catching a standby flight (lowest cost but can be interrupted).

### EC2 Use Cases

* **Web Applications** : Hosting websites and web applications
* **Development/Test Environments** : Creating and testing applications
* **High-Performance Computing** : Running complex scientific or engineering calculations
* **Gaming Servers** : Hosting multiplayer game sessions
* **Batch Processing** : Running batch jobs that process data periodically

## AWS Lambda

### First Principles of Lambda

Lambda represents a fundamentally different approach to computing called "serverless computing."

> Lambda allows you to run code without provisioning or managing servers. You simply upload your code, and Lambda takes care of everything required to run and scale it.

#### Key Concepts of Lambda

1. **Functions** : Units of code that perform specific tasks
2. **Events** : Actions that trigger Lambda functions
3. **Execution Environment** : The runtime context where your code executes
4. **Cold Start** : The initial setup time when a new execution environment is created

### How Lambda Works

When a Lambda function is triggered:

1. AWS provisions compute capacity based on the configuration of your Lambda function
2. AWS runs your function code, passing in the event data
3. Once execution completes, the compute resources are released
4. You are billed only for the compute time consumed during execution

### Lambda Runtime Model

Lambda supports multiple programming languages through "runtimes":

* Node.js
* Python
* Ruby
* Java
* Go
* .NET Core

### Example: Creating a Simple Lambda Function

Here's an example of a simple Python Lambda function that processes S3 events:

```python
import json

def lambda_handler(event, context):
    # Extract bucket and object information from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
  
    # Log information about the S3 object
    print(f"Processing file: {key} from bucket: {bucket}")
  
    # Your processing logic here
  
    # Return a success response
    return {
        'statusCode': 200,
        'body': json.dumps(f'Successfully processed {key} from {bucket}')
    }
```

This function:

* Receives an event parameter containing details about the S3 event
* Extracts the bucket name and object key from the event
* Logs information about the file (visible in CloudWatch Logs)
* Returns a success response with HTTP status code 200

### Lambda Configuration

When setting up a Lambda function, you configure:

1. **Memory** : Between 128MB and 10GB (CPU scales with memory)
2. **Timeout** : How long the function can run (up to 15 minutes)
3. **IAM Role** : Permissions for your function
4. **Environment Variables** : Configuration values accessible to your code

### Lambda Pricing Model

Lambda has a simple pricing model:

1. **Number of requests** : You pay for each request made to your function
2. **Duration** : You pay for the time your code executes, rounded to the nearest millisecond
3. **Free tier** : 1 million requests and 400,000 GB-seconds of compute time per month

> The pay-per-use model is like paying for electricity: you only pay for what you use when you use it, down to the millisecond.

### Lambda Use Cases

* **Real-time File Processing** : Process uploads to S3 in real-time
* **Real-time Stream Processing** : Process data from Kinesis streams
* **API Backend** : Power APIs through API Gateway
* **Web Applications** : Run backend code for web applications
* **IoT Backends** : Process and respond to IoT events

## Comparing EC2 and Lambda

Let's compare these services across key dimensions:

### Management Model

 **EC2** :

* You manage the virtual server (instance)
* You are responsible for the operating system, patching, scaling
* You pay for the server running time, even when idle

 **Lambda** :

* AWS manages the execution environment
* No OS management or patching required
* You pay only when your code executes

### Example: Scaling Behavior

Imagine a web application that experiences varying load throughout the day:

 **EC2 Scaling** :

```bash
# Create an Auto Scaling group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name my-asg \
  --launch-configuration-name my-launch-config \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --vpc-zone-identifier "subnet-12345678,subnet-87654321"

# Create a scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name my-asg \
  --policy-name cpu-scale-out \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration file://config.json
```

 **Lambda Scaling** :
Lambda scales automatically. You don't need to configure any scaling parameters:

```python
# Your code automatically scales with no additional configuration
def lambda_handler(event, context):
    # Your code here
    return {
        'statusCode': 200,
        'body': 'Response from Lambda'
    }
```

> Think of EC2 like managing a fleet of delivery trucks: you need to decide how many to have running at any time, maintain them, and add more trucks when demand increases. Lambda is like a delivery service that magically appears exactly when and where packages need to be delivered, with no vehicles to maintain.

### Execution Duration

 **EC2** : Can run continuously for months or years
 **Lambda** : Limited to 15 minutes maximum execution time

### Pricing Model Comparison

Let's look at a concrete example:

 **EC2 Cost Example** :

* t3.medium instance (2 vCPU, 4GB RAM) running 24/7 for a month
* On-Demand pricing: ~$30-40/month (varies by region)
* The cost is the same whether the instance is busy or idle

 **Lambda Cost Example** :

* Function with 512MB memory
* 1 million executions per month, each running for 500ms
* Cost: ~$0.50 - $1.00 per month
* No cost when the function isn't executing

### State Management

 **EC2** :

* Persistent local storage on the instance
* State can be maintained between requests

 **Lambda** :

* Ephemeral execution environment
* State must be stored externally (S3, DynamoDB, etc.)

## Architectural Patterns

### EC2-Based Architecture Example

A traditional three-tier web application on EC2 might look like:

```
Client → Load Balancer → EC2 Web Servers → EC2 App Servers → RDS Database
```

Code for setting up an EC2 web server:

```bash
#!/bin/bash
# Install web server
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd

# Create simple web page
echo "<html><body><h1>Hello from EC2</h1></body></html>" > /var/www/html/index.html
```

### Lambda-Based Serverless Architecture Example

A serverless architecture for a similar application:

```
Client → API Gateway → Lambda Functions → DynamoDB
```

API Gateway integration with Lambda:

```javascript
// Lambda function for API backend
exports.handler = async (event) => {
    // Extract information from the API Gateway event
    const httpMethod = event.httpMethod;
    const path = event.path;
  
    // Handle different endpoints
    if (path === '/items' && httpMethod === 'GET') {
        // Code to retrieve items from DynamoDB
        const items = await getItemsFromDatabase();
      
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(items)
        };
    }
  
    // Handle other routes...
  
    // Default response for unhandled routes
    return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
    };
};
```

## When to Use Each Service

### Choose EC2 When You Need:

* Long-running applications
* Full control over the server environment
* Applications that require specific OS configurations
* Legacy applications that aren't designed for serverless
* Workloads with predictable, steady-state resource requirements

### Choose Lambda When You Need:

* Event-driven processing
* Short-running functions (under 15 minutes)
* Highly variable workloads with idle periods
* Microservices
* Simple APIs or backend processing

## Common Challenges and Solutions

### EC2 Challenges

 **Challenge** : Ensuring high availability
 **Solution** : Deploy across multiple Availability Zones

```bash
# Launch instances in multiple AZs using auto-scaling
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name multi-az-asg \
  --launch-configuration-name my-launch-config \
  --min-size 2 \
  --max-size 10 \
  --vpc-zone-identifier "subnet-12345678,subnet-87654321"
```

 **Challenge** : Security patching
 **Solution** : Use AWS Systems Manager Patch Manager

### Lambda Challenges

 **Challenge** : Cold starts
 **Solution** : Provisioned concurrency

```bash
# Configure provisioned concurrency for a Lambda function
aws lambda put-provisioned-concurrency-config \
  --function-name my-function \
  --qualifier prod \
  --provisioned-concurrent-executions 10
```

 **Challenge** : Function timeout limits
 **Solution** : Break workloads into smaller functions or move to Step Functions

## Integration with Other AWS Services

Both EC2 and Lambda integrate with the broader AWS ecosystem:

### EC2 Integration Examples

* **ELB** (Elastic Load Balancing): Distributes traffic across EC2 instances
* **EBS** (Elastic Block Store): Provides persistent block storage
* **CloudWatch** : Monitors EC2 instances and triggers alarms

### Lambda Integration Examples

* **API Gateway** : Creates RESTful APIs that invoke Lambda functions
* **S3** : Triggers Lambda functions when objects are created or modified
* **DynamoDB** : Triggers Lambda functions on table updates
* **EventBridge** : Schedules Lambda function execution

## Advanced Concepts

### EC2 Advanced Features

* **Placement Groups** : Control instance placement for networking or hardware failures
* **Dedicated Hosts** : Physical servers dedicated to your use
* **Spot Instances** : Bid on unused EC2 capacity for significant discounts

### Lambda Advanced Features

* **Layers** : Package libraries and dependencies separately from function code
* **Extensions** : Augment Lambda functions with monitoring, security and governance tools
* **Destinations** : Configure where to send results after function execution

Example of using Lambda Layers:

```bash
# Create a Lambda Layer
aws lambda publish-layer-version \
  --layer-name my-layer \
  --description "My dependencies" \
  --content S3Bucket=my-bucket,S3Key=layer.zip \
  --compatible-runtimes python3.8 python3.9

# Attach the layer to a function
aws lambda update-function-configuration \
  --function-name my-function \
  --layers arn:aws:lambda:region:account-id:layer:my-layer:1
```

## Summary

> EC2 and Lambda represent two fundamentally different approaches to computing in the cloud. EC2 gives you virtual servers with complete control, while Lambda abstracts away the server entirely, allowing you to focus solely on your code.

EC2 provides the flexibility and control of traditional server-based computing but with the advantages of cloud elasticity and scalability. It's ideal for applications that require full OS access, need to run continuously, or can't be refactored into smaller components.

Lambda represents the serverless computing paradigm, where you only worry about your code and AWS handles all infrastructure concerns. It's perfect for event-driven workloads, microservices architectures, and scenarios with variable demand.

Understanding both services and their appropriate use cases lets you select the right compute service for each workload, often using both in combination to create comprehensive cloud solutions.
