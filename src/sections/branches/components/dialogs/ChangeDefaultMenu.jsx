import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  const { enqueueSnackbar } = useSnackbar();
  const { fsChangeMenuForAllTables, fsGetAllMenus } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedMenuID, setSelectedMenuID] = useState('');

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
  });

  const onMenuChange = (e) => {
    setSelectedMenuID(e.target.value);
  };

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => fsChangeMenuForAllTables(branchID, selectedMenuID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-tables', branchID] });
      enqueueSnackbar('Tables Menu were updated successfully !!');
      onClose();
    },
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Change Menu for All Tables</DialogTitle>
      <DialogContent>
        <Select
          value={selectedMenuID}
          onChange={onMenuChange}
          variant="standard"
          fullWidth
          required
        >
          <MenuItem value="" />
          {menusList.map((menu) => (
            <MenuItem key={menu.docID} value={menu.docID}>
              {menu.title}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="success"
          onClick={() => mutate()}
          loading={isPending}
          disabled={!selectedMenuID}
        >
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
