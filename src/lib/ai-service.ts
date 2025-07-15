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

    const prompt = `
    Translate the following Catholic Mass readings to ${targetLanguage}. Keep the structure exactly the same and maintain the spiritual and liturgical tone:

    Liturgical Day: ${readings.liturgicalDay}
    Optional Saint: ${readings.optionalSaint || 'None'}
    
    First Reading Title: ${readings.Mass_R1.title}
    First Reading Source: ${readings.Mass_R1.source}
    First Reading Text: ${readings.Mass_R1.text}
    
    Psalm Title: ${readings.Mass_Ps.title}
    Psalm Source: ${readings.Mass_Ps.source}
    Psalm Text: ${readings.Mass_Ps.text}
    
    ${readings.Mass_R2 ? `Second Reading Title: ${readings.Mass_R2.title}
    Second Reading Source: ${readings.Mass_R2.source}
    Second Reading Text: ${readings.Mass_R2.text}` : ''}
    
    Gospel Acclamation Title: ${readings.Mass_GA.title}
    Gospel Acclamation Source: ${readings.Mass_GA.source}
    Gospel Acclamation Text: ${readings.Mass_GA.text}
    
    Gospel Title: ${readings.Mass_G.title}
    Gospel Source: ${readings.Mass_G.source}
    Gospel Text: ${readings.Mass_G.text}

    Please provide the translation in the same JSON structure format with all fields translated to ${targetLanguage}.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the translated structure
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const translatedData = JSON.parse(jsonMatch[0]);
        return {
          ...readings,
          liturgicalDay: translatedData.liturgicalDay || readings.liturgicalDay,
          optionalSaint: translatedData.optionalSaint || readings.optionalSaint,
          Mass_R1: {
            title: translatedData.Mass_R1?.title || readings.Mass_R1.title,
            source: translatedData.Mass_R1?.source || readings.Mass_R1.source,
            text: translatedData.Mass_R1?.text || readings.Mass_R1.text
          },
          Mass_Ps: {
            title: translatedData.Mass_Ps?.title || readings.Mass_Ps.title,
            source: translatedData.Mass_Ps?.source || readings.Mass_Ps.source,
            text: translatedData.Mass_Ps?.text || readings.Mass_Ps.text
          },
          Mass_R2: readings.Mass_R2 ? {
            title: translatedData.Mass_R2?.title || readings.Mass_R2.title,
            source: translatedData.Mass_R2?.source || readings.Mass_R2.source,
            text: translatedData.Mass_R2?.text || readings.Mass_R2.text
          } : undefined,
          Mass_GA: {
            title: translatedData.Mass_GA?.title || readings.Mass_GA.title,
            source: translatedData.Mass_GA?.source || readings.Mass_GA.source,
            text: translatedData.Mass_GA?.text || readings.Mass_GA.text
          },
          Mass_G: {
            title: translatedData.Mass_G?.title || readings.Mass_G.title,
            source: translatedData.Mass_G?.source || readings.Mass_G.source,
            text: translatedData.Mass_G?.text || readings.Mass_G.text
          }
        };
      }
    } catch (parseError) {
      console.error('Error parsing translated readings:', parseError);
    }

    return readings; // Return original if translation fails
  } catch (error) {
    console.error('Error translating readings:', error);
    return readings; // Return original if translation fails
  }
}