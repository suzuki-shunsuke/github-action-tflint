# github-action-tflint

GitHub Actions for tflint.
Run tflint and notify the result with reviewdog.
This GitHub Actions does **not** install tflint and reviewdog, so you have to install them in advance.
It allows to install tools outside this action.
We recommend [aqua](https://aquaproj.github.io/) to install them.

## Motivation

We know there are other GitHub Actions for tflint.
They install tflint automatically, but we would like to manage tools with [aqua](https://aquaproj.github.io/), which is a declarative CLI Version Manager written in Go.
By aqua, you can update tools continuously with Renovate very easily and use the same tool versions in both CI and your development environment.
This GitHub Actions does **not** install tflint, so we can install them outside this action.

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
