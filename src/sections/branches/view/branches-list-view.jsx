import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Box, Card, Stack, Button, useTheme, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';
import Label from 'src/components/label';
import Image from 'src/components/image';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useSettingsContext } from 'src/components/settings';

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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
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
  const theme = useTheme();
  const router = useRouter();
  const { title, cover, docID, description, isActive, allowSerfOrder, currency, defaultLanguage } =
    branchInfo;

  const qrCounts = '25';

  console.log(branchInfo);

  const branchCover = () => {
    if (cover === undefined)
      return (
        <Image disabledEffect alt={title} src="/assets/mock-images/branch-mock.webp" ratio="4/3" />
      );
    return <Image disabledEffect alt={title} src={cover} ratio="4/3" />;
  };

  return (
    <Card sx={{ pb: 1 }}>
      <Box sx={{ position: 'relative', borderBottom: `dashed 1px ${theme.palette.divider}` }}>
        {branchCover()}
        <Label
          variant="filled"
          color={isActive ? 'success' : 'error'}
          sx={{ position: 'absolute', right: 10, bottom: 10 }}
        >
          {isActive ? 'Active' : 'Disabled'}
        </Label>
      </Box>

      <Stack direction="column" spacing={0.5} sx={{ p: 1 }}>
        <Typography variant="h6">{title}</Typography>
        <CardItem
          title="Customers Self Order"
          color={allowSerfOrder ? 'success' : 'error'}
          content={allowSerfOrder ? 'Enabled' : 'Disabled'}
        />
        <CardItem
          title="Default Language"
          color="inherit"
          content={LANGUAGE_CODES[branchInfo.defaultLanguage].name}
        />
        <CardItem title="Currency" color="inherit" content={branchInfo.currency} />
        <CardItem title="QR Codes" color="inherit" content={qrCounts} />
      </Stack>

      <Stack sx={{ px: 1 }}>
        <Button
          variant="contained"
          color="secondary"
          endIcon={<Iconify icon="iconamoon:arrow-right-2-bold" />}
          onClick={() => router.push(paths.dashboard.branches.manage(docID))}
        >
          Manage
        </Button>
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
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="caption" color={color} sx={{ borderRadius: 1.5 }}>
        {content}
      </Typography>
    </Stack>
  );
}
