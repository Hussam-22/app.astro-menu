import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

import { Stack, TableRow, TableCell, Typography, CircularProgress } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';

MealTableRow.propTypes = {
  row: PropTypes.object,
  onEditRow: PropTypes.func,
  mealLabelsList: PropTypes.array,
};

export default function MealTableRow({ row, onEditRow, mealLabelsList }) {
  const { docID, cover, title, isActive, mealLabels, portions, isNew, lastUpdatedAt } = row;
  const queryClient = useQueryClient();

  const lastUpdate = lastUpdatedAt?.seconds
    ? new Date(lastUpdatedAt.seconds * 1000).toLocaleString()
    : '';

  if (!cover)
    setTimeout(() => {
      queryClient.invalidateQueries(['meals']);
    }, 5000);

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
      <TableCell
        onClick={() => onEditRow(docID)}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            textDecoration: 'underline',
          },
        }}
      >
        <Stack direction="row" spacing={1}>
          {cover ? (
            <Image
              disabledEffect
              alt={title}
              src={cover}
              sx={{ borderRadius: 0.5, width: 52, height: 52, mr: 1 }}
            />
          ) : (
            <CircularProgress sx={{ borderRadius: 1.5, width: 48, height: 48, mr: 2 }} />
          )}
          <Stack direction="column" spacing={0.5}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Stack direction="row" spacing={2}>
              {portions.map((portion, i) => (
                <Label
                  variant="soft"
                  color="default"
                  key={`${portion.portionSize}-${i}`}
                  sx={{ fontWeight: 400 }}
                >
                  {portion.portionSize} - ${portion.price}
                </Label>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{lastUpdate}</Typography>
      </TableCell>
      <TableCell align="center">
        <Typography variant="body2">{metaKeywordsText()}</Typography>
      </TableCell>
      <TableCell align="center">
        {isNew && (
          <Label variant="soft" color="error">
            New
          </Label>
        )}
      </TableCell>

      <TableCell align="center">
        <Label
          variant="soft"
          color={isActive ? 'success' : 'secondary'}
          sx={{ textTransform: 'capitalize' }}
        >
          {isActive ? 'Visible' : 'Hidden'}
        </Label>
      </TableCell>
    </TableRow>
  );
}
