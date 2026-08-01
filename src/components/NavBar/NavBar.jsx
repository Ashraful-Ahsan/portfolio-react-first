import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 30);
  };

  React.useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { id: "/", label: "Home" },
    { id: "/projects", label: "Projects" },
    { id: "/free-tools", label: "Free Tools" },
    { id: "/contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full px-[7vw] transition-all duration-300 md:px-[7vw] lg:px-[20vw] ${
        isScrolled ? "bg-[#050414]/80 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.25)]" : "bg-transparent py-4"
      }`}
    >
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white shadow-lg shadow-black/20">
        <Link to="/" className="text-lg font-semibold tracking-wide">
          <span className="text-[#8245ec]">&lt;</span>
          <span className="text-white">Ahsan</span>
          <span className="text-[#8245ec]">/</span>
          <span className="text-white">Tech</span>
          <span className="text-[#8245ec]">&gt;</span>
        </Link>

        <ul className="hidden items-center space-x-7 text-sm text-slate-300 md:flex">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.id}
                className={`transition hover:text-[#8245ec] ${location.pathname === item.id ? "text-[#8245ec]" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center space-x-3 md:flex">
          <a href="https://github.com/Ashraful-Ahsan" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-[#8245ec]">
            <FaGithub size={18} />
          </a>
          <a href="https://www.linkedin.com/in/md-ashraful-ahsan-902975200/" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-[#8245ec]">
            <FaLinkedin size={18} />
          </a>
        </div>

        <div className="md:hidden">
          {isOpen ? (
            <FiX className="cursor-pointer text-3xl text-[#8245ec]" onClick={() => setIsOpen(false)} />
          ) : (
            <FiMenu className="cursor-pointer text-3xl text-[#8245ec]" onClick={() => setIsOpen(true)} />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mx-auto mt-3 w-[95%] rounded-2xl border border-white/10 bg-[#050414]/90 p-4 shadow-2xl backdrop-blur-xl md:hidden">
          <ul className="flex flex-col space-y-3 text-center text-slate-300">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.id}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-lg px-3 py-2 transition ${location.pathname === item.id ? "bg-purple-500/15 text-[#8245ec]" : "hover:bg-white/10 hover:text-white"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <div className="flex justify-center space-x-4 pt-2">
              <a href="https://github.com/Ashraful-Ahsan" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-slate-300 transition hover:text-[#8245ec]">
                <FaGithub size={20} />
              </a>
              <a href="https://www.linkedin.com/in/md-ashraful-ahsan-902975200/" target="_blank" rel="noopener noreferrer" className="rounded-full p-2 text-slate-300 transition hover:text-[#8245ec]">
                <FaLinkedin size={20} />
              </a>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
