import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
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
import { delay } from 'src/utils/promise-delay';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

RemoveMealDialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  sectionInfo: PropTypes.object,
  mealInfo: PropTypes.object,
};

function RemoveMealDialog({ isOpen, onClose, sectionInfo, mealInfo }) {
  const { id: menuID } = useParams();
  const { fsUpdateSection } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      await delay(1000);
      const updatedMeals = sectionInfo.meals.filter(
        (sectionMeal) => sectionMeal.docID !== mealInfo.docID
      );
      await fsUpdateSection(menuID, sectionInfo.docID, {
        meals: updatedMeals,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sections', menuID]);
      queryClient.invalidateQueries(['section', sectionInfo.docID, menuID]);
      enqueueSnackbar('Meal removed successfully', { variant: 'success' });
      onClose();
    },
  });

  return (
    <Dialog fullWidth maxWidth="sm" open={isOpen} onClose={onClose} scroll="paper">
      <DialogTitle>Remove Meal from Section</DialogTitle>

      <DialogContent sx={{ mb: 2 }}>
        <Typography>
          Are you sure you want to remove
          <Box component="span" sx={{ mx: 0.5 }}>
            <Label variant="soft" color="error">
              {mealInfo?.title}
            </Label>
          </Box>
          meal from the
          <Box component="span" sx={{ mx: 0.5 }}>
            <Label variant="soft" color="success">
              {sectionInfo?.title}
            </Label>
          </Box>
          section
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions>
        <LoadingButton
          type="submit"
          variant="contained"
          color="error"
          onClick={() => mutate()}
          loading={isPending}
        >
          Remove Meal
        </LoadingButton>
        <Button color="inherit" variant="outlined" onClick={onClose}>
          close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RemoveMealDialog;
