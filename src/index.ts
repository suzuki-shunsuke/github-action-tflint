import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    workingDirectory: process.env.WORKING_DIR || "",
    githubToken: process.env.GH_TOKEN || "",
    githubTokenForTflintInit: process.env.GH_TOKEN_FOR_TFLINT_INIT || "",
    githubTokenForFix: process.env.GH_TOKEN_FOR_FIX || "",
    githubComment: process.env.IS_GH_COMMENT === "true",
    fix: process.env.IS_FIX === "true",
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
