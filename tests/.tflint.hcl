# https://github.com/terraform-linters/tflint/tree/master/docs/rules
rule "terraform_deprecated_index" {
  enabled = true
}

rule "terraform_unused_declarations" {
  enabled = true
}

rule "terraform_comment_syntax" {
  enabled = true
}

rule "terraform_documented_outputs" {
  enabled = false # TODO enable
}

rule "terraform_documented_variables" {
  enabled = false # TODO enable
}

rule "terraform_typed_variables" {
  enabled = false # TODO enable
}

rule "terraform_naming_convention" {
  enabled = false # It is difficult to rename existing resources
}

rule "terraform_required_version" {
  enabled = true
}

rule "terraform_required_providers" {
  enabled = false # TODO enable
}

rule "terraform_standard_module_structure" {
  enabled = false
}
