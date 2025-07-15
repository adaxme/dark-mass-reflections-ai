import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CleanReadingData } from '@/lib/readings-api';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Cross } from 'lucide-react';

interface ReadingsTabProps {
  readings: CleanReadingData | null;
  loading: boolean;
  error: string | null;
}

const ReadingsTab: React.FC<ReadingsTabProps> = ({ readings, loading, error }) => {
  const { t } = useLanguage();

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

  if (!readings) return null;

  const readingSections = [
    { data: readings.Mass_R1, key: 'r1' },
    { data: readings.Mass_Ps, key: 'ps' },
    ...(readings.Mass_R2 ? [{ data: readings.Mass_R2, key: 'r2' }] : []),
    { data: readings.Mass_GA, key: 'ga' },
    { data: readings.Mass_G, key: 'g' }
  ];

  return (
    <div className="space-y-6">
      {/* Date Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {readings.liturgicalDay}
        </h2>
        {readings.optionalSaint && (
          <p className="text-lg text-accent font-medium mb-2">{readings.optionalSaint}</p>
        )}
        <p className="text-muted-foreground">{readings.date}</p>
      </div>

      {/* Reading Sections */}
      <div className="space-y-6">
        {readingSections.map((section, index) => (
          <Card key={section.key} className="bg-card border-border shadow-gentle">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen className="h-5 w-5" />
                {section.data.title}
              </CardTitle>
              {section.data.source && (
                <p className="text-sm text-accent font-medium">{section.data.source}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {section.data.text}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Copyright */}
      {readings.copyright && (
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">{readings.copyright}</p>
        </div>
      )}
    </div>
  );
};

export default ReadingsTab;