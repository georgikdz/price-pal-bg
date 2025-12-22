import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  MIN_PRICES_BY_PRODUCT, 
  ABSOLUTE_MIN_PRICE, 
  isExtractedPriceSuspicious 
} from "../_shared/price-validation.ts";

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

// Extended product catalog for better matching
const CANONICAL_PRODUCTS = [
  // Dairy
  { id: 'kashkaval', nameBg: 'кашкавал', keywords: ['кашкавал', 'жълто сирене', 'yellow cheese'] },
  { id: 'sirene', nameBg: 'сирене', keywords: ['краве сирене', 'бяло сирене', 'сирене', 'feta'] },
  { id: 'cream-cheese', nameBg: 'крема сирене', keywords: ['крема сирене', 'cream cheese', 'филаделфия', 'arla'] },
  { id: 'milk', nameBg: 'мляко', keywords: ['прясно мляко', 'мляко', 'milk', 'olympus'] },
  { id: 'yogurt', nameBg: 'кисело мляко', keywords: ['кисело мляко', 'йогурт', 'yogurt', 'домашно'] },
  { id: 'butter', nameBg: 'масло', keywords: ['масло', 'butter', 'краве масло'] },
  { id: 'eggs', nameBg: 'яйца', keywords: ['яйца', 'яйце', 'eggs'] },
  { id: 'sour-cream', nameBg: 'сметана', keywords: ['сметана', 'заквасена сметана', 'sour cream'] },
  
  // Oils
  { id: 'sunflower-oil', nameBg: 'олио', keywords: ['олио', 'слънчогледово', 'sunflower oil', 'златно', 'добруджанско'] },
  { id: 'olive-oil', nameBg: 'зехтин', keywords: ['зехтин', 'маслиново масло', 'olive oil', 'extra virgin'] },
  
  // Grains & Bakery
  { id: 'flour', nameBg: 'брашно', keywords: ['брашно', 'flour'] },
  { id: 'bread', nameBg: 'хляб', keywords: ['хляб', 'bread', 'питка', 'франзела'] },
  { id: 'rice', nameBg: 'ориз', keywords: ['ориз', 'rice', 'български ориз'] },
  { id: 'pasta', nameBg: 'макарони', keywords: ['макарони', 'паста', 'спагети', 'pasta', 'spaghetti'] },
  { id: 'banitsa', nameBg: 'баница', keywords: ['баница', 'баничка'] },
  { id: 'pita', nameBg: 'питка', keywords: ['питка', 'пърленка', 'pita'] },
  
  // Produce - Vegetables
  { id: 'tomatoes', nameBg: 'домати', keywords: ['домати', 'домат', 'tomatoes', 'розови домати', 'чери'] },
  { id: 'cucumbers', nameBg: 'краставици', keywords: ['краставици', 'краставица', 'cucumbers', 'оранжерийни'] },
  { id: 'potatoes', nameBg: 'картофи', keywords: ['картофи', 'картоф', 'potatoes'] },
  { id: 'sweet-potatoes', nameBg: 'сладки картофи', keywords: ['сладки картофи', 'sweet potatoes', 'батат'] },
  { id: 'onions', nameBg: 'лук', keywords: ['лук', 'onions', 'кромид'] },
  { id: 'carrots', nameBg: 'моркови', keywords: ['моркови', 'морков', 'carrots'] },
  { id: 'peppers', nameBg: 'чушки', keywords: ['чушки', 'чушка', 'пипер', 'peppers', 'камби'] },
  { id: 'cabbage', nameBg: 'зеле', keywords: ['зеле', 'cabbage'] },
  { id: 'lettuce', nameBg: 'маруля', keywords: ['маруля', 'салата', 'lettuce'] },
  { id: 'garlic', nameBg: 'чесън', keywords: ['чесън', 'garlic'] },
  
  // Produce - Fruits
  { id: 'lemons', nameBg: 'лимони', keywords: ['лимони', 'лимон', 'lemons'] },
  { id: 'apples', nameBg: 'ябълки', keywords: ['ябълки', 'ябълка', 'apples', 'голден'] },
  { id: 'bananas', nameBg: 'банани', keywords: ['банани', 'банан', 'bananas'] },
  { id: 'oranges', nameBg: 'портокали', keywords: ['портокали', 'портокал', 'oranges'] },
  { id: 'grapes', nameBg: 'грозде', keywords: ['грозде', 'grapes'] },
  { id: 'watermelon', nameBg: 'диня', keywords: ['диня', 'watermelon', 'пъпеш'] },
  
  // Proteins - Meat
  { id: 'chicken', nameBg: 'пиле', keywords: ['пиле', 'пилешко', 'chicken', 'градус', 'охладено'] },
  { id: 'chicken-breast', nameBg: 'пилешко филе', keywords: ['пилешко филе', 'филе', 'chicken breast'] },
  { id: 'minced-meat', nameBg: 'кайма', keywords: ['кайма', 'minced meat', 'мляно месо', 'мащерски'] },
  { id: 'pork', nameBg: 'свинско', keywords: ['свинско', 'свинска', 'pork', 'плешка', 'шницел', 'врат'] },
  { id: 'pork-chops', nameBg: 'котлети', keywords: ['котлети', 'котлет', 'pork chops', 'свински котлет'] },
  { id: 'beef', nameBg: 'телешко', keywords: ['телешко', 'beef', 'говеждо'] },
  { id: 'sausages', nameBg: 'наденица', keywords: ['наденица', 'колбас', 'sausages', 'кренвирш'] },
  { id: 'kebapche', nameBg: 'кебапче', keywords: ['кебапче', 'kebab'] },
  { id: 'kyufte', nameBg: 'кюфте', keywords: ['кюфте', 'кюфтета'] },
  { id: 'lukanka', nameBg: 'луканка', keywords: ['луканка', 'салам', 'сух колбас'] },
  { id: 'ham', nameBg: 'шунка', keywords: ['шунка', 'ham', 'бекон', 'bacon'] },
  
  // Proteins - Fish
  { id: 'fish', nameBg: 'риба', keywords: ['риба', 'fish'] },
  { id: 'salmon', nameBg: 'сьомга', keywords: ['сьомга', 'salmon'] },
  { id: 'tuna', nameBg: 'риба тон', keywords: ['риба тон', 'тон', 'tuna'] },
  { id: 'mackerel', nameBg: 'скумрия', keywords: ['скумрия', 'mackerel'] },
  
  // Pantry
  { id: 'sugar', nameBg: 'захар', keywords: ['захар', 'sugar'] },
  { id: 'salt', nameBg: 'сол', keywords: ['сол', 'salt'] },
  { id: 'coffee', nameBg: 'кафе', keywords: ['кафе', 'coffee', 'капсули', 'dolce gusto', 'nescafe'] },
  { id: 'tea', nameBg: 'чай', keywords: ['чай', 'tea'] },
  { id: 'honey', nameBg: 'мед', keywords: ['мед', 'honey'] },
  { id: 'tomato-paste', nameBg: 'доматено пюре', keywords: ['доматено пюре', 'томатено', 'tomato paste'] },
  { id: 'canned-beans', nameBg: 'боб', keywords: ['боб', 'фасул', 'beans'] },
  { id: 'canned-corn', nameBg: 'царевица', keywords: ['царевица', 'corn'] },
  { id: 'pickles', nameBg: 'краставички', keywords: ['кисели краставички', 'туршия', 'pickles'] },
  
  // Snacks
  { id: 'biscuits', nameBg: 'бисквити', keywords: ['бисквити', 'biscuits', 'cookies'] },
  { id: 'chocolate', nameBg: 'шоколад', keywords: ['шоколад', 'chocolate', 'milka', 'oreo'] },
  { id: 'chips', nameBg: 'чипс', keywords: ['чипс', 'chips', 'ruffles', 'lays'] },
  { id: 'wafers', nameBg: 'вафли', keywords: ['вафли', 'вафла', 'wafers', 'хели'] },
  { id: 'nuts', nameBg: 'ядки', keywords: ['ядки', 'бадеми', 'фъстъци', 'nuts', 'almonds'] },
  
  // Beverages
  { id: 'water', nameBg: 'вода', keywords: ['минерална вода', 'вода', 'water'] },
  { id: 'juice', nameBg: 'сок', keywords: ['сок', 'juice', 'нектар'] },
  { id: 'cola', nameBg: 'кола', keywords: ['кола', 'cola', 'pepsi', 'coca'] },
  { id: 'beer', nameBg: 'бира', keywords: ['бира', 'beer'] },
  { id: 'wine', nameBg: 'вино', keywords: ['вино', 'wine'] },
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
      `- ${p.id}: ${p.nameBg} (keywords: ${p.keywords.join(', ')})`
    ).join('\n');

    const systemPrompt = `You are an expert at extracting product and price information from Bulgarian grocery store brochures.

Your task is to analyze the brochure page images and extract all food products with their prices.

CANONICAL PRODUCTS (use these IDs when matching, check keywords for better matching):
${productListStr}

CRITICAL PRICE EXTRACTION RULES:
1. Bulgarian prices are in BGN (лв. or лева)
2. PROMO PRICE: The LARGE, highlighted price is the PROMOTIONAL/SALE price
3. REGULAR PRICE: The smaller, often crossed-out price is the ORIGINAL/REGULAR price
4. If a price is shown as "Само X.XX лв." - this is the promo price
5. If you see two prices, the higher one is regular, the lower one is promo

MANDATORY PRICE SANITY CHECKS (reject if outside these ranges):
- Bread (хляб): 0.80 - 6.00 BGN per piece or loaf
- Vegetables/fruits: 0.50 - 12.00 BGN/kg
- Meat: 5.00 - 35.00 BGN/kg  
- Dairy (yogurt 400g): 0.60 - 3.00 BGN
- Dairy (milk 1L): 1.50 - 4.00 BGN
- Cheese (1kg): 8.00 - 30.00 BGN
- Eggs (10 pcs): 2.50 - 8.00 BGN
- Oil (1L): 2.00 - 8.00 BGN
- Flour (1kg): 0.80 - 3.00 BGN

CRITICAL: If a price seems too low (e.g., bread for 0.11 BGN), you have likely misread it!
- Double-check the decimal point position
- Make sure you're not confusing price-per-100g with price-per-kg
- Prices below 0.50 BGN for any food item are extremely suspicious

UNIT NORMALIZATION:
- "за кг" or "кг" = per kilogram
- "за 100 г" = per 100 grams (DO NOT multiply - report as-is with unit "100 г")
- "бр" or "бр." = per piece
- "л" = per liter

For each product found, extract:
1. raw_name: The exact product name as written (in Bulgarian)
2. raw_price: The REGULAR price (higher price, may be crossed out). Number only.
3. promo_price: The PROMOTIONAL price (lower, highlighted price). Number only, or null if not on sale.
4. raw_unit: The unit/quantity exactly as shown (e.g., "1 кг", "400 г", "10 бр")
5. mapped_product_id: Best matching canonical product ID, or null if no match
6. confidence_score: Confidence in the mapping (0.0 to 1.0)

IMPORTANT LOGIC:
- If ONLY ONE price is shown (no crossed-out price), set raw_price to that price and promo_price to null
- If TWO prices are shown: raw_price = higher/crossed-out price, promo_price = lower/highlighted price
- NEVER set raw_price lower than promo_price
- Skip any product where the price seems unrealistically low

Return ONLY a valid JSON array. No markdown, no explanation. Example:
[{"raw_name":"Краставици оранжерийни","raw_price":2.99,"promo_price":1.49,"raw_unit":"1 кг","mapped_product_id":"cucumbers","confidence_score":0.95}]`;

    // Build content array with all images
    const userContent: any[] = [
      {
        type: 'text',
        text: `Analyze these ${images.length} page(s) from a ${store} grocery brochure. Extract ALL food products with prices. Return ONLY valid JSON array.`,
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

    // Validate and clean extracted products using shared validation
    const cleanedProducts = extractedProducts
      .map((p: any) => {
        let rawPrice = parseFloat(p.raw_price) || null;
        let promoPrice = p.promo_price ? parseFloat(p.promo_price) : null;
        
        // Ensure raw_price >= promo_price (swap if needed)
        if (rawPrice && promoPrice && rawPrice < promoPrice) {
          console.log(`Swapping prices for ${p.raw_name}: raw=${rawPrice}, promo=${promoPrice}`);
          [rawPrice, promoPrice] = [promoPrice, rawPrice];
        }
        
        // If only promo_price and no raw_price, treat promo as raw
        if (!rawPrice && promoPrice) {
          rawPrice = promoPrice;
          promoPrice = null;
        }
        
        return {
          ...p,
          raw_price: rawPrice,
          promo_price: promoPrice,
        };
      })
      .filter((p: any) => {
        // Use shared validation logic
        if (isExtractedPriceSuspicious(p.mapped_product_id, p.raw_price, p.promo_price)) {
          const effectivePrice = p.promo_price ?? p.raw_price;
          const minPrice = p.mapped_product_id 
            ? (MIN_PRICES_BY_PRODUCT[p.mapped_product_id] ?? ABSOLUTE_MIN_PRICE) 
            : ABSOLUTE_MIN_PRICE;
          console.log(`Filtering out suspicious price for ${p.raw_name} (${p.mapped_product_id}): ${effectivePrice} < min ${minPrice}`);
          return false;
        }
        return true;
      });

    // AI-enhance matching for products with low confidence or no match
    const enhancedProducts = await Promise.all(
      cleanedProducts.map(async (p: any) => {
        // Skip if already has high-confidence match
        if (p.mapped_product_id && p.confidence_score >= 0.8) {
          return p;
        }

        // Try AI matching for low-confidence or unmatched products
        try {
          const matchResponse = await fetch(`${supabaseUrl}/functions/v1/match-product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rawName: p.raw_name,
              store: store,
              useAI: true
            }),
          });

          if (matchResponse.ok) {
            const matchResult = await matchResponse.json();
            if (matchResult.productId && matchResult.confidence > (p.confidence_score || 0)) {
              console.log(`AI enhanced match for "${p.raw_name}": ${matchResult.productId} (${matchResult.confidence}) via ${matchResult.method}`);
              return {
                ...p,
                mapped_product_id: matchResult.productId,
                confidence_score: matchResult.confidence,
              };
            }
          }
        } catch (e) {
          console.error(`AI matching failed for "${p.raw_name}":`, e);
        }

        return p;
      })
    );

    // Insert extracted products into database
    if (enhancedProducts.length > 0) {
      const productsToInsert = enhancedProducts.map((p: any) => ({
        brochure_id: brochureId,
        raw_name: p.raw_name || 'Unknown',
        raw_price: p.raw_price,
        raw_unit: p.raw_unit || null,
        promo_price: p.promo_price,
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

      // Insert prices for mapped products with correct price logic
      const pricesToInsert = enhancedProducts
        .filter((p: any) => p.mapped_product_id && (p.raw_price || p.promo_price))
        .map((p: any) => ({
          product_id: p.mapped_product_id,
          store: store,
          brand: p.raw_name || null,
          // price = regular price (raw_price), or promo_price if no regular
          price: p.raw_price || p.promo_price,
          // promo_price only if it exists AND is different from regular
          promo_price: p.promo_price && p.promo_price !== p.raw_price ? p.promo_price : null,
          is_promo: !!(p.promo_price && p.promo_price !== p.raw_price),
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
        products_found: enhancedProducts.length 
      })
      .eq('id', brochureId);

    if (updateError) {
      console.error('Error updating brochure status:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        productsFound: enhancedProducts.length,
        products: enhancedProducts 
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
