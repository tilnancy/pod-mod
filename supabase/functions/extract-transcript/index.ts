import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  console.log('Received request:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Supabase client');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Supabase URL available:', !!supabaseUrl);
    console.log('Supabase key available:', !!supabaseKey);
    
    const supabase = createClient(
      supabaseUrl ?? '',
      supabaseKey ?? ''
    );

    console.log('Fetching OpenAI API key from database');
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'openai')
      .single();

    if (apiKeyError) {
      console.error('Error fetching API key:', apiKeyError);
      throw new Error('Failed to retrieve API key');
    }

    if (!apiKeyData) {
      console.error('No API key found in database');
      throw new Error('API key not found');
    }

    console.log('Successfully retrieved API key');

    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      console.error('Invalid or missing audio file in request');
      throw new Error('No audio file provided');
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Create form data for OpenAI API
    const openAIFormData = new FormData();
    openAIFormData.append('file', audioFile);
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('response_format', 'json');
    openAIFormData.append('language', 'en');
    openAIFormData.append('timestamp_granularities', ['segment', 'word']);

    console.log('Preparing to call OpenAI API');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      console.log('Calling OpenAI API');
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyData.key_value}`,
        },
        body: openAIFormData,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log('OpenAI API response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      // Read the response as a buffer first
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const responseText = decoder.decode(buffer);
      
      console.log('Raw response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Successfully parsed JSON response:', result);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      if (!result.text) {
        console.error('Invalid response format - missing text property:', result);
        throw new Error('Invalid response format from OpenAI API');
      }

      // Convert the OpenAI response into our TranscriptionResult format
      const transcription = {
        text: result.text,
        segments: result.segments?.map((segment: any, index: number) => ({
          id: `segment-${index}`,
          start: segment.start || 0,
          end: segment.end || 0,
          text: segment.text || ''
        })) || [{
          id: 'segment-0',
          start: 0,
          end: result.duration || 0,
          text: result.text
        }]
      };

      console.log('Final transcription result:', transcription);

      return new Response(JSON.stringify(transcription), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error('Fetch error:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        console.error('OpenAI API request timed out');
        throw new Error('Request timed out while waiting for OpenAI response');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Transcript extraction error:', error);
    console.error('Error stack:', error.stack);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to extract transcript',
        details: error.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});