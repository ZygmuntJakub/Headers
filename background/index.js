const syncIcon = (isActive) => {
  const path = isActive ? "../icons/icon-32-green.png" : "../icons/icon-32.png";
  browser.browserAction.setIcon({ path });
};

async function addHeadersFromStorage(e) {
  return browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
    if (!isActive) {
      return { requestHeaders: e.requestHeaders };
    }

    return browser.storage.sync
      .get("headers")
      .then(async ({ headers } = {}) => {
        const { disabledHeaders = {} } =
          await browser.storage.sync.get("disabledHeaders");

        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            if (disabledHeaders[key]) {
              continue;
            }
            e.requestHeaders.push({ name: key, value });
          }
        }

        return { requestHeaders: e.requestHeaders };
      });
  });
}

const run = (message) => {
  if (message === "activate") {
    syncIcon(true);
    browser.webRequest.onBeforeSendHeaders.addListener(
      addHeadersFromStorage,
      { urls: ["<all_urls>"] },
      ["blocking", "requestHeaders"],
    );
  } else if (message === "deactivate") {
    syncIcon(false);
    browser.webRequest.onBeforeSendHeaders.removeListener(
      addHeadersFromStorage,
    );
  }
};

browser.runtime.onMessage.addListener(run);

browser.storage.sync.get("isActive").then(({ isActive } = {}) => {
  run(isActive ? "activate" : "deactivate");
});
