// ----------------------------------------------------------------------

export const navVerticalConfig = (config) => ({
  itemGap: config?.itemGap || 0,
  iconSize: config?.iconSize || 24,
  currentRole: config?.currentRole,
  itemRootHeight: config?.itemRootHeight || 38,
  itemSubHeight: config?.itemSubHeight || 36,
  itemPadding: config?.itemPadding || '4px 8px 4px 12px',
  itemRadius: config?.itemRadius || 10,
  hiddenLabel: config?.hiddenLabel || false,
});

export const navMiniConfig = (config) => ({
  itemGap: config?.itemGap || 4,
  iconSize: config?.iconSize || 26,
  currentRole: config?.currentRole,
  itemRootHeight: config?.itemRootHeight || 44,
  itemSubHeight: config?.itemSubHeight || 22,
  itemPadding: config?.itemPadding || '6px 0 0 0',
  itemRadius: config?.itemRadius || 4,
  hiddenLabel: config?.hiddenLabel || false,
});

export const navHorizontalConfig = (config) => ({
  itemGap: config?.itemGap || 6,
  iconSize: config?.iconSize || 22,
  currentRole: config?.currentRole,
  itemRootHeight: config?.itemRootHeight || 32,
  itemSubHeight: config?.itemSubHeight || 34,
  itemPadding: config?.itemPadding || '0 6px 0 6px',
  itemRadius: config?.itemRadius || 6,
  hiddenLabel: config?.hiddenLabel || false,
});
