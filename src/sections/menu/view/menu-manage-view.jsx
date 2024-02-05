import { useState } from 'react';
import { m } from 'framer-motion';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import MenuNewEditForm from 'src/sections/menu/menu-new-edit-form';
import MealsAndSections from 'src/sections/menu/meals-and-sections';
import getVariant from 'src/sections/_examples/extra/animate-view/get-variant';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

function MenuManageView() {
  const theme = useTheme();
  const { id } = useParams();
  const { themeStretch } = useSettingsContext();
  const [currentTab, setCurrentTab] = useState('Menu Info');
  const { fsGetMenu } = useAuthContext();

  const { data: menuData = {} } = useQuery({
    queryKey: [`menu-${id}`],
    queryFn: () => fsGetMenu(id),
  });

  const TABS = [
    {
      value: 'Menu Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: <MenuNewEditForm menuData={menuData} />,
    },
    {
      value: 'Meals and Sections',
      icon: <Iconify icon="mdi:food-fork-drink" width={20} height={20} />,
      component: <MealsAndSections />,
    },
    // {
    //   value: 'Statistics',
    //   icon: <Iconify icon="nimbus:stats" width={20} height={20} />,
    //   component: <MenuStatisticsTab />,
    // },
  ];

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={menuData?.title || ''}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Menus', href: paths.dashboard.menu.list },
          { name: menuData?.title || '' },
        ]}
        action={
          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
            ID: {menuData?.docID}
          </Typography>
        }
      />
      {menuData?.docID && (
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

          {menuData?.docID &&
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
export default MenuManageView;
// MenuManageView.propTypes = { tables: PropTypes.array };
