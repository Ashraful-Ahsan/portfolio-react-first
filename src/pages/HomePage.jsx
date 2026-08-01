import React from "react";
import About from "../components/About/About";
import Skills from "../components/Skills/Skills";
import Services from "../components/Services/Services";
import Projects from "../components/Projects/Projects";
import Education from "../components/Education/Education";
import Contact from "../components/Contact/Contact";

const HomePage = () => {
  return (
    <>
      <About />
      <Skills />
      <Services />
      <Projects />
      <Education />
      <Contact />
    </>
  );
};

export default HomePage;
