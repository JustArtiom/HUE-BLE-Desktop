import "./assets/css/global.css";
import { createRoot } from "react-dom/client";

const root = createRoot(document.getElementById("root"));
root.render(<h1 className="text-3xl font-bold underline">Hello world!</h1>);

console.log(
    '👋 This message is being logged by "renderer.js", included via webpack'
);
