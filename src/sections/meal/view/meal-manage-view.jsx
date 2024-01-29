import { useState } from 'react';
import { m } from 'framer-motion';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import MealTranslation from 'src/sections/meal/meal-translation';
import MealNewEditForm from 'src/sections/meal/meal-new-edit-form';
import getVariant from 'src/sections/_examples/extra/animate-view/get-variant';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function MealManageView() {
  const theme = useTheme();
  const { id: mealID } = useParams();
  const { themeStretch } = useSettingsContext();
  const { fsGetMeal } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('Menu Info');

  const {
    data: mealInfo = {},
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: [`meal-${mealID}`],
    queryFn: () => fsGetMeal(mealID),
  });

  console.log(isSuccess);

  const TABS = [
    {
      value: 'Menu Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: <MealNewEditForm mealInfo={mealInfo} />,
    },
    {
      value: 'Meal Translation',
      icon: <Iconify icon="mdi:food-fork-drink" width={20} height={20} />,
      component: <MealTranslation mealInfo={mealInfo} isFetching={isFetching} />,
    },
  ];

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={mealInfo?.title || ''}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Meals', href: paths.dashboard.meal.list },
          { name: mealInfo?.title || '' },
        ]}
        action={
          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
            ID: {mealInfo?.docID}
          </Typography>
        }
      />
      {mealInfo?.docID && (
        <>
          <Tabs
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            sx={{ bgcolor: theme.palette.background.paper, mt: 2, px: 2, pb: 1, borderRadius: 1 }}
          >
            {TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                label={tab.value}
                icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>

          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

          {mealInfo?.docID &&
            TABS.map((tab) => {
              const isMatched = tab.value === currentTab;
              return (
                isMatched && (
                  <Box
                    component={m.div}
                    {...getVariant('fadeInRight')}
                    key={tab.value}
                    id={tab.value}
                  >
                    {tab.component}
                  </Box>
                )
              );
            })}
        </>
      )}
    </Container>
  );
}
export default MealManageView;
// MealNewView.propTypes = { tables: PropTypes.array };
