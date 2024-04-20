import { Box, Stack, Button, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuView() {
  const { menuSections } = useAuthContext();
  const { tableInfo, branchInfo } = useQrMenuContext();
  const router = useRouter();

  if (!branchInfo.isActive)
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 1,
          gap: 2,
        }}
      >
        <Iconify icon="zondicons:close-solid" sx={{ width: 64, height: 64 }} />
        <Typography variant="h1">Sorry this branch is not open !!</Typography>
      </Box>
    );

  if (tableInfo?.docID && !tableInfo?.isActive)
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 1,
          gap: 2,
        }}
      >
        <Iconify icon="zondicons:close-solid" sx={{ width: 64, height: 64 }} />
        <Typography variant="h1">Sorry this table is not accepting orders !!</Typography>
        <Button
          variant="soft"
          startIcon={<Iconify icon="ph:arrow-fat-left-fill" />}
          onClick={() => router.push('..')}
        >
          Back to restaurant home page
        </Button>
      </Box>
    );

  return (
    <Stack direction="column" spacing={3} sx={{ py: 5 }}>
      {menuSections
        .filter((section) => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <MenuSection key={section.docID} sectionInfo={section} />
        ))}
    </Stack>
  );
}
export default QrMenuView;
