import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    const user = await prisma.user.findFirst();

    if (!user) {
      console.error('No users found in database to test with.');
      return;
    }

    console.log(`Found user: ${user.email} (${user.id})`);
    console.log('Attempting to create a test template...');

    const template = await prisma.template.create({
      data: {
        name: 'Debug Template',
        content: 'This is a test template created by the debug script.',
        userId: user.id,
      },
    });

    console.log('Successfully created template:', template);

    // Clean up
    await prisma.template.delete({
      where: { id: template.id },
    });
    console.log('Successfully deleted test template.');

  } catch (error) {
    console.error('Error during template test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
