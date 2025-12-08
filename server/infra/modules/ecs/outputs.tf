output "cluster_id" {
  value = aws_ecs_cluster.this.id
}

output "service_name" {
  value = aws_ecs_service.api.name
}

output "load_balancer_dns" {
  value = aws_lb.api.dns_name
}
