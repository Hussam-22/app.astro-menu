import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Chip, Stack, Button, Drawer, Divider, Typography } from '@mui/material';

import Image from 'src/components/image';
import { useAuthContext } from 'src/auth/hooks';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

MealTypeDrawer.propTypes = {
  openState: PropTypes.bool,
  onClose: PropTypes.func,
};

function MealTypeDrawer({ openState, onClose }) {
  const { businessProfileID } = useParams();
  const { menuSections, fsGetMeal } = useAuthContext();
  const { setLabel, labels, reset, selectedLanguage, mealsLabel, getTranslation } =
    useQrMenuContext();

  const getLabel = (label) => {
    const { title, translation } = label;
    if (selectedLanguage === 'en') return title;
    return translation?.[selectedLanguage]?.title || title;
  };

  const onMealLabelClick = (labelID) => {
    setLabel(labelID);
  };

  const resetHandler = () => reset();

  const sectionsMealsID = useMemo(
    () => menuSections.flatMap((section) => section.meals.map((meal) => meal)),
    [menuSections]
  );

  const mealsData = useQueries({
    queries: sectionsMealsID.map((mealID) => ({
      queryKey: ['meal', mealID, businessProfileID],
      queryFn: () => fsGetMeal(mealID, '800x800', businessProfileID),
      staleTime: Infinity,
    })),
  });

  if (mealsData.length === 0 || mealsData[0]?.isLoading) return <div>Loading...</div>;

  return (
    <Drawer
      anchor="right"
      open={openState}
      onClose={onClose}
      PaperProps={{ sx: { minWidth: 200, borderRadius: '25px 0 0 25px' } }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ bgcolor: 'rose.400', py: 1, px: 2 }}
        alignItems="center"
        justifyContent="flex-end"
      >
        <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
          {getTranslation('meal type')}
        </Typography>
        <Image src="/assets/icons/qr-menu/filter.svg" width={32} height={32} />
      </Stack>
      <Stack
        direction="column"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ p: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
      >
        {mealsLabel.length !== 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: 'repeat(1,1fr)',
            }}
          >
            {mealsLabel.map((label) => (
              <Chip
                key={label.docID}
                label={`#${getLabel(label)}`}
                onClick={() => onMealLabelClick(label.docID)}
                size="small"
                color={labels.includes(label.docID) ? 'primary' : 'default'}
                variant="soft"
              />
            ))}
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={resetHandler}
            disabled={labels.length === 0}
          >
            {getTranslation('reset')}
          </Button>
          <Button variant="contained" color="inherit" size="small" onClick={onClose}>
            {getTranslation('close')}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default MealTypeDrawer;
