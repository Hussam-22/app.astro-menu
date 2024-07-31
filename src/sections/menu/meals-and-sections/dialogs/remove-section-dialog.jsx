import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Dialog,
  Button,
  Divider,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import { delay } from 'src/utils/promise-delay';

// ----------------------------------------------------------------------

RemoveSectionDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  sectionInfo: PropTypes.object,
};

/* 
! the problem : when you try to remove section, "RemoveSectionDialog" component is still mounted but its parent component "SectionMeals" was removed/unmounted,

react will rerender "RemoveSectionDialog" component after "deleteSectionHandler" is triggered, but when it reaches "useSelector", the section was already removed, and it cant retrieve data from the removed section
*/

function RemoveSectionDialog({ isOpen, onClose, sectionInfo }) {
  const { id: menuID } = useParams();
  const { fsDeleteSection } = useAuthContext();
  const queryClient = useQueryClient();

  const { isPending, mutate, error } = useMutation({
    mutationFn: async () => {
      await delay(1000);
      await fsDeleteSection(
        menuID,
        sectionInfo.docID,
        sectionInfo.order,
        sectionInfo.meals.map((meal) => meal.docID)
      );
    },
    onSuccess: () => {
      const queryKeys = ['sections', menuID];
      queryClient.invalidateQueries(queryKeys);
      onClose();
    },
  });

  const deleteSectionHandler = () => mutate();

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Remove Section</DialogTitle>

      <DialogContent sx={{ mb: 2 }}>
        <Typography>
          Are you sure you want to remove
          <Box component="span" sx={{ mx: 1 }}>
            <Label variant="filled" color="warning">
              {sectionInfo.title}
            </Label>
          </Box>
          section from the menu
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions>
        <LoadingButton
          type="submit"
          variant="contained"
          color="error"
          onClick={deleteSectionHandler}
          loading={isPending}
        >
          Remove Section
        </LoadingButton>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveSectionDialog;
