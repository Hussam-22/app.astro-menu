import PropTypes from 'prop-types';

import { Button, TableRow, TableCell } from '@mui/material';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

MenusTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function MenusTableRow({ row, onEditRow }) {
  const { title, isActive, lastUpdatedAt } = row;

  const lastUpdateDate = new Date(lastUpdatedAt.seconds * 1000).toDateString();
  const lastUpdateTime = new Date(lastUpdatedAt.seconds * 1000).toLocaleTimeString();

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="text" onClick={onEditRow}>
          {title}
        </Button>
      </TableCell>

      <TableCell align="center">{row?.meals?.length || 0}</TableCell>
      <TableCell align="center">{`${lastUpdateDate} | ${lastUpdateTime}`}</TableCell>
      <TableCell align="center">
        <Label
          variant="filled"
          color={(!isActive && 'error') || (isActive && 'success')}
          sx={{ textTransform: 'capitalize' }}
        >
          {isActive ? 'Active' : 'Disabled'}
        </Label>
      </TableCell>
    </TableRow>
  );
}
