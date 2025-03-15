import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Bell, Moon, Share2, Heart, Clock } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { registerForPushNotifications } from '@/lib/notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (prefs) {
      setNotificationsEnabled(prefs.notifications_enabled);
      const [hours, minutes] = prefs.notification_time.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      setNotificationTime(time);
    }
  };

  const handleNotificationToggle = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);

    if (newState) {
      const token = await registerForPushNotifications();
      if (!token) {
        setNotificationsEnabled(false);
        return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        notifications_enabled: newState,
      });
  };

  const handleTimeChange = async (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (!selectedTime) return;

    setNotificationTime(selectedTime);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const timeString = selectedTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        notification_time: timeString,
      });
  };

  const SECTIONS = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Daily Notifications',
          type: 'switch',
          value: notificationsEnabled,
          onChange: handleNotificationToggle,
        },
        {
          icon: Clock,
          label: 'Notification Time',
          type: 'time',
          value: notificationTime,
          onChange: () => setShowTimePicker(true),
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          type: 'switch',
          value: darkMode,
          onChange: () => setDarkMode(!darkMode),
        }
      ]
    },
    {
      title: 'General',
      items: [
        {
          icon: Share2,
          label: 'Share App',
          type: 'button'
        },
        {
          icon: Heart,
          label: 'Saved Quotes',
          type: 'button'
        }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {SECTIONS.map((section, sectionIndex) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.delay(sectionIndex * 200)}
          style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {section.items.map((item, itemIndex) => (
            <Animated.View
              key={item.label}
              entering={FadeInUp.delay((sectionIndex * 200) + (itemIndex * 100))}
              style={styles.item}>
              <View style={styles.itemLeft}>
                <item.icon size={20} color="#6b7280" />
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: '#d1d5db', true: '#818cf8' }}
                  thumbColor={item.value ? '#6366f1' : '#ffffff'}
                />
              ) : item.type === 'time' ? (
                <Pressable onPress={item.onChange}>
                  <Text style={styles.timeText}>
                    {item.value.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </Pressable>
              ) : (
                <Pressable>
                  <Text style={styles.buttonText}>View</Text>
                </Pressable>
              )}
            </Animated.View>
          ))}
        </Animated.View>
      ))}
      
      {showTimePicker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={notificationTime}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  buttonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
});