import prisma from '../src/config/database';

async function main() {
  console.log('Reproducing Webhook Error...');

  const instagramAccountId = '17841477112232272'; // The ID we found earlier
  const commentData = {
    id: 'comment_123',
    text: 'Fiyat nedir?',
    from: { id: '123', username: 'test_musterisi' },
    media: { id: 'media_123', media_product_type: 'FEED' }
  };

  try {
    console.log('1. Finding Account...');
    const account = await prisma.instagramAccount.findFirst({
      where: { instagramUserId: instagramAccountId }
    });
    
    if (!account) {
      console.log('Account not found');
      return;
    }
    console.log('Account found:', account.id);

    console.log('2. Finding Settings...');
    const settings = await prisma.automationSettings.findUnique({
      where: { instagramAccountId: account.id }
    });

    if (!settings) {
      console.log('Settings not found');
      return;
    }
    console.log('Settings found:', settings);

    console.log('3. Creating Lead...');
    const lead = await prisma.lead.create({
      data: {
        instagramAccountId: account.id,
        username: commentData.from.username,
        comment: commentData.text,
        mediaUrl: `https://instagram.com/p/${commentData.media.id}`,
        status: 'NEW'
      }
    });
    console.log('Lead created:', lead.id);

    console.log('4. Attempting Reply...');
    try {
      // Simulate what happens in the controller
      if (settings.replyToComment && settings.commentReplyTemplate) {
        console.log('Calling replyToComment...');
        // We can't easily import the service function here without mocking axios, 
        // but we can simulate the failure it would produce.
        throw new Error('Request failed with status code 400'); 
      }
    } catch (err) {
      console.log('✅ Caught expected error from API call:', err.message);
    }

  } catch (error) {
    console.error('❌ ERROR CAUGHT:', error);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
