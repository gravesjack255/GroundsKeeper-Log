// Subscription configuration
// Change these settings when ready to enable paid subscriptions

export const subscriptionConfig = {
  // Set to true when ready to enable paid subscriptions
  subscriptionRequired: false,
  
  // Free trial period in days (0 = no trial when subscriptionRequired is true)
  freeTrialDays: 14,
  
  // Price display (for marketing purposes)
  monthlyPrice: 29,
  yearlyPrice: 290,
  
  // Feature flags for subscription tiers
  features: {
    free: {
      maxEquipment: 10,
      maxMaintenanceLogs: 100,
      photoUpload: true,
      exportData: false,
    },
    pro: {
      maxEquipment: -1, // unlimited
      maxMaintenanceLogs: -1, // unlimited
      photoUpload: true,
      exportData: true,
    }
  }
};

// Helper to check if user has active subscription
// This will be expanded when Stripe is integrated
export function hasActiveSubscription(user: any): boolean {
  // If subscriptions aren't required, everyone has access
  if (!subscriptionConfig.subscriptionRequired) {
    return true;
  }
  
  // TODO: Check user's subscription status from database
  // For now, return true (free access)
  return true;
}

// Helper to check feature access
export function canAccessFeature(feature: keyof typeof subscriptionConfig.features.free, isPro: boolean = false): boolean {
  const tier = isPro ? subscriptionConfig.features.pro : subscriptionConfig.features.free;
  return tier[feature] !== false && tier[feature] !== 0;
}
