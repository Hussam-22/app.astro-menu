import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import StaffLayout from 'src/layouts/staff/layout';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const StaffPage = lazy(() => import('src/pages/staff/staff-page'));

// ----------------------------------------------------------------------

export const staffRoutes = [
  {
    element: (
      <StaffLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </StaffLayout>
    ),
    children: [{ path: 'staff/:businessProfileID/:staffID', element: <StaffPage /> }],
  },
];
