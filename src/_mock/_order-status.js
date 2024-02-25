export const ORDER_STATUS = [
  { value: 0, label: 'Open', customerText: '', color: 'secondary', icon: 'ph:read-cv-logo' },
  {
    value: 1,
    label: 'Start New Order',
    customerText: 'Taking Order',
    color: 'secondary',
    icon: 'dashicons:welcome-write-blog',
  },
  {
    value: 2,
    label: 'Send to Kitchen',
    customerText: 'Preparing In-Kitchen',
    color: 'warning',
    icon: 'ph:cooking-pot-light',
  },
  {
    value: 3,
    label: 'Serve to Customer',
    customerText: 'Food is Served',
    color: 'success',
    icon: 'game-icons:hot-meal',
  },
  {
    value: 4,
    label: 'Collect Payment',
    customerText: 'Paid',
    color: 'success',
    icon: 'ri:check-double-line',
  },
  {
    value: 99,
    label: 'Cancel Order',
    customerText: '',
    color: 'default',
    icon: 'solar:bill-cross-outline5',
  },
];
