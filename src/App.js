import 'react-quill/dist/quill.snow.css';
import 'simplebar-react/dist/simplebar.min.css';
import 'react-lazy-load-image-component/src/effects/blur.css';

import 'src/locales/i18n';
import ThemeProvider from 'src/theme';
import Router from 'src/routes/sections';
import ProgressBar from 'src/components/progress-bar';
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
import { SystemContextProvider } from 'src/context/state-context';
import { AuthProvider, AuthConsumer } from 'src/auth/context/firebase';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <SystemContextProvider>
      <AuthProvider>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'light', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'bold', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: false,
          }}
        >
          <ThemeProvider>
            <SnackbarProvider>
              <SettingsDrawer />
              <ProgressBar />
              <AuthConsumer>
                <Router />
              </AuthConsumer>
            </SnackbarProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </SystemContextProvider>
  );
}
