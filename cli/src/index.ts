#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('paygate')
  .description('CLI to scaffold and manage PayGate x402 API integrations')
  .version('0.1.0');

program
  .command('init')
  .description('Interactive setup wizard to initialize PayGate in your project')
  .action(initCommand);

// We'll add dev, test, and status later

program.parse();
