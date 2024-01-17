import { useState } from 'react';
import PropTypes from 'prop-types';

// @mui
import { useTheme } from '@mui/material/styles';
import { Link, TableRow, TableCell, Typography, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
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
  const theme = useTheme();
  const { user, fsGetBranchTablesCount } = useAuthContext();
  const { title, imgUrl, isActive, docID } = row;
  const [tablesCount, setTablesCount] = useState(0);

  const ordersCount =
    user.statisticsSummary?.branches[docID]?.orders?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthIncome =
    user?.statisticsSummary?.branches[docID]?.income?.[THIS_YEAR]?.[THIS_MONTH] || 0;
  const thisMonthScans =
    user?.statisticsSummary?.branches[docID]?.scans?.[THIS_YEAR]?.[THIS_MONTH] || 0;

  const textColor =
    theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light;

  // useEffect(() => {
  //   const getTablesCount = async () => {
  //     const count = await fsGetBranchTablesCount(row.id);
  //     return setTablesCount(count);
  //   };
  //   getTablesCount();
  // }, [fsGetBranchTablesCount, row.docId]);

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          disabledEffect
          alt={title}
          src={imgUrl}
          sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }}
        />

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
      <TableCell align="center">{tablesCount}</TableCell>
      <TableCell align="center">{thisMonthScans}</TableCell>
      <TableCell align="center">
        <Label variant="soft" color={isActive ? 'success' : 'error'}>
          <Typography variant="caption">{isActive ? 'Active' : 'Disabled'}</Typography>
        </Label>
      </TableCell>
    </TableRow>
  );
}