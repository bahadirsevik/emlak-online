import { Request, Response } from 'express';
import prisma from '../config/database';
import * as instagramService from '../services/instagram.service';
import { encrypt } from '../utils/encryption.util';

// Extend Request to include user from auth middleware
interface AuthRequest extends Request {
  user?: { id: string };
}

export const initAuth = (req: Request, res: Response) => {
  const url = instagramService.getAuthUrl();
  res.json({ url });
};

export const callback = async (req: AuthRequest, res: Response) => {
  const { code } = req.query;
  const userId = req.user?.id;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Authorization code is missing' });
  }

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    // 1. Exchange code for short-lived token
    const shortLivedData = await instagramService.exchangeCodeForToken(code);
    
    // 2. Exchange for long-lived token
    const longLivedData = await instagramService.getLongLivedToken(shortLivedData.access_token);
    const accessToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // seconds

    // 3. Get User's Pages and connected Instagram Accounts
    const pages = await instagramService.getUserPages(accessToken);
    
    const connectedAccounts = [];

    // 4. Iterate and save connected Instagram accounts
    for (const page of pages) {
      if (page.instagram_business_account) {
        const igAccount = page.instagram_business_account;
        
        // Fetch full details (optional, but good for profile pic etc)
        // const details = await instagramService.getInstagramAccountDetails(igAccount.id, accessToken);

        const expiresAt = new Date(Date.now() + expiresIn * 1000);
        const encryptedToken = encrypt(accessToken); // We use the User Token for all actions usually

        const savedAccount = await prisma.instagramAccount.upsert({
          where: {
            userId_instagramUserId: {
              userId,
              instagramUserId: igAccount.id,
            },
          },
          update: {
            accessToken: encryptedToken,
            tokenExpiresAt: expiresAt,
            username: igAccount.username,
            accountType: 'BUSINESS', // It's always business/creator if connected to a page
            isActive: true,
            lastSyncAt: new Date(),
          },
          create: {
            userId,
            instagramUserId: igAccount.id,
            username: igAccount.username,
            accessToken: encryptedToken,
            tokenExpiresAt: expiresAt,
            accountType: 'BUSINESS',
          },
        });
        connectedAccounts.push(savedAccount);
      }
    }

    if (connectedAccounts.length === 0) {
       // No IG accounts found connected to pages
       return res.redirect('http://localhost:5173/dashboard?status=warning&message=no_instagram_business_account_found');
    }

    res.redirect('http://localhost:5173/dashboard?status=success'); 
  } catch (error: any) {
    console.error('Instagram Auth Error:', error.response?.data || error.message);
    res.redirect('http://localhost:5173/dashboard?status=error&message=auth_failed');
  }
};

export const getAccounts = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const accounts = await prisma.instagramAccount.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        username: true,
        accountType: true,
        connectedAt: true,
        instagramUserId: true,
        isActive: true,
        watermarkPublicId: true,
        watermarkPosition: true,
        watermarkOpacity: true,
        watermarkScale: true
      } as any
    });
    res.json(accounts);
  } catch (error: any) {
    console.error('Get Accounts Error:', error);
    res.status(500).json({ message: 'Error fetching accounts', error: error.message });
  }
};

export const disconnectAccount = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    await prisma.instagramAccount.updateMany({
      where: { id, userId },
      data: { isActive: false }
    });
    res.json({ message: 'Account disconnected' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error disconnecting account', error: error.message });
  }
};

export const connectManual = async (req: AuthRequest, res: Response) => {
  const { instagramBusinessId, facebookPageId, accessToken } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!instagramBusinessId || !facebookPageId || !accessToken) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Manual Connect Request:', { instagramBusinessId, facebookPageId, tokenLength: accessToken?.length });
    const encryptedToken = encrypt(accessToken);
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // Assume 60 days

    const savedAccount = await prisma.instagramAccount.upsert({
      where: {
        userId_instagramUserId: {
          userId,
          instagramUserId: instagramBusinessId,
        },
      },
      update: {
        accessToken: encryptedToken,
        tokenExpiresAt: expiresAt,
        username: 'Manual Connection', 
        accountType: 'BUSINESS',
        isActive: true,
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        instagramUserId: instagramBusinessId,
        username: 'Manual Connection',
        accessToken: encryptedToken,
        tokenExpiresAt: expiresAt,
        accountType: 'BUSINESS',
      },
    });

    res.status(200).json({ message: 'Account connected successfully', account: savedAccount });
  } catch (error: any) {
    console.error('Manual Connect Error:', error);
    res.status(500).json({ message: 'Failed to connect account', error: error.message });
  }
};

export const updateWatermarkSettings = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { watermarkPublicId, watermarkPosition, watermarkOpacity, watermarkScale } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const updatedAccount = await prisma.instagramAccount.updateMany({
      where: { id, userId },
      data: {
        watermarkPublicId,
        watermarkPosition,
        watermarkOpacity,
        watermarkScale
      } as any
    });

    if (updatedAccount.count === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }

    res.json({ message: 'Watermark settings updated successfully' });
  } catch (error: any) {
    console.error('Watermark Update Error:', error);
    res.status(500).json({ message: 'Failed to update watermark settings', error: error.message });
  }
};
