import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    workingDirectory: core.getInput('working_directory', { required: false }),
    githubToken: core.getInput('github_token', { required: true }),
    githubTokenForTflintInit: core.getInput('github_token_for_tflint_init', { required: false }),
    githubComment: core.getBooleanInput('github_comment', { required: true }),
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
