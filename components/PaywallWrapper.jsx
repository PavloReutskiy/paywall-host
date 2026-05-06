import { useEffect, useRef, useState } from 'react';
import EventBus from '../event-bus';
import styles from './PaywallWrapper.module.css';

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
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    loadPaywallModule(variant)
      .then((module) => {
        if (containerRef.current) {
          module.mount(containerRef.current);

          EventBus.dispatch('paywall:init', {
            products,
            // --- Extended context (available from GrowthBook in production) ---
            // merchant: { name: 'Stripe', currency: 'USD' },
            // legal: { trialTerms: 'Cancel anytime. No commitments.' },
            // analytics: { sessionId: crypto.randomUUID(), userId: '...' },
          });

          setStatus('ready');
        }
      })
      .catch(() => setStatus('error'));

    const cleanup = EventBus.on('paywall:continue', ({ selectedProduct }) => {
      onContinue(selectedProduct);
    });

    return cleanup;
  }, []);

  return (
    <>
      {status === 'loading' && (
        <div className={styles.overlay}>
          <div className={styles.spinner} />
        </div>
      )}
      {status === 'error' && (
        <div className={styles.overlay}>
          <div className={styles.errorBox}>
            <p className={styles.errorText}>Failed to load paywall.</p>
            <p className={styles.errorHint}>Check that paywall-remote is running on port 3001.</p>
          </div>
        </div>
      )}
      <div ref={containerRef} />
    </>
  );
}
