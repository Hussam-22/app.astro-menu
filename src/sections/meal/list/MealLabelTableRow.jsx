import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Stack,
  Switch,
  Divider,
  TableRow,
  TableCell,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

MealLabelTableRow.propTypes = {
  row: PropTypes.object,
};

export default function MealLabelTableRow({ row }) {
  const { docID, title, isActive } = row;
  const { fsUpdateMealLabel, fsDeleteMealLabel } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (mealIDs) => {
      const affectedMealsIDs = mealIDs.map((mealID) => `meal-${mealID}`);
      const queryKeys = ['meal-labels', 'meals', ...affectedMealsIDs];
      queryClient.invalidateQueries(queryKeys);
      enqueueSnackbar('Label Updated Successfully!');
    },
  });

  const onStatusChangeHandler = () =>
    mutate(() => fsUpdateMealLabel({ ...row, isActive: !row.isActive }));

  const onDeleteLabelHandler = () => mutate(() => fsDeleteMealLabel(row.docID));

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <ListItemText
          primary={title}
          secondary={docID}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
        />
      </TableCell>

      <TableCell align="center">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          divider={<Divider flexItem orientation="vertical" sx={{ borderStyle: 'dashed' }} />}
        >
          <Label
            variant="soft"
            color={isActive ? 'success' : 'error'}
            sx={{ textTransform: 'capitalize' }}
          >
            {isActive ? 'Active' : 'Hidden'}
          </Label>

          {isPending ? (
            <CircularProgress size={20} />
          ) : (
            <Switch checked={row.isActive} aria-label="Status" onClick={onStatusChangeHandler} />
          )}

          <IconButton onClick={onDeleteLabelHandler}>
            <Iconify icon="tabler:trash" sx={{ color: 'error.main', width: 24, height: 24 }} />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
