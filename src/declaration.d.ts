import { ble } from "./ui/preload";

declare global {
    interface Window {
        ble: typeof ble;
    }
}
