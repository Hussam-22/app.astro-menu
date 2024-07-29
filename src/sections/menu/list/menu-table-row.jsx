import PropTypes from 'prop-types';

import { Box, TableRow, TableCell, ListItemText } from '@mui/material';

// ----------------------------------------------------------------------

MenusTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function MenusTableRow({ row, onEditRow }) {
  const { title, isActive, lastUpdatedAt, docID, mostOrderedMeals = 0 } = row;

  const lastUpdate = new Date(lastUpdatedAt.seconds * 1000).toLocaleString();

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          onClick={() => onEditRow(docID)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <ListItemText
            primary={title}
            primaryTypographyProps={{ typography: 'body1', fontWeight: 'bold' }}
          />
        </Box>
      </TableCell>

      <TableCell align="center">{mostOrderedMeals}</TableCell>
      <TableCell align="center">{lastUpdate}</TableCell>
      {/* <TableCell align="center">
        <Label
          variant="filled"
          color={(!isActive && 'error') || (isActive && 'success')}
          sx={{ textTransform: 'capitalize' }}
        >
          {isActive ? 'Active' : 'Disabled'}
        </Label>
      </TableCell> */}
    </TableRow>
  );
}
