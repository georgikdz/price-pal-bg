import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CANONICAL_PRODUCTS = [
  { id: 'kashkaval', name: 'Yellow Cheese (Kashkaval)', nameBg: 'Кашкавал', category: 'dairy' },
  { id: 'sirene', name: 'White Cheese (Sirene)', nameBg: 'Сирене', category: 'dairy' },
  { id: 'milk', name: 'Milk 3.6%', nameBg: 'Прясно мляко', category: 'dairy' },
  { id: 'yogurt', name: 'Bulgarian Yogurt', nameBg: 'кисело мляко', category: 'dairy' },
  { id: 'butter', name: 'Butter', nameBg: 'Масло', category: 'dairy' },
  { id: 'eggs', name: 'Eggs', nameBg: 'Яйца', category: 'dairy' },
  { id: 'sunflower-oil', name: 'Sunflower Oil', nameBg: 'Слънчогледово олио', category: 'oils' },
  { id: 'olive-oil', name: 'Olive Oil', nameBg: 'Зехтин', category: 'oils' },
  { id: 'flour', name: 'White Flour', nameBg: 'Брашно', category: 'grains' },
  { id: 'bread', name: 'White Bread', nameBg: 'Хляб', category: 'grains' },
  { id: 'rice', name: 'White Rice', nameBg: 'Ориз', category: 'grains' },
  { id: 'pasta', name: 'Pasta', nameBg: 'Макарони', category: 'grains' },
  { id: 'tomatoes', name: 'Tomatoes', nameBg: 'Домати', category: 'produce' },
  { id: 'cucumbers', name: 'Cucumbers', nameBg: 'Краставици', category: 'produce' },
  { id: 'potatoes', name: 'Potatoes', nameBg: 'Картофи', category: 'produce' },
  { id: 'onions', name: 'Onions', nameBg: 'Лук', category: 'produce' },
  { id: 'lemons', name: 'Lemons', nameBg: 'Лимони', category: 'produce' },
  { id: 'apples', name: 'Apples', nameBg: 'Ябълки', category: 'produce' },
  { id: 'bananas', name: 'Bananas', nameBg: 'Банани', category: 'produce' },
  { id: 'chicken', name: 'Chicken', nameBg: 'Пилешко', category: 'proteins' },
  { id: 'minced-meat', name: 'Minced Meat', nameBg: 'Кайма', category: 'proteins' },
  { id: 'pork', name: 'Pork', nameBg: 'Свинско', category: 'proteins' },
  { id: 'sugar', name: 'White Sugar', nameBg: 'Захар', category: 'pantry' },
  { id: 'salt', name: 'Table Salt', nameBg: 'Сол', category: 'pantry' },
  { id: 'coffee', name: 'Ground Coffee', nameBg: 'Кафе', category: 'pantry' },
  { id: 'tomato-paste', name: 'Tomato Paste', nameBg: 'Доматено пюре', category: 'pantry' },
  { id: 'biscuits', name: 'Biscuits', nameBg: 'Бисквити', category: 'snacks' },
  { id: 'chocolate', name: 'Chocolate', nameBg: 'Шоколад', category: 'snacks' },
  { id: 'water', name: 'Mineral Water', nameBg: 'Минерална вода', category: 'beverages' },
  { id: 'juice', name: 'Orange Juice', nameBg: 'Сок', category: 'beverages' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let brochureId: string | undefined;

  try {
    const body = await req.json();
    brochureId = body?.brochureId;
    const { store, images } = body ?? {};

    // Validate required fields
    if (!brochureId || !store) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: brochureId, store' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid images array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.log(`Processing brochure ${brochureId} for store ${store} with ${images.length} page(s)`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build AI request with images
    const productListStr = CANONICAL_PRODUCTS.map(p => 
      `- ${p.id}: ${p.name} / ${p.nameBg}`
    ).join('\n');

    const systemPrompt = `You are an expert at extracting product and price information from Bulgarian grocery store brochures.

Your task is to analyze the brochure page images and extract all food products with their prices.

CANONICAL PRODUCTS (use these IDs when matching):
${productListStr}

For each product found, extract:
1. raw_name: The exact product name as written in the brochure (in Bulgarian or English)
2. raw_price: The regular price in BGN (just the number, e.g., 5.99)
3. raw_unit: The unit/quantity (e.g., "1 kg", "500g", "1 L", "1 бр.")
4. promo_price: The promotional price if on sale (just the number), or null if not on sale
5. mapped_product_id: The best matching canonical product ID from the list above, or null if no match
6. confidence_score: Your confidence in the mapping (0.0 to 1.0)

Return ONLY a valid JSON array of objects. No explanation or markdown. Example:
[{"raw_name":"Кашкавал Витоша","raw_price":15.99,"raw_unit":"1 kg","promo_price":12.99,"mapped_product_id":"kashkaval","confidence_score":0.95}]`;

    // Build content array with all images
    const userContent: any[] = [
      {
        type: 'text',
        text: `Analyze these ${images.length} page(s) from a ${store} grocery brochure and extract all food products with prices. Return ONLY valid JSON array combining products from all pages.`,
      },
    ];

    // Add each page image
    for (const img of images) {
      if (img.dataUrl && typeof img.dataUrl === 'string' && img.dataUrl.startsWith('data:image/')) {
        userContent.push({
          type: 'image_url',
          image_url: { url: img.dataUrl },
        });
      }
    }

    console.log('Calling AI API...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI credits depleted. Please add credits to continue.');
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '[]';
    
    console.log('AI response received, parsing...');

    // Parse the extracted products
    let extractedProducts = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedProducts = JSON.parse(jsonMatch[0]);
      } else {
        console.log('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      extractedProducts = [];
    }

    console.log(`Extracted ${extractedProducts.length} products`);

    // Insert extracted products into database
    if (extractedProducts.length > 0) {
      const productsToInsert = extractedProducts.map((p: any) => ({
        brochure_id: brochureId,
        raw_name: p.raw_name || 'Unknown',
        raw_price: p.raw_price || null,
        raw_unit: p.raw_unit || null,
        promo_price: p.promo_price || null,
        mapped_product_id: p.mapped_product_id || null,
        confidence_score: p.confidence_score || 0,
      }));

      const { error: insertError } = await supabase
        .from('extracted_products')
        .insert(productsToInsert);

      if (insertError) {
        console.error('Error inserting products:', insertError);
        throw insertError;
      }

      // Insert prices for mapped products
      const pricesToInsert = extractedProducts
        .filter((p: any) => p.mapped_product_id && p.raw_price)
        .map((p: any) => ({
          product_id: p.mapped_product_id,
          store: store,
          brand: p.raw_name || null,
          price: p.promo_price || p.raw_price,
          promo_price: p.promo_price || null,
          is_promo: !!p.promo_price,
          unit: p.raw_unit || null,
          brochure_id: brochureId,
        }));

      if (pricesToInsert.length > 0) {
        const { error: pricesError } = await supabase
          .from('prices')
          .insert(pricesToInsert);

        if (pricesError) {
          console.error('Error inserting prices:', pricesError);
        } else {
          console.log(`Inserted ${pricesToInsert.length} prices`);
        }
      }
    }

    // Update brochure status
    const { error: updateError } = await supabase
      .from('brochure_uploads')
      .update({ 
        status: 'completed', 
        products_found: extractedProducts.length 
      })
      .eq('id', brochureId);

    if (updateError) {
      console.error('Error updating brochure status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        productsFound: extractedProducts.length,
        products: extractedProducts 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing brochure:', error);
    
    // Try to update brochure status to failed
    try {
      if (brochureId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase
          .from('brochure_uploads')
          .update({ status: 'failed' })
          .eq('id', brochureId);
      }
    } catch (e) {
      console.error('Failed to update brochure status:', e);
    }

    // Return user-friendly error messages
    let userMessage = 'Failed to process brochure';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        userMessage = 'Service temporarily unavailable. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('credits')) {
        userMessage = 'Processing service unavailable';
        statusCode = 503;
      }
    }

    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
