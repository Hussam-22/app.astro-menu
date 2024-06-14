import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Stack, Drawer } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import { useQrMenuContext } from 'src/sections/qr-menu/context/qr-menu-context';

LanguageDrawer.propTypes = {
  openState: PropTypes.bool,
  toggleDrawer: PropTypes.func,
};

function LanguageDrawer({ openState, toggleDrawer }) {
  const { businessProfile } = useQrMenuContext();

  if (!businessProfile.languages) return null;

  return (
    <Drawer
      anchor="bottom"
      open={openState}
      PaperProps={{
        sx: {
          maxHeight: '50%',
          minHeight: '20%',
        },
      }}
      onClose={() => toggleDrawer('language')}
    >
      <Stack
        direction="column"
        spacing={1}
        sx={{ p: 3, mx: 'auto' }}
        justifyContent="left"
        alignItems="left"
      >
        {businessProfile?.languages?.length !== 0 &&
          [...businessProfile.languages, businessProfile.defaultLanguage].map((language) => (
            <LanguageButton toggleDrawer={toggleDrawer} code={language} key={language} />
          ))}
      </Stack>
    </Drawer>
  );
}

export default LanguageDrawer;

// ----------------------------------------------------------------------------

function LanguageButton({ code, toggleDrawer }) {
  const { setLanguage, selectedLanguage } = useQrMenuContext();
  const [loading, setLoading] = useState(false);

  // const { data, isValidating } = useSWR(
  //   `https://restcountries.com/v3.1/lang/${LANGUAGE_CODES[code].name}?fields=languages,flags`,
  //   fetcher
  // );

  const onlanguagechange = () => {
    setLoading(true);

    setTimeout(() => {
      setLanguage(code);
      setLoading(false);
      toggleDrawer('cart');
    }, 500);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <LoadingButton
        variant={selectedLanguage === code ? 'contained' : 'outlined'}
        onClick={() => onlanguagechange(code)}
        loading={loading}
        sx={{
          minWidth: 200,
        }}
      >
        {LANGUAGE_CODES[code].value}
      </LoadingButton>
    </Stack>
  );
}

LanguageButton.propTypes = {
  code: PropTypes.string,
  toggleDrawer: PropTypes.func,
};
