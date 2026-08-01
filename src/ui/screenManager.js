const screens = new Map();

export function registerScreen(name, api) {
  screens.set(name, api);
}

// Shows the named screen and hides all others. Pass null/undefined to hide everything.
export function showScreen(name) {
  screens.forEach((api, key) => {
    if (key === name) api.show();
    else api.hide();
  });
}
