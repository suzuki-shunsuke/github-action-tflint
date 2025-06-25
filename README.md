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

- [tflint](https://github.com/terraform-linters/tflint)
- [reviewdog](https://github.com/reviewdog/reviewdog)
- (Optional) [github-comment](https://github.com/suzuki-shunsuke/github-comment)
- (Optional) [ghcp](https://github.com/int128/ghcp): If the input `fix` is true, ghcp is required.

You can install these tools by [aqua](https://aquaproj.github.io/):

```sh
aqua g -i terraform-linters/tflint reviewdog/reviewdog suzuki-shunsuke/github-comment int128/ghcp
```

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
    github_token_for_tflint_init: ${{ secrets.GH_TOKEN_FOR_TFLINT_INIT }}
    github_token_for_fix: ${{ secrets.GH_TOKEN_FOR_FIX }}
    working_directory: foo
    github_comment: "true"
    fix: "true"
```

## Inputs

### Required Inputs

Nothing.

### Optional Inputs

name | default value | description
--- | --- | ---
github_token | `github.token` | GitHub Access Token. The permission `pull-requests:write` is required.
github_token_for_tflint_init | `github_token` | GitHub Access Token for `tflint --init`. It this isn't set, the input `github_token` is used. This input is useful for a GitHub Enterprise Server. The permission `contents:read` is required
github_token_for_fix | `github_token` | GitHub Access Token for `tflint --fix`. It this isn't set, the input `github_token` is used. The permission `contents:write` is required.
working_directory | "" (current directory) | Woring Directory
github_comment | `false` | Whether a comment is posted with github-comment
fix | false | If this is true, code is fixed by `tflint --fix`. ghcp is required for this
github_app_id_for_securefix_action | | GitHub App ID for Securefix Action's client app
github_app_private_key_for_securefix_action | | GitHub App Private Key for Securefix Action's client app
securefix_action_server_repository | | Securefix Action Server Repository name (not full name)

## Outputs

Nothing.

## Available versions

As of v1.3.0, the available versions were changed.

> [!CAUTION]
> We don't add `dist/*.js` in the main branch and feature branches.
> So you can't specify `main` and feature branches as versions.
>
> ```yaml
> # This never works as dist/index.js doesn't exist.
> uses: suzuki-shunsuke/github-action-tflint@main
> ```

The following versions are available.

1. [Release versions](https://github.com/suzuki-shunsuke/github-action-tflint/releases)

```yaml
uses: suzuki-shunsuke/github-action-tflint@v0.1.1
```

2. [Pull Request versions](https://github.com/suzuki-shunsuke/github-action-tflint/branches/all?query=pr%2F&lastTab=overview): These versions are removed when we feel unnecessary. These versions are used to test pull requests.

```yaml
uses: suzuki-shunsuke/github-action-tflint@pr/1473
```

3. [latest branch](https://github.com/suzuki-shunsuke/github-action-tflint/tree/latest): [This branch is built by CI when the main branch is updated](https://github.com/suzuki-shunsuke/github-action-tflint/blob/latest/.github/workflows/main.yaml). Note that we push commits to the latest branch forcibly.

```yaml
uses: suzuki-shunsuke/github-action-tflint@latest
```

Pull Request versions and the latest branch are unstable.
These versions are for testing.
You should use the latest release version in production.

## License

[MIT](LICENSE)
