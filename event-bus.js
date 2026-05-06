const EventBus = {
  dispatch(event, data) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  on(event, callback) {
    const handler = (e) => callback(e.detail);
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  },
};

export default EventBus;
