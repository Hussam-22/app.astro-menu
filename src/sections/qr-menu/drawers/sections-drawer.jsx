import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useQueries } from '@tanstack/react-query';

import { Box } from '@mui/system';
import { Stack, Drawer, Button, Divider, useTheme, Typography } from '@mui/material';

import Image from 'src/components/image';
import { useAuthContext } from 'src/auth/hooks';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

SectionsDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function SectionsDrawer({ openState, toggleDrawer }) {
  const theme = useTheme();
  const { businessProfileID } = useParams();
  const { menuSections, fsGetMeal } = useAuthContext();
  const { selectedLanguage, getTranslation, mostOrderedMeals } = useQrMenuContext();

  const menuSectionsWithMostOrderedMeals = useMemo(
    () =>
      mostOrderedMeals === undefined || mostOrderedMeals?.length === 0
        ? menuSections
        : [
            ...menuSections,
            {
              order: 0,
              isActive: true,
              meals: [...mostOrderedMeals],
              title: 'most ordered meals',
              docID: 'most-ordered-meals',
            },
          ],
    [menuSections, mostOrderedMeals]
  );

  const getTitle = (section) => {
    const { title, translation, translationEdited } = section;
    if (selectedLanguage === 'en') return title;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const onSectionClickHandler = (sectionID) => {
    const sectionElement = document.getElementById(sectionID);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
      toggleDrawer('menu');
    }
  };

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

  if (mealsData[0].isLoading) return <div>Loading...</div>;

  const inActiveMeals = mealsData
    .map((meal) => meal?.data)
    .filter((meal) => !meal?.isActive)
    .map((meal) => meal?.docID);

  return (
    <Drawer
      anchor="right"
      open={openState}
      onClose={() => toggleDrawer('menu')}
      PaperProps={{
        sx: {
          minWidth: 200,
          borderRadius: '25px 0 0 25px',
          // '&:before': {
          //   width: 1,
          //   height: 1,
          //   zIndex: -1,
          //   content: "''",
          //   opacity: 0.24,
          //   position: 'absolute',
          //   backgroundSize: 'cover',
          //   backgroundRepeat: 'no-repeat',
          //   backgroundPosition: 'center center',
          //   backgroundImage: 'url(/assets/background/overlay_4.jpg)',
          // },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ bgcolor: 'rose.400', py: 1, px: 2 }}
        alignItems="center"
        justifyContent="flex-end"
      >
        <Typography variant="h5" sx={{ color: '#FFFFFF' }}>
          {getTranslation('menu sections')}
        </Typography>
        <Image src="/assets/icons/qr-menu/food-menu.svg" width={32} height={32} />
      </Stack>

      <Stack
        direction="column"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ p: 2, direction: selectedLanguage === 'ar' ? 'rtl' : 'ltr' }}
      >
        {menuSectionsWithMostOrderedMeals.length !== 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(1,1fr)',
              gap: 1,
            }}
          >
            {[...menuSectionsWithMostOrderedMeals]
              .filter((section) => section.meals.every((mealID) => !inActiveMeals.includes(mealID)))
              .filter(
                (section) =>
                  section.isActive &&
                  section.meals.length !== 0 &&
                  !section.meals.every((meal) => inActiveMeals.includes(meal))
              )
              .sort((a, b) => a.order - b.order)
              .map((section) => (
                <Typography
                  key={section.docID}
                  onClick={() => onSectionClickHandler(section.docID)}
                  sx={{
                    fontWeight: '600',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    textDecorationColor: theme.palette.rose[300],
                  }}
                >
                  {section?.order === 0 ? getTranslation(section.title) : getTitle(section)}
                </Typography>
              ))}
          </Box>
        )}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          alignSelf="center"
        >
          <Button
            variant="contained"
            color="inherit"
            size="small"
            onClick={() => toggleDrawer('menu')}
          >
            {getTranslation('close')}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export default SectionsDrawer;
