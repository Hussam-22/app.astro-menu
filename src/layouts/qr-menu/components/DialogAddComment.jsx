import { useRef } from 'react';
import PropTypes from 'prop-types';

import { LoadingButton } from '@mui/lab';
import { Stack, Dialog, TextField, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

DialogAddComment.propTypes = {
  isOpen: PropTypes.bool,
  loading: PropTypes.bool,
  onClose: PropTypes.func,
  addComment: PropTypes.func,
};

export default function DialogAddComment({ isOpen, onClose, addComment, loading }) {
  const commentRef = useRef();

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2} direction="column" sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Any Special Requests?</Typography>
          <TextField
            name="comment"
            placeholder="No Pickles, Medium-well, Extra Cheese..."
            rows={2}
            multiline
            fullWidth
            inputRef={commentRef}
          />

          <LoadingButton
            type="submit"
            variant="contained"
            color="success"
            onClick={() => addComment(commentRef.current.value)}
            loading={loading}
            startIcon={<Iconify icon="mdi:hamburger-plus" />}
          >
            Add Meal
          </LoadingButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
