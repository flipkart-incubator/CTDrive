import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const ROOT_COMPONENT = <ErrorBoundary>{<App />}</ErrorBoundary>;

ReactDOM.createRoot(document.getElementById("root")!).render(ROOT_COMPONENT);
