import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Register for push notifications
export async function registerForPushNotifications() {
  let token;

  if (Platform.OS === 'web') {
    // Web push notifications not supported yet
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}

// Schedule next day's notification
export async function scheduleNextQuote(userId: string, preferredTime: string) {
  const [hours, minutes] = preferredTime.split(':').map(Number);
  
  // Calculate next notification time
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  // Get user's preferred categories
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('category_ids')
    .eq('user_id', userId)
    .single();

  // Get a random quote for tomorrow
  const quote = await getRandomQuote(userPrefs?.category_ids);
  
  if (!quote) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Daily Wisdom',
      body: `"${quote.text}" - ${quote.author}`,
      data: { quoteId: quote.id },
    },
    trigger: {
      date: tomorrow,
      repeats: false,
    },
  });
}