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

1. **Create your tfvars file**
   ```bash
   cd server/infra
   cp terraform.tfvars.example terraform.tfvars
   ```
   Replace every placeholder with your real values. Leave `database_url = null` to let Terraform generate it from the RDS endpoint.

2. **Gather required secrets**
   - **AWS access**: Either run `aws configure` with an admin user for local runs or create an IAM role that trusts GitHub OIDC; note its ARN for `AWS_IAM_ROLE_ARN`.
   - **Database credentials**: Decide on `db_username`, `db_password`, and (optionally) change `db_name`.
   - **ECR image**:
     1. Build backend image: `docker build -t helloclass-api:latest server`.
     2. Authenticate to ECR: `aws ecr get-login-password ... | docker login ...`.
     3. Push to the repo Terraform created (see `terraform output ecr_repository_url`).
     4. Set `api_container_image` in tfvars/CI secrets to that URI.
   - **ACM certificate**: If you already have one in `us-east-1`, set `acm_certificate_arn`. Otherwise leave null; Terraform will request a certificate and output the DNS validation CNAMEs you must add to Route53.
   - **Cognito hosted domain**: Pick a globally unique `cognito_domain_prefix` (`helloclass-app-prod`, etc.).

3. **Run Terraform**
   ```bash
   terraform init
   terraform plan -out=tfplan
   terraform apply tfplan
   ```
   Outputs include the RDS endpoint, validation records, CloudFront distribution ID, static S3 bucket name, and ALB DNS name.

4. **Validate ACM**
   - Open AWS Console → Certificate Manager.
   - For each pending domain, add the suggested CNAME record into your `helloclass.app` hosted zone.
   - Wait for the certificate status to become `Issued`. CloudFront/ALB listeners finish provisioning afterwards.

5. **Wire up Route53**
   - `helloclass.app` (A/AAAA alias) → CloudFront distribution.
   - `www.helloclass.app` → same CloudFront distribution (alias or CNAME).
   - `api.helloclass.app` (A/AAAA alias) → Application Load Balancer DNS name (printed by Terraform).

6. **Publish the frontend bundle**
   - Build: `npm run build` (repo root).
   - Upload: `aws s3 sync dist/ s3://<bucket-from-terraform>`.
   - Invalidate CDN cache: `aws cloudfront create-invalidation --distribution-id <id> --paths "/*"`.

7. **(Optional) Configure GitHub Actions secrets** so `.github/workflows/infra-deploy.yml` can run unattended:

   | Secret | Purpose |
   | --- | --- |
   | `AWS_IAM_ROLE_ARN` | Role that GitHub OIDC assumes |
   | `AWS_REGION` | Must match tfvars |
   | `PROJECT_NAME`, `ENVIRONMENT` | Naming/tagging |
   | `DB_USERNAME`, `DB_PASSWORD` | Seeded into Terraform |
   | `DATABASE_URL` | Leave empty or `null` if using auto-generation |
   | `API_CONTAINER_IMAGE` | Latest ECR image URI |
   | `ACM_CERTIFICATE_ARN` | (Optional) Use existing certificate |

> **Important**
>
> - The RDS security group currently allows ingress from `0.0.0.0/0` for bootstrapping.
>   Lock this down to specific CIDRs/SGs before production.
> - Uploading the frontend bundle is manual unless you add a CI step.
> - ECS service requires a valid image pushed to ECR; otherwise tasks fail at launch.
