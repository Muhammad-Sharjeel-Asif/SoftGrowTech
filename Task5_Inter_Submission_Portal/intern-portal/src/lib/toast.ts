import toast, { Toaster } from "react-hot-toast";

// Re-export Toaster component
export { Toaster };

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: "top-right" as const,
  success: {
    duration: 3000,
  },
  error: {
    duration: 5000,
  },
  loading: {
    duration: 10000,
  },
};

// Success toast
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      ...toastConfig,
      ...toastConfig.success,
      icon: "✓",
      style: {
        background: "#ECFDF5",
        color: "#065F46",
        border: "1px solid #10B981",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  },

  // Error toast
  error: (message: string) => {
    return toast.error(message, {
      ...toastConfig,
      ...toastConfig.error,
      icon: "✗",
      style: {
        background: "#FEF2F2",
        color: "#991B1B",
        border: "1px solid #EF4444",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  },

  // Loading toast (returns dismiss function)
  loading: (message: string) => {
    return toast.loading(message, {
      ...toastConfig,
      ...toastConfig.loading,
      icon: "⏳",
      style: {
        background: "#EFF6FF",
        color: "#1E40AF",
        border: "1px solid #3B82F6",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
  },

  // Info toast
  info: (message: string) => {
    return toast(message, {
      ...toastConfig,
      icon: "ℹ",
      style: {
        background: "#EFF6FF",
        color: "#1E40AF",
        border: "1px solid #3B82F6",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
      },
    });
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
      success: {
        ...toastConfig.success,
        icon: "✓",
        style: {
          background: "#ECFDF5",
          color: "#065F46",
          border: "1px solid #10B981",
          borderRadius: "8px",
        },
      },
      error: {
        ...toastConfig.error,
        icon: "✗",
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #EF4444",
          borderRadius: "8px",
        },
      },
      loading: {
        ...toastConfig.loading,
        icon: "⏳",
        style: {
          background: "#EFF6FF",
          color: "#1E40AF",
          border: "1px solid #3B82F6",
          borderRadius: "8px",
        },
      },
    });
  },

  // Dismiss a toast
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

export default toast;
