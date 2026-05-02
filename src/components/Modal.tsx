"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && e.target === contentRef.current) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      const mountTimer = setTimeout(() => setIsMounted(true), 0);

      return () => {
        clearTimeout(mountTimer);
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }

    const hideTimer = setTimeout(() => setIsVisible(false), 0);
    const closeTimer = setTimeout(() => setIsMounted(false), 180);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const animationFrame = requestAnimationFrame(() => {
      setIsVisible(true);
      contentRef.current?.focus();
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isOpen, isMounted]);

  if (!isMounted) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-150 ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-[opacity,transform,filter] duration-200 ease-out ${
          isVisible ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-2 scale-[0.98] opacity-0 blur-[2px]"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
