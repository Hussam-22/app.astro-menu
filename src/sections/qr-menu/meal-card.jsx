import { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

import { Box, Card, Stack, Select, Divider, MenuItem, InputBase, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { useAuthContext } from 'src/auth/hooks';
import AddMealToCart from 'src/sections/qr-menu/add-meal-to-cart';

function MealCard({ mealInfo }) {
  //   const { lang } = useParams();
  const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
  const { cover, docID, description, isActive, isNew, mealLabels, portions, title, translation } =
    mealInfo;
  const { user } = useAuthContext();
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
    <Card sx={{ bgcolor: 'background.default', p: 1 }}>
      <Stack direction="column" spacing={1}>
        <Box sx={{ position: 'relative' }}>
          <Image
            src={cover}
            ratio="16/9"
            sx={{ borderRadius: 1, filter: `grayscale(${isActive ? '0' : '100'})` }}
          />
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
        <Typography variant="h4">{title}</Typography>
        <Stack direction="row" spacing={1}>
          {labels.map((label) => (
            <Label variant="soft" color="default" key={label.docID} sx={{ fontSize: 10 }}>
              #{label.title}
            </Label>
          ))}
        </Stack>
        <Typography variant="body2">{description}</Typography>

        <Divider />
        {!isActive && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Out of Stock
            </Typography>
          </Box>
        )}
        {isActive && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Select
              value={selectedPortionIndex}
              onChange={onPortionChange}
              input={<InputBase sx={{ pl: 2, bgcolor: 'primary.lighter', borderRadius: 0.5 }} />}
              inputProps={{
                sx: { textTransform: 'capitalize' },
              }}
            >
              {portions.map((portion, index) => (
                <MenuItem key={index} value={index}>
                  {`${portion.portionSize} - ${portion.gram}gram`}
                </MenuItem>
              ))}
            </Select>
            <Stack direction="row" spacing={1} alignItems="center">
              <AddMealToCart portion={portions[selectedPortionIndex]} mealInfo={mealInfo} />
              <Typography variant="h6">{`${portions[selectedPortionIndex].price} ${user.currency}`}</Typography>
            </Stack>
          </Stack>
        )}
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
