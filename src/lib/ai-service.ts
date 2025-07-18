import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReadingSection } from './readings-api';

const API_KEY = "AIzaSyAcDVH3NfuTIsmV31dNYwIv7uluD3-6Bvk";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface Saint {
  name: string;
  feastDay: string;
  biography: string;
  patron: string;
  prayerOrQuote: string;
}

export async function generateHomily(gospel: ReadingSection, language: string = 'en'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const languageMap = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French'
    };
    
    const targetLanguage = languageMap[language as keyof typeof languageMap] || 'English';
    
    const prompt = `
    As a Catholic priest, write a short, inspiring homily (200-300 words) based on today's Gospel reading.
    
    IMPORTANT: Write the entire homily in ${targetLanguage}.

    Gospel: ${gospel.source}
    "${gospel.text}"

    Please provide a spiritual reflection that:
    - Connects the Gospel message to daily life
    - Offers practical guidance for living as a Catholic
    - Includes hope and encouragement
    - Is accessible to all ages
    - Reflects traditional Catholic teaching

    Write in a warm, pastoral tone as if speaking directly to the congregation.
    Write everything in ${targetLanguage}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating homily:', error);
    return 'Unable to generate homily at this time. Please try again later.';
  }
}

function stripHtmlTags(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

export async function generateSaintOfTheDay(language: string = 'en'): Promise<Saint> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });

    const languageMap = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French'
    };
    
    const targetLanguage = languageMap[language as keyof typeof languageMap] || 'English';

    const prompt = `
    Provide information about a Catholic saint for today, ${dateString}. If there's no specific saint for today, choose a well-known Catholic saint. 

    IMPORTANT: Write all content in ${targetLanguage}.

    Please provide the response in this exact JSON format with PLAIN TEXT only (no HTML tags):
    {
      "name": "Saint's full name",
      "feastDay": "Month Day (or feast day)",
      "biography": "Brief biography in 2-3 sentences focusing on their life and achievements",
      "patron": "What they are patron saint of",
      "prayerOrQuote": "A famous quote from them or a short prayer to them"
    }

    Focus on saints recognized by the Catholic Church. Keep the biography inspiring and accessible.
    Return only plain text in JSON format, no HTML tags or formatting.
    Write all content in ${targetLanguage}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const saintData = JSON.parse(jsonMatch[0]);
        
        // Strip HTML tags from all fields
        return {
          name: stripHtmlTags(saintData.name || ""),
          feastDay: stripHtmlTags(saintData.feastDay || ""),
          biography: stripHtmlTags(saintData.biography || ""),
          patron: stripHtmlTags(saintData.patron || ""),
          prayerOrQuote: stripHtmlTags(saintData.prayerOrQuote || "")
        };
      }
    } catch (parseError) {
      console.error('Error parsing saint JSON:', parseError);
    }
    
    // Fallback saint if parsing fails
    return {
      name: "Saint Francis of Assisi",
      feastDay: "October 4",
      biography: "Born into a wealthy family in Assisi, Italy, Francis abandoned his comfortable life to serve Christ and the poor. He founded the Franciscan order and is known for his love of nature and animals.",
      patron: "Animals, ecology, and Italy",
      prayerOrQuote: "Lord, make me an instrument of your peace. Where there is hatred, let me sow love."
    };
  } catch (error) {
    console.error('Error generating saint:', error);
    return {
      name: "Saint Francis of Assisi",
      feastDay: "October 4",
      biography: "Born into a wealthy family in Assisi, Italy, Francis abandoned his comfortable life to serve Christ and the poor. He founded the Franciscan order and is known for his love of nature and animals.",
      patron: "Animals, ecology, and Italy",
      prayerOrQuote: "Lord, make me an instrument of your peace. Where there is hatred, let me sow love."
    };
  }
}

export async function translateReadings(readings: any, language: string = 'en'): Promise<any> {
  if (language === 'en') {
    return readings; // No translation needed for English
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const languageMap = {
      'es': 'Spanish',
      'fr': 'French'
    };
    
    const targetLanguage = languageMap[language as keyof typeof languageMap];
    if (!targetLanguage) {
      return readings;
    }

    // Create separate translation requests for better reliability
    const translateText = async (text: string, context: string = ''): Promise<string> => {
      const prompt = `Translate the following Catholic liturgical text to ${targetLanguage}. Maintain the spiritual and liturgical tone. ${context}

Text to translate: "${text}"

Respond with ONLY the translated text, no additional formatting or explanation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    };

    // Translate each field individually for better accuracy
    const [
      translatedLiturgicalDay,
      translatedOptionalSaint,
      translatedR1Title,
      translatedR1Source,
      translatedR1Text,
      translatedPsTitle,
      translatedPsSource,
      translatedPsText,
      translatedGATitle,
      translatedGASource,
      translatedGAText,
      translatedGTitle,
      translatedGSource,
      translatedGText,
      translatedR2Title,
      translatedR2Source,
      translatedR2Text,
      translatedCopyright
    ] = await Promise.all([
      translateText(readings.liturgicalDay, 'This is a liturgical day name.'),
      readings.optionalSaint ? translateText(readings.optionalSaint, 'This is a saint name.') : null,
      translateText(readings.Mass_R1.title, 'This is a reading title.'),
      translateText(readings.Mass_R1.source, 'This is a biblical source reference.'),
      translateText(readings.Mass_R1.text, 'This is a biblical reading text.'),
      translateText(readings.Mass_Ps.title, 'This is a psalm title.'),
      translateText(readings.Mass_Ps.source, 'This is a psalm source reference.'),
      translateText(readings.Mass_Ps.text, 'This is a psalm text.'),
      translateText(readings.Mass_GA.title, 'This is a gospel acclamation title.'),
      translateText(readings.Mass_GA.source, 'This is a gospel acclamation source.'),
      translateText(readings.Mass_GA.text, 'This is a gospel acclamation text.'),
      translateText(readings.Mass_G.title, 'This is a gospel title.'),
      translateText(readings.Mass_G.source, 'This is a gospel source reference.'),
      translateText(readings.Mass_G.text, 'This is a gospel reading text.'),
      readings.Mass_R2 ? translateText(readings.Mass_R2.title, 'This is a second reading title.') : null,
      readings.Mass_R2 ? translateText(readings.Mass_R2.source, 'This is a second reading source reference.') : null,
      readings.Mass_R2 ? translateText(readings.Mass_R2.text, 'This is a second reading text.') : null,
      translateText(readings.copyright, 'This is copyright text.')
    ]);

    return {
      ...readings,
      liturgicalDay: translatedLiturgicalDay,
      optionalSaint: translatedOptionalSaint,
      Mass_R1: {
        title: translatedR1Title,
        source: translatedR1Source,
        text: translatedR1Text
      },
      Mass_Ps: {
        title: translatedPsTitle,
        source: translatedPsSource,
        text: translatedPsText
      },
      Mass_R2: readings.Mass_R2 ? {
        title: translatedR2Title,
        source: translatedR2Source,
        text: translatedR2Text
      } : undefined,
      Mass_GA: {
        title: translatedGATitle,
        source: translatedGASource,
        text: translatedGAText
      },
      Mass_G: {
        title: translatedGTitle,
        source: translatedGSource,
        text: translatedGText
      },
      copyright: translatedCopyright
    };
  } catch (error) {
    console.error('Error translating readings:', error);
    return readings; // Return original if translation fails
  }
}