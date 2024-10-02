import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Stack,
  Switch,
  Tooltip,
  Divider,
  TableRow,
  TableCell,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

MealLabelTableRow.propTypes = {
  row: PropTypes.object,
};

export default function MealLabelTableRow({ row }) {

  console.log(row);
  

  const { title, isActive } = row;
  const { fsUpdateMealLabel, fsDeleteMealLabel } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isPending } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: (mealIDs) => {
      // const affectedMealsIDs = mealIDs.map((mealID) => `meal-${mealID}`);
      // const queryKeys = ['meal-labels', 'meals', ...affectedMealsIDs];
      // queryClient.invalidateQueries(queryKeys);
      queryClient.invalidateQueries(['meal-labels']);
      queryClient.invalidateQueries(['meals']);
      queryClient.invalidateQueries(['meal']);
      enqueueSnackbar('Label Updated Successfully!');
    },
  });

  const onStatusChangeHandler = () =>
    mutate(() => fsUpdateMealLabel({ ...row, isActive: !row.isActive }));

  const onDeleteLabelHandler = () => mutate(() => fsDeleteMealLabel(row.docID));

  return (
    <TableRow hover>
      <TableCell>
        <Stack direction="column" spacing={1}>
          <Typography variant="overline">{title}</Typography>
          {row?.translation && (
            <Stack direction="row" spacing={1}>
              {Object.entries(row.translation).map(([key, value]) => (
                <Label
                  variant="soft"
                  color="info"
                  sx={{ textTransform: 'capitalize' }}
                  key={key}
                  size="small"
                >
                  {value.title}
                </Label>
              ))}
            </Stack>
          )}
        </Stack>
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
            <Tooltip title="disabling the label will remove it from all meals, this is helpful if you want to temporary stop using this meal label and hide it from customers">
              <Switch checked={row.isActive} aria-label="Status" onClick={onStatusChangeHandler} />
            </Tooltip>
          )}

          <IconButton onClick={onDeleteLabelHandler}>
            <Iconify icon="tabler:trash" sx={{ color: 'error.main', width: 24, height: 24 }} />
          </IconButton>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
