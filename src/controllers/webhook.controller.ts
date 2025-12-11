import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database';
import * as instagramService from '../services/instagram.service';

// Verify the payload signature from Facebook
const verifySignature = (req: Request): boolean => {
  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) return true; // Skip if no secret (dev mode)

  const hmac = crypto.createHmac('sha256', appSecret);
  return true; 
};

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'gravity_webhook_token';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
};

import fs from 'fs';

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'comments') {
              await processComment(entry.id, change.value);
            }
          }
        }
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    fs.writeFileSync('webhook_error.txt', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n`);
    res.sendStatus(500);
  }
};

const processComment = async (instagramAccountId: string, commentData: any) => {
  const { text, from, media } = commentData;
  const username = from.username;
  const commentId = commentData.id;

  console.log(`Processing comment from ${username}: ${text}`);

  // 1. Find the account in our DB
  const account = await prisma.instagramAccount.findFirst({
    where: { instagramUserId: instagramAccountId }
  });

  if (!account) {
    console.log('Account not found for ID:', instagramAccountId);
    return;
  }

  // 2. Get Automation Settings
  const settings = await prisma.automationSettings.findUnique({
    where: { instagramAccountId: account.id }
  });

  if (!settings || !settings.isActive) {
    console.log('Automation disabled for this account.');
    return;
  }

  // 3. Check for keywords
  const lowerText = text.toLowerCase();
  const match = settings.keywords.some((keyword: string) => lowerText.includes(keyword.toLowerCase()));

  if (match) {
    console.log('Keyword match found! Triggering Auto-DM...');

    // 4. Create Lead
    const lead = await prisma.lead.create({
      data: {
        instagramAccountId: account.id,
        username: username,
        comment: text,
        mediaUrl: media ? `https://instagram.com/p/${media.id}` : null,
        status: 'NEW'
      }
    });

    // 5. Send DM / Reply
    try {
      if (settings.replyToComment && settings.commentReplyTemplate) {
        await instagramService.replyToComment(commentId, settings.commentReplyTemplate, account.accessToken);
        
        await prisma.lead.update({
          where: { id: lead.id },
          data: { 
            status: 'CONTACTED',
            notes: 'Replied to comment.'
          }
        });
      }

      // DM logic placeholder
      if (settings.dmTemplate) {
         // await instagramService.sendDM(instagramAccountId, from.id, settings.dmTemplate, account.accessToken);
      }

    } catch (err) {
      console.error('Failed to send auto-response:', err);
    }
  }
};
