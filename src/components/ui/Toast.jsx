import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 inset-x-0 z-[100] flex flex-col items-center pointer-events-none px-4 gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 size={18} className="text-mint shrink-0" />,
              error: <AlertCircle size={18} className="text-chili shrink-0" />,
              info: <Info size={18} className="text-mango shrink-0" />,
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-aubergine text-cream shadow-modal border border-aubergine-700 max-w-sm w-full text-xs font-sans font-medium"
              >
                {icons[toast.type] || icons.info}
                <span className="flex-1 leading-snug">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-cream/60 hover:text-cream p-1 -mr-1"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { addToast: (msg) => console.log(msg) };
  }
  return context;
}
