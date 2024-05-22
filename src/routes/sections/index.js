import { Navigate, useRoutes } from 'react-router-dom';

import MainLayout from 'src/layouts/main';
import { useAuthContext } from 'src/auth/hooks';
import { staffRoutes } from 'src/routes/sections/staff';
import { qrMenuRoutes } from 'src/routes/sections/qr-menu';

import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { HomePage, mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';
import { componentsRoutes } from './components';

// ----------------------------------------------------------------------

export default function Router() {
  const { businessProfile } = useAuthContext();

  const filteredDashboardRoutes = dashboardRoutes.map((route) => ({
    ...route,
    children: route.children.filter((child) => child.path !== 'staffs'),
  }));

  console.log(filteredDashboardRoutes);

  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: (
        <MainLayout>
          <HomePage />
        </MainLayout>
      ),
    },

    // Auth routes
    ...authRoutes,
    ...authDemoRoutes,

    // Dashboard routes
    ...filteredDashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,

    // Qr Menu
    ...qrMenuRoutes,

    // Staff
    ...staffRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
