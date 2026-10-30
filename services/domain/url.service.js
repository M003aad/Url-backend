import mongoose from 'mongoose';
import Url from '../../models/Url.model.js';

export const addUrl = async ({ originalUrl, urlCode, shortUrl, userId }) => {
  try {
    await Url.create({
      originalUrl: originalUrl,
      urlCode: urlCode,
      shortUrl: shortUrl,
      userId: userId,
    });
  } catch (err) {
    console.error('Error in addUrl:', err);
    throw err;
  }
};

export const checkCodeExists = async (code) => {
  const count = await Url.countDocuments({ urlCode: code });
  return count > 0;
};

export const getAndIncrementUrl = async (code) => {
  return await Url.findOneAndUpdate(
    { urlCode: code },
    { $inc: { clicks: 1 } },
    { select: 'originalUrl' },
  ).lean();
};

export const findOriginalUrlByCode = async (code) => {
  return await Url.findOne({ urlCode: code }).select('originalUrl').lean();
};

export const incrementClickCount = async (code) => {
  return await Url.updateOne({ urlCode: code }, { $inc: { clicks: 1 } });
};

export const findUrlAndDeleteIt = async (urlId, userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  return await Url.findOneAndDelete({
    _id: urlId,
    userId: userObjectId,
  });
};

// url.service.js
export const getAllUrls = async (userId, page, limit) => {
  const skip = (page - 1) * limit;

  // إرسال Query د القراءة و Query د الحساب فـ نفس الوقت (Parallel)
  const [urls, totalUrls] = await Promise.all([
    Url.find({ userId })
      .select('originalUrl urlCode shortUrl clicks createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Url.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(totalUrls / limit) || 1;

  return { urls, totalUrls, totalPages, currentPage: page };
};
