// i18n
// map
import 'mapbox-gl/dist/mapbox-gl.css';
// slick-carousel
import 'slick-carousel/slick/slick.css';
// editor
import 'react-quill/dist/quill.snow.css';
import 'slick-carousel/slick/slick-theme.css';
// lightbox
import 'yet-another-react-lightbox/styles.css';
// scroll bar
import 'simplebar-react/dist/simplebar.min.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';

import 'src/locales/i18n';

// ----------------------------------------------------------------------

// @mui
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// theme
import ThemeProvider from 'src/theme';
// routes
import Router from 'src/routes/sections';
// redux
import ReduxProvider from 'src/redux/redux-provider';
// components
import ProgressBar from 'src/components/progress-bar';
import MotionLazy from 'src/components/animate/motion-lazy';
// hooks
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
// auth
import { AuthProvider, AuthConsumer } from 'src/auth/context/firebase';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

// import { AuthProvider, AuthConsumer } from 'src/auth/context/jwt';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/auth0';
// import { AuthProvider, AuthConsumer } from 'src/auth/context/amplify';

// ----------------------------------------------------------------------

export default function App() {
  const charAt = `

  ░░░    ░░░ 
  ▒▒▒▒  ▒▒▒▒ 
  ▒▒ ▒▒▒▒ ▒▒ 
  ▓▓  ▓▓  ▓▓ 
  ██      ██ 
  
  `;

  // console.info(`%c${charAt}`, 'color: #5BE49B');

  useScrollToTop();

  return (
    <AuthProvider>
      <ReduxProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light', // 'light' | 'dark'
              themeDirection: 'ltr', //  'rtl' | 'ltr'
              themeContrast: 'default', // 'default' | 'bold'
              themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <SettingsDrawer />
                  <ProgressBar />
                  <AuthConsumer>
                    <Router />
                  </AuthConsumer>
                </SnackbarProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </AuthProvider>
  );
}
