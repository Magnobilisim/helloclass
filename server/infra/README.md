# Infrastructure as Code (Terraform)

This folder contains the Terraform configuration for the HelloClass AWS
infrastructure. Current coverage:

- Dedicated VPC (public/private subnets, routing, IGW)
- PostgreSQL RDS instance
- ECR repository
- ECS Fargate cluster/service (with ALB + CloudWatch logs)
- ACM certificate placeholder (DNS validation)
- CloudFront + static S3 bucket
- Cognito User Pool & client (hosted domain)
- IAM role for GitHub Actions
- SSM Parameter for DATABASE_URL

## Structure

```
infra/
├── main.tf           # root module wiring all components together
├── variables.tf      # shared inputs
├── providers.tf / versions.tf
├── modules/
│   ├── network/      # VPC, subnets, routing
│   ├── rds/          # PostgreSQL instance
│   ├── ecr/          # Container registry
│   ├── ecs/          # ECS Fargate service + ALB
│   ├── acm/          # ACM certificate (DNS validation required)
│   ├── cloudfront/   # CDN + static bucket
│   ├── cognito/      # User pool & client
│   ├── iam/          # GitHub Actions IAM role
│   └── ssm/          # Parameter store entries
```

## Usage

Create a `terraform.tfvars` file (or provide variables via CLI/CI) similar to:

```
project_name        = "helloclass"
environment         = "dev"
aws_region          = "eu-north-1"
db_username         = "helloclass_admin"
db_password         = "<secure password>"
database_url        = "postgresql://..."
primary_domain      = "example.com"
cognito_domain_prefix = "helloclass-demo"
api_container_image = "<ECR image URI>"
```

Then initialize and plan/apply:

```
cd server/infra
terraform init
terraform plan
terraform apply
```

> **Important**
>
> - The RDS security group currently allows ingress from `0.0.0.0/0` for bootstrapping.
>   Lock this down to specific CIDRs/SGs before production.
> - ACM certificate uses DNS validation; you must create the Route53 records that AWS
>   outputs for validation (or re-use an existing certificate via `acm_certificate_arn`).
> - ECS service requires an image pushed to the created ECR repository (or any accessible registry).
