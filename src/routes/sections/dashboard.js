import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// layouts
import DashboardLayout from 'src/layouts/dashboard';
// auth
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// BRANCH
const BranchesListPage = lazy(() => import('src/pages/dashboard/branch/branch-list-page'));
const BranchManagePage = lazy(() => import('src/pages/dashboard/branch/branch-manage-page'));
const BranchNewPage = lazy(() => import('src/pages/dashboard/branch/branch-new-page'));

// MENU
const MenuListPage = lazy(() => import('src/pages/dashboard/menu/menu-list-page'));
const MenuManagePage = lazy(() => import('src/pages/dashboard/menu/menu-manage-page'));

// MEAL
const MealListPage = lazy(() => import('src/pages/dashboard/meal/meal-list-page'));
const MealManagePage = lazy(() => import('src/pages/dashboard/meal/meal-manage-page'));
const MealNewPage = lazy(() => import('src/pages/dashboard/meal/meal-new-page'));

// Meal Labels
const MealLabelsPage = lazy(() => import('src/pages/dashboard/meal-labels/meal-labels-page'));

// STAFFS
const StaffsListPage = lazy(() => import('src/pages/dashboard/staffs/staffs-list-page'));
const StaffsManagePage = lazy(() => import('src/pages/dashboard/staffs/staffs-manage-page'));
const StaffsNewPage = lazy(() => import('src/pages/dashboard/staffs/staffs-new-page'));

// BUSINESS PROFILE
const BusinessProfileManagePage = lazy(() =>
  import('src/pages/dashboard/business-profile/branch-manage-page')
);
const TranslationSettingsPage = lazy(() =>
  import('src/pages/dashboard/translation-settings/translation-settings-page')
);

// SUBSCRIPTION INFO
const SubscriptionInfoPage = lazy(() =>
  import('src/pages/dashboard/subscription-payment/subscription-info-page')
);

// CUSTOMERS
const CustomersPage = lazy(() =>
  import('src/pages/dashboard/customers/customers-page')
);

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <RoleBasedGuard hasContent sx={{ py: 10 }}>
              <Outlet />
            </RoleBasedGuard>
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      // { element: <IndexPage />, index: true },
      { element: <BranchesListPage />, index: true },
      {
        path: 'branch',
        children: [
          { element: <BranchesListPage />, index: true },
          { path: 'list', element: <BranchesListPage /> },
          { path: 'new', element: <BranchNewPage /> },
          { path: ':id/manage', element: <BranchManagePage /> },
        ],
      },
      {
        path: 'menu',
        children: [
          { element: <MenuListPage />, index: true },
          { path: 'list', element: <MenuListPage /> },
          { path: ':id/manage', element: <MenuManagePage /> },
        ],
      },

      {
        path: 'meal',
        children: [
          { element: <MealListPage />, index: true },
          { path: 'list', element: <MealListPage /> },
          { path: 'new', element: <MealNewPage /> },
          { path: ':id/manage', element: <MealManagePage /> },
        ],
      },
      {
        path: 'labels',
        element: <MealLabelsPage />,
      },
      {
        path: 'staffs',
        children: [
          { element: <StaffsListPage />, index: true },
          { path: 'list', element: <StaffsListPage /> },
          { path: 'new', element: <StaffsNewPage /> },
          { path: ':id/manage', element: <StaffsManagePage /> },
        ],
      },
      {
        path: 'translation-settings',
        element: <TranslationSettingsPage />,
      },
      { path: 'business-profile/manage', element: <BusinessProfileManagePage /> },
      { path: 'subscription-info', element: <SubscriptionInfoPage /> },
      { path: 'customers', element: <CustomersPage /> },
    ],
  },
];
