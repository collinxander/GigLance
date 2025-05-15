import { useSubscription } from './useSubscription'

export function usePremiumAccess() {
  const { subscription, loading, error, isSubscribed, isPastDue, isCanceled } = useSubscription()

  const canAccessPremium = isSubscribed && !isCanceled
  const needsPaymentUpdate = isPastDue
  const isPremiumLoading = loading
  const premiumError = error

  return {
    canAccessPremium,
    needsPaymentUpdate,
    isPremiumLoading,
    premiumError,
    subscription,
  }
} 