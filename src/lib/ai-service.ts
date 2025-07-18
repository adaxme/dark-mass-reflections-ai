export interface Saint {
  name: string;
  feastDay: string;
  biography: string;
  patron: string;
  prayerOrQuote: string;
}

export interface ReadingSection {
  title: string;
  source: string;
  text: string;
}

const API_KEY = "AIzaSyAcDVH3NfuTIsmV31dNYwIv7uluD3-6Bvk";

export async function generateHomily(gospel: ReadingSection, language: string = 'en'): Promise<string> {
  try {
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('Error generating homily:', error);
    return 'Unable to generate homily at this time. Please try again later.';
  }
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export async function generateSaintOfTheDay(language: string = 'en'): Promise<Saint> {
  try {
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const saintData = JSON.parse(jsonMatch[0]);
          
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
    return readings;
  }

  try {
    const languageMap = {
      'es': 'Spanish',
      'fr': 'French'
    };
    
    const targetLanguage = languageMap[language as keyof typeof languageMap];
    if (!targetLanguage) {
      return readings;
    }

    const translateText = async (text: string, context: string = ''): Promise<string> => {
      const prompt = `Translate the following Catholic liturgical text to ${targetLanguage}. Maintain the spiritual and liturgical tone. ${context}

Text to translate: "${text}"

Respond with ONLY the translated text, no additional formatting or explanation.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text.trim();
      }
      
      return text; // Return original if translation fails
    };

    // Translate key fields
    const translatedReadings = {
      ...readings,
      liturgicalDay: await translateText(readings.liturgicalDay, 'This is a liturgical day name.'),
      optionalSaint: readings.optionalSaint ? await translateText(readings.optionalSaint, 'This is a saint name.') : null,
      Mass_R1: {
        title: await translateText(readings.Mass_R1.title, 'This is a reading title.'),
        source: await translateText(readings.Mass_R1.source, 'This is a biblical source reference.'),
        text: await translateText(readings.Mass_R1.text, 'This is a biblical reading text.')
      },
      Mass_Ps: {
        title: await translateText(readings.Mass_Ps.title, 'This is a psalm title.'),
        source: await translateText(readings.Mass_Ps.source, 'This is a psalm source reference.'),
        text: await translateText(readings.Mass_Ps.text, 'This is a psalm text.')
      },
      Mass_R2: readings.Mass_R2 ? {
        title: await translateText(readings.Mass_R2.title, 'This is a second reading title.'),
        source: await translateText(readings.Mass_R2.source, 'This is a second reading source reference.'),
        text: await translateText(readings.Mass_R2.text, 'This is a second reading text.')
      } : undefined,
      Mass_GA: {
        title: await translateText(readings.Mass_GA.title, 'This is a gospel acclamation title.'),
        source: await translateText(readings.Mass_GA.source, 'This is a gospel acclamation source.'),
        text: await translateText(readings.Mass_GA.text, 'This is a gospel acclamation text.')
      },
      Mass_G: {
        title: await translateText(readings.Mass_G.title, 'This is a gospel title.'),
        source: await translateText(readings.Mass_G.source, 'This is a gospel source reference.'),
        text: await translateText(readings.Mass_G.text, 'This is a gospel reading text.')
      },
      copyright: await translateText(readings.copyright, 'This is copyright text.')
    };

    return translatedReadings;
  } catch (error) {
    console.error('Error translating readings:', error);
    return readings;
  }
}