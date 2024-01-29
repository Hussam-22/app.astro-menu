import PropTypes from 'prop-types';

import { Box, TableRow, TableCell, Typography, ListItemText } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';

MealTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  mealLabelsList: PropTypes.array,
};

export default function MealTableRow({ row, onEditRow, mealLabelsList }) {
  const { docID, cover, title, isActive, mealLabels, portions, isNew } = row;

  const metaKeywordsText = () => {
    if (mealLabelsList.length !== 0)
      return mealLabels
        .map(
          (labelID) =>
            mealLabelsList.find((label) => label.docID === labelID)?.title.toLowerCase() || ''
        )
        .join(', ');
    return null;
  };

  return (
    <TableRow hover>
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          disabledEffect
          alt={title}
          src={cover}
          sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }}
        />
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
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </Box>
      </TableCell>

      <TableCell align="center">{portions.length}</TableCell>
      <TableCell align="center">
        <Typography variant="caption">{metaKeywordsText()}</Typography>
      </TableCell>
      <TableCell align="center">
        {isNew && (
          <Label variant="soft" color="warning">
            New
          </Label>
        )}
      </TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={isActive ? 'success' : 'error'}
          sx={{ textTransform: 'capitalize' }}
        >
          {isActive ? 'Active' : 'Hidden'}
        </Label>
      </TableCell>
    </TableRow>
  );
}
