import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { generateHomily } from '../lib/ai-service';
import { fetchReadings, CleanReadingData } from '../lib/readings-api';
import { translateReadings } from '../lib/ai-service';
import { useLanguage } from '../contexts/LanguageContext';

const HomilyScreen = () => {
  const [homily, setHomily] = useState<string | null>(null);
  const [readings, setReadings] = useState<CleanReadingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadReadings();
  }, [language]);

  const loadReadings = async () => {
    try {
      const readingsData = await fetchReadings();
      const translatedReadings = await translateReadings(readingsData, language);
      setReadings(translatedReadings);
      
      // Auto-generate homily when readings are loaded
      if (translatedReadings?.Mass_G) {
        loadHomily(translatedReadings.Mass_G);
      }
    } catch (err) {
      console.error('Error loading readings:', err);
    }
  };

  const loadHomily = async (gospel = readings?.Mass_G) => {
    if (!gospel) return;
    
    try {
      setLoading(true);
      setError(null);
      const homilyText = await generateHomily(gospel, language);
      setHomily(homilyText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setHomily(null);
    loadHomily();
  };

  if (!readings?.Mass_G) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="menu-book" size={48} color="#888" />
        <Text style={styles.noGospelText}>No Gospel reading available for homily generation.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="error" size={48} color="#FF6B6B" />
        <Text style={styles.errorText}>{t('error')}: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadHomily()}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View style={styles.homilyCard}>
        {/* Header */}
        <View style={styles.homilyHeader}>
          <View style={styles.iconContainer}>
            <Icon name="chat" size={24} color="#000" />
          </View>
          <Text style={styles.homilyTitle}>{t('spiritualReflection')}</Text>
          <Text style={styles.gospelSource}>
            Based on today's Gospel: {readings.Mass_G.source}
          </Text>
        </View>

        {/* Homily Content */}
        {homily ? (
          <View style={styles.homilyContent}>
            <Text style={styles.homilyText}>{homily}</Text>
            
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={handleGenerateNew}
              disabled={loading}
            >
              <Icon name="refresh" size={16} color="#000" />
              <Text style={styles.generateButtonText}>{t('generateNew')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.generateContainer}>
            <Text style={styles.generatePrompt}>
              Generate a spiritual reflection for today's Gospel.
            </Text>
            <TouchableOpacity 
              style={styles.generateButton} 
              onPress={() => loadHomily()}
              disabled={loading}
            >
              <Icon name="chat" size={16} color="#000" />
              <Text style={styles.generateButtonText}>Generate Homily</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  homilyCard: {
    backgroundColor: '#1F1F1F',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  homilyHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    backgroundColor: '#FFD700',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  homilyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  gospelSource: {
    fontSize: 14,
    color: '#AAA',
    textAlign: 'center',
  },
  homilyContent: {
    alignItems: 'center',
  },
  homilyText: {
    fontSize: 18,
    color: '#F0F0F0',
    lineHeight: 28,
    textAlign: 'left',
    marginBottom: 24,
  },
  generateContainer: {
    alignItems: 'center',
  },
  generatePrompt: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  noGospelText: {
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 32,
    marginTop: 16,
    fontSize: 16,
  },
  loadingText: {
    color: '#AAA',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomilyScreen;