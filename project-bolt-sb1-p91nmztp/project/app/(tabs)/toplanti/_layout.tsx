import { Stack } from 'expo-router';

export default function ToplantiLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Toplantı Detayı',
          headerShown: true,
          headerTintColor: '#007AFF',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}