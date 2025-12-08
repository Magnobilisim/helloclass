module "network" {
  source = "./modules/network"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr_block     = var.vpc_cidr_block
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

module "rds" {
  source = "./modules/rds"

  project_name = var.project_name
  environment  = var.environment

  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  db_username        = var.db_username
  db_password        = var.db_password
  db_instance_class  = var.db_instance_class
  allocated_storage  = var.db_allocated_storage
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "ecs" {
  source = "./modules/ecs"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  public_subnet_ids  = module.network.public_subnet_ids
  container_image    = var.api_container_image
  container_port     = var.api_container_port
  desired_count      = var.api_desired_count
  task_cpu           = var.api_task_cpu
  task_memory        = var.api_task_memory
  db_secret_arn      = var.db_secret_arn
  acm_certificate_arn = var.acm_certificate_arn
}

output "vpc_id" {
  value = module.network.vpc_id
}

output "db_endpoint" {
  value = module.rds.db_endpoint
}
