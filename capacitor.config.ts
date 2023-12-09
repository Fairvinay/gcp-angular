import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budget.client',
  appName: 'budget-client',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [],
  
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  }
};

export default config;

/* remove allowNa
"192.168.1.4",
	"df2b-116-74-136-62.ngrok-free.app",
        "meta-falcon-407301.el.r.appspot.com"

*/
