import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { PaygateConfig, PaygateConfigSchema, PaygateConfigInput } from './schema';

export function loadConfig(configOverrides?: Partial<PaygateConfigInput>): PaygateConfig {
  const cwd = process.cwd();
  const possibleFiles = [
    'paygate.config.yaml',
    'paygate.config.yml',
    'paygate.config.json'
  ];

  let fileContent = '';
  let ext = '';

  for (const file of possibleFiles) {
    const fullPath = path.join(cwd, file);
    if (fs.existsSync(fullPath)) {
      fileContent = fs.readFileSync(fullPath, 'utf-8');
      ext = path.extname(file);
      break;
    }
  }

  let parsed: any = {};
  if (fileContent) {
    // Basic env var interpolation: ${VAR_NAME}
    fileContent = fileContent.replace(/\$\{([^}]+)\}/g, (_, varName) => {
      return process.env[varName] || '';
    });

    if (ext === '.yaml' || ext === '.yml') {
      parsed = yaml.load(fileContent);
    } else if (ext === '.json') {
      parsed = JSON.parse(fileContent);
    }
  }

  // Merge overrides
  if (configOverrides) {
    parsed = { ...parsed, ...configOverrides };
  }

  // Validate with Zod
  const result = PaygateConfigSchema.safeParse(parsed);
  
  if (!result.success) {
    console.error("PayGate Configuration Error:");
    result.error.errors.forEach(err => {
      console.error(`- ${err.path.join('.')}: ${err.message}`);
    });
    throw new Error("Invalid paygate config");
  }

  return result.data;
}
