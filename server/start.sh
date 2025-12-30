#!/bin/sh
set -e

# Install dependencies, build, and start the server
npm install
npm run build
npm run start
