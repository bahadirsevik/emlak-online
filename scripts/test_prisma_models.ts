import prisma from '../src/config/database';

async function main() {
  console.log('Testing Prisma Models...');
  
  try {
    // @ts-ignore
    if (!prisma.automationSettings) {
      console.error('❌ prisma.automationSettings is UNDEFINED');
    } else {
      console.log('✅ prisma.automationSettings is DEFINED');
      
      // Try a query
      const count = await prisma.automationSettings.count();
      console.log(`✅ Query successful. Count: ${count}`);
    }
  } catch (error) {
    console.error('❌ Error querying AutomationSettings:', error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
