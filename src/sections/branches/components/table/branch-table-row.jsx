import PropTypes from 'prop-types';

import { Box, TableRow, TableCell, ListItemText } from '@mui/material';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

BranchTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

export default function BranchTableRow({ row, onEditRow }) {
  const { title, cover, docID, isActive, allowSelfOrder, skipKitchen, lastUpdatedAt } = row;

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
            secondary={docID}
            primaryTypographyProps={{ typography: 'body1', fontWeight: 'bold' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
              typography: 'body2',
            }}
          />
        </Box>
      </TableCell>

      <TableCell align="center">{lastUpdate}</TableCell>
      <TableCell align="center">
        <Label
          variant="soft"
          color={(!allowSelfOrder && 'error') || (allowSelfOrder && 'success')}
          sx={{ textTransform: 'capitalize' }}
        >
          {allowSelfOrder ? 'Allow' : 'Disabled'}
        </Label>
      </TableCell>
      <TableCell align="center">
        <Label
          variant="soft"
          color={(skipKitchen && 'error') || (!skipKitchen && 'success')}
          sx={{ textTransform: 'capitalize' }}
        >
          {skipKitchen ? 'Skip' : 'Dont Skip'}
        </Label>
      </TableCell>
      <TableCell align="center">
        <Label
          variant="soft"
          color={(!isActive && 'error') || (isActive && 'success')}
          sx={{ textTransform: 'capitalize' }}
        >
          {isActive ? 'Active' : 'Disabled'}
        </Label>
      </TableCell>
    </TableRow>
  );
}
