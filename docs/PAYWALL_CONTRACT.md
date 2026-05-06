# Paywall EventBus Contract

Цей документ описує інтерфейс комунікації між `paywall-host` і `paywall-remote`
через EventBus. Будь-який новий пейвол у `paywall-remote` **зобов'язаний** слідувати цьому контракту.

---

## Архітектура

```
[paywall-host]  ──── paywall:init ────►  [paywall-remote]
                                                │
                ◄─── paywall:continue ──────────┘
```

`paywall-host` ніколи не імпортує код з `paywall-remote` напряму.
Вся комунікація — виключно через `window.CustomEvent` (EventBus).

---

## Events

### `paywall:init` — Host → Remote

Диспатчиться host-ом одразу після `module.mount()`.
Містить всі дані, необхідні пейволу для рендеру.

```ts
EventBus.dispatch('paywall:init', {
  // --- Обов'язкові ---
  products: Array<{
    name: string;   // "1-Week Trial"
    price: string;  // "$7.99"
  }>;

  // --- Розширені (доступні з GrowthBook в production) ---
  // merchant?: {
  //   name: string;      // "Stripe"
  //   currency: string;  // "USD"
  // };
  // legal?: {
  //   trialTerms: string;          // "Cancel anytime."
  //   cancellationPolicy: string;
  // };
  // analytics?: {
  //   sessionId: string;
  //   userId: string;
  // };
});
```

### `paywall:continue` — Remote → Host

Диспатчиться remote-ом коли юзер обрав план і натиснув CTA-кнопку.
Пейвол **зобов'язаний** очистити свої EventBus-слухачі після цього виклику.

```ts
EventBus.dispatch('paywall:continue', {
  selectedProduct: {
    name: string;   // "2-Week Plan"
    price: string;  // "$8.49"
  };
  // У production: додати selectedProduct.id для передачі в checkout
});
```

---

## Вимоги до нового пейволу

Кожна нова папка в `paywall-remote/src/` повинна:

1. **Слухати `paywall:init`** і рендерити продукти з `event.products`
2. **Диспатчити `paywall:continue`** з `selectedProduct` при натисканні CTA
3. **Очищати слухачі** (викликати `cleanup()`) після `paywall:continue`
4. **Експортувати `mount(container)`** — єдина точка входу

```js
// Мінімальний шаблон нового пейволу
import EventBus from 'event-bus';

export function mount(container) {
  container.innerHTML = `...HTML...`;

  const cleanup = EventBus.on('paywall:init', ({ products }) => {
    // рендер продуктів
  });

  container.querySelector('#cta').addEventListener('click', () => {
    const selected = /* отримати обраний продукт */;
    EventBus.dispatch('paywall:continue', { selectedProduct: selected });
    cleanup();
  });
}
```

---

## Нотатки

- Пейвол рендериться всередині `div#paywall-root`, наданого host-ом
- Пейвол **не контролює** показ/приховування контейнера — це зона відповідальності host-а
- `singleton: true` для `event-bus` в webpack конфігу гарантує один екземпляр EventBus
- В production `products` та весь контекст приходять з GrowthBook до відкриття пейволу
