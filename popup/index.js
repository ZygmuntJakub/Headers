const isActiveCheckbox = document.getElementById("isActiveCheckbox");

const syncIsActive = () => {
  browser.storage.sync.get("isActive").then((result) => {
    isActiveCheckbox.checked = result.isActive;
    browser.browserAction.setIcon({
      path: result.isActive
        ? "../icons/icon-32-green.png"
        : "../icons/icon-32.png",
    });
    syncTable();
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
  browser.storage.sync.get("headers").then(async (result) => {
    const { disabledHeaders = {} } =
      await browser.storage.sync.get("disabledHeaders");
    headersTableBody.innerHTML = "";
    const headers = Object.entries(result.headers || {});
    for (const [key, value] of headers) {
      const row = document.createElement("tr");
      const keyCell = document.createElement("td");
      const keyInput = document.createElement("input");
      const valueCell = document.createElement("td");
      const valueInput = document.createElement("input");
      const enableCheckbox = document.createElement("input");
      const deleteButton = document.createElement("button");

      enableCheckbox.checked = !disabledHeaders[key];
      keyInput.value = key;
      valueInput.value = value;
      keyInput.type = "text";
      valueInput.type = "text";
      enableCheckbox.type = "checkbox";

      keyInput.addEventListener("change", () => {
        browser.storage.sync.get("headers").then((result) => {
          const newHeaders = result.headers || {};
          newHeaders[keyInput.value] = newHeaders[key];
          delete newHeaders[key];
          browser.storage.sync.set({ headers: newHeaders });
          syncTable();
        });
      });

      valueInput.addEventListener("change", () => {
        browser.storage.sync.get("headers").then((result) => {
          const newHeaders = result.headers || {};
          newHeaders[keyInput.value] = valueInput.value;
          browser.storage.sync.set({ headers: newHeaders });
          syncTable();
        });
      });

      enableCheckbox.addEventListener("click", () => {
        browser.storage.sync.get("disabledHeaders").then((result) => {
          const newDisabledHeaders = result.disabledHeaders || {};
          newDisabledHeaders[key] = !enableCheckbox.checked;
          browser.storage.sync.set({ disabledHeaders: newDisabledHeaders });
          syncTable();
        });
      });

      deleteButton.addEventListener("click", () => {
        browser.storage.sync.get("headers").then((result) => {
          const newHeaders = result.headers || {};
          delete newHeaders[key];
          browser.storage.sync.set({ headers: newHeaders });
        });

        browser.storage.sync.get("disabledHeaders").then((result) => {
          const newDisabledHeaders = result.disabledHeaders || {};
          delete newDisabledHeaders[key];
          browser.storage.sync.set({ disabledHeaders: newDisabledHeaders });
        });
        row.remove();
      });

      keyCell.appendChild(keyInput);
      valueCell.appendChild(valueInput);
      row.style.opacity =
        disabledHeaders[key] || !isActiveCheckbox.checked ? 0.5 : 1;
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("deleteButton");

      row.appendChild(keyCell);
      row.appendChild(valueCell);
      row.appendChild(enableCheckbox);
      row.appendChild(deleteButton);

      headersTableBody.appendChild(row);
    }
  });
};

const headerKeyInput = document.getElementById("headerKeyInput");
const headerValueInput = document.getElementById("headerValueInput");
const addHeaderButton = document.getElementById("addHeaderButton");

const addHeader = () => {
  const values = {
    key: headerKeyInput.value,
    value: headerValueInput.value,
  };

  if (!values.key || !values.value) {
    return;
  }

  browser.storage.sync.get("headers").then((result) => {
    const newHeaders = result.headers || {};
    newHeaders[values.key] = values.value;
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

syncTable();
syncIsActive();
