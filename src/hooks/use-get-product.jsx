import { useAuthContext } from 'src/auth/hooks';

export function useGetProductInfo() {
  const { businessProfile } = useAuthContext();

  console.log(businessProfile);

  if (!businessProfile?.docID) return {};

  const { active, images, description, id, metadata, name, updated } =
    businessProfile.product_details;
  //   const { paymentDate, nextPaymentDate, isPaid } = businessProfile.paymentInfo.at(-1);

  const allowAnalytics = metadata.analytics === 'true';
  const isMenuOnly = metadata.isMenuOnly === 'true';
  const allowPoS = metadata.pos === 'true';
  const branches = +metadata.branches;
  const languages = +metadata.languages;
  const tables = +metadata.tables;
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
    tables,
    version,
  };
}
