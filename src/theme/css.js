// @mui
import { alpha } from '@mui/material/styles';
import { dividerClasses } from '@mui/material/Divider';
import { menuItemClasses } from '@mui/material/MenuItem';
import { checkboxClasses } from '@mui/material/Checkbox';
import { autocompleteClasses } from '@mui/material/Autocomplete';

// ----------------------------------------------------------------------

export const paper = ({ theme, bgcolor, dropdown }) => ({
  ...bgBlur({
    blur: 20,
    opacity: 0.9,
    color: theme.palette.background.paper,
    ...(!!bgcolor && {
      color: bgcolor,
    }),
  }),
  backgroundImage: 'url(/assets/cyan-blur.png), url(/assets/red-blur.png)',
  backgroundRepeat: 'no-repeat, no-repeat',
  backgroundPosition: 'top right, left bottom',
  backgroundSize: '50%, 50%',
  ...(dropdown && {
    padding: theme.spacing(0.5),
    boxShadow: theme.customShadows.dropdown,
    borderRadius: theme.shape.borderRadius * 1.25,
  }),
});

// ----------------------------------------------------------------------

export const menuItem = (theme) => ({
  ...theme.typography.body2,
  padding: theme.spacing(0.75, 1),
  borderRadius: theme.shape.borderRadius * 0.75,
  '&:not(:last-of-type)': {
    marginBottom: 4,
  },
  [`&.${menuItemClasses.selected}`]: {
    fontWeight: theme.typography.fontWeightSemiBold,
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${checkboxClasses.root}`]: {
    padding: theme.spacing(0.5),
    marginLeft: theme.spacing(-0.5),
    marginRight: theme.spacing(0.5),
  },
  [`&.${autocompleteClasses.option}[aria-selected="true"]`]: {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`&+.${dividerClasses.root}`]: {
    margin: theme.spacing(0.5, 0),
  },
});

// ----------------------------------------------------------------------

export function bgBlur(props) {
  const color = props?.color || '#000000';
  const blur = props?.blur || 6;
  const opacity = props?.opacity || 0.8;
  const imgUrl = props?.imgUrl;

  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity),
      },
    };
  }

  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity),
  };
}

// ----------------------------------------------------------------------

export function bgGradient(props) {
  const direction = props?.direction || 'to bottom';
  const startColor = props?.startColor;
  const endColor = props?.endColor;
  const imgUrl = props?.imgUrl;
  const color = props?.color;

  if (imgUrl) {
    return {
      background: `linear-gradient(${direction}, ${startColor || color}, ${
        endColor || color
      }), url(${imgUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
    };
  }

  return {
    background: `linear-gradient(${direction}, ${startColor}, ${endColor})`,
  };
}

// ----------------------------------------------------------------------

export function textGradient(value) {
  return {
    background: `-webkit-linear-gradient(${value})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };
}

// ----------------------------------------------------------------------

export const hideScroll = {
  x: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowX: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  y: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
};

export const blinkingElement = {
  animation: 'blink 2s infinite',
  '@keyframes blink': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
};

export function blinkingBorder(color, id) {
  return {
    animation: `${id} 2s infinite`,
    boxShadow: `2px 2px 0 0 ${color}`,
    border: `solid 2px ${color}`,
    borderRadius: 3,
    [`@keyframes ${id}`]: {
      '0%': {
        border: `solid 2px ${color}`,
        boxShadow: `2px 2px 0 0 ${color}`,
      },
      '50%': {
        border: `solid 2px ${color}`,
        boxShadow: '2px 2px 0 0 transparent',
      },
      '100%': {
        border: `solid 2px ${color}`,
        boxShadow: `2px 2px 0 0 ${color}`,
      },
    },
  };
}

export function blinkingBg(color) {
  return {
    animation: 'blinkingBg 2s infinite',
    bgcolor: ` ${color}`,
    '@keyframes blinkingBg': {
      '0%': {
        bgcolor: `${color}`,
      },
      '50%': {
        bgcolor: 'transparent',
      },
      '100%': {
        bgcolor: `${color}`,
      },
    },
  };
}

export function shakingAnimation() {
  return {
    animation: ' shake 0.5s',
    '@keyframes shake': {
      '0%': { transform: 'translateX(0)' },
      '25%': { transform: 'translateX(-5px)' },
      '50%': { transform: 'translateX(5px)' },
      '75%': { transform: 'translateX(-5px)' },
      '100%': { transform: 'translateX(0)' },
    },
  };
}
