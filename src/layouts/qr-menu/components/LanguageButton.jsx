import PropTypes from 'prop-types';

import { Button, Divider } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';

LanguageButton.propTypes = {
  code: PropTypes.string,
  onlanguagechange: PropTypes.func,
};
function LanguageButton({ code, onlanguagechange }) {
  return (
    <>
      <Button variant="text" onClick={() => onlanguagechange(code)}>
        {LANGUAGE_CODES[code]}
      </Button>
      <Divider sx={{ borderStyle: 'dashed' }} />
    </>
  );
}

export default LanguageButton;
