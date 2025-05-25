export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { query, display = 10, start = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'query parameter is required' });
    }

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ 
        error: 'API credentials not configured'
      });
    }

    const url = `https://openapi.naver.com/v1/search/blog?query=${encodeURIComponent(query)}&display=${display}&start=${start}`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver API error: ${response.status}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data.items || []);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: '네이버 검색 API 오류가 발생했습니다',
      details: error.message 
    });
  }
} 