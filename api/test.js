export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  
  res.status(200).json({
    message: 'Environment test',
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientIdLength: clientId ? clientId.length : 0,
    secretLength: clientSecret ? clientSecret.length : 0,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('NAVER')),
    timestamp: new Date().toISOString()
  });
} 