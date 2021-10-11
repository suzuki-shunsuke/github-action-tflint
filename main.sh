#!/usr/bin/env bash

set -eu

github-comment exec -- tflint --init
tflint --format=checkstyle --module . |
	reviewdog -f=checkstyle \
		-name="tflint" \
		-reporter=github-pr-review \
		-level=warning \
		-fail-on-error=1
