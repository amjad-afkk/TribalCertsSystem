export interface SahayakGuidance {
  language: 'hi' | 'en' | 'or' | 'bn' | 'sat';
  languageName: string;
  plainLanguageExplanation: string;
  prescribedAction: string[];
  statutoryCureDeadlineDays: number;
  contactHelpline: string;
  audioScript: string;
}

export class DeficiencyVoiceService {
  static getGuidance(
    deficiencyText: string,
    applicantName: string,
    language: 'hi' | 'en' | 'or' | 'bn' | 'sat' = 'hi'
  ): SahayakGuidance {
    const lower = deficiencyText.toLowerCase();

    let issueType: 'INCOME' | 'CASTE' | 'BONAFIDE' | 'MARKSHEET' | 'BANK' | 'GENERAL' = 'GENERAL';
    if (lower.includes('income') || lower.includes('aay') || lower.includes('revenue') || lower.includes('cap')) {
      issueType = 'INCOME';
    } else if (lower.includes('caste') || lower.includes('st') || lower.includes('pvtg') || lower.includes('tribe')) {
      issueType = 'CASTE';
    } else if (lower.includes('bonafide') || lower.includes('enroll') || lower.includes('college') || lower.includes('institute')) {
      issueType = 'BONAFIDE';
    } else if (lower.includes('mark') || lower.includes('grade') || lower.includes('transcript')) {
      issueType = 'MARKSHEET';
    } else if (lower.includes('bank') || lower.includes('ifsc') || lower.includes('account') || lower.includes('dbt')) {
      issueType = 'BANK';
    }

    const scripts: Record<string, Record<'hi' | 'en' | 'or' | 'bn' | 'sat', { explanation: string; actions: string[]; audio: string }>> = {
      INCOME: {
        en: {
          explanation: `Dear ${applicantName}, your uploaded Annual Income Certificate has a discrepancy or is from a previous financial year exceeding statutory norms.`,
          actions: [
            'Obtain a fresh Annual Income Certificate from your local Revenue Officer / Tehsildar or Sub-Divisional Magistrate (SDM).',
            'Ensure the certificate reflects the current financial year and bears a verifiable digital signature or QR code.',
            'Scan and upload the clear PDF copy within 15 days via the "Resolve Deficiency" button.'
          ],
          audio: `Namaste ${applicantName}. Your income certificate needs an update. Please visit your local Tehsildar office, get the current financial year income certificate with digital sign or QR seal, and upload it on this portal within fifteen days to resume scholarship processing.`
        },
        hi: {
          explanation: `प्रिय ${applicantName}, आपके द्वारा अपलोड किए गए आय प्रमाण पत्र में विसंगति पाई गई है या यह पिछले वित्तीय वर्ष का है।`,
          actions: [
            'अपने नजदीकी तहसील कार्यालय या सी.एस.सी. केंद्र से चालू वित्तीय वर्ष का नया आय प्रमाण पत्र बनवाएं।',
            'प्रमाण पत्र पर तहसीलदार/एसडीएम के डिजिटल हस्ताक्षर या क्यूआर कोड होना अनिवार्य है।',
            'पंद्रह दिनों के भीतर "दोष निवारण" बटन पर क्लिक करके नया प्रमाण पत्र अपलोड करें।'
          ],
          audio: `नमस्ते ${applicantName}. आपके आवेदन में आय प्रमाण पत्र को लेकर सुधार की आवश्यकता है। कृपया अपनी तहसील या सीएससी केंद्र से चालू वर्ष का नया आय प्रमाण पत्र प्राप्त करें और पंद्रह दिनों के अंदर पोर्टल पर अपलोड करें। सहायता के लिए टोल फ्री नंबर 1800-11-7777 पर संपर्क कर सकते हैं।`
        },
        or: {
          explanation: `ପ୍ରିୟ ${applicantName}, ଆପଣଙ୍କ ଦ୍ୱାରା ଦାଖଲ କରାଯାଇଥିବା ଆୟ ପ୍ରମାଣପତ୍ରରେ ତ୍ରୁଟି ଦେଖାଦେଇଛି ବା ଏହା ପୁରୁଣା ଅଟେ।`,
          actions: [
            'ନିକଟସ୍ଥ ତହସିଲ କାର୍ଯ୍ୟାଳୟ ବା ଜନସେବା କେନ୍ଦ୍ରରୁ ନୂତନ ଆୟ ପ୍ରମାଣପତ୍ର ସଂଗ୍ରହ କରନ୍ତୁ।',
            'ଏଥିରେ ତହସିଲଦାରଙ୍କ ଡିଜିଟାଲ୍ ସ୍ୱାକ୍ଷର କିମ୍ବା କ୍ୟୁଆର୍ କୋଡ୍ ରହିବା ଆବଶ୍ୟକ।',
            '୧୫ ଦିନ ମଧ୍ୟରେ ପୋର୍ଟାଲରେ ଅପଲୋଡ୍ କରନ୍ତୁ।'
          ],
          audio: `ନମସ୍କାର ${applicantName}। ଆପଣଙ୍କ ଛାତ୍ରବୃତ୍ତି ଆବେଦନରେ ଆୟ ପ୍ରମାଣପତ୍ରର ନବୀକରଣ ଆବଶ୍ୟକ। ଦୟାକରି ତହସିଲ କାର୍ଯ୍ୟାଳୟରୁ ଚଳିତ ବର୍ଷର ନୂତନ ପ୍ରମାଣପତ୍ର ଆଣି ପନ୍ଦର ଦିନ ମଧ୍ୟରେ ଅପଲୋଡ୍ କରନ୍ତୁ।`
        },
        bn: {
          explanation: `প্রিয় ${applicantName}, আপনার আপলোড করা বার্ষিক আয়ের সার্টিফিকেটে কিছু অসামঞ্জস্য রয়েছে বা এটি মেয়াদোত্তীর্ণ।`,
          actions: [
            'আপনার স্থানীয় তহশিলদার বা বিডিও অফিস থেকে চলতি আর্থিক বছরের নতুন আয়ের সনদ নিন।',
            'সনদটিতে ডিজিটাল স্বাক্ষর বা কিউআর কোড যাচাইযোগ্য হতে হবে।',
            '১৫ দিনের মধ্যে পোর্টালে পুনরায় আপলোড করুন।'
          ],
          audio: `নমস্কার ${applicantName}। আপনার স্কলারশিপ ফর্মে আয়ের সার্টিফিকেটে অসঙ্গতি পাওয়া গেছে। দয়া করে আপনার ব্লক বা তহশিল অফিস থেকে চলতি বছরের সার্টিফিকেট নিয়ে ১৫ দিনের মধ্যে পোর্টালে আপলোড করুন।`
        },
        sat: {
          explanation: `Johar ${applicantName}. Apnar aay praman patra re kami mena-a. Nawa certificate lagao-a.`,
          actions: [
            'Tehsil office khon nawa aay praman patra hatao me.',
            'Certificate re QR seal ar digital daskhat tahen jaruri gea.',
            'Gele-monre (15) maha bhitar re portal re upload me.'
          ],
          audio: `Johar ${applicantName}. Apnak scholarship re aay praman patra nawa lagao-a. Doyakate Tehsil khon nawa aay certificate agukate gele-monre maha bhitar re portal re upload me.`
        }
      },
      CASTE: {
        en: {
          explanation: `Dear ${applicantName}, your Scheduled Tribe (ST) Certificate requires digital verification or re-attestation.`,
          actions: [
            'Ensure your ST certificate is issued by a competent revenue officer (Tehsildar/SDO).',
            'Pull the verified certificate directly via DigiLocker using your Aadhaar number to get an instant digital seal.',
            'Re-upload the clear document within 15 days.'
          ],
          audio: `Namaste ${applicantName}. Your ST caste certificate needs re-verification. You can easily pull it from DigiLocker or visit your local welfare office to ensure your caste certificate has a valid digital signature.`
        },
        hi: {
          explanation: `प्रिय ${applicantName}, आपके अनुसूचित जनजाति (ST) प्रमाण पत्र के डिजिटल सत्यापन की आवश्यकता है।`,
          actions: [
            'यह सुनिश्चित करें कि प्रमाण पत्र अनुविभागीय अधिकारी (SDO) या तहसीलदार द्वारा जारी किया गया है।',
            'डिजिलॉकर (DigiLocker) के माध्यम से अपना सत्यापित डिजिटल प्रमाण पत्र तुरंत लिंक करें।',
            '15 दिनों के भीतर पोर्टल पर पुनः अपलोड करें।'
          ],
          audio: `नमस्ते ${applicantName}. आपके एसटी जाति प्रमाण पत्र का सत्यापन आवश्यक है। आप डिजילॉकर से सीधे अपना प्रमाणित जाति प्रमाण पत्र जोड़ सकते हैं या 15 दिनों में इसे पुनः अपलोड कर सकते हैं।`
        },
        or: {
          explanation: `ପ୍ରିୟ ${applicantName}, ଆପଣଙ୍କ ଜନଜାତି (ST) ପ୍ରମାଣପତ୍ରର ଡିଜିଟାଲ୍ ଯାଞ୍ଚ ଆବଶ୍ୟକ।`,
          actions: [
            'ଡିଜିଲକର୍ ମାଧ୍ୟମରେ ସିଧାସଳଖ ପ୍ରମାଣିତ ସାର୍ଟିଫିକେଟ୍ ଯୋଡ଼ନ୍ତୁ।',
            '୧୫ ଦିନ ମଧ୍ୟରେ ପୋର୍ଟାଲରେ ଅପଲୋଡ୍ କରନ୍ତୁ।'
          ],
          audio: `ନମସ୍କାର ${applicantName}। ଆପଣଙ୍କ ଜାତି ପ୍ରମାଣପତ୍ର ଯାଞ୍ଚ ପାଇଁ ଡିଜିଲକର୍ ମାଧ୍ୟମରେ ସାର୍ଟିଫିକେଟ୍ ଲିଙ୍କ କରନ୍ତୁ।`
        },
        bn: {
          explanation: `প্রিয় ${applicantName}, আপনার তপশিলি উপজাতি (ST) সার্টিফিকেটের ডিজিটাল যাচাই প্রয়োজন।`,
          actions: [
            'ডিজিলকার (DigiLocker) থেকে সরাসরি ভেরিফায়েড সার্টিফিকেট লিঙ্ক করুন।',
            '১৫ দিনের মধ্যে পোর্টালে আপলোড করুন।'
          ],
          audio: `নমস্কার ${applicantName}। আপনার এসটি সার্টিফিকেটটি ডিজিলকার থেকে লিঙ্ক করে ১৫ দিনের মধ্যে জমা দিন।`
        },
        sat: {
          explanation: `Johar ${applicantName}. Apnar ST Jati Praman Patra re digital verify lagao-a.`,
          actions: [
            'DigiLocker khon Jati certificate link me.',
            'Gele-monre (15) maha bhitar re submit me.'
          ],
          audio: `Johar ${applicantName}. Jati praman patra verify lagid DigiLocker byabahar me ar gele-monre maha bhitar re upload me.`
        }
      },
      GENERAL: {
        en: {
          explanation: `Dear ${applicantName}, your application requires clarification: "${deficiencyText}".`,
          actions: [
            'Review the scrutiny notes provided by your Nodal Officer carefully.',
            'Gather the requested supporting documentation from your institute or local authority.',
            'Submit your clarification and updated documents within 15 days.'
          ],
          audio: `Hello ${applicantName}. Your application has been returned for minor clarification regarding ${deficiencyText}. Please check the guidance notes and resubmit within fifteen days to avoid cancellation.`
        },
        hi: {
          explanation: `प्रिय ${applicantName}, आपके आवेदन में सुधार की आवश्यकता है: "${deficiencyText}"।`,
          actions: [
            'नोडल अधिकारी द्वारा दी गई टिप्पणियों को ध्यान से पढ़ें।',
            'अपने संस्थान या संबंधित कार्यालय से आवश्यक दस्तावेज प्राप्त करें।',
            '15 दिनों के भीतर अपना स्पष्टीकरण एवं दस्तावेज पोर्टल पर सबमिट करें।'
          ],
          audio: `नमस्ते ${applicantName}. आपके आवेदन में नोडल अधिकारी द्वारा कुछ सुधार मांगा गया है: ${deficiencyText}। कृपया 15 दिनों के भीतर आवश्यक दस्तावेज अपलोड करें ताकि आपकी छात्रवृत्ति समय पर जारी हो सके।`
        },
        or: {
          explanation: `ପ୍ରିୟ ${applicantName}, ଆପଣଙ୍କ ଆବେଦନରେ ସଂଶୋଧନ ଆବଶ୍ୟକ: "${deficiencyText}"।`,
          actions: [
            'ନୋଡାଲ୍ ଅଧିକାରୀଙ୍କ ମନ୍ତବ୍ୟ ଅନୁସାରେ ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର ସଂଗ୍ରହ କରନ୍ତୁ।',
            '୧୫ ଦିନ ମଧ୍ୟରେ ଦାଖଲ କରନ୍ତୁ।'
          ],
          audio: `ନମସ୍କାର ${applicantName}। ଆପଣଙ୍କ ଫର୍ମରେ ସଂଶୋଧନ ଆବଶ୍ୟକ। ଦୟାକରି ୧୫ ଦିନ ମଧ୍ୟରେ କାଗଜପତ୍ର ଅପଲୋଡ୍ କରନ୍ତୁ।`
        },
        bn: {
          explanation: `প্রিয় ${applicantName}, আপনার আবেদনে সংশোধন প্রয়োজন: "${deficiencyText}"।`,
          actions: [
            'নোডাল অফিসারের মন্তব্য অনুযায়ী প্রয়োজনীয় কাগজপত্র সংগ্রহ করুন।',
            '১৫ দিনের মধ্যে পুনরায় আপলোড করুন।'
          ],
          audio: `নমস্কার ${applicantName}। আপনার আবেদনপত্রে সংশোধনের জন্য ১৫ দিনের মধ্যে কাগজ জমা দিন।`
        },
        sat: {
          explanation: `Johar ${applicantName}. Application re kami mena-a: "${deficiencyText}".`,
          actions: [
            'Nodal Officer-a katha leka kagoj tayar me.',
            'Gele-monre maha bhitar re re-submit me.'
          ],
          audio: `Johar ${applicantName}. Application thik lagid gele-monre maha bhitar re kagoj upload me.`
        }
      }
    };

    const selectedCategory = scripts[issueType] || scripts.GENERAL;
    const localized = selectedCategory[language] || selectedCategory.hi;

    const langNames: Record<string, string> = {
      hi: 'हिंदी (Hindi)',
      en: 'English',
      or: 'ଓଡ଼ିଆ (Odia)',
      bn: 'বাংলা (Bengali)',
      sat: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)'
    };

    return {
      language,
      languageName: langNames[language] || 'Hindi',
      plainLanguageExplanation: localized.explanation,
      prescribedAction: localized.actions,
      statutoryCureDeadlineDays: 15,
      contactHelpline: '1800-11-7777 (MoTA Toll-Free)',
      audioScript: localized.audio
    };
  }
}
