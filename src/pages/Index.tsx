import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchReadings, CleanReadingData } from '@/lib/readings-api';
import { translateReadings } from '@/lib/ai-service';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import ReadingsTab from '@/components/ReadingsTab';
import SaintTab from '@/components/SaintTab';
import HomilyTab from '@/components/HomilyTab';
import LanguageSelector from '@/components/LanguageSelector';
import { Cross, BookOpen, Heart, MessageSquare } from 'lucide-react';

const AppContent = () => {
  const [readings, setReadings] = useState<CleanReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const loadReadings = async () => {
      try {
        setLoading(true);
        setError(null);
        const readingsData = await fetchReadings();
        const translatedReadings = await translateReadings(readingsData, language);
        setReadings(translatedReadings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, [language]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-gold p-2 rounded-lg">
                <Cross className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {t('dailyReadings')}
              </h1>
            </div>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="readings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 mb-8">
            <TabsTrigger 
              value="readings" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" />
              {t('readings')}
            </TabsTrigger>
            <TabsTrigger 
              value="saint" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Heart className="h-4 w-4" />
              {t('saint')}
            </TabsTrigger>
            <TabsTrigger 
              value="homily" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              {t('homily')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="readings" className="space-y-6">
            <ReadingsTab 
              readings={readings} 
              loading={loading} 
              error={error} 
            />
          </TabsContent>

          <TabsContent value="saint" className="space-y-6">
            <SaintTab />
          </TabsContent>

          <TabsContent value="homily" className="space-y-6">
            <HomilyTab readings={readings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default Index;
