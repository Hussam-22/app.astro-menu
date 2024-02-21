import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import WaiterLayout from 'src/layouts/waiter/layout';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const WaiterPage = lazy(() => import('src/pages/waiter/waiter-page'));

// ----------------------------------------------------------------------

export const waiterRoutes = [
  {
    element: (
      <WaiterLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </WaiterLayout>
    ),
    children: [{ path: 'waiter/:userID/:waiterID', element: <WaiterPage /> }],
  },
];
