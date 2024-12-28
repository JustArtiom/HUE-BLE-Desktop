import { contextBridge, ipcRenderer } from "electron";

const sleep = (time: number) => new Promise((res) => setTimeout(res, time));

const WebBle = {
    SERVICE_UUID: "932c32bd-0000-47a2-835a-a8d455b859dd",
    CHARACTERISTIC: {
        UUID_HUE: "fe0f",
        UUID_LIGHT_STATE: "932c32bd-0002-47a2-835a-a8d455b859dd",
        UUID_BRIGHTNESS: "932c32bd-0003-47a2-835a-a8d455b859dd",
        UUID_XY_COLOUR: "932c32bd-0005-47a2-835a-a8d455b859dd",
    },

    hexToRgb(hexColor: string): [number, number, number] {
        hexColor = hexColor.replace(/^#/, "");
        return [
            parseInt(hexColor.slice(0, 2), 16) / 255.0,
            parseInt(hexColor.slice(2, 4), 16) / 255.0,
            parseInt(hexColor.slice(4, 6), 16) / 255.0,
        ];
    },

    rgbToXyDim(r: number, g: number, b: number): [number, number, number] {
        function gammaCorrection(value: number): number {
            return value > 0.04045
                ? ((value + 0.055) / (1.0 + 0.055)) ** 2.4
                : value / 12.92;
        }

        r = gammaCorrection(r);
        g = gammaCorrection(g);
        b = gammaCorrection(b);

        const X = r * 0.649926 + g * 0.103455 + b * 0.197109;
        const Y = r * 0.234327 + g * 0.743075 + b * 0.022598;
        const Z = r * 0.0 + g * 0.053077 + b * 1.035763;

        const xySum = X + Y + Z;
        const x = xySum === 0 ? 0 : X / xySum;
        const y = xySum === 0 ? 0 : Y / xySum;

        const brightness = Math.max(r, g, b) * 255;
        return [x, y, Math.round(brightness)];
    },

    xyToHex: (x: number, y: number, brightness: number = 1): string => {
        // Define the reference white point (D65)
        const whiteX = 0.3127;
        const whiteY = 0.329;

        // Calculate XYZ from XY (assuming brightness Y is provided)
        const z = ((1 - x - y) / y) * brightness;
        const r = (x / y) * brightness;
        const g = brightness;

        // Convert XYZ to RGB (Apply the linear transformation matrix)
        let r1 = 3.2406 * r - 1.5372 * g - 0.4986 * z;
        let g1 = -0.9689 * r + 1.8758 * g + 0.0415 * z;
        let b1 = 0.0556 * r - 0.204 * g + 1.0572 * z;

        // Apply gamma correction
        r1 =
            r1 <= 0.0031308
                ? 12.92 * r1
                : 1.055 * Math.pow(r1, 1 / 2.4) - 0.055;
        g1 =
            g1 <= 0.0031308
                ? 12.92 * g1
                : 1.055 * Math.pow(g1, 1 / 2.4) - 0.055;
        b1 =
            b1 <= 0.0031308
                ? 12.92 * b1
                : 1.055 * Math.pow(b1, 1 / 2.4) - 0.055;

        // Ensure values are clamped between 0 and 255
        r1 = Math.max(0, Math.min(255, r1 * 255));
        g1 = Math.max(0, Math.min(255, g1 * 255));
        b1 = Math.max(0, Math.min(255, b1 * 255));

        // Convert to hexadecimal
        return WebBle.rgbToHex(r1, g1, b1);
    },

    // Helper function to convert RGB to Hex
    rgbToHex: (r: number, g: number, b: number): string => {
        const toHex = (x: number): string => {
            const hex = Math.round(x).toString(16).padStart(2, "0");
            return hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    },
};

let chosenDevice: BluetoothDevice;
let server: BluetoothRemoteGATTServer;

export const ble = {
    scanDevices: async (
        cb: (deviceId: string, deviceName: string, select: () => void) => any
    ) => {
        ipcRenderer.on("ble-scan", (_, devices: Electron.BluetoothDevice[]) => {
            devices.forEach(({ deviceId, deviceName }) =>
                cb(deviceId, deviceName, () => {
                    ipcRenderer.send("ble-selected", deviceId);
                })
            );
        });

        chosenDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [WebBle.SERVICE_UUID],
        });
    },

    connect: async () => {
        try {
            await sleep(100);
            console.log("connecting to device", chosenDevice);
            server = await chosenDevice.gatt.connect();
            console.log("Connected to device", server);
        } catch (error) {
            console.error("Error connecting to Bluetooth device:", error);
            throw error; // Re-throwing error to make sure it can be caught elsewhere if needed
        }
    },

    writeCharacteristic: async (uuid: string, value: DataView) => {
        try {
            const service = await server.getPrimaryService(WebBle.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(uuid);
            await characteristic.writeValue(value);
            console.log(`Wrote to characteristic ${uuid}`);
        } catch (error) {
            console.error("Error writing to characteristic:", error);
            throw error;
        }
    },

    async getLightState(): Promise<boolean> {
        try {
            const service = await server.getPrimaryService(WebBle.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(
                WebBle.CHARACTERISTIC.UUID_LIGHT_STATE
            );
            const value = await characteristic.readValue();
            return value.getUint8(0) === 1;
        } catch (error) {
            console.error("Error reading light state:", error);
            throw error;
        }
    },

    async getColorXY(): Promise<[number, number]> {
        try {
            const service = await server.getPrimaryService(WebBle.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(
                WebBle.CHARACTERISTIC.UUID_XY_COLOUR
            );
            const value = await characteristic.readValue();
            const x = value.getUint16(0, true) / 0xffff;
            const y = value.getUint16(2, true) / 0xffff;
            return [x, y];
        } catch (error) {
            console.error("Error reading color:", error);
            throw error;
        }
    },

    async getBrightness(): Promise<number> {
        try {
            const service = await server.getPrimaryService(WebBle.SERVICE_UUID);
            const characteristic = await service.getCharacteristic(
                WebBle.CHARACTERISTIC.UUID_BRIGHTNESS
            );
            const value = await characteristic.readValue();
            return value.getUint8(0);
        } catch (error) {
            console.error("Error reading brightness:", error);
            throw error;
        }
    },

    async turnOnLight() {
        const ON_COMMAND = new DataView(new Uint8Array([0x01]).buffer);
        await ble.writeCharacteristic(
            WebBle.CHARACTERISTIC.UUID_LIGHT_STATE,
            ON_COMMAND
        );
    },

    async turnOffLight() {
        const OFF_COMMAND = new DataView(new Uint8Array([0x00]).buffer);
        await ble.writeCharacteristic(
            WebBle.CHARACTERISTIC.UUID_LIGHT_STATE,
            OFF_COMMAND
        );
    },

    async setColorXY(x: number, y: number) {
        if (x < 0 || x > 1 || y < 0 || y > 1) {
            throw new Error("XY coordinates must be between 0.0 and 1.0.");
        }
        const xInt = Math.round(x * 0xffff);
        const yInt = Math.round(y * 0xffff);
        const buffer = new ArrayBuffer(4);
        const dataView = new DataView(buffer);
        dataView.setUint16(0, xInt, true);
        dataView.setUint16(2, yInt, true);
        await ble.writeCharacteristic(
            WebBle.CHARACTERISTIC.UUID_XY_COLOUR,
            dataView
        );
    },

    async setBrightness(brightness: number) {
        const clampedBrightness = Math.max(1, Math.min(brightness, 254));
        const buffer = new ArrayBuffer(1);
        const dataView = new DataView(buffer);
        dataView.setUint8(0, clampedBrightness);
        await ble.writeCharacteristic(
            WebBle.CHARACTERISTIC.UUID_BRIGHTNESS,
            dataView
        );
    },

    async setColorHex(hexColor: string) {
        const [r, g, b] = WebBle.hexToRgb(hexColor);
        const [x, y, brightness] = WebBle.rgbToXyDim(r, g, b);
        await ble.setColorXY(x, y);
        await ble.setBrightness(brightness);
        console.log(
            `Set color to HEX(${hexColor}) with XY(${x}, ${y}) and brightness(${brightness})`
        );
    },

    WebBle,
};

contextBridge.exposeInMainWorld("ble", ble);
