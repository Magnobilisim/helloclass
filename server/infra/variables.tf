variable "project_name" {
  description = "Base name used for tagging resources"
  type        = string
}

variable "environment" {
  description = "Deployment environment (dev/stg/prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "vpc_cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.10.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of public subnet CIDR blocks"
  type        = list(string)
  default     = [
    "10.10.0.0/24",
    "10.10.1.0/24"
  ]
}

variable "private_subnet_cidrs" {
  description = "List of private subnet CIDR blocks"
  type        = list(string)
  default     = [
    "10.10.10.0/24",
    "10.10.11.0/24"
  ]
}

variable "db_username" {
  description = "Master username for the Postgres instance"
  type        = string
}

variable "db_password" {
  description = "Master password for the Postgres instance"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the RDS instance"
  type        = number
  default     = 20
}

variable "api_container_image" {
  description = "Container image for the API service"
  type        = string
  default     = "public.ecr.aws/nginx/nginx:latest"
}

variable "api_container_port" {
  description = "Container port exposed by the API service"
  type        = number
  default     = 3000
}

variable "api_desired_count" {
  description = "Number of desired ECS tasks"
  type        = number
  default     = 1
}

variable "api_task_cpu" {
  description = "Fargate task CPU units"
  type        = number
  default     = 512
}

variable "api_task_memory" {
  description = "Fargate task memory (MB)"
  type        = number
  default     = 1024
}

variable "db_secret_arn" {
  description = "ARN of the Secrets Manager secret containing DATABASE_URL"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate used for HTTPS"
  type        = string
}
