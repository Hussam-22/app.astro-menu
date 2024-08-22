import { useAuthContext } from 'src/auth/hooks';

export function useGetProductInfo() {
  const { businessProfile } = useAuthContext();

  const { images, description, id, metadata, name, updated } = businessProfile.productInfo;

  const { status } = businessProfile.subscriptionInfo;

  const allowAnalytics = metadata.analytics === 'true';
  const isMenuOnly = metadata.isMenuOnly === 'true';
  const allowPoS = metadata.pos === 'true';
  const branches = +metadata.branches;
  const languages = +metadata.languages;
  const maxTables = +metadata.tables;
  const { version } = metadata;
  const maxTranslationsLanguages = +metadata.languages;

  const statusName = () => {
    if (status === 'active') {
      return 'Active';
    }
    if (status === 'past_due') {
      return 'Past Due';
    }
    if (status === 'unpaid') {
      return 'Unpaid';
    }
    if (status === 'canceled') {
      return 'Canceled';
    }
    if (status === 'incomplete') {
      return 'Incomplete';
    }
    if (status === 'incomplete_expired') {
      return 'Incomplete Expired';
    }
    if (status === 'trialing') {
      return 'Trialing';
    }
    if (status === 'paused') {
      return 'Paused';
    }
    return 'Unknown';
  };

  return {
    isActive: status === 'active',
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
    status,
    statusName: statusName(),
    role: status === 'active' || status === 'trialing' ? 'full' : 'deny',
    maxTranslationsLanguages,
  };
}
