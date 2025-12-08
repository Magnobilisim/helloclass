variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "assume_role_policy" {
  type = string
}

variable "allowed_actions" {
  type = list(string)
  default = [
    "ec2:*",
    "iam:*",
    "ecs:*",
    "ecr:*",
    "rds:*",
    "logs:*",
    "cloudwatch:*",
    "elasticloadbalancing:*",
    "ssm:*",
    "secretsmanager:*",
    "s3:*",
    "cloudfront:*",
    "cognito-idp:*"
  ]
}
