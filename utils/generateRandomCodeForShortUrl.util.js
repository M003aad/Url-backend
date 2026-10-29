import crypto from 'crypto';

const generateRandomCodeForShortUrl = (length) => {
  return crypto.randomBytes(length).toString('hex');
};

export default generateRandomCodeForShortUrl;
