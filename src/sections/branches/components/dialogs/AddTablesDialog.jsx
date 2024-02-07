import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Stack,
  Dialog,
  Button,
  Select,
  MenuItem,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

AddTablesDialog.propTypes = {
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
};

function AddTablesDialog({ isOpen, onClose }) {
  const { id: branchID } = useParams();
  const countRef = useRef();
  const menuRef = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { fsAddBatchTablesToBranch, fsGetAllMenus } = useAuthContext();
  const queryClient = useQueryClient();

  const onMenuChange = (e) => {
    setSelectedMenu(e.target.value);
  };

  const { data: menusList = [] } = useQuery({
    queryKey: ['menus'],
    queryFn: () => fsGetAllMenus(),
  });
  const [selectedMenu, setSelectedMenu] = useState(menusList?.[0]?.docID || '');

  const { mutate, isPending } = useMutation({
    mutationFn: () => fsAddBatchTablesToBranch(branchID, selectedMenu),
    onSuccess: () => {
      queryClient.invalidateQueries(['branch-tables', branchID]);
      enqueueSnackbar('Tables Added Successfully !!');
      onClose();
    },
  });

  const onAddTablesHandler = () => mutate();

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Add multiple tables to branch</DialogTitle>
      <DialogContent sx={{ mt: 3 }}>
        <Stack direction="column" spacing={2}>
          <TextField
            fullWidth
            variant="filled"
            label="How many tables? (Number only)"
            type="number"
            inputRef={countRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <LoadingButton
                    onClick={onAddTablesHandler}
                    variant="text"
                    loading={isPending}
                    fullWidth
                  >
                    Add Tables
                  </LoadingButton>
                </InputAdornment>
              ),
            }}
          />

          {menusList.length !== 0 && (
            <Select
              label="Select Menu"
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
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddTablesDialog;
