import axios from 'axios';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v21.0';
const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth';

export const getAuthUrl = () => {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  // Scopes required for publishing and managing comments/insights
  const scope = [
    'email',
    'pages_show_list',
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_insights',
    'pages_read_engagement'
  ].join(',');
  
  return `${FACEBOOK_AUTH_URL}?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
};

export const exchangeCodeForToken = async (code: string) => {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    code,
  });

  const response = await axios.get(`${FACEBOOK_API_URL}/oauth/access_token`, { params });
  return response.data; // { access_token, token_type, expires_in }
};

export const getLongLivedToken = async (shortLivedToken: string) => {
  const response = await axios.get(`${FACEBOOK_API_URL}/oauth/access_token`, {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      fb_exchange_token: shortLivedToken,
    },
  });
  return response.data; // { access_token, token_type, expires_in }
};

export const getUserPages = async (accessToken: string) => {
  // Fetch user's pages and their connected Instagram accounts
  const response = await axios.get(`${FACEBOOK_API_URL}/me/accounts`, {
    params: {
      access_token: accessToken,
      fields: 'id,name,access_token,instagram_business_account{id,username,profile_picture_url}',
    },
  });
  return response.data.data;
};

export const getInstagramAccountDetails = async (instagramId: string, accessToken: string) => {
  const response = await axios.get(`${FACEBOOK_API_URL}/${instagramId}`, {
    params: {
      access_token: accessToken,
      fields: 'id,username,profile_picture_url,biography,followers_count,follows_count,media_count',
    },
  });
  return response.data;
};

export const createMediaContainer = async (instagramId: string, imageUrl: string, caption: string, accessToken: string, isCarouselItem: boolean = false) => {
  const params: any = {
    image_url: imageUrl,
    access_token: accessToken,
  };

  if (isCarouselItem) {
    params.is_carousel_item = true;
  } else {
    params.caption = caption;
  }

  const response = await axios.post(`${FACEBOOK_API_URL}/${instagramId}/media`, null, { params });
  return response.data.id; // Container ID
};

export const createCarouselContainer = async (instagramId: string, childrenIds: string[], caption: string, accessToken: string) => {
  const response = await axios.post(`${FACEBOOK_API_URL}/${instagramId}/media`, null, {
    params: {
      media_type: 'CAROUSEL',
      children: childrenIds.join(','),
      caption: caption,
      access_token: accessToken,
    },
  });
  return response.data.id; // Carousel Container ID
};

export const createVideoContainer = async (instagramId: string, videoUrl: string, caption: string, accessToken: string, coverUrl?: string) => {
  const params: any = {
    media_type: 'REELS',
    video_url: videoUrl,
    caption: caption,
    access_token: accessToken,
  };
  
  if (coverUrl) {
    params.cover_url = coverUrl;
  }

  const response = await axios.post(`${FACEBOOK_API_URL}/${instagramId}/media`, null, { params });
  return response.data.id;
};

export const checkContainerStatus = async (containerId: string, accessToken: string) => {
  const response = await axios.get(`${FACEBOOK_API_URL}/${containerId}`, {
    params: {
      fields: 'status_code,status',
      access_token: accessToken,
    },
  });
  return response.data;
};

export const publishMedia = async (instagramId: string, creationId: string, accessToken: string) => {
  const response = await axios.post(`${FACEBOOK_API_URL}/${instagramId}/media_publish`, null, {
    params: {
      creation_id: creationId,
      access_token: accessToken,
    },
  });
  return response.data.id; // Media ID
};

export const sendDM = async (instagramId: string, recipientId: string, message: string, accessToken: string) => {
  // Note: Sending DMs via API requires 'instagram_manage_messages' permission and is limited.
  // For standard accounts, this might be restricted.
  // Endpoint: POST /{ig-user-id}/messages
  
  const response = await axios.post(`${FACEBOOK_API_URL}/${instagramId}/messages`, {
    recipient: { id: recipientId },
    message: { text: message }
  }, {
    params: { access_token: accessToken }
  });
  
  return response.data;
};

export const replyToComment = async (commentId: string, message: string, accessToken: string) => {
  // Endpoint: POST /{comment-id}/replies
  const response = await axios.post(`${FACEBOOK_API_URL}/${commentId}/replies`, null, {
    params: {
      message: message,
      access_token: accessToken
    }
  });
  
  return response.data;
};
