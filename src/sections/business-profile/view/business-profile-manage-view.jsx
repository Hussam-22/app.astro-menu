import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import BusinessProfileEditForm from 'src/sections/business-profile/business-profile-edit-form';
import BusinessProfileTranslation from 'src/sections/business-profile/business-profile-translation';

function BusinessProfileManageView() {
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { businessProfile, fsGetBusinessProfile } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('Business Info');

  const { data, error, isFetching, status } = useQuery({
    queryKey: ['businessProfile', businessProfile.docID],
    queryFn: async () => fsGetBusinessProfile(businessProfile.docID),
  });

  const TABS = [
    {
      value: 'Business Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: businessProfile?.docID && <BusinessProfileEditForm />,
    },
    {
      value: 'Translation',
      icon: <Iconify icon="ph:globe-light" width={20} height={20} />,
      component: businessProfile?.docID && (
        <BusinessProfileTranslation businessProfileInfo={data} />
      ),
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
            ID: {businessProfile?.docID}
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
            sx={{
              bgcolor: theme.palette.background.paper,
              mt: 2,
              px: 2,
              pb: 1,
              borderRadius: 1,
            }}
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
                  // <Box component={m.div} {...getVariant('fadeInUp')} key={tab.value} id={tab.value}>
                  <Box key={tab.value} id={tab.value}>
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
