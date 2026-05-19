import { Command } from 'commander';
import { loadConfig } from '@emmanue5002k/paygate-core';
import fs from 'fs';
import path from 'path';

export function registerPublishCommand(program: Command) {
  program
    .command('publish')
    .description('Generate an OpenAPI specification for the Circle Agent Marketplace')
    .action(async () => {
      try {
        console.log('📖 Generating OpenAPI specification for Agent Marketplace...');
        const config = loadConfig();
        
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
          // Normalize wildcard routes to OpenAPI path parameters
          const openApiPath = route.replace(/\*/g, '{proxy+}');
          
          let priceStr = 'Unknown';
          if (routeConfig.pricing && routeConfig.pricing.type === 'flat') {
             priceStr = routeConfig.pricing.price;
          } else if (routeConfig.price) {
             priceStr = routeConfig.price;
          }

          const description = routeConfig.description || `Access the ${route} resource.`;

          openapi.paths[openApiPath] = {
            get: {
              summary: `Access ${route}`,
              description: `${description} \n\n**Price:** ${priceStr} ${config.pricing?.defaultCurrency || 'USDC'}`,
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

        console.log(`✅ Generated openapi.json successfully!`);
        console.log(`\n🚀 To publish your service to the Circle Agent Marketplace:`);
        console.log(`1. Review the generated openapi.json file.`);
        console.log(`2. Go to https://agents.circle.com/services`);
        console.log(`3. Submit your OpenAPI schema to list your service!`);

      } catch (err: any) {
        console.error('❌ Failed to generate OpenAPI spec:', err.message);
        process.exit(1);
      }
    });
}
