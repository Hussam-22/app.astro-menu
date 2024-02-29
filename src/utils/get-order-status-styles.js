export function getOrderStatusStyle(isInKitchen, isReadyToServe, theme) {
  if (isReadyToServe)
    return {
      color: theme.palette.info.main,
      labelColor: 'info',
      icon: 'dashicons:food',
      status: 'Ready to Serve',
    };
  if (isInKitchen)
    return {
      color: theme.palette.warning.main,
      labelColor: 'warning',
      icon: 'ph:cooking-pot-light',
      status: 'Preparing Order...',
    };

  return 'none';
}
