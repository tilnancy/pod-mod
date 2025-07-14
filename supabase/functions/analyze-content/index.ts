import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const analysisPrompt = `
For the transcript provided analyze and provide the following:
1. Swear Words - List the swear words present in the transcript. 
2. Racial Slurs - List the racial slurs present in the transcript
3. Sensitive Content - List any sensitive content present in the transcript
4. Violence and extremism - List any content related to violence and extremism. Praising or encouraging violent acts, terrorism, or extremist groups; step‑by‑step instructions for weapons/attacks
5. Sexual Content - Content that is sexual in nature

Provide direct answers to questions. Be helpful and concise.
`;

Deno.serve(async (req) => {
  console.log('Received content analysis request:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Getting OpenAI API key from database');
    
    // Get OpenAI API key from database
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('key_name', 'openai')
      .single();

    if (apiKeyError || !apiKeyData) {
      console.error('Failed to get OpenAI API key from database:', apiKeyError);
      throw new Error('OpenAI API key not found in database');
    }

    const openaiApiKey = apiKeyData.key_value;
    
    if (!openaiApiKey) {
      console.error('OpenAI API key is empty');
      throw new Error('OpenAI API key not configured');
    }
    
    console.log('Successfully retrieved API key from database');

    const requestData = await req.json();
    console.log('Received request data:', requestData);
    
    const { transcript } = requestData;
    if (!transcript) {
      console.error('No transcript provided in request');
      throw new Error('No transcript provided');
    }

    console.log('Preparing OpenAI API request');
    const openAIRequest = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: analysisPrompt
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('Calling OpenAI API with request:', JSON.stringify(openAIRequest, null, 2));
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIRequest)
    });

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

    const result = await response.json();
    console.log('OpenAI API response content:', result);

    // Parse the response content into sections
    const content = result.choices[0].message.content;
    console.log('Raw content from OpenAI:', content);

    // Split the content into sections and create a structured response
    const sections = content.split('\n').reduce((acc, line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('1. Swear Words')) {
        acc.swear_words = trimmedLine.replace('1. Swear Words - ', '');
      } else if (trimmedLine.startsWith('2. Racial Slurs')) {
        acc.racial_slurs = trimmedLine.replace('2. Racial Slurs - ', '');
      } else if (trimmedLine.startsWith('3. Sensitive Content')) {
        acc.sensitive_content = trimmedLine.replace('3. Sensitive Content - ', '');
      } else if (trimmedLine.startsWith('4. Violence and extremism')) {
        acc.violence_and_extremism = trimmedLine.replace('4. Violence and extremism - ', '');
      } else if (trimmedLine.startsWith('5. Sexual Content')) {
        acc.sexual_content = trimmedLine.replace('5. Sexual Content - ', '');
      }
      return acc;
    }, {
      swear_words: 'None detected',
      racial_slurs: 'None detected',
      sensitive_content: 'None detected',
      violence_and_extremism: 'None detected',
      sexual_content: 'None detected',
      timestamp: new Date().toISOString()
    });

    console.log('Structured analysis result:', sections);

    return new Response(JSON.stringify(sections), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Content analysis error:', error);
    console.error('Error stack:', error.stack);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to analyze content',
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