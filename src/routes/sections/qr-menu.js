import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

// layouts
import QrMenuLayout from 'src/layouts/qr-menu/layout';
import QrMenuHomePage from 'src/pages/qr-menu/home-page';
// components

// ----------------------------------------------------------------------

export const QrMenuPage = lazy(() => import('src/pages/qr-menu/qr-menu'));

// ----------------------------------------------------------------------

export const qrMenuRoutes = [
  {
    path: 'qr-menu/:businessProfileID/:branchID/:tableID',
    element: (
      <QrMenuLayout>
        <Outlet />
      </QrMenuLayout>
    ),
    children: [
      { element: <QrMenuHomePage />, index: true },
      { path: 'menu', element: <QrMenuPage /> },
    ],
  },
];
