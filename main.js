import { app, BrowserWindow, session, globalShortcut } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.setName("YouTube Minerado");

let win;

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
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
}

app.whenReady().then(() => {
  createWindow();

  // Atalho de Play/Pause
  globalShortcut.register("MediaPlayPause", () => {
    win.webContents.executeJavaScript(
      `document.querySelector('.play-pause-button')?.click()`,
    );
  });
});
