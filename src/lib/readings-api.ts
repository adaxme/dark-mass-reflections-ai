export interface ReadingSection {
  title: string;
  source: string;
  text: string;
}

export interface CleanReadingData {
  date: string;
  liturgicalDay: string;
  optionalSaint?: string;
  Mass_R1: ReadingSection;
  Mass_Ps: ReadingSection;
  Mass_R2?: ReadingSection;
  Mass_GA: ReadingSection;
  Mass_G: ReadingSection;
  copyright: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function extractSection(data: any, key: string, title: string): ReadingSection {
  return {
    title,
    source: stripHtml(data[key]?.source || ""),
    text: stripHtml(data[key]?.text || "")
  };
}

export async function fetchReadings(): Promise<CleanReadingData> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    
    const url = `https://universalis.com/United.States/${formattedDate}/jsonpmass.js`;
    
    // For React Native, we'll use a different approach since JSONP isn't directly supported
    // We'll use a proxy or direct fetch if CORS allows
    const response = await fetch(url.replace('.js', '.json'));
    const data = await response.json();
    
    const fullDayText = stripHtml(data.day || "");
    const [liturgicalDay, optionalSaintPart] = fullDayText.split("or").map(part => part.trim());

    const cleanData: CleanReadingData = {
      date: data.date,
      liturgicalDay,
      optionalSaint: optionalSaintPart || undefined,
      Mass_R1: extractSection(data, 'Mass_R1', 'First Reading'),
      Mass_Ps: extractSection(data, 'Mass_Ps', 'Responsorial Psalm'),
      Mass_R2: data.Mass_R2 ? extractSection(data, 'Mass_R2', 'Second Reading') : undefined,
      Mass_GA: extractSection(data, 'Mass_GA', 'Gospel Acclamation'),
      Mass_G: extractSection(data, 'Mass_G', 'Gospel'),
      copyright: stripHtml(data.copyright?.text || "")
    };

    return cleanData;
  } catch (error) {
    console.error('Error fetching readings:', error);
    
    // Return mock data as fallback
    return {
      date: new Date().toLocaleDateString(),
      liturgicalDay: "Sunday in Ordinary Time",
      Mass_R1: {
        title: "First Reading",
        source: "Sample Reading",
        text: "Sample reading text..."
      },
      Mass_Ps: {
        title: "Responsorial Psalm",
        source: "Psalm 23",
        text: "The Lord is my shepherd..."
      },
      Mass_GA: {
        title: "Gospel Acclamation",
        source: "Alleluia",
        text: "Alleluia, alleluia..."
      },
      Mass_G: {
        title: "Gospel",
        source: "Matthew 5:1-12",
        text: "Sample gospel text..."
      },
      copyright: "Copyright notice"
    };
  }
}