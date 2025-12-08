resource "aws_ssm_parameter" "db_url" {
  name        = "/${var.project_name}/${var.environment}/DATABASE_URL"
  type        = "SecureString"
  value       = var.database_url
  description = "Database connection string"
}
