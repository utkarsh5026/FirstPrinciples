# Terraform for AWS Provisioning: A First Principles Approach

Let's explore Terraform for AWS provisioning from the ground up, building our understanding layer by layer.

## Understanding Infrastructure as Code

> Infrastructure as Code (IaC) is the practice of managing and provisioning computing infrastructure through machine-readable definition files rather than physical hardware configuration or interactive configuration tools.

Before we dive into Terraform specifically, we need to understand why it exists. Traditionally, infrastructure was created manually:

1. Logging into web consoles
2. Clicking buttons to create resources
3. Manually configuring settings
4. Documenting changes in wikis or documents

This approach creates several problems:

* **Human error** : Manual processes are prone to mistakes
* **Configuration drift** : Systems deviate from desired state over time
* **Limited scalability** : Cannot easily replicate configurations
* **Poor auditability** : Difficult to track who changed what and when
* **No version control** : Cannot easily roll back to previous states

Infrastructure as Code solves these problems by describing infrastructure in text files that can be:

* Stored in version control systems (like Git)
* Reviewed like any other code
* Tested automatically
* Deployed consistently
* Rolled back when needed

## What is Terraform?

> Terraform is an open-source infrastructure as code software tool created by HashiCorp that enables users to define and provision infrastructure using a declarative configuration language.

Terraform was created by HashiCorp in 2014 and has since become one of the most popular IaC tools. Its key characteristics include:

1. **Declarative syntax** : You describe what you want, not how to create it
2. **Provider model** : Interfaces with many cloud platforms and services
3. **State management** : Tracks the current state of your infrastructure
4. **Plan and apply workflow** : Shows changes before making them
5. **Resource graph** : Models dependencies between resources

Let's look at a simple example of Terraform code:

```hcl
# This is a basic AWS provider configuration
provider "aws" {
  region = "us-west-2"
}

# This creates an EC2 instance
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "example-instance"
  }
}
```

In this example:

* We declare we'll be using AWS as our provider
* We specify the region (us-west-2)
* We define a resource of type `aws_instance` named "example"
* We configure its basic properties (AMI, instance type, and tags)

This simple file, when processed by Terraform, would create an actual EC2 instance in your AWS account.

## Core Terraform Concepts

### 1. Providers

> Providers are plugins that enable Terraform to interact with specific cloud platforms, services, or APIs.

Providers are the bridge between Terraform and external services. The AWS provider allows Terraform to create and manage AWS resources. Here's how you configure the AWS provider:

```hcl
provider "aws" {
  region     = "us-east-1"
  access_key = "AKIAIOSFODNN7EXAMPLE" # Better to use environment variables
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" # Better to use environment variables
}
```

It's better practice to use environment variables or AWS profiles rather than hardcoded credentials:

```hcl
provider "aws" {
  region  = "us-east-1"
  profile = "my-aws-profile" # Uses credentials from ~/.aws/credentials
}
```

### 2. Resources

> Resources are the most important element in Terraform. Each resource block describes one or more infrastructure objects.

Resources follow this general syntax:

```hcl
resource "PROVIDER_RESOURCETYPE" "NAME" {
  ARGUMENT1 = VALUE1
  ARGUMENT2 = VALUE2
}
```

For example, to create an S3 bucket:

```hcl
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-unique-bucket-name-2023"
  acl    = "private"
  
  tags = {
    Environment = "Development"
    Project     = "Learning Terraform"
  }
}
```

This code:

* Creates a resource of type `aws_s3_bucket`
* Names it "my_bucket" (this is the Terraform identifier, not the actual bucket name)
* Sets the actual bucket name to "my-unique-bucket-name-2023"
* Sets the access control list (ACL) to private
* Adds tags for organization

### 3. Data Sources

> Data sources allow Terraform to use information defined outside of Terraform, or modified by functions not managed by Terraform.

Data sources fetch existing resources rather than creating them. For example:

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  
  owners = ["099720109477"] # Canonical
}

# Now we can use this AMI ID in a resource
resource "aws_instance" "web_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
}
```

This code:

* Searches for the most recent Ubuntu 20.04 AMI from Canonical
* Uses that AMI ID when creating an EC2 instance
* Avoids hardcoding AMI IDs that change over time

### 4. Variables and Outputs

> Variables serve as parameters for a Terraform module, allowing customization without altering the module's code.

Variables let you make your Terraform code reusable:

```hcl
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

provider "aws" {
  region = var.aws_region
}

resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type
  
  tags = {
    Name = "example-instance"
  }
}
```

> Outputs are like return values for a Terraform module.

Outputs expose specific values:

```hcl
output "instance_ip" {
  description = "The public IP of the web server"
  value       = aws_instance.example.public_ip
}

output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.example.id
}
```

When you run `terraform apply`, these values are displayed. They can also be used by other Terraform configurations.

## The Terraform Workflow

The Terraform workflow consists of three main steps:

### 1. Initialize (terraform init)

> Initialization prepares the working directory for use with Terraform.

This command:

* Downloads provider plugins
* Sets up the backend for storing state
* Prepares the working directory

```bash
$ terraform init

Initializing the backend...

Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 3.0"...
- Installing hashicorp/aws v3.74.0...
- Installed hashicorp/aws v3.74.0 (signed by HashiCorp)

Terraform has been successfully initialized!
```

### 2. Plan (terraform plan)

> Planning determines what actions are necessary to achieve the desired state.

This command:

* Reads the current state of resources
* Compares it with your configuration
* Shows what changes would be made

```bash
$ terraform plan

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated with the
following symbols:
  + create

Terraform will perform the following actions:

  # aws_instance.example will be created
  + resource "aws_instance" "example" {
      + ami                          = "ami-0c55b159cbfafe1f0"
      + instance_type                = "t2.micro"
      + tags                         = {
          + "Name" = "example-instance"
        }
      # ... other computed attributes
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

### 3. Apply (terraform apply)

> Apply executes the actions proposed in the plan.

This command:

* Executes the proposed changes
* Updates the state file
* Shows output values

```bash
$ terraform apply

# ... same plan output as above ...

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value: yes

aws_instance.example: Creating...
aws_instance.example: Creation complete after 40s [id=i-1234567890abcdef0]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

instance_id = "i-1234567890abcdef0"
instance_ip = "34.218.45.67"
```

## Setting Up Terraform for AWS

To use Terraform with AWS, you need to:

1. **Install Terraform** :

* Download from the HashiCorp website
* Or use package managers: `brew install terraform`, `choco install terraform`, etc.

1. **Configure AWS credentials** :

* Create an IAM user with appropriate permissions
* Configure credentials using one of these methods:
  * AWS CLI: `aws configure`
  * Environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
  * Shared credentials file: `~/.aws/credentials`

1. **Create your first Terraform configuration** :

* Create a new directory
* Add `.tf` files with your configuration
* Run `terraform init`, `terraform plan`, and `terraform apply`

Let's create a simple AWS infrastructure with:

* A VPC
* Public and private subnets
* An internet gateway
* A simple EC2 instance

```hcl
# main.tf

provider "aws" {
  region = "us-west-2"
}

# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "MainVPC"
  }
}

# Create a public subnet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-west-2a"
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "Public Subnet"
  }
}

# Create an internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "Main Internet Gateway"
  }
}

# Create a route table for the public subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  
  tags = {
    Name = "Public Route Table"
  }
}

# Associate the route table with the public subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# Create a security group
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "Allow SSH"
  }
}

# Create an EC2 instance
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI
  instance_type = "t2.micro"
  
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.allow_ssh.id]
  associate_public_ip_address = true
  
  tags = {
    Name = "Web Server"
  }
}
```

This example demonstrates:

* Creating a VPC with a CIDR block
* Creating a public subnet within that VPC
* Adding an internet gateway to enable internet access
* Setting up routing to direct traffic through the internet gateway
* Creating a security group to allow SSH access
* Launching an EC2 instance in the public subnet

## Variables and Modularity

To make our configuration more reusable, let's refactor it to use variables:

```hcl
# variables.tf

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
  default     = "ami-0c55b159cbfafe1f0" # Amazon Linux 2 AMI
}
```

```hcl
# main.tf

provider "aws" {
  region = var.aws_region
}

# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  
  tags = {
    Name = "MainVPC"
  }
}

# Create a public subnet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidr
  availability_zone = "${var.aws_region}a"
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "Public Subnet"
  }
}

# ... rest of the resources using variables ...

# Create an EC2 instance
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.allow_ssh.id]
  associate_public_ip_address = true
  
  tags = {
    Name = "Web Server"
  }
}
```

```hcl
# outputs.tf

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}

output "instance_id" {
  description = "ID of the created EC2 instance"
  value       = aws_instance.web.id
}

output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.web.public_ip
}
```

By separating variables, resources, and outputs into different files, we make our configuration more organized and maintainable.

## Terraform Modules

> Modules are containers for multiple resources that are used together. They allow you to create reusable components.

Let's create a VPC module:

```hcl
# modules/vpc/variables.tf

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}
```

```hcl
# modules/vpc/main.tf

# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  
  tags = {
    Name = "MainVPC"
  }
}

# Create a public subnet
resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.public_subnet_cidr
  availability_zone = "${var.region}a"
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "Public Subnet"
  }
}

# Create an internet gateway
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "Main Internet Gateway"
  }
}

# Create a route table for the public subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  
  tags = {
    Name = "Public Route Table"
  }
}

# Associate the route table with the public subnet
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

```hcl
# modules/vpc/outputs.tf

output "vpc_id" {
  description = "ID of the created VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = aws_subnet.public.id
}
```

Now we can use this module in our main configuration:

```hcl
# main.tf

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"
  
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  region             = var.aws_region
}

# Create a security group
resource "aws_security_group" "allow_ssh" {
  name        = "allow_ssh"
  description = "Allow SSH inbound traffic"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "Allow SSH"
  }
}

# Create an EC2 instance
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  subnet_id                   = module.vpc.public_subnet_id
  vpc_security_group_ids      = [aws_security_group.allow_ssh.id]
  associate_public_ip_address = true
  
  tags = {
    Name = "Web Server"
  }
}
```

## State Management

> Terraform state is a crucial component that maps resources in your configuration to real-world resources.

Terraform stores the state of your infrastructure in a file called `terraform.tfstate`. By default, this file is stored locally, but in a team environment, you should use a remote backend.

### Local State

When using local state:

* The state file is stored on your local filesystem
* Only one person can modify the infrastructure at a time
* There's a risk of losing the state file
* Sensitive information might be stored in plain text

### Remote State

For production environments, use a remote backend:

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "prod/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
```

This configuration:

* Stores the state file in an S3 bucket
* Uses DynamoDB for state locking (prevents concurrent modifications)
* Encrypts the state file at rest

### State Operations

Terraform provides several commands for working with state:

* `terraform state list`: Lists resources in the state
* `terraform state show [resource]`: Shows details of a specific resource
* `terraform state mv [source] [destination]`: Moves resources within state
* `terraform state rm [resource]`: Removes a resource from state
* `terraform import [resource] [id]`: Imports existing resources into state

## Advanced Terraform Concepts for AWS

### 1. Data Sources for Existing Resources

Instead of creating new resources, you can reference existing ones:

```hcl
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "default" {
  vpc_id = data.aws_vpc.default.id
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = data.aws_vpc.default.id
  
  # ... security group rules ...
}
```

This code uses the default VPC and its subnets instead of creating new ones.

### 2. Count and For_each for Multiple Resources

To create multiple similar resources:

```hcl
# Using count
variable "instance_count" {
  description = "Number of EC2 instances to create"
  type        = number
  default     = 3
}

resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = {
    Name = "Web-${count.index + 1}"
  }
}

# Using for_each
variable "instance_types" {
  description = "Map of instance types to create"
  type        = map(string)
  default     = {
    small  = "t2.micro"
    medium = "t2.small"
    large  = "t2.medium"
  }
}

resource "aws_instance" "app" {
  for_each      = var.instance_types
  ami           = var.ami_id
  instance_type = each.value
  
  tags = {
    Name = "App-${each.key}"
  }
}
```

The difference between `count` and `for_each`:

* `count` creates an indexed list of resources
* `for_each` creates a map of resources with string or integer keys
* `for_each` is better for resources that might be added or removed from the middle of the list

### 3. Conditional Resources

Create resources conditionally:

```hcl
variable "create_eip" {
  description = "Whether to create an Elastic IP"
  type        = bool
  default     = true
}

resource "aws_eip" "web" {
  count    = var.create_eip ? 1 : 0
  instance = aws_instance.web.id
}
```

This will only create the Elastic IP if `create_eip` is set to `true`.

### 4. Dynamic Blocks

Use dynamic blocks for repeatable nested blocks:

```hcl
variable "ingress_rules" {
  description = "List of ingress rules"
  type        = list(object({
    port        = number
    protocol    = string
    description = string
    cidr_blocks = list(string)
  }))
  default     = [
    {
      port        = 80
      protocol    = "tcp"
      description = "HTTP"
      cidr_blocks = ["0.0.0.0/0"]
    },
    {
      port        = 443
      protocol    = "tcp"
      description = "HTTPS"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]
}

resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.main.id
  
  dynamic "ingress" {
    for_each = var.ingress_rules
    content {
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = ingress.value.protocol
      description = ingress.value.description
      cidr_blocks = ingress.value.cidr_blocks
    }
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

The dynamic block iterates through the `ingress_rules` variable to create multiple ingress rules without repetition.

### 5. Local Values (Locals)

Use locals for expressions you use multiple times:

```hcl
locals {
  common_tags = {
    Project     = "Terraform Demo"
    Environment = "Development"
    Owner       = "DevOps Team"
  }
  
  name_prefix = "demo-"
}

resource "aws_vpc" "main" {
  cidr_block = var.vpc_cidr
  
  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}vpc"
    }
  )
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = var.public_subnet_cidr
  
  tags = merge(
    local.common_tags,
    {
      Name = "${local.name_prefix}public-subnet"
    }
  )
}
```

This approach makes it easier to maintain common tags and naming conventions.

## Real-World Example: Three-Tier Architecture

Let's create a more complex example of a three-tier architecture:

1. Web tier: Public-facing load balancer and web servers
2. Application tier: Private application servers
3. Database tier: RDS database in private subnets

Here's a simplified version:

```hcl
# Create a VPC with public and private subnets
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "three-tier-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-west-2a", "us-west-2b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.3.0/24", "10.0.4.0/24"]
  database_subnets = ["10.0.5.0/24", "10.0.6.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
  
  tags = {
    Environment = "Production"
    Project     = "Three-Tier App"
  }
}

# Security group for web tier
resource "aws_security_group" "web" {
  name        = "web-sg"
  description = "Security group for web tier"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for app tier
resource "aws_security_group" "app" {
  name        = "app-sg"
  description = "Security group for app tier"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Security group for database tier
resource "aws_security_group" "db" {
  name        = "db-sg"
  description = "Security group for database tier"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Web tier - Load balancer
resource "aws_lb" "web" {
  name               = "web-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_target_group" "web" {
  name     = "web-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
}

resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.web.arn
  port              = 80
  protocol          = "HTTP"
  
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}

# Web tier - EC2 instances
resource "aws_launch_template" "web" {
  name_prefix   = "web-"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  vpc_security_group_ids = [aws_security_group.web.id]
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "Hello from the web tier" > /var/www/html/index.html
    service httpd start
  EOF
  )
}

resource "aws_autoscaling_group" "web" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = module.vpc.public_subnets
  
  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }
  
  target_group_arns = [aws_lb_target_group.web.arn]
}

# App tier - EC2 instances
resource "aws_launch_template" "app" {
  name_prefix   = "app-"
  image_id      = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.small"
  
  vpc_security_group_ids = [aws_security_group.app.id]
  
  user_data = base64encode(<<-EOF
    #!/bin/bash
    echo "Hello from the app tier" > /var/www/html/index.html
    service httpd start
  EOF
  )
}

resource "aws_autoscaling_group" "app" {
  desired_capacity    = 2
  max_size            = 4
  min_size            = 2
  vpc_zone_identifier = module.vpc.private_subnets
  
  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
}

# Database tier - RDS instance
resource "aws_db_subnet_group" "main" {
  name       = "main"
  subnet_ids = module.vpc.database_subnets
}

resource "aws_db_instance" "main" {
  allocated_storage    = 10
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t3.micro"
  name                 = "mydb"
  username             = "admin"
  password             = "password" # In production, use a secret manager
  parameter_group_name = "default.mysql5.7"
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot  = true
}
```

This example creates:

1. A VPC with public, private, and database subnets
2. Security groups for each tier
3. A load balancer for the web tier
4. Auto-scaling groups for web and app tiers
5. An RDS database in the database tier

## Best Practices for Terraform with AWS

### 1. State Management

> Always use remote state for team environments.

```hcl
terraform {
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "path/to/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### 2. Workspace Isolation

Use Terraform workspaces to manage different environments:

```bash
# Create a new workspace for development
$ terraform workspace new dev

# Create a new workspace for production
$ terraform workspace new prod

# List workspaces
$ terraform workspace list

# Select a workspace
$ terraform workspace select dev
```

Then use the workspace in your configuration:

```hcl
locals {
  environment = terraform.workspace
  
  instance_type = {
    dev  = "t2.micro"
    test = "t2.small"
    prod = "t2.medium"
  }
}

resource "aws_instance" "example" {
  ami           = var.ami_id
  instance_type = local.instance_type[local.environment]
  
  tags = {
    Environment = local.environment
  }
}
```

### 3. Module Organization

Organize your Terraform code with a consistent structure:

```
project/
│
├── main.tf          # Main configuration
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── providers.tf     # Provider configurations
├── versions.tf      # Terraform and provider versions
│
├── modules/         # Local modules
│   ├── vpc/
│   ├── ec2/
│   └── rds/
│
└── environments/    # Environment-specific configurations
    ├── dev/
    ├── staging/
    └── prod/
```

### 4. Version Pinning

Pin Terraform and provider versions to avoid unexpected changes:

```hcl
terraform {
  required_version = "~> 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}
```

### 5. Tagging Strategy

Implement a consistent tagging strategy:

```hcl
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    Owner       = var.owner
    ManagedBy   = "Terraform"
    CreatedDate = timestamp()
  }
}

resource "aws_vpc" "main" {
  # ... other configuration ...
  
  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-vpc"
    }
  )
}
```

## Conclusion

> Terraform is a powerful tool for managing AWS infrastructure as code, enabling you to create, modify, and destroy resources in a consistent and repeatable way.

We've covered:

1. The fundamental concepts of Infrastructure as Code
2. Core Terraform concepts: providers, resources, variables, and outputs
3. The Terraform workflow: init, plan, and apply
4. Setting up Terraform for AWS
5. Creating reusable modules
6. Managing state
7. Advanced Terraform patterns
8. Real-world examples and best practices

By adopting Terraform for AWS provisioning, you can:

* Automate infrastructure deployment
* Version control your infrastructure
* Implement infrastructure testing
* Ensure consistency across environments
* Document your infrastructure as code
* Collaborate more effectively with your team

Remember that Terraform is just one part of a larger DevOps ecosystem. It works best when combined with version control systems, CI/CD pipelines, and proper operational practices.
