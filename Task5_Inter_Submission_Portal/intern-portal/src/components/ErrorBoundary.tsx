"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md">
            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  <h1 className="text-xl font-bold text-gray-900">
                    Something went wrong
                  </h1>

                  <p className="mt-2 text-sm text-gray-600">
                    We&apos;re sorry, but something unexpected happened. Please try
                    refreshing the page.
                  </p>

                  {this.state.error && (
                    <details className="mt-4 text-left">
                      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        Error details
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-100 p-3 text-xs text-red-600">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}

                  <div className="mt-6">
                    <Button onClick={this.handleReset} variant="primary">
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
