import PropTypes from 'prop-types';

import { Box, TableRow, TableCell, ListItemText } from '@mui/material';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

MenusTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function MenusTableRow({ row, onEditRow }) {
  const { title, isActive, lastUpdatedAt, docID } = row;

  console.log('//TODO: enable/disable menu (If seems necessary)');

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
            secondary={docID}
            primaryTypographyProps={{ typography: 'body1' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </Box>
      </TableCell>

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
