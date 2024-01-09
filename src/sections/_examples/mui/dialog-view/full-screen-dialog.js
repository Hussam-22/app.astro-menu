import { forwardRef } from 'react';

// @mui
import List from '@mui/material/List';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

// components
import Iconify from 'src/components/iconify';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FullScreenDialog() {
  const dialog = useBoolean();

  return (
    <>
      <Button variant="outlined" color="error" onClick={dialog.onTrue}>
        Full Screen Dialogs
      </Button>

      <Dialog
        fullScreen
        open={dialog.value}
        onClose={dialog.onFalse}
        TransitionComponent={Transition}
      >
        <AppBar position="relative" color="default">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={dialog.onFalse}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>

            <Typography variant="h6" sx={{ flex: 1, ml: 2 }}>
              Sound
            </Typography>

            <Button autoFocus color="inherit" variant="contained" onClick={dialog.onFalse}>
              Save
            </Button>
          </Toolbar>
        </AppBar>

        <List>
          <ListItemButton>
            <ListItemText primary="Phone ringtone" secondary="Titania" />
          </ListItemButton>

          <Divider />

          <ListItemButton>
            <ListItemText primary="Default notification ringtone" secondary="Tethys" />
          </ListItemButton>
        </List>
      </Dialog>
    </>
  );
}
