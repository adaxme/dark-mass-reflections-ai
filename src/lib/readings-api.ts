// Interfaces for structured data
interface ReadingSection {
  title: string;
  source: string;
  text: string;
}

interface CleanReadingData {
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

// Utility to strip HTML tags
function stripHtml(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

// Helper to extract and label reading sections
function extractSection(data: any, key: string, title: string): ReadingSection {
  return {
    title,
    source: stripHtml(data[key]?.source || ""),
    text: stripHtml(data[key]?.text || "")
  };
}

// Main function to fetch and clean Universalis Mass readings
export async function fetchReadings(): Promise<CleanReadingData> {
  return new Promise<CleanReadingData>((resolve, reject) => {
    const script = document.createElement('script');
    const uniqueCallbackName = 'universalisCallback_' + Date.now();

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    const url = `https://universalis.com/United.States/${formattedDate}/jsonpmass.js`;

    // JSONP callback
    (window as any)[uniqueCallbackName] = (data: any) => {
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

      resolve(cleanData);
      delete (window as any)[uniqueCallbackName];
      document.body.removeChild(script);
    };

    // Error handler
    script.onerror = () => {
      reject(new Error(`JSONP request to ${url} failed`));
      delete (window as any)[uniqueCallbackName];
      document.body.removeChild(script);
    };

    script.src = `${url}?callback=${uniqueCallbackName}`;
    document.body.appendChild(script);
  });
}

export type { ReadingSection, CleanReadingData };