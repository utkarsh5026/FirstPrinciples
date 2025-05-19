# AWS Detective: Security Investigation from First Principles

I'll explain AWS Detective from the ground up, covering its core concepts, how it works, and how security teams use it to investigate potential threats.

> The most profound security investigations begin not with complex tools, but with a simple question: "What happened, and why?"

## Understanding Security Investigation Fundamentals

Before diving into AWS Detective specifically, let's establish what security investigation actually means.

### The Security Investigation Process

Security investigation is the systematic examination of security-related events to understand:

1. What happened (the timeline and scope of events)
2. How it happened (the attack vectors and techniques used)
3. Why it happened (the vulnerabilities that were exploited)
4. What was affected (the resources and data impacted)

In traditional environments, this investigation process typically involves:

* Manual log collection from multiple systems
* Correlation of events across different timeframes
* Analysis of network traffic patterns
* Examination of access patterns and user behaviors

This process is often challenging because:

* Data exists in silos across different systems
* The volume of data is enormous
* Relationships between events aren't obvious
* Visualizing the attack path is difficult

## Enter AWS Detective

AWS Detective is a security service that automates much of this investigative process within AWS environments. It ingests logs from multiple AWS sources, applies machine learning and graph theory to analyze relationships, and provides visualization tools to help investigators understand and respond to potential security threats.

> Detective work is about connecting the dots - AWS Detective simply helps you see which dots should be connected.

### The Problem Detective Solves

Let me illustrate with an example:

Imagine you receive an alert that an EC2 instance in your environment is communicating with a known malicious IP address. Some questions immediately arise:

* When did this communication begin?
* What other resources might this instance have contacted?
* Has the instance's behavior changed recently?
* What IAM users or roles accessed this instance before the communication started?

Answering these questions traditionally requires:

1. Collecting VPC Flow Logs to see network traffic
2. Examining CloudTrail logs to see API calls
3. Looking at GuardDuty findings
4. Manually analyzing how these different data points relate to each other

This is time-consuming, error-prone, and might miss important connections.

## How AWS Detective Works

AWS Detective solves this by:

1. **Automatic data collection** : It pulls data from AWS CloudTrail logs, VPC Flow Logs, and Amazon GuardDuty findings
2. **Data processing** : It extracts entities (like IAM users, IP addresses, EC2 instances) and their relationships
3. **Graph creation** : It builds a behavior graph that maps relationships between entities over time
4. **Machine learning analysis** : It establishes baselines and identifies anomalous behaviors
5. **Visualization** : It provides interactive visualizations to help investigators explore the data

### Core Concepts in AWS Detective

#### Behavior Graph

The foundation of AWS Detective is the behavior graph - a data structure that maps relationships between entities in your AWS environment.

An entity could be:

* An IAM user or role
* An EC2 instance
* An IP address
* An S3 bucket
* A Lambda function

The graph captures how these entities interact over time, making it possible to trace activity paths and identify suspicious patterns.

#### Data Sources

Detective automatically ingests and processes data from:

1. **AWS CloudTrail** : Records API calls made within your AWS account
2. **Amazon VPC Flow Logs** : Records network traffic in your VPC
3. **Amazon GuardDuty** : Provides threat detection findings

Let's look at what each contributes:

**CloudTrail** provides context like:

* Which user created an EC2 instance
* When IAM permissions were changed
* What API calls were made from a particular role

**VPC Flow Logs** show:

* Communication between resources
* Connections to external IP addresses
* Network traffic patterns and volumes

**GuardDuty** adds:

* Known threat intelligence
* Initial indicators of compromise
* Automated detection of suspicious activity

#### Baseline and Anomaly Detection

Detective establishes behavioral baselines for entities in your environment and highlights deviations that might indicate security issues.

For example, it might establish that:

* A specific IAM role typically makes 50-100 API calls per day
* An EC2 instance normally communicates with 5-10 IP addresses
* Network traffic to a certain S3 bucket is usually under 5GB per day

When these patterns change significantly, Detective can help you visualize and investigate these changes.

## Using AWS Detective for Investigations

Let's walk through a practical example of using Detective to investigate a security incident.

### Example Investigation: Unusual API Activity

Scenario: You receive a GuardDuty finding that indicates unusual API call patterns from an IAM role named "DevelopmentRole".

#### Step 1: Access the Detective Console

You would log into the AWS Console and navigate to the Detective service.

#### Step 2: Locate the Entity

In the Detective search interface, you'd search for "DevelopmentRole" to find the IAM role in question.

#### Step 3: Examine the Profile Panel

Detective presents a profile panel showing:

* A timeline of the role's activity
* Visualization of API call volume over time
* Geographic locations of API calls
* Unusual API calls that this role hasn't made before

Here's a simplified example of the code that might power such a visualization:

```javascript
// Example of timeline visualization code
const timelineChart = new TimeSeriesChart({
  element: document.getElementById('api-timeline'),
  data: apiCallData,
  timeField: 'timestamp',
  valueField: 'callCount',
  // Highlight anomalous time periods
  anomalyDetection: {
    enabled: true,
    threshold: 2.5 // Standard deviations from normal
  }
});

timelineChart.render();
```

This visualization would show spikes in API activity that deviate from the normal pattern.

#### Step 4: Investigate Related Entities

From the role's profile, you can see:

* Which EC2 instances were accessed using this role
* Which IP addresses made requests using this role
* What unusual API calls were made

Let's say you notice the role was used to access an EC2 instance that it normally doesn't interact with. You can click on that EC2 instance to pivot your investigation.

#### Step 5: Examine the EC2 Instance Profile

The EC2 instance profile might show:

* Unusual outbound connections to unknown IP addresses
* Changes in the volume of network traffic
* API calls made to create new resources

A snippet of code that might analyze this network activity:

```python
# Example code that might analyze network traffic patterns
def analyze_vpc_flow_logs(instance_id, time_range):
    # Fetch flow logs for the instance
    flow_logs = get_flow_logs_for_instance(instance_id, time_range)
  
    # Group by destination IP
    destination_counts = {}
    for log in flow_logs:
        dest_ip = log['destination_ip']
        if dest_ip in destination_counts:
            destination_counts[dest_ip] += log['bytes']
        else:
            destination_counts[dest_ip] = log['bytes']
  
    # Identify unusual destinations
    usual_destinations = get_historical_destinations(instance_id)
    unusual_destinations = []
  
    for ip, bytes in destination_counts.items():
        if ip not in usual_destinations:
            unusual_destinations.append({
                'ip': ip,
                'bytes': bytes,
                'country': get_ip_country(ip)
            })
  
    return unusual_destinations
```

#### Step 6: Build the Attack Timeline

Based on the information you've gathered, you can now reconstruct the attack timeline:

1. The attacker obtained credentials for the DevelopmentRole (perhaps through phishing)
2. They used this role to access an EC2 instance not normally accessed by this role
3. From this instance, they established connections to external command and control servers
4. They then attempted to access additional AWS resources

## Advanced Detective Capabilities

### Finding Groups

Detective allows you to create finding groups, which aggregate related security findings to help you understand broader attack campaigns rather than just individual alerts.

> Think of finding groups as chapters in a mystery novel, where individual findings are merely sentences.

### Multi-Account Management

For organizations with multiple AWS accounts, Detective supports multi-account management through AWS Organizations. This allows security teams to:

1. Set up a central Detective administrator account
2. Automatically include member accounts in investigations
3. See cross-account relationships that might indicate lateral movement by attackers

Here's a simplified example of how you might set up multi-account Detective with AWS SDK:

```python
# Example code to enable Detective across multiple accounts
import boto3

# Initialize Detective client
detective = boto3.client('detective')

# Enable Detective in the administrator account
graph_response = detective.create_graph()
graph_arn = graph_response['GraphArn']

# Add member accounts to the graph
member_accounts = [
    {'AccountId': '111122223333', 'EmailAddress': 'security@example.com'},
    {'AccountId': '444455556666', 'EmailAddress': 'devops@example.com'}
]

detective.create_members(
    GraphArn=graph_arn,
    Message='Please accept this invitation to AWS Detective',
    Accounts=member_accounts
)
```

### Integration with Security Lake

AWS Detective can also integrate with AWS Security Lake, which serves as a centralized repository for security data across AWS services, on-premises environments, and third-party sources.

This integration gives Detective access to even more context for investigations, including:

* Data from on-premises security tools
* Third-party security logs
* Custom log sources

## Detective Workflow Integration

Detective doesn't operate in isolation - it's typically part of a broader security workflow:

1. **Detection** : Tools like GuardDuty, Security Hub, or third-party SIEM systems detect potential security issues
2. **Investigation** : Security analysts use Detective to understand the scope and impact of these issues
3. **Remediation** : Based on Detective's insights, security teams take action to address the problems
4. **Prevention** : Learnings from investigations inform security improvements to prevent similar issues

Here's how this might look in practice:

```python
# Example pseudocode for a security workflow
def security_incident_workflow(finding_id):
    # Step 1: Retrieve the initial finding
    finding = guardduty.get_finding(finding_id)
  
    # Step 2: Enrich with Detective data
    detective_details = detective.investigate_finding(finding_id)
  
    # Step 3: Determine severity and impact
    severity = calculate_severity(finding, detective_details)
    affected_resources = detective_details.get_affected_resources()
  
    # Step 4: Remediate based on findings
    if severity > CRITICAL_THRESHOLD:
        # Automatic remediation for critical issues
        remediation.isolate_resources(affected_resources)
        remediation.revoke_compromised_credentials(detective_details.get_compromised_credentials())
        notification.alert_security_team(finding, detective_details, severity)
    else:
        # Queue for manual review
        ticket.create_investigation_ticket(finding, detective_details, severity)
```

## Setting Up AWS Detective

Setting up Detective involves a few key steps:

1. **Enable the service** : This can be done through the AWS Console or programmatically
2. **Configure data sources** : Ensure CloudTrail, VPC Flow Logs, and GuardDuty are properly configured
3. **Set up access permissions** : Create IAM roles and policies for security analysts
4. **Configure retention settings** : Determine how long you need to keep Detective data

A simple setup using the AWS CLI might look like:

```bash
# Enable Detective
aws detective create-graph

# Get the graph ARN
graph_arn=$(aws detective list-graphs --query 'GraphList[0].Arn' --output text)

# Configure data source settings
aws detective update-graph-settings \
  --graph-arn $graph_arn \
  --logging-configuration '{
    "CloudTrailLoggingEnabled": true,
    "VpcFlowLoggingEnabled": true,
    "GuardDutyLoggingEnabled": true
  }'
```

## Detective Pricing and Considerations

Detective pricing is based on:

* The volume of data ingested from CloudTrail, VPC Flow Logs, and GuardDuty
* The retention period for your data

Key considerations when implementing Detective:

1. **Data volume** : Environments with high API activity or network traffic will incur higher costs
2. **Multi-account setup** : Costs scale with the number of accounts
3. **Retention needs** : Longer retention periods increase costs but provide more historical context
4. **Integration requirements** : Consider how Detective will fit into your existing security tools and processes

## Detective Limitations and Best Practices

### Limitations

Detective has some limitations to be aware of:

1. **Historical data** : Detective can only analyze data from the point it was enabled
2. **AWS-focused** : It primarily analyzes AWS resources and may miss on-premises or third-party cloud issues
3. **Finding correlation** : While Detective helps see relationships, human analysts still need to interpret the data
4. **Learning curve** : The graph-based approach may require training for security teams

### Best Practices

To get the most from Detective:

1. **Enable early** : Turn on Detective before you need it so you have historical data
2. **Use with GuardDuty** : The combination provides both detection and investigation capabilities
3. **Train investigators** : Ensure security teams understand how to use the visualization tools
4. **Establish workflows** : Create clear processes for when and how to use Detective in investigations
5. **Regularly review** : Periodically review Detective findings even without specific alerts

> The best investigations don't begin with a tool, but with a curious mind armed with the right tools.

## Summary

AWS Detective transforms security investigation by:

1. Automatically collecting and processing security telemetry from multiple AWS sources
2. Building relationship graphs that show how entities interact over time
3. Establishing behavioral baselines and highlighting anomalies
4. Providing visualization tools to help investigators explore complex data
5. Enabling rapid understanding of security incidents and their impact

When used as part of a comprehensive security strategy, Detective helps security teams answer the critical questions: what happened, how it happened, why it happened, and what was affected - all critical elements in responding effectively to security threats in AWS environments.
