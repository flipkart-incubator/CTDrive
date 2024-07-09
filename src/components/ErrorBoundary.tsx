import SomethingWentWrong from "@/assets/SomethingWentWrong";
import { Button } from "antd";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center w-full h-screen justify-center align-middle flex-col">
          <div className="flex flex-col items-center">
            <SomethingWentWrong width={300} height={250} />
            <span className="text-2xl my-3">Something went wrong</span>
            <Button onClick={() => window.location.reload()}>Reload</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
