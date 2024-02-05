import PropTypes from 'prop-types';

import { Stack, CircularProgress } from '@mui/material';

import { LANGUAGE_CODES } from 'src/locales/languageCodes';
import LanguageCard from 'src/components/translation-cards/LanguageCard';

BranchTranslation.propTypes = { branchInfo: PropTypes.object, isPending: PropTypes.bool };

function BranchTranslation({ branchInfo, isPending }) {
  const languageKeys = Object.keys(branchInfo?.translationEdited || {});

  if (isPending) return <CircularProgress />;

  return (
    <Stack spacing={3}>
      {!isPending &&
        languageKeys
          .sort((a, b) => LANGUAGE_CODES[a].localeCompare(LANGUAGE_CODES[b]))
          .map((key) => (
            <LanguageCard
              languageKey={key}
              key={key}
              showTitleField={false}
              reduxSlice="branch"
              data={branchInfo}
            />
          ))}
    </Stack>
  );
}

export default BranchTranslation;
