import { useState } from 'react';
import { m } from 'framer-motion';
import { useParams } from 'react-router';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import StaffLink from 'src/sections/branches/staff-link';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import getVariant from 'src/sections/_examples/extra/animate-view/get-variant';
import BusinessProfileEditForm from 'src/sections/business-profile/business-profile-edit-form';

function BusinessProfileManageView() {
  const { id: businessProfileID } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { businessProfile } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('Business Info');

  const TABS = [
    {
      value: 'Business Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: businessProfile?.docID && <BusinessProfileEditForm />,
    },
    // {
    //   value: 'Tables',
    //   icon: <Iconify icon="mdi:food-fork-drink" width={20} height={20} />,
    //   component: <BranchTables businessProfile={businessProfile} />,
    // },
    // {
    //   value: 'Statistics',
    //   icon: <Iconify icon="nimbus:stats" width={20} height={20} />,
    //   component: <BranchStatistics />,
    // },
    {
      value: 'Staffs Dashboard Link',
      icon: (
        <Iconify
          icon="streamline:food-kitchenware-chef-toque-hat-cook-gear-chef-cooking-nutrition-tools-clothes-hat-clothing-food"
          width={20}
          height={20}
        />
      ),
      component: <StaffLink />,
    },
  ];

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={businessProfile?.businessName || ''}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Business Profile' },
          { name: businessProfile?.businessName || '' },
        ]}
        action={
          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
            ID: {businessProfileID}
          </Typography>
        }
      />

      {businessProfile?.docID && (
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

          {businessProfile?.docID &&
            TABS.map((tab) => {
              const isMatched = tab.value === currentTab;
              return (
                isMatched && (
                  <Box component={m.div} {...getVariant('fadeInUp')} key={tab.value} id={tab.value}>
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
export default BusinessProfileManageView;

// BranchManageView.propTypes = { tables: PropTypes.array };
