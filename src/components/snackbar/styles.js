import { MaterialDesignContent } from 'notistack';

// @mui
import { alpha, styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

export const StyledNotistack = styled(MaterialDesignContent)(({ theme }) => {
  const isLight = theme.palette.mode === 'light';

  return {
    '& #notistack-snackbar': {
      ...theme.typography.subtitle2,
      padding: 0,
      flexGrow: 1,
    },
    '&.notistack-MuiContent': {
      padding: theme.spacing(0.5),
      paddingRight: theme.spacing(2),
      color: theme.palette.text.primary,
      boxShadow: theme.customShadows.z8,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
    },
    '&.notistack-MuiContent-default': {
      padding: theme.spacing(1),
      color: isLight ? theme.palette.common.white : theme.palette.grey[800],
      backgroundColor: isLight ? theme.palette.grey[800] : theme.palette.common.white,
    },
    '&.notistack-MuiContent-info': {
      backgroundColor: theme.palette.info.lighter,
    },
    '&.notistack-MuiContent-success': {
      backgroundColor: theme.palette.success.lighter,
    },
    '&.notistack-MuiContent-warning': {
      backgroundColor: theme.palette.warning.lighter,
    },
    '&.notistack-MuiContent-error': {
      backgroundColor: theme.palette.error.lighter,
    },
    '&.notistack-MuiContent-inKitchen': {
      backgroundColor: theme.palette.error.lighter,
    },
    '&.notistack-MuiContent-isReadyToServe': {
      backgroundColor: theme.palette.info.lighter,
    },
  };
});

// ----------------------------------------------------------------------

export const StyledIcon = styled('span')(({ color, theme }) => ({
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(1.5),
  color: theme.palette[color].dark,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette[color].main, 0.16),
}));
