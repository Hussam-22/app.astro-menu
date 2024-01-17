import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { LoadingButton } from '@mui/lab';
import {
  Select,
  Dialog,
  Button,
  MenuItem,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { rdxUpdateTable } from 'src/redux/slices/branch';

ChangeDefaultMenu.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
};

function ChangeDefaultMenu({ isOpen, onClose }) {
  const { id: branchID } = useParams();
  const dispatch = useDispatch();
  const menusList = useSelector((state) => state.menu.menus);
  const { fsChangeMenuForAllTables } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(menusList[0].id);

  const onMenuChange = (e) => {
    setSelectedMenu(e.target.value);
  };

  const changeMenu = () => {
    setIsLoading(true);

    fsChangeMenuForAllTables(branchID, selectedMenu);
    dispatch(rdxUpdateTable(selectedMenu));

    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Change Menu for All Tables</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Select
          value={selectedMenu}
          onChange={onMenuChange}
          size="small"
          variant="filled"
          fullWidth
        >
          {menusList.map((menu) => (
            <MenuItem key={menu.id} value={menu.id}>
              {menu.title}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <LoadingButton variant="contained" color="success" onClick={changeMenu} loading={isLoading}>
          Save
        </LoadingButton>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ChangeDefaultMenu;
