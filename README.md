# github-action-tflint

GitHub Actions for [tflint](https://github.com/terraform-linters/tflint).

<img width="1411" alt="image" src="https://user-images.githubusercontent.com/13323303/153742908-2512f73a-1505-4c0c-9284-b6deb8983c2f.png">

<img width="945" alt="image" src="https://user-images.githubusercontent.com/13323303/153742833-403ea6c5-a780-4d2a-a30c-3a481c0971b1.png">

Run tflint and notify the result with [reviewdog](https://github.com/reviewdog/reviewdog) and [github-comment](https://github.com/suzuki-shunsuke/github-comment).
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
* (Optional) [github-comment](https://github.com/suzuki-shunsuke/github-comment)

## Notification with reviewdog

<img width="1411" alt="image" src="https://user-images.githubusercontent.com/13323303/153742908-2512f73a-1505-4c0c-9284-b6deb8983c2f.png">

## Notification with github-comment

<img width="945" alt="image" src="https://user-images.githubusercontent.com/13323303/153742833-403ea6c5-a780-4d2a-a30c-3a481c0971b1.png">

```yaml
- uses: suzuki-shunsuke/github-action-tflint@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    working_directory: tests
    github_comment: true # Enable github-comment notification
```

:bulb: If you want to hide old notification, please use [github-comment hide command](https://github.com/suzuki-shunsuke/github-comment#hide).

## Example

```yaml
- uses: suzuki-shunsuke/github-action-tflint@v0.1.1
```

```yaml
- uses: suzuki-shunsuke/github-action-tflint@v0.1.1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    working_directory: foo
    github_comment: true
```

## Inputs

### Required Inputs

Nothing.

### Optional Inputs

name | default value | description
--- | --- | ---
github_token | `github.token` | GitHub Access Token
working_directory | "" (current directory) | Woring Directory
github_comment | `false` | Whether a comment is posted with github-comment

## Outputs

Nothing.

## License

[MIT](LICENSE)
