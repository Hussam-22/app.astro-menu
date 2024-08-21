import PropTypes from 'prop-types';

import { Stack, TableRow, TableCell, Typography, CircularProgress } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import { useGetBranchInfo } from 'src/hooks/use-get-branch-info';

// ----------------------------------------------------------------------

BranchTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};

const year = new Date().getFullYear();
const month = new Date().getMonth();

export default function BranchTableRow({ row, onEditRow }) {
  const { title, cover, docID, isActive } = row;

  const {
    totalOrders,
    totalTurnoverStr,
    averageTurnoverStr,
    totalScans,
    totalIncome,
    avgIncomePerOrder,
  } = useGetBranchInfo(docID, year, month);

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
          <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">{totalOrders}</TableCell>
      <TableCell align="center">{totalScans}</TableCell>
      <TableCell align="center">{totalTurnoverStr}</TableCell>
      <TableCell align="center">{averageTurnoverStr}</TableCell>
      <TableCell align="center">{totalIncome}</TableCell>
      <TableCell align="center">{avgIncomePerOrder}</TableCell>
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
