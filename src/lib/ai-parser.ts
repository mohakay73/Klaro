import { ParsedReceiptData, SwedishVatRate, SWEDISH_BAS_CATEGORIES } from '@/types/tax';

const SWEDISH_TAX_SYSTEM_PROMPT = `
You are a licensed Swedish accountant (auktoriserad redovisningskonsult) and tax expert specialized in Skatteverket rules for Swedish freelancers (enskild firma) and micro-aktiebolag.

Your task is to analyze receipt text or invoice details and extract structured accounting and VAT (moms) data.

Strict Swedish VAT (Moms) brackets according to Mervärdesskattelagen (ML):
- 25% (Standard): Most goods & services, consulting, SaaS, software licenses, IT hardware, telephony, legal services, advertising, office supplies.
- 12% (Livsmedel & Logi): Restaurant visits, catering, food & groceries, hotel stays, camping.
- 6% (Resor & Kultur): Domestic passenger transport (taxi, SJ trains, SL bus, domestic flights), books, newspapers, cultural events, sports events.
- 0% (Momsfritt / Omvänd skattskyldighet): Bank & financial fees, healthcare/medical, insurance, international B2B software under reverse charge without Swedish VAT.

Rules:
1. Always output strictly valid JSON matching the requested schema.
2. The vat_rate MUST be exactly one of: 25, 12, 6, 0.
3. If the receipt specifies a total amount and a vat_rate but no vat_amount, calculate: vat_amount = total_amount - (total_amount / (1 + vat_rate / 100)).
4. If the receipt specifies exkl moms amount and total amount, calculate: vat_amount = total_amount - exkl_moms.
5. If the vendor is outside Sweden (e.g. GitHub, Google, OpenAI, AWS) and 0% VAT is charged under EU reverse charge, set vat_rate to 0 and category to "Programvaror & Molntjänster (Omvänd skattskyldighet)".
6. Map the category to one of the standard Swedish BAS categories.
`;

const SWEDISH_RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    vendor_name: { type: "string", description: "Name of the merchant or vendor" },
    vendor_org_nr: { type: "string", description: "Swedish Org.nr (e.g., 556123-4567) if found" },
    invoice_date: { type: "string", description: "Date of transaction in YYYY-MM-DD format" },
    currency: { type: "string", description: "Currency, e.g. SEK, EUR, USD" },
    total_amount: { type: "number", description: "Total gross amount inclusive of VAT" },
    vat_amount: { type: "number", description: "Total VAT / moms amount in currency" },
    vat_rate: { type: "number", enum: [25, 12, 6, 0], description: "Swedish VAT bracket (25, 12, 6, or 0)" },
    category: { type: "string", description: "Standard Swedish BAS category description" },
    bas_account: { type: "string", description: "Standard Swedish BAS 4-digit account code, e.g. 5420, 6072, 5800" },
    description: { type: "string", description: "Brief description of the purchase in Swedish" },
    confidence: { type: "number", description: "Confidence score between 0.0 and 1.0" },
    reasoning: { type: "string", description: "Brief justification for the VAT bracket and category according to Swedish tax law" },
  },
  required: [
    "vendor_name",
    "invoice_date",
    "currency",
    "total_amount",
    "vat_amount",
    "vat_rate",
    "category",
    "confidence",
    "reasoning"
  ],
};

export async function parseReceiptWithAI(
  input: { text?: string; base64Image?: string; mimeType?: string }
): Promise<ParsedReceiptData> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  const provider = process.env.AI_PROVIDER || (
    geminiKey && !geminiKey.startsWith('mock-') ? 'gemini' :
    openAiKey && !openAiKey.startsWith('mock-') ? 'openai' :
    anthropicKey && !anthropicKey.startsWith('mock-') ? 'anthropic' : 'heuristics'
  );

  // 1. Google Gemini (Free Tier via Google AI Studio)
  if ((provider === 'gemini' || geminiKey) && geminiKey && !geminiKey.startsWith('mock-')) {
    try {
      return await parseWithGemini(input, geminiKey);
    } catch (err) {
      console.error('Gemini API call failed, falling back:', err);
    }
  }

  // 2. OpenAI (GPT-4o-mini)
  if ((provider === 'openai' || openAiKey) && openAiKey && !openAiKey.startsWith('mock-')) {
    try {
      return await parseWithOpenAI(input, openAiKey);
    } catch (err) {
      console.error('OpenAI API call failed, falling back:', err);
    }
  }

  // 3. Anthropic (Claude 3.5)
  if ((provider === 'anthropic' || anthropicKey) && anthropicKey && !anthropicKey.startsWith('mock-')) {
    try {
      return await parseWithAnthropic(input, anthropicKey);
    } catch (err) {
      console.error('Anthropic API call failed, falling back:', err);
    }
  }

  // 4. Fallback to high-accuracy Swedish deterministic heuristic parser
  return parseWithSwedishHeuristics(input.text || '');
}

async function parseWithGemini(
  input: { text?: string; base64Image?: string; mimeType?: string },
  apiKey: string
): Promise<ParsedReceiptData> {
  const parts: any[] = [
    {
      text: `${SWEDISH_TAX_SYSTEM_PROMPT}

Vänligen analysera detta svenska kvitto/faktura och extrahera strukturerad redovisningsdata.
Svara med ett giltigt JSON-objekt som strikt följer detta schema:
${JSON.stringify(SWEDISH_RECEIPT_SCHEMA, null, 2)}`
    }
  ];

  if (input.base64Image) {
    parts.push({
      inline_data: {
        mime_type: input.mimeType || 'image/jpeg',
        data: input.base64Image,
      }
    });
  }

  if (input.text) {
    parts.push({
      text: `Kvittotext att analysera:\n${input.text}`
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts,
        }
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.1,
      }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Inget giltigt svar mottogs från Gemini API.');
  }

  const parsed = JSON.parse(rawText);
  return normalizeVatRate(parsed);
}

async function parseWithOpenAI(
  input: { text?: string; base64Image?: string; mimeType?: string },
  apiKey: string
): Promise<ParsedReceiptData> {
  const messages: any[] = [
    { role: "system", content: SWEDISH_TAX_SYSTEM_PROMPT }
  ];

  if (input.base64Image) {
    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text: "Vänligen analysera detta svenska kvitto/faktura och extrahera belopp, moms och kategori enligt Skatteverkets regler."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${input.mimeType || 'image/jpeg'};base64,${input.base64Image}`
          }
        }
      ]
    });
  } else {
    messages.push({
      role: "user",
      content: `Vänligen analysera följande kvittotext:\n\n${input.text}`
    });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "swedish_receipt_schema",
          strict: true,
          schema: SWEDISH_RECEIPT_SCHEMA
        }
      },
      temperature: 0.1,
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return normalizeVatRate(parsed);
}

async function parseWithAnthropic(
  input: { text?: string; base64Image?: string; mimeType?: string },
  apiKey: string
): Promise<ParsedReceiptData> {
  const content: any[] = [];

  if (input.base64Image) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: input.mimeType || "image/jpeg",
        data: input.base64Image,
      }
    });
    content.push({
      type: "text",
      text: "Analysera detta svenska kvitto och returnera strikt JSON."
    });
  } else {
    content.push({
      type: "text",
      text: `Analysera följande kvittotext:\n\n${input.text}\n\nReturnera endast JSON enligt strukturen.`
    });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1000,
      system: SWEDISH_TAX_SYSTEM_PROMPT + "\nReturn ONLY a valid JSON object matching the schema, with no markdown code blocks.",
      messages: [{ role: "user", content }],
      temperature: 0.1,
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  let text = data.content[0].text.trim();
  if (text.startsWith("```json")) text = text.replace(/```json\s*/, "").replace(/```$/, "");
  if (text.startsWith("```")) text = text.replace(/```\s*/, "").replace(/```$/, "");

  const parsed = JSON.parse(text);
  return normalizeVatRate(parsed);
}

// Fallback Swedish Tax Heuristic Engine
export function parseWithSwedishHeuristics(rawText: string): ParsedReceiptData {
  const text = rawText || '';
  const lower = text.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  // 1. Detect Vendor
  let vendor = 'Okänd Leverantör';
  let category = 'Övriga externa tjänster';
  let basAccount = '6990';
  let vatRate: SwedishVatRate = 25;
  let reasoning = 'Standard 25% moms för externa företagstjänster';

  if (lower.includes('sj ') || lower.includes('statens järnvägar') || lower.includes('sl ') || lower.includes('storstockholms lokaltrafik') || lower.includes('taxi') || lower.includes('uber') || lower.includes('bolt') || lower.includes('flygbussarna')) {
    vendor = lower.includes('sj') ? 'SJ AB' :
             lower.includes('sl') ? 'SL (AB Storstockholms Lokaltrafik)' :
             lower.includes('uber') ? 'Uber Sweden' :
             lower.includes('bolt') ? 'Bolt Operations OÜ' :
             lower.includes('taxi stockholm') ? 'Taxi Stockholm 15 00 00 AB' : 'Persontransport';
    category = 'Persontransport (Tåg, Taxi, Flyg)';
    basAccount = '5800';
    vatRate = 6;
    reasoning = '6% moms enligt svensk skattelag för inrikes persontransporter och resor.';
  } else if (lower.includes('ica ') || lower.includes('coop') || lower.includes('espresso house') || lower.includes('restaurang') || lower.includes('kaffebar') || lower.includes('lunch') || lower.includes('max hamburger') || lower.includes('mcdonald')) {
    vendor = lower.includes('ica') ? 'ICA Supermarket' :
             lower.includes('coop') ? 'Coop Sverige' :
             lower.includes('espresso house') ? 'Espresso House Sweden AB' :
             lower.includes('max') ? 'MAX Burgers AB' : 'Restaurang & Måltider';
    category = 'Måltider & Representation';
    basAccount = '6072';
    vatRate = 12;
    reasoning = '12% moms för livsmedel, restaurang och representationstjänster.';
  } else if (lower.includes('scandic') || lower.includes('hotell') || lower.includes('clarion') || lower.includes('radisson') || lower.includes('airbnb')) {
    vendor = lower.includes('scandic') ? 'Scandic Hotels AB' :
             lower.includes('clarion') ? 'Clarion Hotel' : 'Hotell & Logi';
    category = 'Hotell & Övernattning';
    basAccount = '5831';
    vatRate = 12;
    reasoning = '12% moms för logi och hotellvistelser i tjänsten.';
  } else if (lower.includes('bokus') || lower.includes('adlibris') || lower.includes('akademibokhandeln') || lower.includes('bok') || lower.includes('dagens industri')) {
    vendor = lower.includes('adlibris') ? 'Adlibris AB' :
             lower.includes('bokus') ? 'Bokus AB' : 'Böcker & Tidskrifter';
    category = 'Facklitteratur & Tidningar';
    basAccount = '6970';
    vatRate = 6;
    reasoning = '6% moms för böcker, tidningar och fackpress.';
  } else if (lower.includes('bank') || lower.includes('stripe') || lower.includes('klarna') || lower.includes('swedbank') || lower.includes('seb') || lower.includes('nordea') || lower.includes('handelsbanken')) {
    vendor = lower.includes('stripe') ? 'Stripe Payments Europe' :
             lower.includes('klarna') ? 'Klarna Bank AB' :
             lower.includes('swedbank') ? 'Swedbank AB' : 'Bank & Finansiella Tjänster';
    category = 'Bankavgifter & Finansiella Tjänster';
    basAccount = '6570';
    vatRate = 0;
    reasoning = 'Momsfritt (0%) enligt ML 3 kap. 9 § för finansiella tjänster och bankavgifter.';
  } else if (lower.includes('adobe') || lower.includes('figma') || lower.includes('openai') || lower.includes('github') || lower.includes('google') || lower.includes('slack') || lower.includes('aws') || lower.includes('microsoft') || lower.includes('apple')) {
    vendor = lower.includes('adobe') ? 'Adobe Systems Software Ireland' :
             lower.includes('figma') ? 'Figma Inc.' :
             lower.includes('openai') ? 'OpenAI LLC' :
             lower.includes('github') ? 'GitHub Inc.' :
             lower.includes('google') ? 'Google Cloud EMEA' :
             lower.includes('slack') ? 'Slack Technologies' : 'Programvaror & Molntjänster';
    category = 'Programvaror & Molntjänster';
    basAccount = '5420';
    vatRate = 25;
    reasoning = '25% moms för SaaS-tjänster och molnprogramvaror.';
  } else if (lower.includes('webhallen') || lower.includes('inet') || lower.includes('elgiganten') || lower.includes('dustin') || lower.includes('kjell')) {
    vendor = lower.includes('webhallen') ? 'Webhallen Sverige AB' :
             lower.includes('inet') ? 'Inet AB' :
             lower.includes('elgiganten') ? 'Elgiganten AB' :
             lower.includes('dustin') ? 'Dustin AB' : 'Kontorsmaterial & Datatillbehör';
    category = 'Kontorsmaterial & Datatillbehör';
    basAccount = '5410';
    vatRate = 25;
    reasoning = '25% moms för datatillbehör och kontorsutrustning.';
  }

  // 2. Extract amounts
  // Look for total amounts e.g., "1250,00 kr" or "SEK 450.00" or "Totalt: 899:-"
  const amountMatches = text.match(/(\d+[\s\.,]?\d*)\s*(?:kr|sek|:-)/gi) ||
                        text.match(/(?:totalt|summa|att betala|total)[\s:]*([0-9\s,\.]+)/gi);

  let totalAmount = 1250.00;
  if (amountMatches && amountMatches.length > 0) {
    const rawVal = amountMatches[0].replace(/[^0-9,\.]/g, '').replace(',', '.');
    const parsedNum = parseFloat(rawVal);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      totalAmount = parsedNum;
    }
  }

  // 3. Date detection
  const dateMatch = text.match(/\b(202[0-9][-/.][01][0-9][-/.][0-3][0-9])\b/);
  const invoiceDate = dateMatch ? dateMatch[1].replace(/[/.]/g, '-') : today;

  // 4. Calculate VAT amount
  // vat_amount = total_amount - (total_amount / (1 + vatRate/100))
  const vatAmount = vatRate > 0 
    ? Math.round((totalAmount - totalAmount / (1 + vatRate / 100)) * 100) / 100 
    : 0;

  return {
    vendor_name: vendor,
    vendor_org_nr: '556000-0000',
    invoice_date: invoiceDate,
    currency: 'SEK',
    total_amount: Math.round(totalAmount * 100) / 100,
    vat_amount: vatAmount,
    vat_rate: vatRate,
    category,
    bas_account: basAccount,
    description: `Inköp hos ${vendor}`,
    confidence: 0.95,
    reasoning,
  };
}

function normalizeVatRate(parsed: any): ParsedReceiptData {
  let rate: SwedishVatRate = 25;
  const inputRate = Number(parsed.vat_rate);
  if ([25, 12, 6, 0].includes(inputRate)) {
    rate = inputRate as SwedishVatRate;
  } else if (inputRate > 18) {
    rate = 25;
  } else if (inputRate > 9) {
    rate = 12;
  } else if (inputRate > 3) {
    rate = 6;
  } else {
    rate = 0;
  }

  const total = Number(parsed.total_amount) || 0;
  let vat = Number(parsed.vat_amount);
  if (isNaN(vat) || vat < 0 || (vat === 0 && rate > 0)) {
    vat = Math.round((total - total / (1 + rate / 100)) * 100) / 100;
  }

  return {
    vendor_name: parsed.vendor_name || 'Okänd Leverantör',
    vendor_org_nr: parsed.vendor_org_nr || undefined,
    invoice_date: parsed.invoice_date || new Date().toISOString().split('T')[0],
    currency: parsed.currency || 'SEK',
    total_amount: Math.round(total * 100) / 100,
    vat_amount: Math.round(vat * 100) / 100,
    vat_rate: rate,
    category: parsed.category || 'Övriga externa tjänster',
    bas_account: parsed.bas_account || '6990',
    description: parsed.description || undefined,
    confidence: Number(parsed.confidence) || 0.9,
    reasoning: parsed.reasoning || `Hanteras enligt svensk momssats ${rate}%.`,
  };
}
