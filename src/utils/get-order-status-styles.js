export function getOrderStatusStyle(isInKitchen, isReadyToServe, theme) {
  if (isInKitchen && !isReadyToServe)
    return {
      color: theme.palette.warning.main,
      labelColor: 'warning',
      icon: 'ph:cooking-pot-light',
      status: 'Preparing Order...',
    };
  if (isInKitchen && isReadyToServe)
    return {
      color: theme.palette.info.main,
      labelColor: 'info',
      icon: 'dashicons:food',
      status: 'Ready to Serve',
    };
  return 'none';
}
