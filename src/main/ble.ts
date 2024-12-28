import { BrowserWindow, ipcMain } from "electron";

export const handleBLE = (window: BrowserWindow) => {
    let btCallback: (deviceId: string) => void;

    window.webContents.on(
        "select-bluetooth-device",
        async (event, deviceList, callback) => {
            event.preventDefault();
            btCallback = callback;
            window.webContents.send("ble-scan", deviceList);
        }
    );

    ipcMain.on("ble-selected", (event, deviceId) => {
        if (btCallback) btCallback(deviceId);
        btCallback = null;
    });
};
