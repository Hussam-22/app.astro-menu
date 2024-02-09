import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

import { Box, Card, Stack, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';

function MealCard({ mealInfo }) {
  //   const { lang } = useParams();
  const userID = 'n2LrTyRkktYlddyljHUPsodtpsf1';
  const { cover, docID, description, isActive, isNew, mealLabels, portions, title, translation } =
    mealInfo;

  const queryClient = useQueryClient();
  const cachedMealLabels = queryClient.getQueryData(['mealsLabel', userID]);

  const labels = cachedMealLabels.filter((cachedMealLabel) =>
    mealLabels.includes(cachedMealLabel.docID)
  );

  return (
    <Card sx={{ bgcolor: 'background.default', p: 3 }}>
      <Stack direction="column" spacing={1}>
        <Box sx={{ position: 'relative' }}>
          <Image src={cover} ratio="16/9" sx={{ borderRadius: 1 }} />
          {isNew && (
            <Box sx={{ position: 'absolute', bottom: -15, right: 10 }}>
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
        <Typography variant="body2">{description}</Typography>
        <Stack direction="row" spacing={1}>
          {labels.map((label) => (
            <Label variant="filled">#{label.title}</Label>
          ))}
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
