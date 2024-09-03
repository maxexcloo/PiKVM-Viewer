const { app, BrowserWindow } = require("electron");

function main() {
  const window = new BrowserWindow({
    width: 1920,
    height: 1080,
    resizable: false,
    title: "PiKVM",
    useContentSize: true,
    webPreferences: {
      contextIsolation: true
    }
  });

  window.loadURL("https://pikvm/").catch((error) => {
    console.error("Failed to load URL:", error);
  });

  window.on("close", (event) => {
    event.preventDefault();
    window.destroy();
  });

  window.on("page-title-updated", (event) => {
    event.preventDefault();
  });

  window.webContents.on("certificate-error", (event, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  });

  window.webContents.on("did-finish-load", () => {
    window.webContents.executeJavaScript(`
      const injectStyleObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            document.querySelectorAll('div.window-active').forEach(element => {
              element.style.setProperty('border', 'none', 'important');
            });
          }
        });
      });

      document.querySelectorAll('div.window').forEach(el => {
        injectStyleObserver.observe(el, {
          attributes: true,
          attributeFilter: ['style']
        });
      });
    `);
  });
}

app.on("window-all-closed", () => {
  app.quit();
});

app.whenReady().then(main);
