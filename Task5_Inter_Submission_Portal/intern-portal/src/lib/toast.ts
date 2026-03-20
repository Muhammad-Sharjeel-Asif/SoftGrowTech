import toast, { Toast, Toaster } from "react-hot-toast";

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: "top-right" as const,
  style: {
    borderRadius: "8px",
    background: "#333",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    padding: "12px 16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  success: {
    duration: 3000,
    iconTheme: {
      primary: "#10B981",
      secondary: "#fff",
    },
    style: {
      background: "#ECFDF5",
      color: "#065F46",
      border: "1px solid #10B981",
    },
  },
  error: {
    duration: 5000,
    iconTheme: {
      primary: "#EF4444",
      secondary: "#fff",
    },
    style: {
      background: "#FEF2F2",
      color: "#991B1B",
      border: "1px solid #EF4444",
    },
  },
  loading: {
    duration: 10000,
    style: {
      background: "#EFF6FF",
      color: "#1E40AF",
      border: "1px solid #3B82F6",
    },
  },
};

// Custom toast components
const ToastContent = ({
  icon,
  message,
}: {
  icon: string;
  message: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="text-lg" role="img" aria-hidden="true">
      {icon}
    </span>
    <span className="font-medium">{message}</span>
  </div>
);

// Success toast
export const showToast = {
  success: (message: string) => {
    return toast.success(<ToastContent icon="✓" message={message} />, {
      ...toastConfig,
      ...toastConfig.success,
    });
  },

  // Error toast
  error: (message: string) => {
    return toast.error(<ToastContent icon="✗" message={message} />, {
      ...toastConfig,
      ...toastConfig.error,
    });
  },

  // Loading toast (returns dismiss function)
  loading: (message: string) => {
    return toast.loading(<ToastContent icon="⏳" message={message} />, {
      ...toastConfig,
      ...toastConfig.loading,
    });
  },

  // Info toast
  info: (message: string) => {
    return toast(
      <ToastContent icon="ℹ" message={message} />,
      {
        ...toastConfig,
        duration: 4000,
        style: {
          ...toastConfig.success.style,
          background: "#EFF6FF",
          color: "#1E40AF",
          border: "1px solid #3B82F6",
        },
      }
    );
  },

  // Promise helper
  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    }, {
      ...toastConfig,
      success: toastConfig.success,
      error: toastConfig.error,
      loading: toastConfig.loading,
    });
  },

  // Dismiss a toast
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// Export Toaster component
export { Toaster };
export default toast;
