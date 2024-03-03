import { useRef } from 'react';
import PropTypes from 'prop-types';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Dialog, TextField, Typography, DialogContent } from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

DialogAddComment.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  addMeal: PropTypes.func,
};

export default function DialogAddComment({ isOpen, onClose, addMeal }) {
  const commentRef = useRef();

  const handleMealAddWithComment = () => {
    addMeal(+1, commentRef.current.value);
  };

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
          <Box>
            <LoadingButton
              type="submit"
              variant="contained"
              color="success"
              onClick={handleMealAddWithComment}
              startIcon={<Iconify icon="mdi:hamburger-plus" />}
            >
              Add Meal
            </LoadingButton>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
