import { useQuery } from '@tanstack/react-query';

import { Box, Stack, Button, Divider, useTheme, Typography } from '@mui/material';

import Image from 'src/components/image';
import Label from 'src/components/label';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { blinkingElement } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import MenuSection from 'src/sections/qr-menu/menu-section';
import { getOrderStatusStyle } from 'src/utils/get-order-status-styles';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

function QrMenuView() {
  const theme = useTheme();
  const { menuSections, fsGetImgDownloadUrl, orderSnapShot } = useAuthContext();
  const {
    tableInfo,
    branchInfo,
    businessProfile: { docID, businessName, defaultLanguage, translationEdited, translation, logo },
    selectedLanguage,
    mostOrderedMeals = [],
    getTranslation,
  } = useQrMenuContext();
  const router = useRouter();

  const menuSectionsWithMostOrderedMeals =
    mostOrderedMeals?.length === 0
      ? menuSections
      : [
          ...menuSections,
          {
            order: 0,
            isActive: true,
            meals: [...mostOrderedMeals],
            title: 'most ordered meals',
            docID: 'most-ordered-meals',
          },
        ];

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
    enabled: !!docID && branchInfo.isActive && tableInfo?.docID && tableInfo?.isActive && !logo,
  });

  const tableNumber = tableInfo?.index === 0 ? 'QR Menu' : `Table ${tableInfo?.index}`;

  const OrderIsInKitchen =
    orderSnapShot?.isInKitchen?.length !== 0 && orderSnapShot?.isReadyToServe?.length === 0;

  const orderIsReadyToServe =
    orderSnapShot?.isReadyToServe && orderSnapShot?.isReadyToServe?.length !== 0;

  const orderStatus = getOrderStatusStyle(
    orderSnapShot?.isInKitchen?.includes(0),
    orderSnapShot?.isReadyToServe?.includes(0),
    theme
  );

  if (!branchInfo.isActive && branchInfo.isActive !== undefined)
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 1,
          gap: 2,
        }}
      >
        <Image src="/assets/icons/qr-menu/store-closed.svg" />
        <Typography variant="h1">Sorry, branch is Closed !!</Typography>
      </Box>
    );

  if (tableInfo?.docID && !tableInfo?.isActive)
    return (
      <Box
        sx={{
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          px: 1,
          gap: 1,
        }}
      >
        {/* <Iconify icon="zondicons:close-solid" sx={{ width: 64, height: 64 }} /> */}
        <Image src="/assets/icons/qr-menu/store-closed.svg" />
        <Typography variant="h1">Sorry, table is not accepting orders !!</Typography>
        <Button
          variant="soft"
          startIcon={<Iconify icon="ph:arrow-fat-left-fill" />}
          onClick={() => router.push('..')}
          color="warning"
        >
          Back to restaurant home page
        </Button>
      </Box>
    );

  return (
    <Stack direction="column" spacing={2} sx={{ py: 5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2 }}>
        {(logo || business_Logo) && (
          <Image
            src={logo || business_Logo}
            sx={{
              width: 72,
              height: 72,
              borderRadius: 1,
              border: `2px solid ${theme.palette.divider}`,
              bgcolor: '#FFFFFF',
              p: 1,
            }}
          />
        )}
        <Stack direction="column">
          <Typography variant="h4">{getTitle()}</Typography>
          <Typography variant="caption">{branchInfo.title}</Typography>
          <Typography variant="caption">{tableNumber}</Typography>
        </Stack>
      </Stack>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{ border: `dashed 1px ${theme.palette.divider}` }}
      />
      {menuSectionsWithMostOrderedMeals
        .filter((section) => section.isActive)
        .sort((a, b) => a.order - b.order)
        .map((section) => (
          <MenuSection key={section.docID} sectionInfo={section} />
        ))}
      {(OrderIsInKitchen || orderIsReadyToServe) && (
        <Label
          variant="filled"
          color={orderStatus.labelColor}
          startIcon={<Iconify icon={orderStatus.icon} />}
          sx={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: 1,
            p: 2,
            ...blinkingElement,
          }}
        >
          {orderStatus.status}
        </Label>
      )}
    </Stack>
  );
}
export default QrMenuView;
