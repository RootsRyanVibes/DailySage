import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Search, Heart, FolderPlus } from 'lucide-react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';

export default function ExploreScreen() {
  const [categories, setCategories] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    loadQuotes();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading categories:', error);
      return;
    }
    
    setCategories(data);
  };

  const loadQuotes = async () => {
    setLoading(true);
    let query = supabase
      .from('quotes')
      .select(`
        *,
        categories (name)
      `)
      .order('created_at', { ascending: false });

    if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error loading quotes:', error);
      return;
    }

    setQuotes(data);
    setLoading(false);
  };

  const handleFavorite = async (quoteId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Please sign in to save favorites');
      return;
    }

    const { error } = await supabase
      .from('favorite_quotes')
      .upsert({
        user_id: user.id,
        quote_id: quoteId,
      });

    if (error) {
      Alert.alert('Error saving favorite');
      return;
    }

    Alert.alert('Quote saved to favorites');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Wisdom</Text>
        <Pressable style={styles.searchButton}>
          <Search size={24} color="#1f2937" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}>
        {categories.map((category, index) => (
          <Animated.View
            key={category.id}
            entering={FadeInRight.delay(index * 100)}>
            <Pressable
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => {
                setSelectedCategory(category.id === selectedCategory ? null : category.id);
                loadQuotes();
              }}>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.quotes}
        contentContainerStyle={styles.quotesContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Loading quotes...</Text>
        ) : quotes.length === 0 ? (
          <Text style={styles.emptyText}>No quotes found</Text>
        ) : quotes.map((quote, index) => (
          <Animated.View
            key={quote.id}
            entering={FadeInRight.delay(index * 200)}
            style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
            <View style={styles.quoteFooter}>
              <Text style={styles.quoteCategory}>
                {quote.categories?.name}
              </Text>
              <View style={styles.quoteActions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => handleFavorite(quote.id)}>
                  <Heart size={20} color="#6366f1" />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  searchButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    color: '#4b5563',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  quotes: {
    flex: 1,
    padding: 16,
  },
  quotesContainer: {
    paddingBottom: 20,
  },
  quoteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  quoteCategory: {
    fontSize: 12,
    color: '#6366f1',
  },
  quoteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quoteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
});