import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';

type Inputs = {
  workingDirectory: string
  githubToken: string
  githubComment: boolean
}

function getSeverity(s: string): string {
  if (s == 'error') {
    return 'ERROR';
  }
  if (s == 'warning') {
    return 'WARNING';
  }
  if (s == 'info') {
    return 'INFO';
  }
  return '';
}

class DiagnosticCode {
  value = ''
  url = ''
}

class DiagnosticLocation {
  path = ''
  range = new DiagnosticLocationRange()
}

class DiagnosticLocationRange {
  start = new DiagnosticLocationRangePoint()
  end = new DiagnosticLocationRangePoint()
}

class DiagnosticLocationRangePoint {
  line = 0
}

class Diagnostic {
  message = ''
  code = new DiagnosticCode()
  location = new DiagnosticLocation()
  severity = ''
}

function generateTable(diagnostics: Array<Diagnostic>): string {
  const lines: Array<string> = ['rule | severity | filepath | range | message', '--- | --- | --- | --- | ---'];
  for (let i = 0; i < diagnostics.length; i++) {
    const diagnostic = diagnostics[i];

    let rule = diagnostic.code.value;
    if (diagnostic.code.url) {
      rule = `[${diagnostic.code.value}](${diagnostic.code.url})`;
    }

    let range = '';
    if (diagnostic.location && diagnostic.location.range && diagnostic.location.range.start) {
      range = `${diagnostic.location.range.start.line} ... ${diagnostic.location.range.end.line}`;
    }

    lines.push(`${rule} | ${diagnostic.severity} | ${diagnostic.location.path} | ${range} | ${diagnostic.message}`);
  }
  return lines.join('\n');
}

export const run = async (inputs: Inputs): Promise<void> => {
  core.info('Running tflint --init');
  await exec.exec('tflint', ['--init'], {
    cwd: inputs.workingDirectory,
  });
  core.info('Running tflint');
  const out = await exec.getExecOutput('tflint', ['--format', 'json', '--module', '.'], {
    cwd: inputs.workingDirectory,
    ignoreReturnCode: true,
  });
  core.info('Parsing tflint result');
  const outJSON = JSON.parse(out.stdout);
  const diagnostics = new Array<Diagnostic>();
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
      const diagnostic = new Diagnostic();
      diagnostic.message = err.message;
      diagnostic.location.path = err.range.filename;
      diagnostic.location.range.start.line = err.range.start.line;
      diagnostic.location.range.end.line = err.range.end.line;
      diagnostic.severity = getSeverity(err.severity);
      diagnostics.push(diagnostic);
    }
  }

  if (inputs.githubComment && diagnostics.length > 0) {
    const table = generateTable(diagnostics);
    const githubCommentTemplate = `## :x: tflint error

{{template "link" .}} | [tflint](https://github.com/terraform-linters/tflint) | [tflint Annotations to disable rules](https://github.com/terraform-linters/tflint/blob/master/docs/user-guide/annotations.md) | [tflint Config](https://github.com/terraform-linters/tflint/blob/master/docs/user-guide/config.md)

Working Directory: \`${inputs.workingDirectory}\`

${table}`;
    await exec.exec('github-comment', ['post', '-stdin-template'], {
      input: Buffer.from(githubCommentTemplate),
      env: {
        ...process.env,
        GITHUB_TOKEN: inputs.githubToken,
      },
    });
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
    cwd: inputs.workingDirectory,
    env: {
      ...process.env,
      REVIEWDOG_GITHUB_API_TOKEN: inputs.githubToken,
    },
  });
}
