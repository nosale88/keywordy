import { ContentType } from '../../../src/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Naver-Client-Id, X-Naver-Client-Secret',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');
    const contentType = url.searchParams.get('type') as ContentType;
    const page = parseInt(url.searchParams.get('page') || '1', 10);

    if (!query) {
      throw new Error('Query parameter is required');
    }

    // Get client credentials from request headers
    const clientId = req.headers.get('X-Naver-Client-Id');
    const clientSecret = req.headers.get('X-Naver-Client-Secret');

    if (!clientId || !clientSecret) {
      throw new Error('Naver API credentials are missing from request headers');
    }

    let apiEndpoint;
    switch (contentType) {
      case 'news':
        apiEndpoint = 'news';
        break;
      case 'blog':
        apiEndpoint = 'blog';
        break;
      case 'cafe':
      case 'all':
      default:
        apiEndpoint = 'blog';
        break;
    }

    const display = 10;
    const start = (page - 1) * display + 1;

    const searchUrl = new URL(`https://openapi.naver.com/v1/search/${apiEndpoint}`);
    searchUrl.searchParams.append('query', query);
    searchUrl.searchParams.append('display', display.toString());
    searchUrl.searchParams.append('start', start.toString());

    console.log(`Searching Naver API: ${searchUrl.toString()}`);

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Naver API error response:', errorText);
      throw new Error(`Naver API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      console.error('Invalid Naver API response:', data);
      throw new Error('Invalid response from Naver API');
    }

    const results = data.items.map((item: {
      title?: string;
      description?: string;
      link?: string;
      bloggername?: string;
      publisher?: string;
      postdate?: string;
      pubDate?: string;
      thumbnail?: string;
    }, index: number) => ({
      id: `${apiEndpoint}-${index}-${Date.now()}`,
      title: item.title?.replace(/<\/?b>/g, '') || '',
      content: item.description?.replace(/<\/?b>/g, '') || '',
      link: item.link,
      source: item.bloggername || item.publisher || '',
      type: apiEndpoint as 'blog' | 'news',
      date: item.postdate || item.pubDate,
      thumbnail: item.thumbnail || undefined,
    }));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});