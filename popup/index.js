const isActiveCheckbox = document.getElementById("isActiveCheckbox");

const syncIsActive = () => {
  browser.storage.sync.get("isActive").then((result) => {
    isActiveCheckbox.checked = result.isActive;
    browser.browserAction.setIcon({
      path: result.isActive
        ? "../icons/icon-32-green.png"
        : "../icons/icon-32.png",
    });
  });
};

isActiveCheckbox.addEventListener("click", () => {
  browser.storage.sync.get("isActive").then((result) => {
    browser.storage.sync.set({ isActive: !result.isActive });
    syncIsActive();
    browser.runtime.sendMessage(result.isActive ? "deactivate" : "activate");
  });
});

const headersTableBody = document.getElementById("headersTableBody");

const syncTable = () => {
  browser.storage.sync.get("headers").then((result) => {
    headersTableBody.innerHTML = "";
    const headers = Object.entries(result.headers || {});
    for (const [key, value] of headers) {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      const valueCell = document.createElement("td");
      const deleteButton = document.createElement("button");

      deleteButton.addEventListener("click", () => {
        browser.storage.sync.get("headers").then((result) => {
          const newHeaders = result.headers || {};
          delete newHeaders[key];
          browser.storage.sync.set({ headers: newHeaders });
          row.remove();
        });
      });

      keyCell.textContent = key;
      valueCell.textContent = value;
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("deleteButton");

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      row.appendChild(deleteButton);

      headersTableBody.appendChild(row);
    }
  });
};

const headerKeyInput = document.getElementById("headerKeyInput");
const headerValueInput = document.getElementById("headerValueInput");
const addHeaderButton = document.getElementById("addHeaderButton");

const addHeader = () => {
  if (!headerKeyInput.value || !headerValueInput.value) {
    return;
  }

  browser.storage.sync.get("headers").then((result) => {
    const newHeaders = result.headers || {};
    newHeaders[headerKeyInput.value] = headerValueInput.value;
    browser.storage.sync.set({ headers: newHeaders });
    headerKeyInput.value = "";
    headerValueInput.value = "";
    syncTable();
  });
};

addHeaderButton.addEventListener("click", addHeader);
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addHeader();
  }
});

syncIsActive();
syncTable();
