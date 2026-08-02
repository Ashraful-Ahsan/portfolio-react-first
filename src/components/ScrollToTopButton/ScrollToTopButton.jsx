import React, { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Modern replacement for window.pageYOffset
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;

      if (scrollPosition > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility(); // Run on mount

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          /* z-[9999] guarantees it stays above background layers, footers, and cards */
          className="fixed bottom-10 right-10 z-[9999] flex items-center justify-center bg-[#8245ec] p-4 rounded-full cursor-pointer shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none"
        >
          <FiArrowUp size={24} className="text-white" />
        </button>
      )}
    </>
  );
};

export default ScrollToTopButton;