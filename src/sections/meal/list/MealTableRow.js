import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import { Button, TableRow, TableCell, Typography } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';

MealTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  tagsList: PropTypes.array,
};

export default function MealTableRow({ row, onEditRow, tagsList }) {
  const { title, cover, isActive, metaKeywords, portions, isNew } = row;

  console.log(cover);
  const theme = useTheme();

  const borderColor =
    theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[700];
  const textColor =
    theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light;

  const metaKeywordsText = () => {
    if (tagsList.length !== 0)
      return metaKeywords
        .map((keywordID) => tagsList.find((tag) => tag.id === keywordID).metaTag)
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

        <Button variant="text" onClick={onEditRow} sx={{ color: textColor }}>
          {title}
        </Button>
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
