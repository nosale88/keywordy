import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { SearchResult, ContentType } from '../../../src/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function searchNaver(query: string, contentType: ContentType = 'all'): Promise<SearchResult[]> {
  try {
    const apiEndpoint = contentType === 'news' ? 'news' : 'blog';
    
    const response = await fetch(`https://openapi.naver.com/v1/search/${apiEndpoint}`, {
      headers: {
        'X-Naver-Client-Id': Deno.env.get('VITE_NAVER_CLIENT_ID') || '',
        'X-Naver-Client-Secret': Deno.env.get('VITE_NAVER_CLIENT_SECRET') || '',
      },
    });

    const data = await response.json();
    const items = data.items;
    
    return items.map((item: {
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
  } catch (error) {
    console.error('Error searching Naver:', error);
    throw new Error('네이버 검색 API 호출 중 오류가 발생했습니다.');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false }).slice(0, 5);
    const currentDay = now.getDay();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    // Get all scheduled searches
    const { data: schedules, error } = await supabase
      .from('scheduled_searches')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    // Process each schedule
    for (const schedule of schedules) {
      if (schedule.time !== currentTime) continue;
      if (schedule.type === 'weekly' && !schedule.days.includes(currentDay)) continue;

      // Perform searches for all tags
      for (const tag of schedule.search_tags) {
        const results = await searchNaver(tag.keyword, tag.content_type);
        
        // Store results in Supabase
        await supabase.from('search_results').insert(
          results.map(result => ({
            ...result,
            schedule_id: schedule.id,
            search_tag: tag,
            searched_at: new Date().toISOString(),
          }))
        );
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});