'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface TrackingScriptsProps {
  gtmId?: string;
  pixelId?: string;
}

export default function TrackingScripts({ gtmId, pixelId }: TrackingScriptsProps) {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>('');

  // 1. Client-side visit reporting
  useEffect(() => {
    // Avoid double logging on initial mount in React Strict Mode if path hasn't changed
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const logVisit = async () => {
      try {
        await fetch('/api/analytics/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/center' },
          body: JSON.stringify({
            path: pathname,
            referrer: typeof document !== 'undefined' ? document.referrer : 'direct'
          })
        });
      } catch (err) {
        console.error('Failed to log client visit analytics:', err);
      }
    };

    logVisit();

    // Trigger Facebook Pixel PageView event client-side if Pixel is initialized
    if (pixelId && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }
  }, [pathname, pixelId]);

  // 2. Head Script Injections
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load GTM
    if (gtmId && !document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(gtmScript);
      
      // Inject GTM noscript in body
      const gtmNoScript = document.createElement('noscript');
      gtmNoScript.id = 'gtm-noscript';
      gtmNoScript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      document.body.appendChild(gtmNoScript);
    }

    // Load Meta Pixel
    if (pixelId && !document.getElementById('fbp-script')) {
      const pixelScript = document.createElement('script');
      pixelScript.id = 'fbp-script';
      pixelScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(pixelScript);

      // Inject Pixel noscript in body
      const pixelNoScript = document.createElement('noscript');
      pixelNoScript.id = 'fbp-noscript';
      pixelNoScript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />
      `;
      document.body.appendChild(pixelNoScript);
    }
  }, [gtmId, pixelId]);

  return null;
}
