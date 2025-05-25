const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract path parameters
    const path = event.path.split('/');
    const apiEndpoint = path[path.length - 1] || 'blog';
    
    const { query, display = 10, start = 1 } = event.queryStringParameters || {};
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'query parameter is required' }),
      };
    }

    // Get API credentials from environment variables
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing Naver API credentials');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API credentials not configured' }),
      };
    }

    const url = `https://openapi.naver.com/v1/search/${apiEndpoint}?query=${encodeURIComponent(query)}&display=${display}&start=${start}`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Naver API error:', response.status, errorText);
      throw new Error(`Naver API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items) {
      console.error('Invalid Naver API response:', data);
      throw new Error('Invalid response format from Naver API');
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data.items),
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: '네이버 검색 API 오류가 발생했습니다',
        details: error.message 
      }),
    };
  }
};