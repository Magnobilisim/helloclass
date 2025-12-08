variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "alternate_names" {
  type    = list(string)
  default = []
}
