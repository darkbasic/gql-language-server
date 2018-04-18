/* @flow */
import { execSync } from 'child_process';

// run flow-typed-update
execSync('flow-typed update', { stdio: [0, 1, 2] });

//
