export function generateEventId(): string {
  return 'evt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export async function trackCapiEvent(eventName: string, eventId: string, customData: any) {
  try {
    await fetch('/api/tracking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        customData,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        clientUserAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    });
  } catch (error) {
    console.error('Meta CAPI Dispatch error:', error);
  }
}

export function trackClientPixel(eventName: string, eventId: string, customData: any) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, customData, { eventID: eventId });
  } else {
    console.log(`[Client-Side Meta Pixel] Event: "${eventName}" | EventID: "${eventId}" | Data:`, customData);
  }
}

export async function trackLeadEvent(leadData: {
  fullName: string;
  email?: string;
  phone: string;
  businessName: string;
  value: number;
}) {
  const eventId = generateEventId();
  const customData = {
    content_name: 'Lead Capture Form',
    currency: 'BDT',
    value: leadData.value,
  };

  // 1. Trigger client pixel
  trackClientPixel('Lead', eventId, customData);

  // 2. Trigger server CAPI
  await trackCapiEvent('Lead', eventId, {
    ...customData,
    userData: {
      fullName: leadData.fullName,
      email: leadData.email,
      phone: leadData.phone,
      businessName: leadData.businessName,
    }
  });
}

export async function trackInitiateCheckoutEvent(bundleData: {
  items: string[];
  value: number;
}) {
  const eventId = generateEventId();
  const customData = {
    content_category: 'Services Bundle Customizer',
    content_ids: bundleData.items,
    currency: 'BDT',
    value: bundleData.value,
  };

  // 1. Trigger client pixel
  trackClientPixel('InitiateCheckout', eventId, customData);

  // 2. Trigger server CAPI
  await trackCapiEvent('InitiateCheckout', eventId, customData);
}

export async function trackCalculatorUseEvent(metrics: {
  monthlyTraffic: number;
  projectedRevenueIncrease: number;
}) {
  const eventId = generateEventId();
  const customData = {
    content_name: 'Growth ROI Calculator',
    traffic_input: metrics.monthlyTraffic,
    currency: 'BDT',
    value: metrics.projectedRevenueIncrease,
  };

  trackClientPixel('Search', eventId, customData);
  await trackCapiEvent('Search', eventId, customData);
}
