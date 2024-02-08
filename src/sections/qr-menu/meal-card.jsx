import PropTypes from 'prop-types';

import { Card, Stack, Typography } from '@mui/material';

import Image from 'src/components/image';

function MealCard({ mealInfo }) {
  //   const { lang } = useParams();
  const { cover, docID, description, isActive, isNew, mealLabels, portions, title, translation } =
    mealInfo;
  return (
    <Card sx={{ bgcolor: 'background.default', p: 3 }}>
      <Stack direction="column" spacing={1}>
        <Image src={cover} ratio="16/9" sx={{ borderRadius: 2 }} />
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body2">{description}</Typography>
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
