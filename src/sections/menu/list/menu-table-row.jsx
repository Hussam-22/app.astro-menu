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

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="text" onClick={() => onEditRow(row)}>
          {title}
        </Button>
      </TableCell>

      <TableCell align="center">{row?.meals?.length || 0}</TableCell>
      <TableCell align="center">{lastUpdatedAt}</TableCell>
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
