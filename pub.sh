#!/usr/bin/env bash

npm run lib
cp -r src/components/cropper/index.less lib/
git rev-parse --short HEAD > lib/version
