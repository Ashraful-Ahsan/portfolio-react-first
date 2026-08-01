import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#050414]/80 px-[7vw] py-10 md:px-[7vw] lg:px-[20vw]">
      <div className="mx-auto flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold text-white">MD. ASHRAFUL AHSAN</h2>
        <p className="mt-2 text-sm text-slate-400">Designing and building web experiences with care and intention.</p>

        <nav className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-300">
          {[
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: "Free Tools", path: "/free-tools" },
            { name: "Contact", path: "/contact" },
          ].map((item) => (
            <Link key={item.path} to={item.path} className="transition hover:text-purple-400">
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[
            { icon: <FaFacebook />, link: "https://www.facebook.com/ahsanpx/" },
            { icon: <FaTwitter />, link: "https://x.com/ahsanxt" },
            { icon: <FaLinkedin />, link: "https://www.linkedin.com/in/md-ashraful-ahsan-902975200/" },
            { icon: <FaInstagram />, link: "https://www.instagram.com/ahsanxt/?next=%2F" },
            { icon: <FaYoutube />, link: "https://www.youtube.com/@TottoTalash" },
          ].map((item, index) => (
            <a key={`${item.link}-${index}`} href={item.link} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 p-3 text-lg text-slate-300 transition hover:-translate-y-1 hover:border-purple-500/40 hover:text-purple-300">
              {item.icon}
            </a>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-500">© 2026 MD. ASHRAFUL AHSAN. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
