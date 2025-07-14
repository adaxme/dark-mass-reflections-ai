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

export async function generateHomily(gospel: ReadingSection): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
    As a Catholic priest, write a short, inspiring homily (200-300 words) based on today's Gospel reading:

    Gospel: ${gospel.source}
    "${gospel.text}"

    Please provide a spiritual reflection that:
    - Connects the Gospel message to daily life
    - Offers practical guidance for living as a Catholic
    - Includes hope and encouragement
    - Is accessible to all ages
    - Reflects traditional Catholic teaching

    Write in a warm, pastoral tone as if speaking directly to the congregation.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating homily:', error);
    return 'Unable to generate homily at this time. Please try again later.';
  }
}

export async function generateSaintOfTheDay(): Promise<Saint> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `
    Provide information about a Catholic saint for today, ${dateString}. If there's no specific saint for today, choose a well-known Catholic saint. 

    Please provide the response in this exact JSON format:
    {
      "name": "Saint's full name",
      "feastDay": "Month Day (or feast day)",
      "biography": "Brief biography in 2-3 sentences focusing on their life and achievements",
      "patron": "What they are patron saint of",
      "prayerOrQuote": "A famous quote from them or a short prayer to them"
    }

    Focus on saints recognized by the Catholic Church. Keep the biography inspiring and accessible.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
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