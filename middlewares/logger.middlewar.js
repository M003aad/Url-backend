import useragent from 'express-useragent';

export const requestLogger = (req, res, next) => {
  const source = req.headers['user-agent'] || '';
  const ua = useragent.parse(source);

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'Unknown';

  let deviceType = 'Desktop';
  if (ua.isMobile) deviceType = 'Mobile';
  if (ua.isTablet) deviceType = 'Tablet';
  if (ua.isBot) deviceType = 'Bot';

  req.userMetadata = {
    userAgent: source,
    ip,
    deviceType,
    browser: ua.browser !== 'unknown' ? ua.browser : 'Unknown',
  };

  next();
};

export default requestLogger;