const context =
  typeof this.browser !== "undefined" ? this.browser : this.chrome;

const syncIcon = (isActive) => {
  const path = isActive ? "../icons/icon-32-green.png" : "../icons/icon-32.png";
  context.action.setIcon({ path });
};

const getId = (rules, index) =>
  (rules.length ? rules[rules.length - 1].id : 0) + index + 1;

const syncRules = () => {
  context.storage.sync.get("isActive", ({ isActive } = {}) => {
    context.storage.sync.get("headers", ({ headers = {} } = {}) => {
      context.storage.sync.get(
        "disabledHeaders",
        ({ disabledHeaders = {} } = {}) => {
          context.declarativeNetRequest.getDynamicRules().then((rules) => {
            if (!isActive) {
              context.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: rules.map((rule) => rule.id),
              });
            } else {
              context.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: rules
                  .filter(
                    (rule) =>
                      disabledHeaders[rule.action.requestHeaders[0].header] ||
                      !headers[rule.action.requestHeaders[0].header]
                  )
                  .map((rule) => rule.id),
                addRules: Object.entries(headers)
                  .filter(([key]) => !disabledHeaders[key])
                  .filter(
                    ([key, value]) =>
                      !rules.some(
                        (rule) =>
                          rule.action.requestHeaders[0].header === key &&
                          rule.action.requestHeaders[0].value === value
                      )
                  )
                  .map(([key, value], index) => ({
                    id: getId(rules, index),
                    priority: 1,
                    action: {
                      type: "modifyHeaders",
                      requestHeaders: [
                        {
                          operation: "set",
                          header: key,
                          value,
                        },
                      ],
                    },
                    condition: {
                      urlFilter: "*",
                      resourceTypes: Object.values(
                        context.declarativeNetRequest.ResourceType
                      ),
                    },
                  })),
              });
            }
          });
        }
      );
    });
  });
};

context.runtime.onMessage.addListener((message) => {
  if (message === "syncRules") {
    syncRules();
  }
});

syncRules();
