import PropTypes from 'prop-types';

import { Stack, TableRow, TableCell, Typography, CircularProgress } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';

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
      <TableCell
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
        onClick={() => onEditRow(docID)}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {cover ? (
            <Image
              disabledEffect
              alt={title}
              src={cover}
              sx={{ borderRadius: 0.5, width: 52, height: 52 }}
            />
          ) : (
            <CircularProgress sx={{ borderRadius: 1.5, width: 48, height: 48 }} />
          )}
          <Typography variant="h6">{title}</Typography>
        </Stack>
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
