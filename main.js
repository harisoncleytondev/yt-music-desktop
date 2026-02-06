import { app, BrowserWindow, globalShortcut, session } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("Music Minerado");

let win;
let splash;

function createSplash() {
  splash = new BrowserWindow({
    width: 1200,
    height: 760,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, "assets/icon.png"),
  });

  splash.loadFile("splash.html");
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("https://music.youtube.com");

  win.webContents.on("context-menu", (e) => e.preventDefault());

  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      event.preventDefault();
    }
  });

  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(`
      ytmusic-player-ads,
      ytmusic-display-ad,
      .ad-showing {
        display: none !important;
      }
    `);

    if (splash) splash.destroy();
    win.show();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes("accounts.google.com")) {
      return { action: "allow" };
    }
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createSplash();
  createWindow();

  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: [
        "*://*.doubleclick.net/*",
        "*://*.googleads.g.doubleclick.net/*",
        "*://*.ads.youtube.com/*",
        "*://*.pagead2.googlesyndication.com/*",
        "*://*.youtube.com/api/stats/ads*",
        "*://*.youtube.com/pagead/*",
        "*://*.youtube.com/youtubei/v1/player/ad*",
      ],
    },
    (details, callback) => callback({ cancel: true }),
  );

  globalShortcut.register("MediaPlayPause", () => {
    if (!win) return;

    win.webContents.executeJavaScript(`
      document
        .querySelector('tp-yt-paper-icon-button[aria-label]')
        ?.click();
    `);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
