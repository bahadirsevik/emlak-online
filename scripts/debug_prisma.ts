import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  log('Checking Prisma Client models...');
  
  // @ts-ignore
  const keys = Object.keys(prisma);
  log(`Prisma keys: ${JSON.stringify(keys)}`);
  
  // Check specifically for automationSettings
  // @ts-ignore
  if (prisma.automationSettings) {
    log('✅ prisma.automationSettings exists');
  } else {
    log('❌ prisma.automationSettings is UNDEFINED');
  }

  // Check for Lead
  // @ts-ignore
  if (prisma.lead) {
    log('✅ prisma.lead exists');
  } else {
    log('❌ prisma.lead is UNDEFINED');
  }

  fs.writeFileSync('prisma_debug_output.txt', logs.join('\n'));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
