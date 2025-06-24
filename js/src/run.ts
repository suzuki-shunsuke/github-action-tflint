import * as exec from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as path from 'path';

type Inputs = {
  workingDirectory: string
  githubToken: string
  githubTokenForTflintInit: string
  githubTokenForFix: string
  githubComment: boolean
  fix: boolean
  useSecurefixAction: boolean
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
  if (!inputs.githubToken) {
    throw new Error('github_token is required');
  }
  if (!inputs.githubTokenForTflintInit) {
    inputs.githubTokenForTflintInit = inputs.githubToken;
  }
  if (!inputs.githubTokenForFix) {
    inputs.githubTokenForFix = inputs.githubToken;
  }
  core.info('Running tflint --init');
  await exec.exec('tflint', ['--init'], {
    cwd: inputs.workingDirectory,
    env: {
      ...process.env,
      GITHUB_TOKEN: inputs.githubTokenForTflintInit,
    },
  });
  const args = ['--format', 'json'];

  const help = await exec.getExecOutput('tflint', ['--help'], {
    cwd: inputs.workingDirectory,
    silent: true,
  });
  if (help.stdout.includes('--call-module-type')) {
    args.push('--call-module-type=all');
  } else {
    args.push('--module');
  }
  if (inputs.fix) {
    args.push('--fix');
  }

  core.info('Running tflint');
  const out = await exec.getExecOutput('tflint', args, {
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
  if (inputs.fix) {
    const files = new Set(diagnostics.map((d) => path.join(inputs.workingDirectory, d.location.path)));
    if (files.size == 0) {
      return;
    }
    const out = await exec.getExecOutput('git', [
      'diff', '--name-only',
    ].concat([...files]), {
      ignoreReturnCode: true,
    });
    const changedFiles = out.stdout.split('\n').filter(f => f.length > 0);
    if (changedFiles.length !== 0) {
      core.setOutput('fixed_files', changedFiles.join('\n'));
      if (!inputs.useSecurefixAction) {
        return;
      }
      const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF || "";
      await exec.exec('ghcp', [
        'commit',
        '-r', `${github.context.repo.owner}/${github.context.repo.repo}`,
        '-b', branch,
        '-m', 'fix(tflint): auto fix',
      ].concat(changedFiles), {
        env: {
          ...process.env,
          GITHUB_TOKEN: inputs.githubTokenForFix,
        },
      });
      throw new Error("code is fixed by tflint --fix");
    }
  }

  if (inputs.githubComment && diagnostics.length > 0) {
    const table = generateTable(diagnostics);
    const githubCommentTemplate = `## :x: tflint error

{{template "link" .}} | [tflint](https://github.com/terraform-linters/tflint) | [tflint Annotations to disable rules](https://github.com/terraform-linters/tflint/blob/master/docs/user-guide/annotations.md) | [tflint Config](https://github.com/terraform-linters/tflint/blob/master/docs/user-guide/config.md)

Working Directory: \`${inputs.workingDirectory}\`

${table}`;
    await exec.exec('github-comment', [
      'post', '-stdin-template',
    ], {
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

  const reviewdogArgs = [
    '-f', 'rdjson',
    '-name', 'tflint',
    '-filter-mode', 'nofilter',
    '-reporter', reporter,
    '-level', 'warning',
  ];
  const reviewdogHelp = await exec.getExecOutput('reviewdog', ['--help'], {
    cwd: inputs.workingDirectory,
    silent: true,
    ignoreReturnCode: true,
  });
  if (reviewdogHelp.stdout.includes('-fail-level') || reviewdogHelp.stderr.includes('-fail-level')) {
    reviewdogArgs.push('-fail-level', 'error');
  } else {
    reviewdogArgs.push('-fail-on-error', '1');
  }

  await exec.exec('reviewdog', reviewdogArgs, {
    input: Buffer.from(reviewDogInput),
    cwd: inputs.workingDirectory,
    env: {
      ...process.env,
      REVIEWDOG_GITHUB_API_TOKEN: inputs.githubToken,
    },
  });
  if (out.exitCode != 0) {
    throw new Error("tflint failed");
  }
}
