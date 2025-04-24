provider "aws" {
  region = "us-east-1" # Change to your preferred AWS region
}

# Create a key pair for SSH access
resource "aws_key_pair" "flowfund_key" {
  key_name   = "flowfund-key"
  public_key = file("~/.ssh/id_rsa.pub") # Path to your public SSH key
}

# Create a VPC
resource "aws_vpc" "flowfund_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "FlowFund-VPC"
  }
}

# Create a public subnet for the frontend
resource "aws_subnet" "frontend_subnet" {
  vpc_id                  = aws_vpc.flowfund_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  tags = {
    Name = "Frontend-Subnet"
  }
}

# Create a private subnet for the server and Hardhat
resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.flowfund_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name = "Private-Subnet"
  }
}

# Create an internet gateway for the VPC
resource "aws_internet_gateway" "flowfund_igw" {
  vpc_id = aws_vpc.flowfund_vpc.id
  tags = {
    Name = "FlowFund-Internet-Gateway"
  }
}

# Create a route table for the public subnet
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.flowfund_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.flowfund_igw.id
  }
  tags = {
    Name = "Public-Route-Table"
  }
}

# Associate the public route table with the frontend subnet
resource "aws_route_table_association" "frontend_route_table_association" {
  subnet_id      = aws_subnet.frontend_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

# Create an Elastic IP for the NAT Gateway
resource "aws_eip" "nat_eip" {
  vpc = true
  tags = {
    Name = "FlowFund-NAT-EIP"
  }
}

# Create a NAT Gateway
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.frontend_subnet.id # NAT Gateway must be in a public subnet
  tags = {
    Name = "FlowFund-NAT-Gateway"
  }
}

# Create a route table for the private subnet
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.flowfund_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }

  tags = {
    Name = "Private-Route-Table"
  }
}

# Associate the private route table with the private subnet
resource "aws_route_table_association" "private_route_table_association" {
  subnet_id      = aws_subnet.private_subnet.id
  route_table_id = aws_route_table.private_route_table.id
}

# Create a security group for the frontend
resource "aws_security_group" "frontend_sg" {
  vpc_id = aws_vpc.flowfund_vpc.id
  name   = "Frontend-SG"

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/32"] # Replace with your IP address
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/32"] # Allow SSH access only from your IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create a security group for the server and Hardhat
resource "aws_security_group" "private_sg" {
  vpc_id = aws_vpc.flowfund_vpc.id
  name   = "Private-SG"

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Allow internal communication within the VPC
  }

  ingress {
    from_port   = 8545
    to_port     = 8545
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Allow internal communication within the VPC
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Allow SSH access to the server and Hardhat
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Launch the frontend EC2 instance
resource "aws_instance" "frontend_instance" {
  ami           = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS AMI (replace with your region's AMI ID)
  instance_type = "t2.micro"
  key_name      = aws_key_pair.flowfund_key.key_name
  subnet_id     = aws_subnet.frontend_subnet.id
  vpc_security_group_ids = [aws_security_group.frontend_sg.id] # Use vpc_security_group_ids

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              docker run -d -p 3000:3000 psiddegowda/flowfund-frontend:latest
              EOF

  tags = {
    Name = "Frontend-Instance"
  }
}

# Launch the server EC2 instance
resource "aws_instance" "server_instance" {
  ami           = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS AMI (replace with your region's AMI ID)
  instance_type = "t2.micro"
  key_name      = aws_key_pair.flowfund_key.key_name
  subnet_id     = aws_subnet.private_subnet.id
  vpc_security_group_ids = [aws_security_group.private_sg.id] # Use vpc_security_group_ids

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              docker run -d -p 9090:9090 psiddegowda/flowfund-server:latest
              EOF

  tags = {
    Name = "Server-Instance"
  }
}

# Launch the Hardhat EC2 instance
resource "aws_instance" "hardhat_instance" {
  ami           = "ami-08c40ec9ead489470" # Ubuntu 22.04 LTS AMI (replace with your region's AMI ID)
  instance_type = "t2.micro"
  key_name      = aws_key_pair.flowfund_key.key_name
  subnet_id     = aws_subnet.private_subnet.id
  vpc_security_group_ids = [aws_security_group.private_sg.id] # Use vpc_security_group_ids

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              usermod -aG docker ubuntu
              docker run -d -p 8545:8545 psiddegowda/flowfund-hardhat:latest
              EOF

  tags = {
    Name = "Hardhat-Instance"
  }
}

# Output the public IP of the frontend instance
output "frontend_public_ip" {
  value = aws_instance.frontend_instance.public_ip
}