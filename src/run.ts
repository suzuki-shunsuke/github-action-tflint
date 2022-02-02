import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';

type Inputs = {
  workingDirectory: string
  githubToken: string
}

function getSeverity(s: string): string | null {
  if (s == 'error') {
    return 'ERROR';
  }
  if (s == 'warning') {
    return 'WARNING';
  }
  if (s == 'info') {
    return 'INFO';
  }
  return null;
}

function getURL(result: any): string {
  if (result.links && result.links.length != 0) {
    return result.links[0];
  }
  return '';
}

export const run = async (inputs: Inputs): Promise<void> => {
  core.info('Running tflint --init');
  await exec.exec('tflint', ['--init']);
  core.info('Running tflint');
  const out = await exec.getExecOutput('tflint', ['--format', 'json', '--module', '.'], {
    cwd: inputs.workingDirectory,
    ignoreReturnCode: true,
  });
  core.info('Parsing tflint result');
  const outJSON = JSON.parse(out.stdout);
  const diagnostics = [];
  if (outJSON.issues) {
    for (let i = 0; i < outJSON.issues.length; i++) {
      const issue = outJSON.issues[i];
      diagnostics.push({
        message: issue.message,
        code: {
          value: issue.rule.name,
          url: issue.rule.link,
        },
        location: {
          path: issue.range.filename,
          range: {
            start: {
              line: issue.range.start.line,
            },
            end: {
              line: issue.range.end.line,
            },
          },
        },
        severity: getSeverity(issue.rule.severity),
      });
    }
  }
  if (outJSON.errors) {
    for (let i = 0; i < outJSON.errors.length; i++) {
      const err = outJSON.errors[i];
      diagnostics.push({
        message: err.message,
        location: {
          path: err.range.filename,
          range: {
            start: {
              line: err.range.start.line,
            },
            end: {
              line: err.range.end.line,
            },
          },
        },
        severity: getSeverity(err.severity),
      });
    }
  }
  const reviewDogInput = JSON.stringify({
    source: {
      name: 'tflint',
      url: 'https://github.com/terraform-linters/tflint',
    },
    diagnostics: diagnostics,
  });
  const reporter = github.context.eventName == 'pull_request' ? 'github-pr-review' : 'github-check';
  core.info(`Reviewdog input: ${reviewDogInput}`);
  core.info('Running reviewdog');
  await exec.exec('reviewdog', ['-f', 'rdjson', '-name', 'tflint', '-filter-mode', 'nofilter', '-reporter', reporter, '-level', 'warning', '-fail-on-error', '1'], {
    input: Buffer.from(reviewDogInput),
    env: {
      ...process.env,
      REVIEWDOG_GITHUB_API_TOKEN: inputs.githubToken,
    },
  });
}
