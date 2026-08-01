import React from "react"
import { Routes, Route } from "react-router-dom"
import NavBar from "./components/NavBar/NavBar"
import Footer from "./components/Footer/Footer"
import BlurBlob from "./BlurBlob"
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton"
import HomePage from "./pages/HomePage"
import ProjectsPage from "./pages/ProjectsPage"
import ContactPage from "./pages/ContactPage"
import FreeToolsPage from "./pages/FreeToolsPage"





function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050414] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <BlurBlob position={{ top: "30%", left: "18%" }} size={{ width: "26%", height: "34%" }} />
        <BlurBlob position={{ top: "72%", left: "82%" }} size={{ width: "20%", height: "24%" }} />
        <div className="absolute inset-0 soft-grid opacity-70 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 pt-20">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/free-tools" element={<FreeToolsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Footer />
      </div>

      <ScrollToTopButton />
    </div>
  );
}

export default App
