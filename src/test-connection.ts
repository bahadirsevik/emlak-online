import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log('Testing connection to DATABASE_URL...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password

    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to database via Prisma Client!');

        // Check if User table exists
        const tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'User';
        `;
        console.log('Table Check Result:', tables);

        // Count existing users if table exists
        if (Array.isArray(tables) && tables.length > 0) {
            const userCount = await prisma.user.count();
            console.log(`User table exists and has ${userCount} records.`);
        } else {
            console.log('User table does NOT exist.');
        }
    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
