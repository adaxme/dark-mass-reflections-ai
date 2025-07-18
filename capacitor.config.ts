import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.07f3fc897a194f55b308b5adb9c334a9',
  appName: 'dark-mass-reflections-ai',
  webDir: 'dist',
  server: {
    url: 'https://07f3fc89-7a19-4f55-b308-b5adb9c334a9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;