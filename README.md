# Hue BLE Desktop

Hue BLE Desktop is a cross-platform desktop application built with **Electron**, **TypeScript**, **React**, and **Webpack**. It allows users to connect and control their Hue lights via Bluetooth Low Energy (BLE) directly from their desktop.

## Prerequisites

Before you can start using the app, you need to establish a connection with your Hue lights using your phone and make them discoverable. Here's how you can set it up:

### Steps to Connect Your Hue Lights

1. **Set up your Hue lights**:

    - Ensure that your Hue lights are connected to your phone via hue philips app.

2. **Connect the lights with your phone**:

    - Open the **Hue** app on your phone.
    - Ensure that your lights are powered on and available.

3. **Make the lights discoverable**:

    - In the Hue app, tap on the **gear icon** (settings).
    - Navigate to **Voice Assistants** (e.g., Alexa or Google Assistant).
    - Choose any voice assistant and enable the **Make Discoverable** option.  
      (do not click "done" until you complete the next step)

4. **Connect your PC to the lights**:

    - Once your lights are discoverable, you need to connect your PC to the lights via Bluetooth. Go to your operating system’s Bluetooth settings and pair the PC with the lights.

5. **Start using the app**:
    - After a successful connection, you can now use the **Hue BLE Desktop** app to connect to the lights and control them.

---

## Features

-   **Device Discovery**: Scan and discover available Hue lights connected to your Bluetooth.
-   **Control Lights**: Turn lights on or off and set the color and brightness.
-   **Color Picker**: Use a color picker to set the light color in HEX format.
-   **Brightness Control**: Adjust the light brightness using a slider.
-   **Real-time Stats**: View the current state, brightness, and color of connected lights.

---

## Installation

To run the app on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hue-ble-desktop.git
cd hue-ble-desktop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

To start the app in development mode, use:

```bash
npm start
```

This will run the app locally on your machine.

### 4. Build the Application

To build the application for production:

```bash
npm run make
```

This will package the app into an executable for your operating system.

---

## Technologies Used

-   **Electron**: Framework for building cross-platform desktop apps with JavaScript.
-   **React**: JavaScript library for building user interfaces.
-   **TypeScript**: Typed superset of JavaScript that improves the development experience.
-   **Webpack**: Module bundler for JavaScript and assets.

---

## Contributing

Feel free to fork the repository, open issues, and submit pull requests. If you find any bugs or have suggestions for improvements, please open an issue in the GitHub repository.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
