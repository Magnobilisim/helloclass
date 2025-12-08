locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_ecr_repository" "this" {
  name                 = "${var.project_name}-${var.environment}-api"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(local.tags, { Name = "${var.project_name}-${var.environment}-ecr" })
}
