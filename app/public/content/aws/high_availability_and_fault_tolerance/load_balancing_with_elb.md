# AWS Load Balancing with Elastic Load Balancers (ELBs)

Let me explain AWS load balancing from first principles, diving deep into how the different types of Elastic Load Balancers work.

## Understanding Load Balancing: First Principles

> At its core, load balancing solves a fundamental problem: how do we distribute incoming network traffic across multiple servers to ensure no single server bears too much burden, while maintaining high availability and reliability?

Imagine you own a popular restaurant. On busy nights, having just one host seating guests would create a bottleneck—people would wait longer, the host would be overwhelmed, and if that host called in sick, nobody could seat customers. The solution? Multiple hosts working together, coordinating to distribute guests evenly across all available tables.

Load balancers in computing work similarly. They act as that coordination layer, distributing incoming traffic (customer requests) across multiple servers (tables) to ensure:

1. No single server gets overwhelmed
2. If one server fails, traffic routes to healthy servers
3. New servers can be added seamlessly during high demand
4. Users experience minimal latency and maximum availability

## AWS Elastic Load Balancers: The Family

AWS offers three main types of Elastic Load Balancers, each designed for specific use cases:

1. **Classic Load Balancer (CLB)** - The original AWS load balancer
2. **Application Load Balancer (ALB)** - For HTTP/HTTPS traffic
3. **Network Load Balancer (NLB)** - For TCP/UDP traffic at ultra-high performance

Let's explore each one in detail.

## Classic Load Balancer (CLB)

> The Classic Load Balancer is like a simple restaurant host who can seat people at tables but doesn't know much about the customers' specific preferences or needs.

The CLB was AWS's first generation load balancer. It operates at both the application layer (Layer 7) and transport layer (Layer 4) of the OSI model.

### Key Characteristics of CLB

* **Basic traffic distribution** : Routes traffic based on simple round-robin or least-connections algorithms
* **Limited routing capabilities** : Cannot route based on content, paths, or advanced rules
* **Both TCP and HTTP** : Works with both Layer 4 (TCP) and Layer 7 (HTTP/HTTPS)
* **Legacy support** : Maintained largely for backward compatibility

### Example Use Case

Imagine you have a simple web application with three identical EC2 instances. A Classic Load Balancer would distribute incoming traffic roughly equally among these instances.

```bash
# AWS CLI example for creating a Classic Load Balancer
aws elb create-load-balancer \
  --load-balancer-name my-classic-lb \
  --listeners "Protocol=HTTP,LoadBalancerPort=80,InstanceProtocol=HTTP,InstancePort=80" \
  --availability-zones us-east-1a us-east-1b \
  --security-groups sg-12345678
```

In this example, we're creating a CLB that listens on port 80 (HTTP) and distributes traffic to instances also on port 80 across two availability zones.

### Basic Health Checks

CLBs perform simple health checks to determine if instances are healthy:

```bash
aws elb configure-health-check \
  --load-balancer-name my-classic-lb \
  --health-check Target=HTTP:80/index.html,Interval=30,Timeout=5,UnhealthyThreshold=2,HealthyThreshold=2
```

This configures a health check that tests if `/index.html` is accessible on port 80. If it fails twice, the instance is marked unhealthy.

## Application Load Balancer (ALB)

> If CLB is a basic restaurant host, the Application Load Balancer is like a sophisticated maître d' who not only seats people but understands their preferences, the type of occasion, and can direct them to specialized sections of the restaurant.

The ALB operates exclusively at Layer 7 (application layer) and is designed for modern web applications, especially those with microservices architectures.

### Key Characteristics of ALB

* **Content-based routing** : Routes requests based on URL paths, hostname, HTTP headers, and query parameters
* **Support for containers** : Integrates with ECS, EKS, and other container services
* **WebSockets support** : Maintains long-running connections
* **HTTP/2 support** : Benefits from HTTP/2 protocol optimizations
* **Authentication integration** : Works with identity providers like Cognito

### Content-Based Routing Example

Let's say you have a web application with different components:

* `/api/*` routes should go to your API servers
* `/images/*` routes should go to your media servers
* Everything else goes to your main application servers

Here's how you'd configure an ALB to handle this:

```bash
# First, create the load balancer
aws elbv2 create-load-balancer \
  --name my-application-lb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678

# Create a target group for API servers
aws elbv2 create-target-group \
  --name api-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345678 \
  --health-check-path /api/health

# Create a target group for media servers
aws elbv2 create-target-group \
  --name media-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345678 \
  --health-check-path /images/health

# Create a target group for the main application
aws elbv2 create-target-group \
  --name main-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345678 \
  --health-check-path /health

# Create listener and rules
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-application-lb/50dc6c495c0c9188 \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/main-targets/73e2d6bc24d8a067

# Add rule to route /api/* to API servers
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2 \
  --priority 10 \
  --conditions Field=path-pattern,Values='/api/*' \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api-targets/73e2d6bc24d8a067

# Add rule to route /images/* to media servers
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2 \
  --priority 20 \
  --conditions Field=path-pattern,Values='/images/*' \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/media-targets/73e2d6bc24d8a067
```

In this example, we're creating:

1. An Application Load Balancer
2. Three target groups for different server types
3. A listener on port 80
4. Rules that direct traffic based on URL path

### Advanced ALB Features

ALBs provide several advanced features:

#### Host-Based Routing

```bash
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2 \
  --priority 5 \
  --conditions Field=host-header,Values='api.example.com' \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api-targets/73e2d6bc24d8a067
```

This routes traffic specifically for the hostname `api.example.com` to your API servers.

#### Weighted Target Groups

```bash
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2 \
  --priority 30 \
  --conditions Field=path-pattern,Values='/beta/*' \
  --actions Type=forward,ForwardConfig='{
    "TargetGroups": [
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/beta-v1/73e2d6bc24d8a067",
        "Weight": 80
      },
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/beta-v2/73e2d6bc24d8a068",
        "Weight": 20
      }
    ]
  }'
```

This implements a simple A/B testing scenario, sending 80% of beta traffic to v1 and 20% to v2.

## Network Load Balancer (NLB)

> If ALB is a sophisticated maître d', the Network Load Balancer is like having a team of Formula 1 pit crew members—extremely fast, incredibly efficient, and designed to handle high-stress situations with precision, but without needing to understand the finer details of customer preferences.

The NLB operates at Layer 4 (transport layer) and is designed for extreme performance, handling millions of requests per second with ultra-low latency.

### Key Characteristics of NLB

* **Ultra-high performance** : Handles millions of requests per second
* **Static IP addresses** : Can have fixed, predictable IP addresses per availability zone
* **Preserve source IP** : Client IP is preserved all the way to the target
* **TCP/UDP/TLS support** : Works with these Layer 4 protocols
* **Extremely low latency** : Single-digit millisecond latency

### Example NLB Setup

Let's create an NLB for a high-performance gaming application that needs stable IPs and low latency:

```bash
# Create the Network Load Balancer with static IPs
aws elbv2 create-load-balancer \
  --name my-network-lb \
  --type network \
  --subnets subnet-12345678 subnet-87654321 \
  --subnet-mappings SubnetId=subnet-12345678,AllocationId=eipalloc-12345678 SubnetId=subnet-87654321,AllocationId=eipalloc-87654321

# Create a target group for game servers
aws elbv2 create-target-group \
  --name game-server-targets \
  --protocol TCP \
  --port 3000 \
  --vpc-id vpc-12345678 \
  --health-check-protocol TCP \
  --health-check-port 3000 \
  --target-type instance

# Create a listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/my-network-lb/50dc6c495c0c9188 \
  --protocol TCP \
  --port 3000 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/game-server-targets/73e2d6bc24d8a067
```

In this example, we're creating:

1. A Network Load Balancer with Elastic IPs (static IP addresses)
2. A target group for game servers using TCP protocol
3. A TCP listener on port 3000

### Using TLS with NLB

For secure communications while maintaining NLB's performance:

```bash
# Create TLS listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/my-network-lb/50dc6c495c0c9188 \
  --protocol TLS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
  --ssl-policy ELBSecurityPolicy-TLS-1-2-2017-01 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/secure-targets/73e2d6bc24d8a067
```

This creates a TLS listener on port 443, using a certificate from AWS Certificate Manager.

## Practical Comparison: When to Use Each Type

### Choose CLB When:

* You have legacy applications designed for Classic Load Balancer
* Your application is simple with identical backend instances
* You need basic load balancing without complex features

### Choose ALB When:

* You need content-based routing (path-based, host-based)
* You're running microservices or container-based applications
* You need HTTP/HTTPS features like redirects or authentication
* You want WebSocket support
* You need to route to different target groups based on request attributes

### Choose NLB When:

* You need extreme performance (millions of requests per second)
* Ultra-low latency is critical (e.g., gaming, trading, IoT)
* You need static IP addresses for your load balancer
* You're working with protocols not supported by ALB (non-HTTP/HTTPS)
* You need to preserve client IP addresses all the way to your applications

## Deep Dive: How ELBs Work Under the Hood

To truly understand ELBs, let's examine what happens when a request flows through the system.

### Request Flow Through an ALB

1. **DNS Resolution** : Client resolves the ALB's DNS name

```
   example.com -> elb1234.us-east-1.elb.amazonaws.com -> [IP1, IP2, IP3, ...]
```

1. **Connection to ALB Node** : Client connects to one of the ALB's IP addresses
2. **Load Balancer Evaluation** : ALB evaluates the request against its rules

* Examines HTTP headers, path, method, query strings
* Identifies the matching rule with highest priority
* Selects target group associated with that rule

1. **Target Selection** : ALB chooses a specific target from the target group

* Uses algorithms like round-robin or least outstanding requests
* Considers target health status
* May implement sticky sessions if configured

1. **Connection to Target** : ALB establishes a new connection to the chosen target
2. **Response Flow** : Response from target flows back through ALB to client

### How Health Checks Work

ELBs constantly monitor the health of registered targets:

1. **Health Check Configuration** : You define:

* Protocol and port
* Path (for HTTP/HTTPS)
* Success criteria
* Check frequency and thresholds

1. **Health Check Process** :

```
   ELB ---[Health Check Request]---> Target
   ELB <---[Health Check Response]--- Target
```

1. **Health State Transitions** :

* Target begins in `initial` state
* Passes HealthyThreshold checks → `healthy`
* Fails UnhealthyThreshold checks → `unhealthy`
* When unhealthy, no new connections sent to target

### Load Balancer Scaling

ELBs automatically scale to handle traffic:

1. **Pre-warming** : For known traffic spikes, AWS can "pre-warm" your load balancer
2. **Node Scaling** : ELBs add nodes as traffic increases
3. **Capacity Units** : Each ELB type has capacity units that scale independently

## Common Load Balancing Patterns

### Blue/Green Deployments with ALB

```
Internet --> ALB --> [Blue Environment (Current)] 
                  \-> [Green Environment (New)]
```

1. Deploy the new version to the Green environment
2. Test the Green environment using path or host-based routing
3. Gradually shift traffic from Blue to Green using weighted target groups:

```bash
# Initially, send 100% to Blue, 0% to Green
aws elbv2 modify-rule \
  --rule-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:rule/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2/1234567890abcdef \
  --actions Type=forward,ForwardConfig='{
    "TargetGroups": [
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/blue/73e2d6bc24d8a067",
        "Weight": 100
      },
      {
        "TargetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/green/73e2d6bc24d8a068",
        "Weight": 0
      }
    ]
  }'

# Shift to 80% Blue, 20% Green
# Gradually increase Green percentage
# Eventually, 0% Blue, 100% Green
```

### Microservices Architecture with ALB

```
Internet --> ALB --> [Service A - /api/users/*]
                  \-> [Service B - /api/products/*]
                  \-> [Service C - /api/orders/*]
```

Configure path-based routing to direct requests to appropriate microservices:

```bash
# Rule for users service
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/my-application-lb/50dc6c495c0c9188/f2f7dc8efc522ab2 \
  --priority 10 \
  --conditions Field=path-pattern,Values='/api/users/*' \
  --actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/users-service/73e2d6bc24d8a067

# Similar rules for products and orders services
```

### High-Performance TCP Services with NLB

```
Internet --> NLB --> [TCP Service Instances]
```

Perfect for databases, game servers, and other TCP-based services:

```bash
# Create NLB for a database service
aws elbv2 create-load-balancer \
  --name database-nlb \
  --type network \
  --subnets subnet-12345678 subnet-87654321

# Create target group
aws elbv2 create-target-group \
  --name database-targets \
  --protocol TCP \
  --port 5432 \
  --vpc-id vpc-12345678 \
  --target-type instance

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/database-nlb/50dc6c495c0c9188 \
  --protocol TCP \
  --port 5432 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/database-targets/73e2d6bc24d8a067
```

## Best Practices for AWS ELBs

### Security Best Practices

1. **Use HTTPS/TLS** : Terminate SSL/TLS at the load balancer

```bash
   aws elbv2 create-listener \
     --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-application-lb/50dc6c495c0c9188 \
     --protocol HTTPS \
     --port 443 \
     --certificates CertificateArn=arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012 \
     --ssl-policy ELBSecurityPolicy-FS-1-2-Res-2019-08 \
     --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/73e2d6bc24d8a067
```

1. **Secure Security Groups** : Restrict traffic to necessary sources

```bash
   aws ec2 create-security-group \
     --group-name elb-sg \
     --description "Security group for ELB" \
     --vpc-id vpc-12345678

   # Allow HTTPS from anywhere
   aws ec2 authorize-security-group-ingress \
     --group-id sg-elb12345 \
     --protocol tcp \
     --port 443 \
     --cidr 0.0.0.0/0

   # Backend security group - only allow traffic from ELB
   aws ec2 authorize-security-group-ingress \
     --group-id sg-backend12345 \
     --protocol tcp \
     --port 80 \
     --source-group sg-elb12345
```

1. **Enable Access Logs** : Log all access for security analysis

```bash
   aws elbv2 modify-load-balancer-attributes \
     --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-application-lb/50dc6c495c0c9188 \
     --attributes Key=access_logs.s3.enabled,Value=true Key=access_logs.s3.bucket,Value=my-logs-bucket Key=access_logs.s3.prefix,Value=my-app-lb-logs
```

### Performance Best Practices

1. **Cross-Zone Load Balancing** : Ensure even distribution across AZs

```bash
   aws elbv2 modify-load-balancer-attributes \
     --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/my-application-lb/50dc6c495c0c9188 \
     --attributes Key=load_balancing.cross_zone.enabled,Value=true
```

1. **Connection Draining (Target Group Deregistration Delay)** : Allow in-flight requests to complete

```bash
   aws elbv2 modify-target-group-attributes \
     --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/73e2d6bc24d8a067 \
     --attributes Key=deregistration_delay.timeout_seconds,Value=30
```

1. **Health Check Tuning** : Optimize health check settings

```bash
   aws elbv2 modify-target-group \
     --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/73e2d6bc24d8a067 \
     --health-check-protocol HTTP \
     --health-check-port 80 \
     --health-check-path /health \
     --health-check-interval-seconds 15 \
     --health-check-timeout-seconds 5 \
     --healthy-threshold-count 2 \
     --unhealthy-threshold-count 2
```

### Reliability Best Practices

1. **Multi-AZ Deployment** : Deploy across multiple Availability Zones

```bash
   aws elbv2 create-load-balancer \
     --name multi-az-lb \
     --subnets subnet-12345678 subnet-87654321 subnet-56781234 \
     --security-groups sg-12345678
```

1. **Auto Scaling Integration** : Dynamically adjust capacity

```bash
   # Create auto scaling group with target group
   aws autoscaling create-auto-scaling-group \
     --auto-scaling-group-name my-asg \
     --launch-configuration-name my-launch-config \
     --min-size 2 \
     --max-size 10 \
     --target-group-arns arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/my-targets/73e2d6bc24d8a067 \
     --vpc-zone-identifier "subnet-12345678,subnet-87654321"
```

1. **Monitoring and Alerting** : Set up CloudWatch alarms

```bash
   aws cloudwatch put-metric-alarm \
     --alarm-name HighLatency \
     --alarm-description "Alarm when latency exceeds 1 second" \
     --metric-name TargetResponseTime \
     --namespace AWS/ApplicationELB \
     --statistic Average \
     --period 60 \
     --threshold 1 \
     --comparison-operator GreaterThanThreshold \
     --dimensions Name=LoadBalancer,Value=app/my-application-lb/50dc6c495c0c9188 \
     --evaluation-periods 3 \
     --alarm-actions arn:aws:sns:us-east-1:123456789012:my-alarm-topic
```

## Conclusion

AWS Elastic Load Balancers provide a robust set of tools for distributing traffic across your applications. By understanding the fundamental principles and specific capabilities of each type:

* **Classic Load Balancer (CLB)** : Simple, legacy option for basic load balancing
* **Application Load Balancer (ALB)** : Sophisticated HTTP/HTTPS routing with content-based decisions
* **Network Load Balancer (NLB)** : High-performance, low-latency option for TCP/UDP traffic

You can design resilient, scalable architectures that handle varying loads effectively. Each load balancer type addresses specific needs, from basic traffic distribution to complex, intelligent routing strategies, providing the foundation for reliable and performant AWS-based applications.
