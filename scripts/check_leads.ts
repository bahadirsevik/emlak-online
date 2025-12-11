import prisma from '../src/config/database';

async function main() {
  console.log('Checking Leads...');
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(`Found ${leads.length} leads.`);
  leads.forEach(lead => {
    console.log(`- [${lead.status}] ${lead.username}: ${lead.comment} (Notes: ${lead.notes})`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
