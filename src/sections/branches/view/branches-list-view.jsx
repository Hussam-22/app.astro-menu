import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, Divider, Container, IconButton, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import Image from 'src/components/image';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

function BranchesListView() {
  const { themeStretch } = useSettingsContext();
  const { fsGetAllBranches } = useAuthContext();

  const {
    data: branchesInfo = [],
    isFetching,
    failureCount,
  } = useQuery({
    queryKey: ['branches'],
    queryFn: () => fsGetAllBranches(),
  });
  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Branches List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Branches List',
          },
        ]}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)' },
          gap: 2,
        }}
      >
        {branchesInfo.map((branch) => (
          <BranchCard key={branch.docID} branchInfo={branch} />
        ))}
      </Box>
    </Container>
  );
}
export default BranchesListView;

// ----------------------------------------------------------------------------

BranchCard.propTypes = {
  branchInfo: PropTypes.object,
};

function BranchCard({ branchInfo }) {
  const router = useRouter();
  const {
    title,
    cover,
    docID,
    isActive,
    allowSelfOrder,
    currency,
    defaultLanguage,
    skipKitchen,
    lastUpdatedAt,
  } = branchInfo;

  const qrCounts = '25';

  const branchCover = () => {
    if (cover === undefined)
      return (
        <Image
          disabledEffect
          alt={title}
          src="/assets/mock-images/branch-mock.webp"
          sx={{ width: '30%' }}
        />
      );
    return <Image disabledEffect alt={title} src={cover} sx={{ width: '30%' }} />;
  };

  return (
    <Card>
      <Stack direction="row" spacing={2}>
        {branchCover()}

        <Stack direction="column" flexGrow={1} sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              lastUpdatedAt: {new Date(lastUpdatedAt.seconds * 1000).toLocaleDateString('en-AE')}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={() => router.push(paths.dashboard.branches.manage(docID))}>
                <Iconify
                  icon="ph:gear-duotone"
                  sx={{ width: 24, height: 24, color: 'common.black' }}
                />
              </IconButton>
              <Label variant="filled" color={isActive ? 'success' : 'error'}>
                {isActive ? 'Active' : 'Disabled'}
              </Label>
            </Stack>
          </Stack>
          <Divider orientation="horizontal" flexItem sx={{ borderStyle: 'dashed' }} />

          <Typography variant="h4">{title}</Typography>
          <CardItem
            title="Customers Self Order"
            color={allowSelfOrder ? 'success.main' : 'error'}
            content={allowSelfOrder ? 'Enabled' : 'Disabled'}
          />
          <CardItem
            title="Skip Kitchen"
            color={skipKitchen ? 'error' : 'success.main'}
            content={skipKitchen ? 'Skip' : `Don't Skip`}
          />
          <CardItem
            title="Default Language"
            color="inherit"
            content={LANGUAGE_CODES[defaultLanguage].name}
          />
          <CardItem title="Currency" color="inherit" content={currency} />
          <CardItem title="QR Codes" color="inherit" content={qrCounts} />
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------------

CardItem.propTypes = {
  title: PropTypes.string,
  color: PropTypes.string,
  content: PropTypes.string,
};
function CardItem({ title, color, content }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
      <Typography variant="body2">{title}</Typography>
      <Typography variant="body2" color={color} sx={{ fontWeight: 'bold' }}>
        {content}
      </Typography>
    </Stack>
  );
}
