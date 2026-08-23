/**
 * Trustpilot Configuration for Vuela Learn
 * 
 * Replace reviewUrl with your official Trustpilot business review link once set up.
 * Example: https://www.trustpilot.com/evaluate/vuelalearn.vercel.app
 */

export const TRUSTPILOT_CONFIG = {
  enabled: true,
  businessName: 'Vuela Learn',
  trustpilotDomain: 'vuelalearn.vercel.app',
  // Official review link - update this URL once your Trustpilot account is activated
  reviewUrl: import.meta.env.VITE_TRUSTPILOT_URL || 'https://www.trustpilot.com/evaluate/vuelalearn.vercel.app',
  // Profile URL
  profileUrl: import.meta.env.VITE_TRUSTPILOT_PROFILE_URL || 'https://www.trustpilot.com/review/vuelalearn.vercel.app',
  ratingScore: '4.9',
  totalReviewsCount: '150+',
};
