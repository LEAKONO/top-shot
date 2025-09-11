import { Toaster, toast } from "react-hot-toast";

// Utility for triggering toasts
export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  custom: (message, options) => toast(message, options),
};

const Toast = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    toastOptions={{
      className: "rounded-lg shadow-md",
      success: {
        style: {
          background: "#059669", 
          color: "#fff",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#059669",
        },
      },
      error: {
        style: {
          background: "#dc2626", 
          color: "#fff",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#dc2626",
        },
      },
    }}
  />
);

export default Toast;
