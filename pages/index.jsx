import { useState } from 'react';
import dynamic from 'next/dynamic';
import ProductForm from '../components/ProductForm';
import styles from './index.module.css';

const PaywallWrapper = dynamic(() => import('../components/PaywallWrapper'), {
  ssr: false,
});

export default function Home() {
  const [state, setState] = useState('form');
  const [formData, setFormData] = useState(null);
  const [result, setResult] = useState(null);

  function handleFormSubmit(data) {
    setFormData(data);
    setState('paywall');
  }

  function handlePaywallContinue(selectedProduct) {
    setResult(selectedProduct);
    setState('success');
  }

  if (state === 'form') {
    return <ProductForm onSubmit={handleFormSubmit} />;
  }

  if (state === 'paywall') {
    return (
      <PaywallWrapper
        variant={formData.variant}
        products={formData.products}
        onContinue={handlePaywallContinue}
      />
    );
  }

  if (state === 'success') {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Purchase Complete</h1>
          <p className={styles.successSubtitle}>
            Data returned via EventBus from paywall-remote
          </p>
          <div className={styles.resultBox}>
            <span className={styles.resultName}>{result.name}</span>
            <span className={styles.resultPrice}>{result.price}</span>
          </div>
          <button
            className={styles.resetButton}
            onClick={() => { setResult(null); setFormData(null); setState('form'); }}
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return null;
}
