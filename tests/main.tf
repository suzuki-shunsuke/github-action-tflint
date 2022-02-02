// invalid comment
resource "null_resource" "foo" {}

terraform {
  required_version = ">= 1.0"
}
