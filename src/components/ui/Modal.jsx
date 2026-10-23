import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'bottom', // 'bottom' (sheet) or 'center' (dialog)
  showClose = true,
  className = '',
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-end sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-aubergine/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal / Sheet Container */}
          <motion.div
            initial={position === 'bottom' ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            animate={position === 'bottom' ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={position === 'bottom' ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full max-w-lg bg-white rounded-t-modal sm:rounded-modal shadow-modal max-h-[92vh] flex flex-col overflow-hidden ${className}`}
            role="dialog"
            aria-modal="true"
          >
            {/* Grab handle for mobile pull down */}
            {position === 'bottom' && (
              <div className="pt-3 pb-1 flex justify-center sm:hidden">
                <div className="w-12 h-1.5 bg-aubergine/15 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-aubergine/8">
                <div>
                  {title && (
                    <h3 className="text-xl font-outfit font-bold text-aubergine leading-snug">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs font-sans text-aubergine/60 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>

                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-aubergine/60 hover:text-aubergine rounded-full hover:bg-aubergine/5 transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content with smooth scrolling */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
