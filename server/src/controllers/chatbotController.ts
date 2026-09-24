import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const KNOWLEDGE_FALLBACKS: Record<string, Record<string, { reply: string; scheme?: string }>> = {
  EN: {
    phd: {
      reply: 'For M.Phil / Ph.D research scholars, the National Fellowship for ST Students (NFST - Code ARG45) offers 750 annual fellowships with statutory reservation for Divyangjan and PVTG scholars.',
      scheme: 'ARG45'
    },
    abroad: {
      reply: 'For overseas studies (Master’s, Ph.D, Post-Doc abroad), apply for the National Overseas Scholarship (NOS - Code AZKMI). It covers full tuition and £15,400 / $17,400 living maintenance in QS Top 1000 universities.',
      scheme: 'AZKMI'
    },
    income: {
      reply: 'Income caps vary by scheme: Pre-Matric & Post-Matric have a ₹2.5 Lakh/year cap; Top Class & NOS have a ₹6.0 Lakh/year cap; NFST research fellowship has NO family income restriction.'
    },
    default: {
      reply: 'To guide you accurately, please tell me your current educational level (e.g. Class 10, College Degree, Ph.D, or Overseas Studies) and your approximate annual family income.'
    }
  },
  HI: {
    phd: {
      reply: 'एम.फिल / पीएच.डी शोध छात्रों के लिए, राष्ट्रीय अनुसूचित जनजाति अध्येतावृत्ति (NFST - कोड ARG45) प्रतिवर्ष 750 फेलोशिप प्रदान करती है, जिसमें दिव्यांगजन और पीवीटीजी के लिए विशेष आरक्षण है।',
      scheme: 'ARG45'
    },
    abroad: {
      reply: 'विदेश में उच्च शिक्षा (मास्टर्स/पीएच.डी) के लिए राष्ट्रीय प्रवासी छात्रवृत्ति (NOS - कोड AZKMI) उपलब्ध है। यह क्यूएस टॉप-1000 विश्वविद्यालयों में पूरी ट्यूशन फीस और निर्वाह भत्ता वहन करती है।',
      scheme: 'AZKMI'
    },
    income: {
      reply: 'आय सीमा: प्री-मैट्रिक और पोस्ट-मैट्रिक के लिए ₹2.5 लाख/वर्ष; टॉप क्लास और एनओएस के लिए ₹6.0 लाख/वर्ष; एनएफएसटी रिसर्च फेलोशिप के लिए आय सीमा की कोई बाध्यता नहीं है।'
    },
    default: {
      reply: 'नमस्ते! सटीक मार्गदर्शन के लिए कृपया अपनी वर्तमान कक्षा (जैसे 10वीं, कॉलेज, शोध या विदेश अध्ययन) और पारिवारिक वार्षिक आय बताएं।'
    }
  },
  OD: {
    default: {
      reply: 'ଜୁହାର! ଆଦିବାସୀ ବ୍ୟାପାର ମନ୍ତ୍ରଣାଳୟ ତରଫରୁ ସ୍ୱାଗତ। ପିଏଚ.ଡି ଗବେଷଣା ପାଇଁ NFST ଏବଂ ବିଦେଶ ପାଠପଢ଼ା ପାଇଁ NOS ଯୋଜନା ଉପଲବ୍ଧ। ଦୟାକରି ଆପଣଙ୍କ ଶ୍ରେଣୀ ଏବଂ ବାର୍ଷିକ ଆୟ ଜଣାନ୍ତୁ।',
      scheme: 'ARG45'
    }
  },
  GON: {
    default: {
      reply: 'ସେବା ଜୋହାର! ଗୋଣ୍ଡୀ ଭାଷାତେ ସହାୟତା: ଏମ.ଫିଲ/ପିଏଚ.ଡି ଗବେଷଣା ଲାଗି NFST ଫେଲୋସିପ ୭୫୦ ସିଟ ମାଡି ଆନେ। ଆୟ ପ୍ରମାଣପତ୍ର ଆଉ ଜାତି ସାର୍ଟିଫିକେଟ ଜରୁରୀ।',
      scheme: 'ARG45'
    }
  }
};

export async function chatWithGemini(req: Request, res: Response): Promise<void> {
  const { message, language = 'EN' } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, error: 'Message is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

      const languageInstructions: Record<string, string> = {
        EN: 'Respond in clear, encouraging, authoritative English.',
        HI: 'Respond in polite, clear Hindi (Devanagari script).',
        OD: 'Respond in polite, clear Odia script.',
        GON: 'Respond with respectful Gondi tribal greetings (e.g., "Seva Johar") and simple, clear Hindi/Gondi dialect instructions.'
      };

      const langDirective = languageInstructions[language] || languageInstructions.EN;

      const systemPrompt = `You are the Official Virtual AI Counselor for the Ministry of Tribal Affairs (MoTA), Government of India.
You specialize in 5 national scholarship & fellowship schemes for Scheduled Tribe (ST) students:
1. Pre-Matric Scholarship (Code: BPVGK): Class 9-10, income cap ₹2.5L/year.
2. Post-Matric Scholarship (Code: BVOBC): Class 11 up to Ph.D, income cap ₹2.5L/year.
3. National Top Class Education (Code: A023B): Top institutions (IIT/IIM/AIIMS/NIT), income cap ₹6.0L/year.
4. National Fellowship for ST Students - NFST (Code: ARG45): M.Phil/Ph.D full-time research, 750 annual seats with 4-tier reservation (Divyangjan 5%, PVTG 10%, Female 30%, Open ST), NO income ceiling.
5. National Overseas Scholarship - NOS (Code: AZKMI): 20 annual slots for Masters/Ph.D abroad at QS Top 1000 universities. Full tuition + living maintenance. Income ceiling ₹6.0L/year.

Guidelines:
- Language: ${langDirective}
- Keep answers concise, factual, and reassuring (maximum 3-4 sentences).
- If recommending a specific scheme, append "[SCHEME_CODE: <CODE>]" at the very end of your response so the UI can highlight it (e.g. [SCHEME_CODE: ARG45]).

User Question: "${message}"`;

      const result = await model.generateContent(systemPrompt);
      const rawResponse = result.response.text().trim();

      // Extract scheme code if present
      let schemeCode: string | undefined;
      const schemeMatch = rawResponse.match(/\[SCHEME_CODE:\s*([A-Z0-9]+)\]/);
      let cleanedText = rawResponse;
      if (schemeMatch) {
        schemeCode = schemeMatch[1];
        cleanedText = rawResponse.replace(/\[SCHEME_CODE:\s*([A-Z0-9]+)\]/, '').trim();
      }

      res.json({
        success: true,
        reply: cleanedText,
        schemeCode,
        method: 'GEMINI_AI'
      });
      return;
    } catch (err: any) {
      console.warn('Chatbot Gemini generation fallback triggered:', err.message);
    }
  }

  // Graceful Fallback
  const q = message.toLowerCase();
  const langDict = KNOWLEDGE_FALLBACKS[language] || KNOWLEDGE_FALLBACKS.EN;
  let fallback = langDict.default;

  if (q.includes('phd') || q.includes('m.phil') || q.includes('research') || q.includes('शोध')) {
    fallback = langDict.phd || langDict.default;
  } else if (q.includes('abroad') || q.includes('overseas') || q.includes('foreign') || q.includes('विदेश')) {
    fallback = langDict.abroad || langDict.default;
  } else if (q.includes('income') || q.includes('cap') || q.includes('आय') || q.includes('limit')) {
    fallback = langDict.income || langDict.default;
  }

  res.json({
    success: true,
    reply: fallback.reply,
    schemeCode: fallback.scheme,
    method: 'FALLBACK'
  });
}
