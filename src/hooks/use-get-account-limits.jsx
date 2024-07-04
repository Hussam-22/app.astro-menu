import { useAuthContext } from 'src/auth/hooks';

export function useGetAccountLimits() {
  const { businessProfile } = useAuthContext();
  if (!businessProfile?.docID) return {};
  //   const { paymentDate, nextPaymentDate, isPaid } = businessProfile.paymentInfo.at(-1);
  const {
    activationDate,
    isTrial,
    isMenuOnly,
    name: planName,
    limits: { analytics: allowAnalytics, branch, languages, pos: allowPoS, scans, tables },
  } = businessProfile.planInfo.at(-1);

  return {
    planName,
    allowAnalytics,
    branch,
    languages,
    allowPoS,
    scans,
    tables,
    isTrial,
    activationDate,
    isMenuOnly,
  };
}
