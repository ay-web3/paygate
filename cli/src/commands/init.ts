import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

export async function initCommand() {
  console.log('Welcome to PayGate CLI! Let\'s monetize your API with x402.\n');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework are you using?',
      choices: ['Express', 'Next.js (Coming soon)', 'Fastify (Coming soon)']
    },
    {
      type: 'input',
      name: 'wallet',
      message: 'Enter your crypto wallet address to receive payments (USDC):',
      validate: (input) => {
        if (!input.startsWith('0x') && input.length < 32) {
          return 'Please enter a valid EVM (0x...) or Solana wallet address.';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'networks',
      message: 'Which networks do you want to support?',
      choices: [
        { name: 'Base Sepolia (Testnet)', value: 'base-sepolia', checked: true },
        { name: 'ARC Testnet', value: 'arc-testnet' },
        { name: 'Solana Devnet', value: 'solana-devnet' },
        { name: 'Base Mainnet', value: 'base' }
      ],
      validate: (answer) => {
        if (answer.length < 1) return 'You must choose at least one network.';
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'dashboard',
      message: 'Do you want to enable the revenue analytics dashboard?',
      default: true
    }
  ]);

  if (answers.framework !== 'Express') {
    console.log('\nCurrently, only Express is fully supported in this early version. Setting up Express...');
    answers.framework = 'Express';
  }

  const cwd = process.cwd();

  // Create config
  const configContent = `seller:
  wallet: "${answers.wallet}"
  networks:
${answers.networks.map((n: string) => `    - ${n}`).join('\n')}
  facilitator: testnet

routes:
  "GET /weather":
    price: "$0.001"
    description: "Sample paid endpoint"

dashboard:
  enabled: ${answers.dashboard}
  port: 3001
`;

  fs.writeFileSync(path.join(cwd, 'paygate.config.yaml'), configContent);
  console.log('\n✅ Created paygate.config.yaml');

  // Create server.ts template
  const serverContent = `import express from "express";
import { paygate } from "@emmanue5002k/paygate-express";

const app = express();

// Initialize PayGate middleware
// This automatically reads paygate.config.yaml and sets up x402!
app.use(paygate());

app.get("/weather", (req, res) => {
  res.json({
    weather: "sunny",
    temperature: 70,
    message: "You paid $0.001 to see this!"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`API server running on http://localhost:\${PORT}\`);
  ${answers.dashboard ? 'console.log(`Dashboard running on http://localhost:3001`);' : ''}
});
`;

  fs.writeFileSync(path.join(cwd, 'server.ts'), serverContent);
  console.log('✅ Created sample server.ts');

  console.log('\n🚀 Setup complete! To get started:');
  console.log('1. Run `npm install @emmanue5002k/paygate-core @emmanue5002k/paygate-express express`');
  console.log('2. Run `npm install --save-dev typescript @types/express ts-node`');
  console.log('3. Run `npx ts-node server.ts`');
}
