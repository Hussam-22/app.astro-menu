import { useAuthContext } from 'src/auth/hooks';

export function useGetProductInfo() {
  const { businessProfile } = useAuthContext();

  const { active, images, description, id, metadata, name, updated } = businessProfile.productInfo;

  const allowAnalytics = metadata.analytics === 'true';
  const isMenuOnly = metadata.isMenuOnly === 'true';
  const allowPoS = metadata.pos === 'true';
  const branches = +metadata.branches;
  const languages = +metadata.languages;
  const maxTables = +metadata.tables;
  const { version } = metadata;

  return {
    active,
    images,
    description,
    id,
    metadata,
    name,
    updated,
    allowAnalytics,
    isMenuOnly,
    allowPoS,
    branches,
    languages,
    maxTables,
    version,
    status: businessProfile.subscriptionInfo.status,
  };
}
