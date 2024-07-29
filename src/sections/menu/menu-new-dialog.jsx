import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import { Dialog, TextField, IconButton, DialogTitle, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';
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

  console.log(isPending);

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose}>
      <DialogTitle>Add New Menu</DialogTitle>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Iconify icon="carbon:close-filled" />
      </IconButton>
      <DialogContent sx={{ pb: 2, px: 2 }}>
        <TextField
          onChange={(e) => setInputValue(e.target.value)}
          fullWidth
          label="Menu Title"
          InputProps={{
            endAdornment: (
              <LoadingButton
                loading={isPending}
                variant="contained"
                color="success"
                onClick={mutate}
                disabled={inputValue.trim() === ''}
              >
                Add
              </LoadingButton>
            ),
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default MenuNewDialog;
