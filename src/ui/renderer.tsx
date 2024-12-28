import App from "./App";
import "./assets/css/global.css";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<App />);

console.log(
    '👋 This message is being logged by "renderer.js", included via webpack'
);
