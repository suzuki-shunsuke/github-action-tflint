#!/usr/bin/env bash

set -eu

github-comment exec -- tflint --init

if [ "$EVENT_NAME" != "pull_request" ]; then
  tflint --module .
  exit 0
fi

tflint --format=checkstyle --module . |
	reviewdog -f=checkstyle \
		-name="tflint" \
		-reporter=github-pr-review \
		-level=warning \
		-fail-on-error=1
