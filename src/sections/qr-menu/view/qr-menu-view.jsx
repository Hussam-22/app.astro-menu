import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Button, Divider, useTheme, Typography } from '@mui/material';

import Image from 'src/components/image';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuView() {
  const theme = useTheme();
  const { menuSections, fsGetImgDownloadUrl } = useAuthContext();
  const {
    tableInfo,
    branchInfo,
    businessProfile: { docID, businessName, defaultLanguage, translationEdited, translation },
    selectedLanguage,
  } = useQrMenuContext();
  const router = useRouter();

  const bucketPath = `${docID}/business-profile`;

  const getTitle = () => {
    if (selectedLanguage === defaultLanguage) return businessName;
    return translationEdited?.[selectedLanguage]?.title
      ? translationEdited?.[selectedLanguage]?.title
      : translation?.[selectedLanguage]?.title;
  };

  const { data: business_Logo = '' } = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['business_Logo', docID],
    queryFn: () => fsGetImgDownloadUrl(bucketPath, 'logo_800x800.webp'),
    enabled: !!docID,
  });

  if (!branchInfo.isActive && branchInfo.isActive !== undefined)
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
    <Stack direction="column" spacing={2} sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        {business_Logo && (
          <Image
            src={business_Logo}
            sx={{
              width: 72,
              height: 72,
              borderRadius: 1,
              border: `2px solid #000000`,
            }}
          />
        )}
        <Stack direction="column">
          <Typography variant="h4">{getTitle()}</Typography>
          <Typography variant="caption">{branchInfo.title}</Typography>
        </Stack>
      </Stack>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{ border: `dashed 1px ${theme.palette.divider}` }}
      />
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
