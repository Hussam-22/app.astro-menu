import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// layouts
import QrMenuLayout from 'src/layouts/qr-menu/layout';
// components
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const QrMenuPage = lazy(() => import('src/pages/qr-menu/qr-menu'));

// ----------------------------------------------------------------------

export const qrMenuRoutes = [
  {
    element: (
      <QrMenuLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </QrMenuLayout>
    ),
    children: [{ path: 'qr-menu/:userID/:branchID/:tableID', element: <QrMenuPage /> }],
  },
];
