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

import { generateSaintOfTheDay, Saint } from '../lib/ai-service';
import { useLanguage } from '../contexts/LanguageContext';

const SaintScreen = () => {
  const [saint, setSaint] = useState<Saint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSaint();
  }, [language]);

  const loadSaint = async () => {
    try {
      setLoading(true);
      setError(null);
      const saintData = await generateSaintOfTheDay(language);
      setSaint(saintData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadSaint();
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

  if (!saint) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
      <View style={styles.saintCard}>
        {/* Header */}
        <View style={styles.saintHeader}>
          <View style={styles.crossContainer}>
            <Icon name="add" size={48} color="#000" style={styles.crossIcon} />
          </View>
          <Text style={styles.saintName}>{saint.name}</Text>
          <View style={styles.feastDayContainer}>
            <Icon name="event" size={16} color="#FFD700" />
            <Text style={styles.feastDay}>{saint.feastDay}</Text>
          </View>
        </View>

        {/* Biography */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="favorite" size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>Biography</Text>
          </View>
          <Text style={styles.biographyText}>{saint.biography}</Text>
        </View>

        {/* Patron */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('patronOf')}</Text>
          <View style={styles.patronBadge}>
            <Text style={styles.patronText}>{saint.patron}</Text>
          </View>
        </View>

        {/* Prayer or Quote */}
        <View style={styles.quoteSection}>
          <View style={styles.sectionHeader}>
            <Icon name="format-quote" size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>Prayer or Quote</Text>
          </View>
          <View style={styles.quoteContainer}>
            <Text style={styles.quoteText}>"{saint.prayerOrQuote}"</Text>
          </View>
        </View>
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
  saintCard: {
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
  saintHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  crossContainer: {
    backgroundColor: '#FFD700',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  crossIcon: {
    transform: [{ rotate: '45deg' }],
  },
  saintName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
  },
  feastDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feastDay: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F0F0F0',
    marginLeft: 8,
  },
  biographyText: {
    fontSize: 16,
    color: '#F0F0F0',
    lineHeight: 24,
  },
  patronBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  patronText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
  },
  quoteSection: {
    marginTop: 8,
  },
  quoteContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  quoteText: {
    fontSize: 16,
    color: '#F0F0F0',
    fontStyle: 'italic',
    lineHeight: 24,
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

export default SaintScreen;