# github-action-tflint

GitHub Actions for tflint

## Requirements

* [tflint](https://github.com/terraform-linters/tflint)
* [reviewdog](https://github.com/reviewdog/reviewdog)

## Example

```yaml
- name: suzuki-shunsuke/github-action-tflint@v0.1.1
```

```yaml
- name: suzuki-shunsuke/github-action-tflint@v0.1.1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    working_directory: foo
```

## Inputs

### Required Inputs

Nothing.

### Optional Inputs

name | default value | description
--- | --- | ---
github_token | `github.token` | GitHub Access Token
working_directory | "" (current directory) | Woring Directory

## Outputs

Nothing.

## License

[MIT](LICENSE)
