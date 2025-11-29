#!/usr/bin/env node

const path = require('path');

const { runCli } = require('../lib/run-cli.js');

async function main(argv) {
    try {
        await runCli(argv);
    } catch (error) {
        console.error('Error:', error.message || error);
        process.exit(1);
    }
}

main(process.argv.slice(2));