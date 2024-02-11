import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

import { Box, Card, Stack, Select, Divider, MenuItem, InputBase, Typography } from '@mui/material';

import Label from 'src/components/label';
import Image from 'src/components/image';
import AddMealToCart from 'src/sections/qr-menu/add-meal-to-cart';

function MealCard({ mealInfo }) {
  //   const { lang } = useParams();
  const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
  const { cover, docID, description, isActive, isNew, mealLabels, portions, title, translation } =
    mealInfo;
  const [selectedPortionIndex, setSelectedPortionIndex] = useState(0);

  const queryClient = useQueryClient();
  const cachedMealLabels = queryClient.getQueryData(['mealsLabel', userID]);

  const labels = cachedMealLabels.filter((cachedMealLabel) =>
    mealLabels.includes(cachedMealLabel.docID)
  );

  const onPortionChange = (e) => {
    setSelectedPortionIndex(e.target.value);
  };

  return (
    <Card sx={{ bgcolor: 'background.default', p: 3 }}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h4">{title}</Typography>
        <Box sx={{ position: 'relative' }}>
          <Image src={cover} ratio="16/9" sx={{ borderRadius: 1 }} />
          {isNew && (
            <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
              <Label
                variant="filled"
                color="error"
                sx={{ fontSize: 20, p: 2, boxShadow: '5px 5px 0 0 #000' }}
              >
                New
              </Label>
            </Box>
          )}
        </Box>

        <Typography variant="body2">{description}</Typography>
        <Stack direction="row" spacing={1}>
          {labels.map((label) => (
            <Label variant="filled" key={label.docID}>
              #{label.title}
            </Label>
          ))}
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Select
            value={selectedPortionIndex}
            onChange={onPortionChange}
            input={<InputBase sx={{ pl: 2, bgcolor: 'warning.lighter', borderRadius: 1 }} />}
            inputProps={{
              sx: { textTransform: 'capitalize' },
            }}
          >
            {portions.map((portion, index) => (
              <MenuItem key={index} value={index}>
                {portion.portionSize}
              </MenuItem>
            ))}
          </Select>

          <AddMealToCart portion={portions[selectedPortionIndex]} mealInfo={mealInfo} />
        </Stack>
      </Stack>
    </Card>
  );
}
export default MealCard;
MealCard.propTypes = {
  mealInfo: PropTypes.shape({
    cover: PropTypes.string,
    docID: PropTypes.string,
    description: PropTypes.string,
    isActive: PropTypes.bool,
    isNew: PropTypes.bool,
    mealLabels: PropTypes.array,
    portions: PropTypes.array,
    title: PropTypes.string,
    translation: PropTypes.object,
    translationEdited: PropTypes.object,
  }),
};
