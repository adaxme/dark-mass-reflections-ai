import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchReadings, CleanReadingData } from '../lib/readings-api';
import { translateReadings } from '../lib/ai-service';
import { useLanguage } from '../contexts/LanguageContext';

const ReadingsScreen = () => {
  const [readings, setReadings] = useState<CleanReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadReadings();
  }, [language]);

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

  const handleRetry = () => {
    loadReadings();
  };

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
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <Icon name="language" size={20} color="#FFD700" />
        <Picker
          selectedValue={language}
          style={styles.languagePicker}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          dropdownIconColor="#FFD700"
        >
          <Picker.Item label="🇺🇸 English" value="en" color="#FFF" />
          <Picker.Item label="🇪🇸 Español" value="es" color="#FFF" />
          <Picker.Item label="🇫🇷 Français" value="fr" color="#FFF" />
        </Picker>
      </View>

      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.liturgicalDay}>{readings.liturgicalDay}</Text>
        {readings.optionalSaint && (
          <Text style={styles.optionalSaint}>{readings.optionalSaint}</Text>
        )}
        <Text style={styles.date}>{readings.date}</Text>
      </View>

      {/* Reading Sections */}
      {readingSections.map((section, index) => (
        <View key={section.key} style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <Icon name="menu-book" size={20} color="#FFD700" />
            <Text style={styles.readingTitle}>{section.data.title}</Text>
          </View>
          {section.data.source && (
            <Text style={styles.readingSource}>{section.data.source}</Text>
          )}
          <Text style={styles.readingText}>{section.data.text}</Text>
        </View>
      ))}

      {/* Copyright */}
      {readings.copyright && (
        <View style={styles.copyrightContainer}>
          <Text style={styles.copyrightText}>{readings.copyright}</Text>
        </View>
      )}
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
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  languagePicker: {
    flex: 1,
    color: '#FFF',
    marginLeft: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  liturgicalDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  optionalSaint: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
  },
  readingCard: {
    backgroundColor: '#1F1F1F',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  readingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  readingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  readingSource: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginBottom: 12,
  },
  readingText: {
    fontSize: 16,
    color: '#F0F0F0',
    lineHeight: 24,
  },
  copyrightContainer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  copyrightText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
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

export default ReadingsScreen;