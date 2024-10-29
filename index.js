const { app, BrowserWindow } = require("electron");

function showMainWindow() {
  const window = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: "PiKVM",
    useContentSize: true,
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

  window.on('resize', (event) => {
    if (!window.isFullScreen()) {
      window.setContentSize(1920, 1080);
    }
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

app.whenReady().then(showMainWindow);
