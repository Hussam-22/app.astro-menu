import { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  Select,
  MenuItem,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

ChangeDefaultMenu.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
};

function ChangeDefaultMenu({ isOpen, onClose }) {
  const { id: branchID } = useParams();
  const { fsChangeMenuForAllTables, fsGetAllMenus } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
  });
  const [selectedMenu, setSelectedMenu] = useState();

  const onMenuChange = (e) => {
    setSelectedMenu(e.target.value);
  };

  const changeMenu = () => {
    setIsLoading(true);

    fsChangeMenuForAllTables(branchID, selectedMenu);

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
            <MenuItem key={menu.docID} value={menu.docID}>
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
