import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { TableRow, TableCell, IconButton, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

CustomersTableRow.propTypes = {
  row: PropTypes.object,
  branchesData: PropTypes.array,
};

export default function CustomersTableRow({ row, branchesData }) {
  const { email, lastOrder, lastVisitBranchID, totalVisits } = row;
  const { fsDeleteCustomer } = useAuthContext();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (mutateFn) => mutateFn(),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
      enqueueSnackbar(`${email} Deleted Successfully!`);
    },
  });

  const onDeleteHandler = () => mutate(() => fsDeleteCustomer(row.docID));

  const branchName =
    branchesData?.find((branch) => branch.docID === lastVisitBranchID)?.title || 'Unknown Branch';
  const lastOrderDate = lastOrder ? new Date(lastOrder.seconds * 1000).toLocaleString() : null;

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="caption">{email}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{lastOrderDate}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{branchName}</Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2">{totalVisits}</Typography>
      </TableCell>

      <TableCell align="center">
        <IconButton onClick={onDeleteHandler} sx={{p:0, m:0}}>
          <Iconify icon="tabler:trash" sx={{ color: 'error.main', width: 21, height: 21 }} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
