import React, { useEffect, useState } from "react";

const App = () => {
    const [devices, setDevices] = useState<
        { deviceId: string; deviceName: string; select: () => void }[]
    >([]);
    const [selected, setSelected] = useState<boolean>(false);
    const [colorHex, setColorHex] = useState<string>("#ffffff");
    const [brightness, setBrightness] = useState<number>(255);
    const [lightState, setLightState] = useState<boolean>(false);

    // Fetch initial device stats once connected
    useEffect(() => {
        if (!selected) return;

        (async () => {
            const currentLightState = await window.ble.getLightState();
            setLightState(currentLightState);

            const [currentX, currentY] = await window.ble.getColorXY();
            const currentColorHex = window.ble.WebBle.xyToHex(
                currentX,
                currentY
            );
            setColorHex(currentColorHex);

            const currentBrightness = await window.ble.getBrightness();
            setBrightness(currentBrightness);
        })();
    }, [selected]);

    const handleSearchDevices = async () => {
        if (!navigator.bluetooth) {
            alert(
                "Web Bluetooth API is not supported by your browser or Electron!"
            );
            return;
        }

        await window.ble.scanDevices((deviceId, deviceName, select) =>
            setDevices((prevDevices) => [
                ...prevDevices.filter((d) => d.deviceId !== deviceId),
                { deviceId, deviceName, select },
            ])
        );
    };

    const handleTurnOnLight = async () => {
        try {
            await window.ble.turnOnLight();
            setLightState(true); // Update state once light is turned on
        } catch (error) {
            alert("Error turning on light: " + error);
        }
    };

    const handleTurnOffLight = async () => {
        try {
            await window.ble.turnOffLight();
            setLightState(false); // Update state once light is turned off
        } catch (error) {
            alert("Error turning off light: " + error);
        }
    };

    const handleSetColor = async () => {
        try {
            await window.ble.setColorHex(colorHex);
        } catch (error) {
            alert("Error setting color: " + error);
        }
    };

    const handleSetBrightness = async () => {
        try {
            await window.ble.setBrightness(brightness);
        } catch (error) {
            alert("Error setting brightness: " + error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            {!selected ? (
                <>
                    <h1 className="text-3xl font-bold text-center mb-6">
                        Bluetooth Device Search
                    </h1>
                    <button
                        onClick={handleSearchDevices}
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition"
                    >
                        Search for Bluetooth Devices
                    </button>

                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Discovered Devices:
                        </h2>
                        <ul className="space-y-4">
                            {devices.map((device, index) => (
                                <li
                                    key={index}
                                    onClick={async () => {
                                        device.select();
                                        await window.ble.connect();
                                        setSelected(true);
                                    }}
                                    className="bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 transition"
                                >
                                    <p className="text-lg">
                                        {device.deviceId} ({device.deviceName})
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <div className="mt-6 w-full max-w-lg mx-auto">
                    <h3 className="text-2xl font-semibold text-center mb-4">
                        Connected to device
                    </h3>
                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={handleTurnOnLight}
                            className="bg-green-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-green-600 transition"
                        >
                            Turn On
                        </button>
                        <button
                            onClick={handleTurnOffLight}
                            className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-red-600 transition"
                        >
                            Turn Off
                        </button>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-xl font-semibold mb-2">
                            Current Light State:
                        </h4>
                        <p className="text-lg">{lightState ? "On" : "Off"}</p>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-2">
                            Current Color:
                        </h4>
                        <p className="text-lg">{colorHex}</p>
                        <div
                            style={{
                                backgroundColor: colorHex,
                            }}
                            className="w-32 h-32 mt-2 rounded-full"
                        ></div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-2">
                            Current Brightness:
                        </h4>
                        <p className="text-lg">{brightness}</p>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-2">
                            Set Color (HEX)
                        </h4>
                        <input
                            type="color"
                            value={colorHex}
                            onChange={(e) => setColorHex(e.target.value)}
                            className="w-24 h-24 border-2 rounded-lg p-2"
                        />
                        <button
                            onClick={handleSetColor}
                            className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition"
                        >
                            Set Color
                        </button>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xl font-semibold mb-2">
                            Set Brightness
                        </h4>
                        <input
                            type="range"
                            value={brightness}
                            onChange={(e) =>
                                setBrightness(Number(e.target.value))
                            }
                            min="1"
                            max="254"
                            className="w-full"
                        />
                        <p className="text-lg mt-2 text-center">{brightness}</p>
                        <button
                            onClick={handleSetBrightness}
                            className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-600 transition"
                        >
                            Set Brightness
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
