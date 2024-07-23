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
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
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
  },
};
