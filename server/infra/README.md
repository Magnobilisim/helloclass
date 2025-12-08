# Infrastructure as Code (Terraform)

This folder contains the first iteration of the HelloClass AWS infrastructure.
It currently provisions:

- A dedicated VPC with public/private subnets, internet gateway, and route tables.
- A PostgreSQL RDS instance and associated subnet group / security group.

More modules (ECS/Fargate, S3/CloudFront, Cognito, SES, etc.) will be added on top of this
foundation in the next steps.

## Structure

```
infra/
├── main.tf           # root module wiring network + database modules together
├── variables.tf      # shared inputs
├── providers.tf / versions.tf
├── modules/
│   ├── network/      # VPC, subnets, routing
│   └── rds/          # PostgreSQL instance
```

## Usage

Create a `terraform.tfvars` file (or provide variables via CLI/CI) similar to:

```
project_name       = "helloclass"
environment        = "dev"
aws_region         = "eu-north-1"
db_username        = "helloclass_admin"
db_password        = "<secure password>"
```

Then initialize and plan/apply:

```
cd server/infra
terraform init
terraform plan
terraform apply
```

> **Important**: The RDS security group currently allows ingress from `0.0.0.0/0` for
> bootstrapping. Before going to production, replace this with tighter rules or security
group references.
