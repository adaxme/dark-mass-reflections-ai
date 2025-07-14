import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateSaintOfTheDay, Saint } from '@/lib/ai-service';
import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Calendar, Quote, Cross } from 'lucide-react';

const SaintTab: React.FC = () => {
  const [saint, setSaint] = useState<Saint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadSaint = async () => {
      try {
        setLoading(true);
        setError(null);
        const saintData = await generateSaintOfTheDay();
        setSaint(saintData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadSaint();
  }, []);

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
        <div className="text-center">
          <p className="text-destructive">{t('error')}: {error}</p>
        </div>
      </div>
    );
  }

  if (!saint) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gradient-holy border-border shadow-divine">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <Cross className="h-12 w-12 text-primary mx-auto mb-4" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary mb-2">
            {saint.name}
          </CardTitle>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            <span className="text-accent font-medium">{saint.feastDay}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Biography */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Biography
            </h3>
            <p className="text-foreground leading-relaxed">
              {saint.biography}
            </p>
          </div>

          {/* Patron */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              {t('patronOf')}
            </h3>
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              {saint.patron}
            </Badge>
          </div>

          {/* Prayer or Quote */}
          <div className="bg-muted/50 p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              Prayer or Quote
            </h3>
            <blockquote className="text-foreground italic leading-relaxed">
              "{saint.prayerOrQuote}"
            </blockquote>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaintTab;