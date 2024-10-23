import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Button,
  Dialog,
  TextField,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';

MenuNewDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

function MenuNewDialog({ isOpen, onClose }) {
  const { fsAddNewMenu } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await delay(1000);
      await fsAddNewMenu({ title: inputValue.trim() });
    },
    onSuccess: () => {
      enqueueSnackbar('New menu added!');
      queryClient.invalidateQueries(['menus']);
      setTimeout(() => {
        onClose();
      }, 100);
    },
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Add New Menu</DialogTitle>
      <DialogContent>
        <TextField
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
          label="Menu Title"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          loading={isPending}
          variant="contained"
          color="secondary"
          onClick={mutate}
          disabled={inputValue.trim() === ''}
        >
          Add
        </LoadingButton>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default MenuNewDialog;
