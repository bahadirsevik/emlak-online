import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for connected Instagram accounts...');
  
  const account = await prisma.instagramAccount.findFirst({
    where: { isActive: true }
  });

  if (!account) {
    fs.writeFileSync('temp_account_info.txt', 'NO_ACCOUNT_FOUND');
    return;
  }

  // Check/Create Settings
  let settings = await prisma.automationSettings.findUnique({
    where: { instagramAccountId: account.id }
  });

  if (!settings) {
    settings = await prisma.automationSettings.create({
      data: {
        instagramAccountId: account.id,
        isActive: true,
        keywords: ['fiyat', 'bilgi', 'test'],
        dmTemplate: 'Merhaba! Test mesajıdır.',
        replyToComment: true,
        commentReplyTemplate: 'DM gönderildi (Test)'
      }
    });
  } else {
    settings = await prisma.automationSettings.update({
      where: { id: settings.id },
      data: { 
        isActive: true,
        keywords: ['fiyat', 'bilgi', 'test'] 
      }
    });
  }

  const payload = {
    object: "instagram",
    entry: [
      {
        id: account.instagramUserId,
        time: 12345678,
        changes: [
          {
            value: {
              from: { id: "123", username: "test_user" },
              media: { id: "media_123", media_product_type: "FEED" },
              id: "comment_123",
              text: "Fiyat nedir?"
            },
            field: "comments"
          }
        ]
      }
    ]
  };

  fs.writeFileSync('temp_account_info.txt', JSON.stringify(payload, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
