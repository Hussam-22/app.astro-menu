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
      border: `2px solid ${theme.palette.info.main}`,
    },
    '&.notistack-MuiContent-success': {
      backgroundColor: theme.palette.common.white,
      border: `2px solid ${theme.palette.success.main}`,
    },
    '&.notistack-MuiContent-warning': {
      border: `2px solid ${theme.palette.warning.main}`,
    },
    '&.notistack-MuiContent-error': {
      border: `2px solid ${theme.palette.error.main}`,
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
