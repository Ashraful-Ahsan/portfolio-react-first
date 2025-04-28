import React from "react"
import NavBar from "./components/NavBar/NavBar"
import About from "./components/About/About"
import Skills from "./components/Skills/Skills"
import Projects from "./components/Projects/Projects"
import Services from "./components/Services/Services"
import Contact from "./components/Contact/Contact"
import Footer from "./components/Footer/Footer"
import Education from "./components/Education/Education"
import BlurBlob from "./BlurBlob"
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton"





function App() {

  return (
    <>
      <div className="bg-[#050414]">
        <BlurBlob
          position={{ top: "35%", left: "20%" }}
          size={{ width: "30%", height: "40%" }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative pt-20">
          <NavBar />
          <About />
          <Skills />
          <Services />
          <Projects />
          <Education />
          <Contact />
          <Footer />
        </div>
        <ScrollToTopButton />
      </div>
    </>
  );
}

export default App
