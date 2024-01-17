import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Link, Stack, TableRow, TableCell } from '@mui/material';

import Label from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// ----------------------------------------------------------------------

TableOrdersTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  selected: PropTypes.bool,
  onViewRow: PropTypes.func,
};

export default function TableOrdersTableRow({ row, selected, onViewRow }) {
  const { id, menuID, cart, index, lastUpdate, isPaid, isCanceled } = row;
  const menuTitle = useSelector(
    (state) => state.menu.menus.find((menu) => menu.id === menuID).title
  );
  const totalBill = cart.reduce((sum, meal) => sum + meal.price, 0);

  const orderStatus = () => {
    if (isPaid) return ['Paid', 'success'];
    if (isCanceled) return ['Canceled', 'error'];
    return ['In Progress', 'default'];
  };

  return (
    <TableRow hover selected={selected}>
      {/* <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell> */}

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Stack>
          <Link
            noWrap
            variant="subtitle2"
            onClick={onViewRow}
            sx={{ color: 'text.disabled', cursor: 'pointer' }}
          >
            {id}
          </Link>
        </Stack>
      </TableCell>

      <TableCell align="left">{fDate(new Date(lastUpdate.seconds * 1000))}</TableCell>
      <TableCell align="left">{menuTitle}</TableCell>
      <TableCell align="center">{fCurrency(totalBill)}</TableCell>
      <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
        {index}
      </TableCell>

      <TableCell align="left">
        <Label variant="filled" color={orderStatus()[1]} sx={{ textTransform: 'capitalize' }}>
          {orderStatus()[0]}
        </Label>
      </TableCell>
    </TableRow>
  );
}
