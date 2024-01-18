import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import PropTypes from 'prop-types';
import MenuNewEditForm from 'src/sections/@dashboard/menus/manage/menu-info/MenuNewEditForm';

NewMenuDialog.propTypes = { isOpen: PropTypes.bool, onClose: PropTypes.func };

function NewMenuDialog({ isOpen, onClose }) {
  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Add New Menu</DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <MenuNewEditForm />
      </DialogContent>
    </Dialog>
  );
}

export default NewMenuDialog;
