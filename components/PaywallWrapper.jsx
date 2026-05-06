import { useEffect, useRef } from 'react';
import EventBus from '../event-bus';

const REMOTE_URL = process.env.NEXT_PUBLIC_REMOTE_URL || 'http://localhost:3001';

let remoteInitialized = false;

async function loadPaywallModule(variant) {
  if (!remoteInitialized) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${REMOTE_URL}/remoteEntry.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    await window.paywallRemote.init({});
    remoteInitialized = true;
  }

  const factory = await window.paywallRemote.get(`./Paywall${variant}`);
  return factory();
}

export default function PaywallWrapper({ variant, products, onContinue }) {
  const containerRef = useRef(null);

  useEffect(() => {
    loadPaywallModule(variant).then((module) => {
      if (containerRef.current) {
        module.mount(containerRef.current);
        EventBus.dispatch('paywall:init', { products });
      }
    });

    const cleanup = EventBus.on('paywall:continue', ({ selectedProduct }) => {
      onContinue(selectedProduct);
    });

    return cleanup;
  }, []);

  return <div ref={containerRef} />;
}
