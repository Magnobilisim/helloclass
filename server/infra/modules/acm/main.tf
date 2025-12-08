locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_acm_certificate" "this" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  subject_alternative_names = var.alternate_names

  tags = merge(local.tags, { Name = "${var.project_name}-${var.environment}-cert" })
}
