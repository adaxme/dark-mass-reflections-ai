import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateHomily } from '@/lib/ai-service';
import { CleanReadingData } from '@/lib/readings-api';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageSquare, RefreshCw, Cross } from 'lucide-react';

interface HomilyTabProps {
  readings: CleanReadingData | null;
}

const HomilyTab: React.FC<HomilyTabProps> = ({ readings }) => {
  const [homily, setHomily] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const loadHomily = async () => {
    if (!readings?.Mass_G) return;
    
    try {
      setLoading(true);
      setError(null);
      const homilyText = await generateHomily(readings.Mass_G, language);
      setHomily(homilyText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (readings?.Mass_G) {
      setHomily(null); // Reset homily when language changes
      loadHomily();
    }
  }, [readings, language]);

  if (!readings?.Mass_G) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No Gospel reading available for homily generation.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Cross className="h-8 w-8 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">{t('error')}: {error}</p>
          <Button onClick={loadHomily} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-gradient-holy border-border shadow-divine">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            <MessageSquare className="h-6 w-6" />
            {t('spiritualReflection')}
          </CardTitle>
          <p className="text-muted-foreground">
            Based on today's Gospel: {readings.Mass_G.source}
          </p>
        </CardHeader>
        
        <CardContent>
          {homily ? (
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-foreground leading-relaxed whitespace-pre-line text-lg">
                  {homily}
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={loadHomily} 
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Generate New Reflection
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Generate a spiritual reflection for today's Gospel.</p>
              <Button onClick={loadHomily} disabled={loading}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Generate Homily
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomilyTab;