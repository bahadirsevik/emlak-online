import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/auth.routes';
import postRoutes from '../routes/post.routes';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

const prisma = new PrismaClient();

describe('Post Endpoints', () => {
  let token: string;
  let userId: string;
  let accountId: string;

  const testUser = {
    email: 'posttest@example.com',
    password: 'password123',
    firstName: 'Post',
    lastName: 'Test'
  };

  beforeAll(async () => {
    // Clean up
    await prisma.post.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.instagramAccount.deleteMany({ where: { user: { email: testUser.email } } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Register
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    console.log('Registration status:', res.statusCode);
    console.log('Registration body:', res.body);

    token = res.body.token;
    userId = res.body.user.id;

    // Create dummy Instagram Account
    const account = await prisma.instagramAccount.create({
      data: {
        userId,
        instagramUserId: '123456789',
        username: 'test_account',
        accessToken: 'dummy_token',
        tokenExpiresAt: new Date(),
        accountType: 'BUSINESS'
      }
    });
    accountId = account.id;
  });

  afterAll(async () => {
    await prisma.post.deleteMany({ where: { userId } });
    await prisma.instagramAccount.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('should schedule a post', async () => {
    const res = await request(app)
      .post('/api/posts/schedule')
      .set('Authorization', `Bearer ${token}`)
      .send({
        instagramAccountId: accountId,
        imageUrl: 'http://example.com/image.jpg',
        imagePublicId: 'test_public_id',
        caption: 'Test Caption',
        scheduledTime: new Date(Date.now() + 3600000).toISOString() // 1 hour later
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.post).toHaveProperty('status', 'SCHEDULED');
  });

  it('should get post stats', async () => {
    const res = await request(app)
      .get('/api/posts/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body.scheduled).toBeGreaterThanOrEqual(1);
  });
});
