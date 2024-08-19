export function remToPx(value) {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value) {
  return `${value / 16}rem`;
}

export function responsiveFontSizes({ sm, md, lg }) {
  return {
    '@media (min-width:600px)': {
      fontSize: pxToRem(sm),
    },
    '@media (min-width:900px)': {
      fontSize: pxToRem(md),
    },
    '@media (min-width:1200px)': {
      fontSize: pxToRem(lg),
    },
  };
}

const primaryFont = 'Public Sans, Vazirmatn, sans-serif'; // Google Font
// const secondaryFont = 'CircularStd, sans-serif'; // Local Font

// ----------------------------------------------------------------------

export const typography = {
  fontFamily: primaryFont,
  fontWeightRegular: 300,
  fontWeightMedium: 400,
  fontWeightSemiBold: 500,
  fontWeightBold: 600,
  WebkitFontSmoothing: 'antialiased',
  h1: {
    fontWeight: 600,
    lineHeight: 80 / 64,
    fontSize: pxToRem(38),
    ...responsiveFontSizes({ sm: 38, md: 44, lg: 50, xl: 56 }),
  },
  h2: {
    fontWeight: 600,
    lineHeight: 64 / 48,
    fontSize: pxToRem(30),
    ...responsiveFontSizes({ sm: 30, md: 36, lg: 42, xl: 48 }),
  },
  h3: {
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(22),
    ...responsiveFontSizes({ sm: 22, md: 28, lg: 34, xl: 40 }),
  },
  h4: {
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(18),
    ...responsiveFontSizes({ sm: 18, md: 24, lg: 30, xl: 36 }),
  },
  h5: {
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(16),
    ...responsiveFontSizes({ sm: 16, md: 22, lg: 28, xl: 34 }),
  },
  h6: {
    fontWeight: 500,
    lineHeight: 28 / 18,
    fontSize: pxToRem(14),
    ...responsiveFontSizes({ sm: 14, md: 16, lg: 18, xl: 20 }),
  },
  subtitle1: {
    fontWeight: 400,
    lineHeight: 1.5,
    fontSize: pxToRem(20),
  },
  subtitle2: {
    fontWeight: 400,
    lineHeight: 22 / 14,
    fontSize: pxToRem(14),
  },
  body1: {
    fontWeight: 300,
    lineHeight: 1.5,
    fontSize: pxToRem(14),
  },
  body2: {
    fontWeight: 300,
    lineHeight: 22 / 14,
    fontSize: pxToRem(12),
  },
  caption: {
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    fontWeight: 600,
  },
  overline: {
    fontWeight: 500,
    lineHeight: 1.5,
    fontSize: pxToRem(12),
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 500,
    lineHeight: 24 / 14,
    fontSize: pxToRem(16),
    textTransform: 'unset',
  },
};
