import React, { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';

interface RegionalChatbotProps {
  onSelectScheme?: (schemeCode: string) => void;
}

export const RegionalChatbot: React.FC<RegionalChatbotProps> = ({ onSelectScheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI' | 'OD' | 'GON'>('EN');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; schemeCode?: string }>>([
    {
      sender: 'bot',
      text: 'Namaste! I am the MoTA Tribal Scholarship Guidance Assistant. I can help you find eligible schemes, checklists, or answers in English, Hindi, Odia, or Gondi. How can I help you today?'
    }
  ]);

  const knowledgeBase: Record<string, Record<string, { reply: string; scheme?: string }>> = {
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

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || input).toLowerCase();
    if (!q.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: textToSend || input }]);
    setInput('');

    setTimeout(() => {
      const langDict = knowledgeBase[language] || knowledgeBase.EN;
      let respObj = langDict.default;

      if (q.includes('phd') || q.includes('m.phil') || q.includes('research') || q.includes('शोध')) {
        respObj = langDict.phd || langDict.default;
      } else if (q.includes('abroad') || q.includes('overseas') || q.includes('foreign') || q.includes('विदेश')) {
        respObj = langDict.abroad || langDict.default;
      } else if (q.includes('income') || q.includes('cap') || q.includes('आय') || q.includes('limit')) {
        respObj = langDict.income || langDict.default;
      }

      setMessages(prev => [...prev, {
        sender: 'bot',
        text: respObj.reply,
        schemeCode: respObj.scheme
      }]);
    }, 450);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1A4D8F',
            color: '#FFFFFF',
            borderRadius: '50px',
            padding: '0.75rem 1.25rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(10,37,64,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            zIndex: 999
          }}
        >
          <Bot size={20} />
          <span>Regional Scheme Assistant</span>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          maxWidth: '92vw',
          height: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ backgroundColor: '#0A2540', color: '#FFFFFF', padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} style={{ color: '#E06D14' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', display: 'block' }}>MoTA Regional Assistant</strong>
                <span style={{ fontSize: '0.6875rem', color: '#CBD5E1' }}>Smart Scheme Recommendation</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Language Switcher */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                style={{
                  fontSize: '0.6875rem',
                  padding: '0.2rem 0.4rem',
                  backgroundColor: '#1E293B',
                  color: '#FFFFFF',
                  border: '1px solid #334155',
                  borderRadius: '3px'
                }}
              >
                <option value="EN">English</option>
                <option value="HI">हिन्दी (Hindi)</option>
                <option value="OD">ଓଡ଼ିଆ (Odia)</option>
                <option value="GON">गोंडी (Gondi)</option>
              </select>

              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#F8FAFC' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? '#1A4D8F' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : '#1A1A1A',
                  border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  padding: '0.65rem 0.875rem',
                  borderRadius: '6px',
                  maxWidth: '85%',
                  fontSize: '0.8125rem',
                  lineHeight: 1.4
                }}
              >
                {m.text}
                {m.schemeCode && onSelectScheme && (
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.35rem' }}>
                    <button
                      onClick={() => {
                        onSelectScheme(m.schemeCode!);
                        setIsOpen(false);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                    >
                      View Scheme {m.schemeCode}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#F1F5F9', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.35rem', overflowX: 'auto', fontSize: '0.6875rem' }}>
            <button
              onClick={() => handleSend('Ph.D research fellowship')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              🎓 Ph.D Fellowship
            </button>
            <button
              onClick={() => handleSend('Foreign studies abroad')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              ✈️ Studies Abroad (NOS)
            </button>
            <button
              onClick={() => handleSend('Income limit cap')}
              style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              💰 Income Caps
            </button>
          </div>

          {/* Input Bar */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem', backgroundColor: '#FFFFFF' }}>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.65rem' }}
              placeholder={language === 'HI' ? 'यहाँ सवाल पूछें...' : 'Ask question here...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={() => handleSend()}
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.75rem' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
