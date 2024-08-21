import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

// @mui
import { Link, TableRow, TableCell, Typography } from '@mui/material';

import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

TableDataRows.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function TableDataRows({ row, onEditRow }) {
  const { fsGetBranch } = useAuthContext();
  const { docID, fullname, branchID, type, isActive, lastLogIn } = row;

  const loginInfo = lastLogIn?.seconds ? new Date(lastLogIn.seconds * 1000).toDateString() : '';

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
    enabled: branchID !== undefined,
  });

  const statusLabel = isActive ? (
    <Label color="success">Active</Label>
  ) : (
    <Label color="error">Disabled</Label>
  );

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Link
          onClick={onEditRow}
          sx={{ cursor: 'pointer', typography: 'body1', color: 'secondary.main', fontWeight: 600 }}
        >
          {fullname}
        </Link>
      </TableCell>

      <TableCell align="center">{branchInfo.title}</TableCell>
      <TableCell align="center">
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {type}
        </Typography>
      </TableCell>
      <TableCell align="center">{loginInfo}</TableCell>
      <TableCell align="center">{statusLabel}</TableCell>
    </TableRow>
  );
}
