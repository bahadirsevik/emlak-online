import prisma from '../src/config/database';

async function main() {
  console.log('Enabling Automation...');
  
  const account = await prisma.instagramAccount.findFirst({
    where: { isActive: true }
  });

  if (!account) {
    console.error('No active account found.');
    return;
  }

  console.log(`Account: ${account.username}`);

  const settings = await prisma.automationSettings.upsert({
    where: { instagramAccountId: account.id },
    update: { isActive: true, keywords: ['fiyat', 'bilgi', 'test'] },
    create: {
      instagramAccountId: account.id,
      isActive: true,
      keywords: ['fiyat', 'bilgi', 'test'],
      dmTemplate: 'Merhaba! Test mesajıdır.',
      replyToComment: true,
      commentReplyTemplate: 'DM gönderildi (Test)'
    }
  });

  console.log('✅ Automation Enabled:', settings);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
