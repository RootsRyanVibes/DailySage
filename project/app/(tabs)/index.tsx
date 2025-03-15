import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Heart, Share2 } from 'lucide-react-native';
import Animated, { 
  FadeIn,
  FadeInDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

type Quote = {
  id: string;
  text: string;
  author: string;
  categories: { name: string } | null;
};

export default function TodayScreen() {
  const [liked, setLiked] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const scale = useSharedValue(1);
  
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  useEffect(() => {
    loadTodayQuote();
  }, []);

  const loadTodayQuote = async () => {
    setLoading(true);
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select(`
        *,
        categories (name)
      `)
      .order('times_shown', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Error loading quote:', error);
      return;
    }

    if (quotes && quotes.length > 0) {
      setQuote(quotes[0]);
      // Increment times_shown
      await supabase
        .from('quotes')
        .update({ times_shown: (quotes[0].times_shown || 0) + 1 })
        .eq('id', quotes[0].id);
    }
    setLoading(false);
  };

  const onLike = async () => {
    if (!quote) return;

    setLiked(!liked);
    scale.value = withSpring(1.2, {}, () => {
      scale.value = withSpring(1);
    });

    if (!liked) {
      await supabase
        .from('quotes')
        .update({ likes: supabase.rpc('increment') })
        .eq('id', quote.id);
    }
  };

  const onShare = async () => {
    if (!quote) return;
    
    const text = `"${quote.text}" - ${quote.author}`;
    
    if (Platform.OS === 'web') {
      try {
        await navigator.share({ text });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  if (loading || !quote) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading today's wisdom...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d' }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />
      
      <Animated.View 
        entering={FadeIn.delay(300)}
        style={styles.header}>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
        <Text style={styles.category}>{quote.categories?.name}</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(600).springify()}
        style={styles.quoteContainer}>
        <Text style={styles.quote}>"{quote.text}"</Text>
        <Text style={styles.author}>— {quote.author}</Text>
        
        <View style={styles.actions}>
          <Pressable onPress={onLike} style={styles.actionButton}>
            <Animated.View style={heartStyle}>
              <Heart
                size={24}
                color={liked ? '#ef4444' : '#ffffff'}
                fill={liked ? '#ef4444' : 'none'}
              />
            </Animated.View>
          </Pressable>

          <Pressable onPress={onShare} style={styles.actionButton}>
            <Share2 size={24} color="#ffffff" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  date: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 16,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  quote: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 42,
  },
  author: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 18,
    marginTop: 16,
  },
  actions: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    alignSelf: 'flex-start',
    padding: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
});