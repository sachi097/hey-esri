import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Hey ESRI',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  }
};

export default config;
