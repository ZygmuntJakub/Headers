const context = chrome;
const isActiveCheckbox = document.getElementById("isActiveCheckbox");

const syncRules = () => {
  context.runtime.sendMessage("syncRules");
};

const syncIsActive = () => {
  context.storage.sync.get("isActive", (result) => {
    isActiveCheckbox.checked = result.isActive;
    context.action.setIcon({
      path: result.isActive
        ? "../icons/icon-32-green.png"
        : "../icons/icon-32.png",
    });
    syncTable();
  });
};

isActiveCheckbox.addEventListener("click", () => {
  context.storage.sync.get("isActive", (result) => {
    context.storage.sync.set({ isActive: !result.isActive });
    syncIsActive();
    syncRules();
  });
});

const headersTableBody = document.getElementById("headersTableBody");

const syncTable = () => {
  context.storage.sync.get("headers", (result) => {
    context.storage.sync.get(
      "disabledHeaders",
      ({ disabledHeaders = {} } = {}) => {
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
            context.storage.sync.get("headers", (result) => {
              const newHeaders = result.headers || {};
              newHeaders[keyInput.value] = newHeaders[key];
              delete newHeaders[key];
              context.storage.sync.set({ headers: newHeaders });
              syncTable();
              syncRules();
            });
          });

          valueInput.addEventListener("change", () => {
            context.storage.sync.get("headers", (result) => {
              const newHeaders = result.headers || {};
              newHeaders[keyInput.value] = valueInput.value;
              context.storage.sync.set({ headers: newHeaders });
              syncTable();
              syncRules();
            });
          });

          enableCheckbox.addEventListener("click", () => {
            context.storage.sync.get("disabledHeaders").then((result) => {
              const newDisabledHeaders = result.disabledHeaders || {};
              newDisabledHeaders[key] = !enableCheckbox.checked;
              context.storage.sync.set({ disabledHeaders: newDisabledHeaders });
              syncTable();
              syncRules();
            });
          });

          deleteButton.addEventListener("click", () => {
            context.storage.sync.get("headers").then((result) => {
              const newHeaders = result.headers || {};
              delete newHeaders[key];
              context.storage.sync.set({ headers: newHeaders });
              syncRules();
            });

            context.storage.sync.get("disabledHeaders").then((result) => {
              const newDisabledHeaders = result.disabledHeaders || {};
              delete newDisabledHeaders[key];
              context.storage.sync.set({ disabledHeaders: newDisabledHeaders });
              syncRules();
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
      }
    );
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

  context.storage.sync.get("headers", (result) => {
    const newHeaders = result.headers || {};
    newHeaders[values.key] = values.value;
    context.storage.sync.set({ headers: newHeaders });
    headerKeyInput.value = "";
    headerValueInput.value = "";
    syncTable();
    syncRules();
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
syncRules();
