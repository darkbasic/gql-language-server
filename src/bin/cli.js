#!/usr/bin/env node
/* @flow */
import yargs from 'yargs';

import initializeLogging, { LOG_LEVEL } from '../utils/logging';
import createConnection from '../createConnection';
import createServer from '../index';

const cli = yargs
  .usage('gql-language-server Command-Line Interface.\n Usage: $0 [args]')
  .help('h')
  .alias('h', 'help')
  .option('node-ipc', {
    describe:
      'Use node-ipc to communicate with the server. Useful for calling from a node.js client',
    type: 'string',
  })
  .option('stdio', {
    describe: 'Use stdio to communicate with the server',
    type: 'string',
  })
  .option('socket', {
    describe:
      'Use a socket (with a port number like --socket=5051) to communicate with the server',
    type: 'number',
  })
  .option('auto-download-gql', {
    describe: 'Automatically download gql package if not found.',
    type: 'boolean',
    default: true,
  })
  .option('watchman', {
    describe: 'use watchman to watch files',
    type: 'boolean',
    default: true,
  })
  .option('log-level', {
    describe: 'log level.',
    choices: Object.values(LOG_LEVEL),
    default: LOG_LEVEL.info,
  });

const { argv } = cli;
const methods = ['node-ipc', 'stdio', 'socket'];

cliInvariant(
  methods.filter(m => argv[m] != null).length === 1,
  'gql-language-server requires exactly one valid connection option (node-ipc, stdio, or socket).',
);
const method = methods.find(m => argv[m] != null);

const options =
  method === 'socket' ? { method: 'socket', port: argv.port } : { method };
// verify port present if method 'socket'
if (options.method === 'socket') {
  cliInvariant(options.port, '--socket option requires port.');
}

const connection = createConnection(options);

// init logging
initializeLogging(connection, argv.logLevel);

// init server
createServer(connection, {
  autoDownloadGQL: argv['auto-download-gql'],
  watchman: argv.watchman,
  debug: argv.debug,
}).listen();

function cliInvariant(condition, ...msgs) {
  if (!condition) {
    /* eslint-disable no-console */
    console.error('ERROR:', ...msgs);
    console.error();
    /* eslint-enable */
    cli.showHelp();
    process.exit(1);
  }
}
