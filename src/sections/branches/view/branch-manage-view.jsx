import { m } from 'framer-motion';
import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Tab, Box, Tabs, Divider, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { rdxSetBranch } from 'src/redux/slices/branch';
import { useSettingsContext } from 'src/components/settings';
import BranchTables from 'src/sections/branches/BranchTables';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import BranchTranslation from 'src/sections/branches/BranchTranslation';
import BranchNewEditForm from 'src/sections/branches/branch-new-edit-form';
import getVariant from 'src/sections/_examples/extra/animate-view/get-variant';

function BranchManageView() {
  const { id: branchID } = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { themeStretch } = useSettingsContext();
  const { fsGetBranch, fsGetBranchTables, fsGetAllBranches, user } = useAuthContext();
  const [currentTab, setCurrentTab] = useState('Branch Info');
  const branchData = useSelector((state) => state.branch.branch);

  useEffect(() => {
    (async () => {
      if (branchData?.title === undefined) dispatch(rdxSetBranch(await fsGetBranch(branchID)));
      // dispatch(rdxGetAllMeals(await fsGetAllMeals()));
      // dispatch(rdxGetAllMenu(await fsGetAllMenus()));
    })();
  }, [
    branchID,
    dispatch,
    fsGetBranch,
    fsGetBranchTables,
    // fsGetAllMenus,
    branchData?.title,
    fsGetAllBranches,
  ]);

  const TABS = [
    {
      value: 'Branch Info',
      icon: <Iconify icon="carbon:ibm-watson-knowledge-catalog" width={20} height={20} />,
      component: <BranchNewEditForm branchData={branchData} />,
    },
    {
      value: 'Translation',
      icon: <Iconify icon="clarity:language-line" width={20} height={20} />,
      component: <BranchTranslation />,
    },
    {
      value: 'Tables',
      icon: <Iconify icon="mdi:food-fork-drink" width={20} height={20} />,
      component: <BranchTables />,
    },
    // {
    //   value: 'Statistics',
    //   icon: <Iconify icon="nimbus:stats" width={20} height={20} />,
    //   component: <BranchStatistics />,
    // },
    // {
    //   value: 'Waiters Dashboard Link',
    //   icon: (
    //     <Iconify
    //       icon="streamline:food-kitchenware-chef-toque-hat-cook-gear-chef-cooking-nutrition-tools-clothes-hat-clothing-food"
    //       width={20}
    //       height={20}
    //     />
    //   ),
    //   component: <WaitersKitchenLinks userID={user.id} />,
    // },
  ];

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={branchData?.title || ''}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Branches', href: paths.dashboard.branches.list },
          { name: branchData?.title || '' },
        ]}
        action={
          <Typography variant="caption" sx={{ color: theme.palette.grey[600] }}>
            ID: {branchID}
          </Typography>
        }
      />

      {branchData?.docID && (
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

          {branchData?.docID &&
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
export default BranchManageView;

// BranchManageView.propTypes = { tables: PropTypes.array };
