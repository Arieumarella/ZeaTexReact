import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message:
        error instanceof Error && error.message
          ? error.message
          : "Terjadi kesalahan yang tidak terduga.",
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error("Unhandled UI error:", error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/30">
            !
          </div>
          <h1 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
            Terjadi Kesalahan
          </h1>
          <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
            Halaman gagal ditampilkan. Silakan muat ulang halaman. Jika masalah
            masih terjadi, hubungi administrator.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Muat Ulang Halaman
          </button>
          {import.meta.env.DEV && this.state.message && (
            <p className="mt-4 break-words text-left text-xs text-red-500">
              {this.state.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}
