import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export async function getRandomQuote(categoryIds?: string[]) {
  let query = supabase
    .from('quotes')
    .select(`
      *,
      categories (
        name
      )
    `)
    .order('times_shown', { ascending: true });

  if (categoryIds && categoryIds.length > 0) {
    query = query.in('category_id', categoryIds);
  }

  const { data: quotes, error } = await query.limit(10);

  if (error) throw error;
  if (!quotes || quotes.length === 0) return null;

  // Get a random quote from the least shown quotes
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  // Increment times_shown
  await supabase
    .from('quotes')
    .update({ times_shown: (quote.times_shown || 0) + 1 })
    .eq('id', quote.id);

  return quote;
}

export async function likeQuote(quoteId: string) {
  const { error } = await supabase
    .from('quotes')
    .update({ likes: supabase.rpc('increment') })
    .eq('id', quoteId);

  if (error) throw error;
}

export async function getCategories() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return categories;
}