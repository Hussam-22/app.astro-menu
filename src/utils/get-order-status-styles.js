export function getOrderStatusStyle(isInKitchen, isReadyToServe, theme) {
  if (isInKitchen)
    return {
      color: theme.palette.warning.main,
      labelColor: 'warning',
      icon: 'ph:cooking-pot-light',
      status: 'Preparing Order...',
    };
  if (isReadyToServe)
    return {
      color: theme.palette.info.main,
      labelColor: 'info',
      icon: 'dashicons:food',
      status: 'Ready to Serve',
    };
  return 'none';
}
