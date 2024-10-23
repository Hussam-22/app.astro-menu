import PropTypes from 'prop-types';

import { Divider } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

// ----------------------------------------------------------------------

export default function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  maxWidth = 'xs',
  closeText,
  ...other
}) {
  return (
    <Dialog fullWidth maxWidth={maxWidth} open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
      <Divider sx={{ mb: 1, mx: 1, borderStyle: 'dashed' }} />
      {content && <DialogContent> {content} </DialogContent>}
      <Divider sx={{ mt: 1, mx: 1, borderStyle: 'dashed' }} />
      <DialogActions>
        <Button variant="soft" onClick={onClose}>
          {closeText}
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  action: PropTypes.node,
  content: PropTypes.node,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  title: PropTypes.string,
  maxWidth: PropTypes.string,
  closeText: PropTypes.string,
};
