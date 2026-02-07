import { app, BrowserWindow, session, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("YouTube Minerado");

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

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  win.webContents.setUserAgent(
    "Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.202 Safari/537.36 SmartTV",
  );

  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      event.preventDefault();
    }
  });

  session.defaultSession.webRequest.onBeforeRequest(
    {
      urls: [
        "*://*.doubleclick.net/*",
        "*://*.googleadservices.com/*",
        "*://*.googlesyndication.com/*",
      ],
    },
    (details, callback) => {
      callback({ cancel: true });
    },
  );

  win.loadURL("https://music.youtube.com");

  win.webContents.on("did-finish-load", () => {
    if (splash) {
      splash.destroy();
      splash = null;
    }
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

  globalShortcut.register("MediaPlayPause", () => {
    win.webContents.executeJavaScript(
      `document.querySelector('.play-pause-button')?.click()`,
    );
  });
});
