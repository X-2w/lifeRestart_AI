import App from './app.js';

// 注册服务工作器
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/view/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// 启用热模块替换（HMR）
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./app.js', function() {
    console.log('App module updated.');
    const newApp = new App();
    newApp.initial();
  });
}

// 其他代码逻辑...
globalThis.$$eventMap = new Map();
globalThis.$$event = (tag, data) => {
    const listener = $$eventMap.get(tag);
    if (listener) listener.forEach(fn => fn(data));
};
globalThis.$$on = (tag, fn) => {
    let listener = $$eventMap.get(tag);
    if (!listener) {
        listener = new Set();
        $$eventMap.set(tag, listener);
    }
    listener.add(fn);
};
globalThis.$$off = (tag, fn) => {
    const listener = $$eventMap.get(tag);
    if (listener) listener.delete(fn);
};

globalThis.json = async fileName => await (await fetch(`../data/${fileName}.json`)).json();

globalThis.hideBanners = (e) => {
    document
        .querySelectorAll(".banner.visible")
        .forEach((b) => b.classList.remove("visible"));
};

const app = new App();
app.initial();

if (module.hot) {
    module.hot.accept();
  }