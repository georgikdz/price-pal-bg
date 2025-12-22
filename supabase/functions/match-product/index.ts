import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Canonical products list for matching
const CANONICAL_PRODUCTS = [
  { id: 'kashkaval', nameBg: 'Кашкавал', keywords: ['кашкавал', 'yellow cheese', 'kashkaval'] },
  { id: 'sirene', nameBg: 'Сирене', keywords: ['сирене', 'бяло сирене', 'white cheese', 'feta'] },
  { id: 'cream-cheese', nameBg: 'Крема сирене', keywords: ['крема', 'cream cheese', 'филаделфия', 'philadelphia'] },
  { id: 'milk', nameBg: 'Прясно мляко', keywords: ['мляко', 'прясно', 'milk', 'milch'] },
  { id: 'yogurt', nameBg: 'Кисело мляко', keywords: ['кисело мляко', 'йогурт', 'yogurt', 'joghurt'] },
  { id: 'butter', nameBg: 'Масло', keywords: ['масло', 'краве масло', 'butter', 'margarine'] },
  { id: 'eggs', nameBg: 'Яйца', keywords: ['яйца', 'яйце', 'eggs', 'eier'] },
  { id: 'sour-cream', nameBg: 'Заквасена сметана', keywords: ['сметана', 'заквасена', 'sour cream'] },
  { id: 'sunflower-oil', nameBg: 'Олио', keywords: ['олио', 'слънчогледово', 'sunflower oil', 'sonnenblumenöl'] },
  { id: 'olive-oil', nameBg: 'Зехтин', keywords: ['зехтин', 'маслиново', 'olive oil', 'olivenöl'] },
  { id: 'flour', nameBg: 'Брашно', keywords: ['брашно', 'flour', 'mehl'] },
  { id: 'bread', nameBg: 'Хляб', keywords: ['хляб', 'bread', 'brot'] },
  { id: 'rice', nameBg: 'Ориз', keywords: ['ориз', 'rice', 'reis'] },
  { id: 'pasta', nameBg: 'Макарони', keywords: ['макарони', 'паста', 'спагети', 'pasta', 'spaghetti', 'nudeln'] },
  { id: 'banitsa', nameBg: 'Баница', keywords: ['баница', 'banitsa'] },
  { id: 'pita', nameBg: 'Питка', keywords: ['питка', 'pita'] },
  { id: 'tomatoes', nameBg: 'Домати', keywords: ['домати', 'домат', 'tomatoes', 'tomaten'] },
  { id: 'cucumbers', nameBg: 'Краставици', keywords: ['краставици', 'краставица', 'cucumbers', 'gurken'] },
  { id: 'potatoes', nameBg: 'Картофи', keywords: ['картофи', 'картоф', 'potatoes', 'kartoffeln'] },
  { id: 'sweet-potatoes', nameBg: 'Сладки картофи', keywords: ['сладки картофи', 'батат', 'sweet potato'] },
  { id: 'onions', nameBg: 'Лук', keywords: ['лук', 'onions', 'zwiebeln'] },
  { id: 'carrots', nameBg: 'Моркови', keywords: ['моркови', 'морков', 'carrots', 'karotten'] },
  { id: 'peppers', nameBg: 'Чушки', keywords: ['чушки', 'чушка', 'пиперки', 'peppers', 'paprika'] },
  { id: 'cabbage', nameBg: 'Зеле', keywords: ['зеле', 'cabbage', 'kohl'] },
  { id: 'lettuce', nameBg: 'Маруля', keywords: ['маруля', 'салата', 'lettuce', 'salat'] },
  { id: 'garlic', nameBg: 'Чесън', keywords: ['чесън', 'garlic', 'knoblauch'] },
  { id: 'lemons', nameBg: 'Лимони', keywords: ['лимон', 'лимони', 'lemons', 'zitronen'] },
  { id: 'apples', nameBg: 'Ябълки', keywords: ['ябълки', 'ябълка', 'apples', 'äpfel'] },
  { id: 'bananas', nameBg: 'Банани', keywords: ['банани', 'банан', 'bananas', 'bananen'] },
  { id: 'oranges', nameBg: 'Портокали', keywords: ['портокали', 'портокал', 'oranges', 'orangen'] },
  { id: 'grapes', nameBg: 'Грозде', keywords: ['грозде', 'grapes', 'trauben'] },
  { id: 'watermelon', nameBg: 'Диня', keywords: ['диня', 'watermelon', 'wassermelone'] },
  { id: 'chicken', nameBg: 'Пиле', keywords: ['пиле', 'пилешко', 'chicken', 'hähnchen'] },
  { id: 'chicken-breast', nameBg: 'Пилешко филе', keywords: ['пилешко филе', 'филе', 'chicken breast', 'hähnchenbrust'] },
  { id: 'minced-meat', nameBg: 'Кайма', keywords: ['кайма', 'мляно месо', 'minced meat', 'hackfleisch'] },
  { id: 'pork', nameBg: 'Свинско', keywords: ['свинско', 'свинина', 'pork', 'schweinefleisch'] },
  { id: 'pork-chops', nameBg: 'Свински котлети', keywords: ['свински котлети', 'котлет', 'pork chops'] },
  { id: 'beef', nameBg: 'Телешко', keywords: ['телешко', 'говеждо', 'beef', 'rindfleisch'] },
  { id: 'sausages', nameBg: 'Наденица', keywords: ['наденица', 'наденички', 'sausages', 'würstchen'] },
  { id: 'kebapche', nameBg: 'Кебапче', keywords: ['кебапче', 'кебапчета', 'kebapche'] },
  { id: 'kyufte', nameBg: 'Кюфте', keywords: ['кюфте', 'кюфтета', 'kyufte'] },
  { id: 'lukanka', nameBg: 'Луканка', keywords: ['луканка', 'lukanka'] },
  { id: 'ham', nameBg: 'Шунка', keywords: ['шунка', 'ham', 'schinken'] },
  { id: 'fish', nameBg: 'Риба', keywords: ['риба', 'fish', 'fisch'] },
  { id: 'salmon', nameBg: 'Сьомга', keywords: ['сьомга', 'salmon', 'lachs'] },
  { id: 'tuna', nameBg: 'Риба тон', keywords: ['тон', 'риба тон', 'tuna', 'thunfisch'] },
  { id: 'mackerel', nameBg: 'Скумрия', keywords: ['скумрия', 'mackerel', 'makrele'] },
  { id: 'sugar', nameBg: 'Захар', keywords: ['захар', 'sugar', 'zucker'] },
  { id: 'salt', nameBg: 'Сол', keywords: ['сол', 'salt', 'salz'] },
  { id: 'coffee', nameBg: 'Кафе', keywords: ['кафе', 'coffee', 'kaffee'] },
  { id: 'tea', nameBg: 'Чай', keywords: ['чай', 'tea', 'tee'] },
  { id: 'honey', nameBg: 'Мед', keywords: ['мед', 'honey', 'honig'] },
  { id: 'tomato-paste', nameBg: 'Доматено пюре', keywords: ['доматено пюре', 'томат паста', 'tomato paste'] },
  { id: 'canned-beans', nameBg: 'Консервиран боб', keywords: ['боб', 'консерва боб', 'beans', 'bohnen'] },
  { id: 'canned-corn', nameBg: 'Консервирана царевица', keywords: ['царевица', 'corn', 'mais'] },
  { id: 'pickles', nameBg: 'Кисели краставички', keywords: ['кисели краставички', 'туршия', 'pickles', 'gewürzgurken'] },
  { id: 'biscuits', nameBg: 'Бисквити', keywords: ['бисквити', 'biscuits', 'kekse'] },
  { id: 'chocolate', nameBg: 'Шоколад', keywords: ['шоколад', 'chocolate', 'schokolade'] },
  { id: 'chips', nameBg: 'Чипс', keywords: ['чипс', 'chips'] },
  { id: 'wafers', nameBg: 'Вафли', keywords: ['вафли', 'wafers', 'waffeln'] },
  { id: 'nuts', nameBg: 'Ядки', keywords: ['ядки', 'nuts', 'nüsse'] },
  { id: 'water', nameBg: 'Минерална вода', keywords: ['вода', 'минерална', 'water', 'wasser'] },
  { id: 'juice', nameBg: 'Сок', keywords: ['сок', 'juice', 'saft'] },
  { id: 'cola', nameBg: 'Кола', keywords: ['кола', 'cola', 'coca-cola', 'pepsi'] },
  { id: 'beer', nameBg: 'Бира', keywords: ['бира', 'beer', 'bier'] },
  { id: 'wine', nameBg: 'Вино', keywords: ['вино', 'wine', 'wein'] },
];

// Fast keyword-based matching
function keywordMatch(rawName: string): { id: string; score: number } | null {
  const normalized = rawName.toLowerCase().trim();
  
  let bestMatch: { id: string; score: number } | null = null;
  
  for (const product of CANONICAL_PRODUCTS) {
    for (const keyword of product.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        const score = keyword.length / normalized.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { id: product.id, score: Math.min(score * 1.5, 0.95) };
        }
      }
    }
  }
  
  return bestMatch;
}

// AI-powered matching for complex cases
async function aiMatch(rawName: string, store: string): Promise<{ id: string | null; confidence: number }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured");
    return { id: null, confidence: 0 };
  }

  const productList = CANONICAL_PRODUCTS.map(p => `- ${p.id}: ${p.nameBg}`).join('\n');

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a product matching expert for Bulgarian grocery stores. Your task is to match raw product names from store brochures to canonical product IDs.

Available canonical products:
${productList}

Rules:
1. Match based on the core product type, ignoring brand names and package sizes
2. "Краве масло PRESIDENT 200г" should match "butter" (масло)
3. "Прясно мляко 3.6%" should match "milk" (мляко)
4. If no good match exists, return null
5. Consider Bulgarian, English, and German product names`
          },
          {
            role: "user",
            content: `Match this product from ${store}:\n"${rawName}"\n\nReturn the best matching product_id or null if no match.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_product",
              description: "Return the matched canonical product ID",
              parameters: {
                type: "object",
                properties: {
                  product_id: {
                    type: ["string", "null"],
                    description: "The canonical product ID or null if no match"
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-1"
                  },
                  reasoning: {
                    type: "string",
                    description: "Brief explanation of the match"
                  }
                },
                required: ["product_id", "confidence", "reasoning"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "match_product" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return { id: null, confidence: 0 };
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`AI match for "${rawName}": ${args.product_id} (${args.confidence}) - ${args.reasoning}`);
      return { id: args.product_id, confidence: args.confidence };
    }

    return { id: null, confidence: 0 };
  } catch (error) {
    console.error("AI matching error:", error);
    return { id: null, confidence: 0 };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawName, store, useAI = true } = await req.json();
    
    if (!rawName) {
      return new Response(
        JSON.stringify({ error: "rawName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // First try fast keyword matching
    const keywordResult = keywordMatch(rawName);
    
    if (keywordResult && keywordResult.score >= 0.7) {
      console.log(`Keyword match for "${rawName}": ${keywordResult.id} (score: ${keywordResult.score})`);
      return new Response(
        JSON.stringify({
          productId: keywordResult.id,
          confidence: keywordResult.score,
          method: "keyword"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fall back to AI matching for complex cases
    if (useAI) {
      const aiResult = await aiMatch(rawName, store || "unknown");
      
      if (aiResult.id && aiResult.confidence >= 0.6) {
        return new Response(
          JSON.stringify({
            productId: aiResult.id,
            confidence: aiResult.confidence,
            method: "ai"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Return keyword match if it exists, even with lower confidence
    if (keywordResult) {
      return new Response(
        JSON.stringify({
          productId: keywordResult.id,
          confidence: keywordResult.score,
          method: "keyword-fallback"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No match found
    return new Response(
      JSON.stringify({
        productId: null,
        confidence: 0,
        method: "none"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("match-product error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
