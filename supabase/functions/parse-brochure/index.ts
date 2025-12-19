import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation constants
const MAX_IMAGES = 50;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB per image
const VALID_STORES = ['billa', 'kaufland', 'lidl'] as const;

// Input validation schema
const imageSchema = z.object({
  dataUrl: z.string().refine(
    (url) => url.startsWith('data:image/') && url.length < MAX_IMAGE_SIZE,
    'Невалидно или прекалено голямо изображение'
  )
});

const requestSchema = z.object({
  brochureId: z.string().uuid('Невалиден формат на brochure ID'),
  store: z.enum(VALID_STORES, {
    errorMap: () => ({ message: 'Магазинът трябва да бъде billa, kaufland или lidl' })
  }),
  images: z.array(imageSchema).min(1, 'Необходимо е поне едно изображение').max(MAX_IMAGES, `Максимум ${MAX_IMAGES} изображения`)
});

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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let brochureId: string | undefined;

  try {
    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Неоторизиран достъп' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Неоторизиран достъп' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === ADMIN ROLE CHECK ===
    const { data: isAdmin, error: roleError } = await userClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.error('Admin role check failed:', roleError?.message || 'User is not admin');
      return new Response(
        JSON.stringify({ error: 'Забранен достъп: Изисква се администраторска роля' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated admin user: ${user.id}`);

    // === INPUT VALIDATION ===
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Invalid JSON in request body');
      return new Response(
        JSON.stringify({ error: 'Невалиден JSON формат' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message);
      console.error('Validation failed:', errorMessages);
      return new Response(
        JSON.stringify({ error: 'Невалидни параметри', details: errorMessages }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { brochureId: validatedBrochureId, store, images } = validation.data;
    brochureId = validatedBrochureId;

    // === VERIFY BROCHURE EXISTS ===
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: brochure, error: brochureError } = await supabase
      .from('brochure_uploads')
      .select('id')
      .eq('id', brochureId)
      .single();

    if (brochureError || !brochure) {
      console.error('Brochure not found:', brochureId);
      return new Response(
        JSON.stringify({ error: 'Брошурата не е намерена' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing brochure ${brochureId} for store ${store} with ${images.length} page(s)`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build AI request with images
    const productListStr = CANONICAL_PRODUCTS.map(p => 
      `- ${p.id}: ${p.name} / ${p.nameBg}`
    ).join('\n');

    const systemPrompt = `You are an expert at extracting product and price information from Bulgarian grocery store brochures.

Your task is to analyze the brochure page images and extract all food products with their prices.

CANONICAL PRODUCTS (use these IDs when matching):
${productListStr}

CRITICAL PRICE EXTRACTION RULES:
- Prices in Bulgarian brochures are in BGN (лв.)
- Look for the LARGE displayed price - this is usually the promotional/sale price
- The smaller crossed-out or "was" price is the regular price
- Common Bulgarian price labels: "САМО" (only), "ЦЕНА" (price), "лв." or "лв" (BGN currency)
- Pay attention to price per unit labels like "за кг" (per kg), "за бр." (per piece), "за л" (per liter)
- Typical grocery prices in Bulgaria:
  * Fruits/vegetables: 1-5 BGN/kg (e.g., cucumbers ~2-4 BGN/kg, tomatoes ~2-5 BGN/kg)
  * Meat: 8-20 BGN/kg
  * Dairy: 2-15 BGN depending on size
  * If a price seems unusually low (like 0.05 BGN/kg), double-check the decimal point
- Watch for prices shown as "X.XX лв./кг" which means price per kilogram

For each product found, extract:
1. raw_name: The exact product name as written in the brochure (in Bulgarian)
2. raw_price: The ORIGINAL/REGULAR price in BGN (the higher price, often crossed out). Just the number, e.g., 5.99
3. raw_unit: The unit/quantity (e.g., "1 kg", "500g", "1 L", "1 бр.", "за кг")
4. promo_price: The PROMOTIONAL/SALE price (the lower, highlighted price), or null if not on sale
5. mapped_product_id: The best matching canonical product ID from the list above, or null if no match
6. confidence_score: Your confidence in the mapping (0.0 to 1.0)

IMPORTANT: If both prices are shown (crossed out and sale price), raw_price = original/crossed out price, promo_price = sale price.
If only one price is shown, that's the raw_price and promo_price should be null.

Return ONLY a valid JSON array of objects. No explanation or markdown. Example:
[{"raw_name":"Краставици","raw_price":3.99,"raw_unit":"1 кг","promo_price":2.49,"mapped_product_id":"cucumbers","confidence_score":0.95}]`;

    // Build content array with all images
    const userContent: any[] = [
      {
        type: 'text',
        text: `Analyze these ${images.length} page(s) from a ${store} grocery brochure and extract all food products with prices. Return ONLY valid JSON array combining products from all pages.`,
      },
    ];

    // Add each page image
    for (const img of images) {
      userContent.push({
        type: 'image_url',
        image_url: { url: img.dataUrl },
      });
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
    let userMessage = 'Грешка при обработка на брошурата';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        userMessage = 'Услугата е временно недостъпна. Моля, опитайте отново по-късно.';
        statusCode = 503;
      } else if (error.message.includes('credits')) {
        userMessage = 'Услугата за обработка е недостъпна';
        statusCode = 503;
      }
    }

    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
