import { app, BrowserWindow, Tray, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';

let window: BrowserWindow;
let isQuiting: boolean;
let tray: Tray;

const logo = require.resolve('_public/images/logo_transparent_blue.png');

app.on('before-quit', () => {
  isQuiting = true;
});

app.on('ready', () => {
  tray = new Tray(logo);

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          window.show();
        },
      },
      {
        label: 'Quit',
        click: () => {
          isQuiting = true;
          app.quit();
        },
      },
    ]),
  );

  window = new BrowserWindow({
    height: 800,
    width: 1200,
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      webSecurity: false,
      devTools: process.env.NODE_ENV !== 'production',
      nodeIntegration: true,
    },
    icon: logo,
    title: 'Facetrack',
  });

  void window.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );

  window.on('close', (event: Event) => {
    if (!isQuiting) {
      event.preventDefault();
      window.hide();
      //event.returnValue = false;
    }
  });
});
