// utils

// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
  QR_MENU: '/qr-menu',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/403',
  page404: '/404',
  page500: '/500',
  // AUTH
  auth: {
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    branches: {
      root: `${ROOTS.DASHBOARD}/branch`,
      list: `${ROOTS.DASHBOARD}/branch/list`,
      new: `${ROOTS.DASHBOARD}/branch/new`,
      manage: (id) => `${ROOTS.DASHBOARD}/branch/${id}/manage`,
    },
    menu: {
      root: `${ROOTS.DASHBOARD}/menu`,
      list: `${ROOTS.DASHBOARD}/menu/list`,
      new: `${ROOTS.DASHBOARD}/menu/new`,
      manage: (id) => `${ROOTS.DASHBOARD}/menu/${id}/manage`,
    },
    meal: {
      root: `${ROOTS.DASHBOARD}/meal`,
      list: `${ROOTS.DASHBOARD}/meal/list`,
      new: `${ROOTS.DASHBOARD}/meal/new`,
      manage: (id) => `${ROOTS.DASHBOARD}/meal/${id}/manage`,
      labels: `${ROOTS.DASHBOARD}/meal/labels`,
    },
    staffs: {
      root: `${ROOTS.DASHBOARD}/staffs`,
      list: `${ROOTS.DASHBOARD}/staffs/list`,
      new: `${ROOTS.DASHBOARD}/staffs/new`,
      manage: (id) => `${ROOTS.DASHBOARD}/staffs/${id}/manage`,
    },
    businessProfile: {
      manage: (id) => `${ROOTS.DASHBOARD}/business-profile/${id}/manage`,
    },
    subscription: {
      root: `${ROOTS.DASHBOARD}/subscription-info`,
    },
  },
};
