import { useState } from 'react';
import { m } from 'framer-motion';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import StaffLink from 'src/sections/branches/staff-link';
import { useSettingsContext } from 'src/components/settings';
import BranchTables from 'src/sections/branches/BranchTables';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import BranchStatistics from 'src/sections/branches/BranchStatistics';
import BranchNewEditForm from 'src/sections/branches/branch-new-edit-form';
import getVariant from 'src/sections/_examples/extra/animate-view/get-variant';

function BranchManageView() {
  const { id: branchID } = useParams();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { fsGetBranch } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('Branch Info');

  const {
    data: branchInfo = {},
    isFetching,
    error,
  } = useQuery({
    queryKey: ['branch', branchID],
    queryFn: () => fsGetBranch(branchID),
  });

  const TABS = [
    {
      value: 'Branch Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: branchInfo?.docID && <BranchNewEditForm branchInfo={branchInfo} />,
    },
    // {
    //   value: 'Translation',
    //   icon: <Iconify icon="clarity:language-line" width={20} height={20} />,
    //   component: <BranchTranslation branchInfo={branchInfo} isFetching={isFetching} />,
    // },
    {
      value: 'Tables',
      icon: <Iconify icon="mdi:food-fork-drink" width={20} height={20} />,
      component: <BranchTables branchInfo={branchInfo} />,
    },
    {
      value: 'Statistics',
      icon: <Iconify icon="nimbus:stats" width={20} height={20} />,
      component: <BranchStatistics />,
    },
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
        heading={branchInfo?.data?.title || ''}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Branches', href: paths.dashboard.branches.list },
          { name: branchInfo?.title || '' },
        ]}
        action={
          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
            ID: {branchID}
          </Typography>
        }
      />

      {branchInfo?.docID && (
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

          {branchInfo?.docID &&
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
export default BranchManageView;

// BranchManageView.propTypes = { tables: PropTypes.array };
