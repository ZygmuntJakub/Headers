const syncIcon = (isActive) => {
  const path = isActive ? "../icons/icon-32-green.png" : "../icons/icon-32.png";
  browser.browserAction.setIcon({ path });
};

async function addHeadersFromStorage(e) {
  return browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
    syncIcon(isActive);
    if (!isActive) {
      return { requestHeaders: e.requestHeaders };
    }

    return browser.storage.sync.get("headers").then(({ headers } = {}) => {
      if (!headers) {
        return { requestHeaders: e.requestHeaders };
      }
      for (const [key, value] of Object.entries(headers)) {
        e.requestHeaders.push({ name: key, value });
      }

      return { requestHeaders: e.requestHeaders };
    });
  });
}

browser.webRequest.onBeforeSendHeaders.addListener(
  addHeadersFromStorage,
  { urls: ["<all_urls>"] },
  ["blocking", "requestHeaders"]
);

browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
  syncIcon(isActive);
});
