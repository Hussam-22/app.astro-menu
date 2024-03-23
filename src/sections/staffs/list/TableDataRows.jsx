import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

// @mui
import { Link, TableRow, TableCell, Typography, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

TableDataRows.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function TableDataRows({ row, onEditRow }) {
  const { fsGetBranch } = useAuthContext();
  const { docID, fullname, branchID, type, isActive, lastLogIn } = row;

  const loginInfo = new Date(lastLogIn.seconds * 1000).toDateString();

  const { data: branchInfo = {} } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
    enabled: branchID !== undefined,
  });

  const statusLabel = isActive ? (
    <Label color="success" varint="fill">
      Active
    </Label>
  ) : (
    <Label color="error" varint="fill">
      Disabled
    </Label>
  );

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          disabledEffect
          src={`/assets/icons/staff/${type}-body.svg`}
          sx={{ borderRadius: 1.5, width: 34, height: 34, mr: 2 }}
        />

        <ListItemText
          primary={
            <Link onClick={onEditRow} sx={{ cursor: 'pointer' }}>
              {fullname}
            </Link>
          }
          secondary={
            <Link
              noWrap
              variant="caption"
              onClick={onEditRow}
              sx={{ color: 'text.disabled', cursor: 'pointer' }}
            >
              {docID}
            </Link>
          }
        />
      </TableCell>

      <TableCell align="center">{branchInfo.title}</TableCell>
      <TableCell align="center">
        <Typography sx={{ textTransform: 'capitalize' }}>{type}</Typography>
      </TableCell>
      <TableCell align="center">{loginInfo}</TableCell>
      <TableCell align="center">{statusLabel}</TableCell>
    </TableRow>
  );
}
