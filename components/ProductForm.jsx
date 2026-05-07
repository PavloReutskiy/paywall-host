import { useState } from 'react';
import styles from './ProductForm.module.css';

const DEFAULT_PRODUCTS = [
  { name: '1-Week Trial', price: '$7.99' },
  { name: '2-Week Plan', price: '$8.49' },
  { name: '4-Week Plan', price: '$14.99' },
];

export default function ProductForm({ onSubmit }) {
  const [variant, setVariant] = useState('A');
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);

  function handleProductChange(index, field, value) {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ variant, products });
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Configure Paywall</h1>
        <p className={styles.subtitle}>Select a variant and set product details</p>

        <div className={styles.field}>
          <label className={styles.label}>Paywall Variant</label>
          <select
            className={styles.select}
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
          >
            <option value="A">Paywall A — Blue</option>
            <option value="B">Paywall B — Green</option>
            <option value="C">Paywall C — Red</option>
            <option value="D">Paywall D — Design System</option>
          </select>
          <span className={styles.hint}>Mocks GrowthBook A/B/C value</span>
        </div>

        <div className={styles.products}>
          <p className={styles.label}>Products</p>
          {products.map((p, i) => (
            <div key={i} className={styles.productRow}>
              <input
                className={styles.input}
                value={p.name}
                placeholder={`Product ${i + 1} name`}
                onChange={(e) => handleProductChange(i, 'name', e.target.value)}
                required
              />
              <input
                className={`${styles.input} ${styles.inputPrice}`}
                value={p.price}
                placeholder="$0.00"
                onChange={(e) => handleProductChange(i, 'price', e.target.value)}
                required
              />
            </div>
          ))}
        </div>

        <button className={styles.button} type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
