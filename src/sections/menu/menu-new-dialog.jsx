import PropTypes from 'prop-types';

import { Dialog, IconButton, DialogTitle, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
import MenuNewEditForm from 'src/sections/menu/MenuNewEditForm';

MenuNewDialog.propTypes = { isOpen: PropTypes.bool, onClose: PropTypes.func };

function MenuNewDialog({ isOpen, onClose }) {
  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle sx={{ position: 'relative' }}>Add New Menu</DialogTitle>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Iconify icon="carbon:close-filled" />
      </IconButton>
      <DialogContent sx={{ p: 3 }}>
        <MenuNewEditForm />
      </DialogContent>
    </Dialog>
  );
}

export default MenuNewDialog;
