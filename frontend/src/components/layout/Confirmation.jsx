import React, { useEffect, useRef, useState } from 'react';

// Styled to match Toast.jsx: white bg, indigo accent, rounded-xl, shadow, progress bar, minimal, friendly
const Confirmation = ({
  message = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const [visible, setVisible] = useState(true);
  const dialogRef = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setVisible(false);
        onCancel && onCancel();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onCancel]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={dialogRef}
        className="w-full max-w-sm py-6 px-7 bg-white rounded-xl border border-gray-200 shadow-sm animate-fadeIn relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center space-x-3 mb-3">
          <span className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="none">
              <path d="M10 6.5v3.5m0 3.5h.01M18.333 10c0 3.143 0 4.714-0.977 5.69C16.38 16.666 14.81 16.666 11.667 16.666H8.333c-3.143 0-4.714 0-5.69-0.977C1.667 14.714 1.667 13.143 1.667 10c0-3.143 0-4.714 0.977-5.69C3.62 3.333 5.191 3.333 8.333 3.333h3.334c3.143 0 4.714 0 5.69 0.977.977.976.977 2.547.977 5.69z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-base font-medium text-gray-800">{message}</span>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={() => {
              setVisible(false);
              onCancel && onCancel();
            }}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            tabIndex={0}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              setVisible(false);
              onConfirm && onConfirm();
            }}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
            tabIndex={0}
          >
            {confirmText}
          </button>
        </div>
        {/* Progress Bar (optional, for subtle feedback) */}
        <div
          className="absolute left-0 bottom-0 h-1 bg-indigo-500 rounded-b-xl"
          style={{ width: "100%" }}
        />
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fadeIn { animation: fadeIn 0.18s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default Confirmation;
