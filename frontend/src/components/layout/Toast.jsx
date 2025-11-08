import React, { useEffect, useRef, useState } from 'react';

const TOAST_DURATION = 2000;

const Toast = ({ message, show, onUndo, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef();

  useEffect(() => {
    if (show) {
      setVisible(true);
      setProgress(100);
      const start = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        setProgress(Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100));
      }, 30);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // match exit animation
      }, TOAST_DURATION);

      return () => {
        clearTimeout(timer);
        clearInterval(progressRef.current);
      };
    } else {
      setVisible(false);
      setProgress(100);
      clearInterval(progressRef.current);
    }
  }, [show, onClose]);

  if (!show && !visible) return null;

  return (
    <div
      className={`
        flex items-center w-full max-w-sm py-5 px-6 text-gray-600 bg-white rounded-xl border border-gray-200 shadow-sm
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
      `}
      style={{ position: 'relative' }}
      role="alert"
    >
      <div className="inline-flex space-x-3 items-center">
        <span className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.87669 5.83334L6.79903 9.07942C8.55721 10.1343 9.4363 10.6618 10.4021 10.6388C11.368 10.6158 12.221 10.0471 13.927 8.9098L18.1233 5.83334M8.33335 16.6667H11.6667C14.8094 16.6667 16.3807 16.6667 17.357 15.6904C18.3334 14.7141 18.3334 13.1427 18.3334 10C18.3334 6.85731 18.3334 5.28596 17.357 4.30965C16.3807 3.33334 14.8094 3.33334 11.6667 3.33334H8.33335C5.19066 3.33334 3.61931 3.33334 2.643 4.30965C1.66669 5.28596 1.66669 6.85731 1.66669 10C1.66669 13.1427 1.66669 14.7141 2.643 15.6904C3.61931 16.6667 5.19066 16.6667 8.33335 16.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <p className="text-base font-medium">{message}</p>
      </div>
      <div className="ml-auto flex items-center space-x-3">
        <button type="button" onClick={onUndo} className="inline-flex justify-center items-center gap-2 text-indigo-600 font-semibold hover:underline">
          Undo
        </button>
        <button type="button" onClick={onClose} className="inline-flex flex-shrink-0 justify-center items-center text-gray-400 transition-all duration-150">
          <span className="sr-only">Close</span>
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 17L7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* Progress Bar */}
      <div
        className="absolute left-0 bottom-0 h-1 bg-indigo-500 rounded-b-xl transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default Toast;
