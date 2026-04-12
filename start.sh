#!/bin/bash
cd "$(dirname "$0")"
echo "Installing dependencies..."
npm install
echo
echo "Starting Assessor2..."
npm run dev
