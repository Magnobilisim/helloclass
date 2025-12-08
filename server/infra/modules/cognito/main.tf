locals {
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_cognito_user_pool" "this" {
  name = "${var.project_name}-${var.environment}-users"

  auto_verified_attributes = ["email"]
  mfa_configuration        = "OFF"
  password_policy {
    minimum_length                   = 8
    require_lowercase               = true
    require_numbers                 = true
    require_symbols                 = false
    require_uppercase               = true
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = local.tags
}

resource "aws_cognito_user_pool_client" "app" {
  name         = "${var.project_name}-${var.environment}-app"
  user_pool_id = aws_cognito_user_pool.this.id
  generate_secret = false
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = var.oauth_scopes
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls
  supported_identity_providers = ["COGNITO"]
}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
}
