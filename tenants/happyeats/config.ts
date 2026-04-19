/**
 * HappyEats Tenant Configuration
 * 
 * All HappyEats-specific branding, URLs, and defaults live here.
 * Edit this file to change HappyEats without touching shared platform code.
 */

export const happyEatsTenant = {
  // ─── Identity ──────────────────────────────────────────────────
  id: 'happyeats',
  name: 'Happy Eats',
  tagline: 'Food, Parts & Services Delivered',
  region: 'Nashville & Middle TN',

  // ─── Colors ────────────────────────────────────────────────────
  accentColor: '#FF7849',
  accentColorDark: '#FF5722',
  gradient: 'linear-gradient(135deg, #FF7849, #FF5722)',

  // ─── URLs ──────────────────────────────────────────────────────
  domain: 'happyeats.app',
  baseUrl: process.env.APP_URL || 'https://happyeats.app',
  supportEmail: 'support@happyeats.app',
  hallmarkDomain: 'happyeats.tlid.io',

  // ─── Email ─────────────────────────────────────────────────────
  emailFrom: process.env.RESEND_FROM_EMAIL || 'Happy Eats <noreply@happyeats.app>',
  emailTitle: 'Happy Eats',

  // ─── SMS ───────────────────────────────────────────────────────
  smsPrefix: 'Happy Eats',

  // ─── Affiliate ─────────────────────────────────────────────────
  affiliatePrefix: 'HE',
  affiliateAppId: 'dw_app_happyeats',

  // ─── Hallmark ──────────────────────────────────────────────────
  hallmarkSlug: 'happyeats',

  // ─── SEO ───────────────────────────────────────────────────────
  seo: {
    title: 'Happy Eats — Food, Parts & Services Delivered',
    description: 'Order food from local food trucks and vendors in Nashville. Fast delivery, real-time tracking, and rewards.',
    ogImage: '/happyeats-emblem.png',
  },

  // ─── Email Logo HTML ───────────────────────────────────────────
  emailLogoHtml: `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td style="width:42px;height:42px;background:linear-gradient(135deg,#FF7849,#FF5722);border-radius:10px;text-align:center;vertical-align:middle;font-size:22px;font-weight:bold;color:#fff;">H</td>
      <td style="padding-left:12px;">
        <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Happy Eats</span><br/>
        <span style="font-size:11px;font-weight:500;color:#FF7849;letter-spacing:2px;text-transform:uppercase;">Nashville &bull; Middle TN</span>
      </td>
    </tr>
    </table>`,
} as const;

export type TenantConfig = typeof happyEatsTenant;
