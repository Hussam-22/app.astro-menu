import { useAuthContext } from 'src/auth/hooks';

export function useAccountLimits() {
  const { businessProfile } = useAuthContext();
  const { paymentDate, nextPaymentDate, isPaid } = businessProfile.paymentInfo.at(-1);
  const {
    activationDate,
    limits,
    isTrial,
    isMenuOnly,
    name: planName,
  } = businessProfile.planInfo.at(-1);

  return { planName };
}
