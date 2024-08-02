const syncIcon = (isActive) => {
  const path = isActive ? "../icons/icon-32-green.png" : "../icons/icon-32.png";
  browser.browserAction.setIcon({ path });
};

async function addHeadersFromStorage(e) {
  return browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
    if (!isActive) {
      return { requestHeaders: e.requestHeaders };
    }

    return browser.storage.sync.get("headers").then(({ headers } = {}) => {
      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          e.requestHeaders.push({ name: key, value });
        }
      }

      return { requestHeaders: e.requestHeaders };
    });
  });
}

browser.runtime.onMessage.addListener((message) => {
  if (message === "activate") {
    syncIcon(true);
    browser.webRequest.onBeforeSendHeaders.addListener(
      addHeadersFromStorage,
      { urls: ["<all_urls>"] },
      ["blocking", "requestHeaders"]
    );
  } else if (message === "deactivate") {
    syncIcon(false);
    browser.webRequest.onBeforeSendHeaders.removeListener(
      addHeadersFromStorage
    );
  }
});

browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
  syncIcon(isActive);
});
