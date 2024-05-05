import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// layouts
import QrMenuLayout from 'src/layouts/qr-menu/layout';
import QrMenuHomePage from 'src/pages/qr-menu/home-page';
// components
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const QrMenuPage = lazy(() => import('src/pages/qr-menu/qr-menu'));

// ----------------------------------------------------------------------

export const qrMenuRoutes = [
  {
    path: 'qr-menu/:businessProfileID/:branchID/:tableID',
    element: (
      <QrMenuLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </QrMenuLayout>
    ),
    children: [
      { element: <QrMenuHomePage />, index: true },
      { path: 'menu', element: <QrMenuPage /> },
    ],
  },
];
