import React, { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi"; // You can use any arrow icon

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // This will make it smooth
    });
  };

  return (
    <>
      {isVisible && (
        <div
          className="fixed bottom-10 right-10 bg-[#8245ec] p-4 rounded-full cursor-pointer"
          onClick={scrollToTop}
        >
          <FiArrowUp size={24} className="text-white" />
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
