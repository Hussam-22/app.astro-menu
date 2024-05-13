import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

// @mui
import {
  Link,
  TableRow,
  TableCell,
  Typography,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

TableDataRows.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
};
const THIS_YEAR = new Date().getFullYear();
const THIS_MONTH = new Date().getMonth();

export default function TableDataRows({ row, onEditRow }) {
  const { user } = useAuthContext();
  const { title, cover, isActive, docID } = row;
  const queryClient = useQueryClient();

  const ordersCount =
    user.statisticsSummary?.branches[docID]?.orders?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthIncome =
    user?.statisticsSummary?.branches[docID]?.income?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthScans =
    user?.statisticsSummary?.branches[docID]?.scans?.[THIS_YEAR]?.[THIS_MONTH] || 0;

  if (!cover)
    setTimeout(() => {
      queryClient.invalidateQueries(['branches']);
    }, 5000);

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        {cover ? (
          <Image
            disabledEffect
            alt={title}
            src={cover}
            sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }}
          />
        ) : (
          <CircularProgress sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }} />
        )}

        <ListItemText
          primary={
            <Link onClick={onEditRow} sx={{ cursor: 'pointer' }}>
              {title}
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

      <TableCell align="center">{ordersCount}</TableCell>
      <TableCell align="center">{fCurrency(thisMonthIncome)}</TableCell>
      <TableCell align="center">{thisMonthScans}</TableCell>
      <TableCell align="center">
        <Label variant="soft" color={isActive ? 'success' : 'error'}>
          <Typography variant="caption">{isActive ? 'Active' : 'Disabled'}</Typography>
        </Label>
      </TableCell>
    </TableRow>
  );
}
