import fs from 'fs';
import path from 'path';

function parseSimpleYaml(filePath: string): any {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const result: any = { routes: {} };
  
  let currentRoute: string | null = null;
  let inRoutesSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for sections at root level (no indentation)
    if (!line.startsWith(' ') && !line.startsWith('\t')) {
      if (trimmed.startsWith('routes:')) {
        inRoutesSection = true;
      } else {
        inRoutesSection = false;
      }
      continue;
    }

    if (inRoutesSection) {
      // Check for route definition (exactly 2 spaces indentation)
      const routeMatch = line.match(/^(\s{2}|\t)[^\s\t]"?([^":]+)"?:?/);
      if (routeMatch) {
        currentRoute = routeMatch[2].trim();
        result.routes[currentRoute] = {};
        continue;
      }

      // Check for properties inside route (exactly 4 spaces indentation)
      if (currentRoute) {
        const propMatch = line.match(/^(\s{4}|\t{2})(price|description):\s*["']?([^"']+)["']?/);
        if (propMatch) {
          const key = propMatch[2];
          const val = propMatch[3];
          result.routes[currentRoute][key] = val;
        }
      }
    }
  }

  return result;
}

try {
  console.log('📖 Standalone Test: Generating OpenAPI specification for Agent Marketplace...');
  
  let yamlPath = path.resolve(process.cwd(), 'paygate.config.yaml');
  if (!fs.existsSync(yamlPath)) {
    // Check fallback
    const fallbackPath = path.resolve(process.cwd(), 'examples/express-basic/paygate.config.yaml');
    if (fs.existsSync(fallbackPath)) {
      yamlPath = fallbackPath;
    } else {
      throw new Error('paygate.config.yaml not found in root folder or examples/express-basic/!');
    }
  }

  const config = parseSimpleYaml(yamlPath);
  
  const openapi: any = {
    openapi: '3.0.0',
    info: {
      title: 'Agent Services API',
      version: '1.0.0',
      description: 'API monetized via PayGate x402 nanopayments.'
    },
    servers: [
      {
        url: 'https://your-domain.com',
        description: 'Production Server'
      }
    ],
    paths: {},
    components: {
      securitySchemes: {
        'x402-payment': {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Circle Gateway x402 payment authorization'
        }
      }
    }
  };

  for (const [route, routeConfig] of Object.entries(config.routes)) {
    const openApiPath = route.replace(/\*/g, '{proxy+}');
    const routeObj: any = routeConfig;
    
    const priceStr = routeObj.price || 'Unknown';
    const description = routeObj.description || `Access the ${route} resource.`;

    openapi.paths[openApiPath] = {
      get: {
        summary: `Access ${route}`,
        description: `${description} \n\n**Price:** ${priceStr} USDC`,
        security: [
          { 'x402-payment': [] }
        ],
        responses: {
          '200': {
            description: 'Successful response'
          },
          '402': {
            description: 'Payment Required - Trigger x402 payment flow'
          }
        }
      }
    };
  }

  const outPath = path.resolve(process.cwd(), 'openapi.json');
  fs.writeFileSync(outPath, JSON.stringify(openapi, null, 2));

  console.log(`\n✅ Generated openapi.json successfully in: ${outPath}`);
  console.log('Check the root folder to view the output!');
} catch (err: any) {
  console.error('❌ Failed to generate OpenAPI spec:', err.message);
}
