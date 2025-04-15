import React from "react";
import { TypeAnimation } from "react-type-animation";
import { FaDownload } from "react-icons/fa6";
import Tilt from "react-parallax-tilt";
import aboutImg from "../../assets/profile.png";

const About = () => {
  return (
    <section
      id="about"
      className="py-12 px-[7vw] md:px-[7vw] lg:px-[20vw] font-sans mt-16 md:mt-24 lg:mt-32"
    >
      <div className="flex flex-col-reverse md:flex-row justify-between items-center">
        {/* Left Side */}
        <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-0">
          {/* Greeting */}
          <h1 className="text-3xl text-white sm:text-4xl md:text-5xl font-bold  mb-2 leading-tight">
            Hi, I&apos;m
          </h1>

          {/* Name */}
          <h2 className="text-4xl text-white sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            MD. ASHRAFUL AHSAN
          </h2>

          {/* Skills Typing Effect */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-[#8245ec] leading-tight">
            <span className="text-[#dbff59]">I am </span>
            <TypeAnimation
              sequence={[
                "Fullstack Web Developer",
                2000,
                "API Developer (PHP & Laravel)",
                2000,
                "React Developer (SPA)",
                2000,
                "JavaScript Coder",
                2000,
              ]}
              speed={50}
              repeat={Infinity}
              cursor={true}
              className="inline-block ml-2"
            />
          </h3>

          {/* About Paragraph */}
          <p className="text-base sm:text-lg md:text-lg text-gray-400 mb-8 mt-6 leading-relaxed text-justify">
            I&apos;m a passionate Full-Stack Developer skilled in modern web
            application development. I specialize in RESTful APIs with PHP
            Laravel, responsive single-page applications using React, and clean
            JavaScript coding. Focused on creating user-friendly, meaningful
            digital experiences, I'm driven by creativity, curiosity, and
            continuous learning — building simple, precise, and impactful
            solutions.
          </p>

          {/* Resume Download Button */}
          <a
            href="/Md_Ashraful_Ahsan_Resume.docx"
            download="Ahsan-Resume"
            className="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold transition duration-300 transform hover:scale-105"
            style={{
              background: "linear-gradient(90deg, #8245ec, #a855f7)",
              color: "#fff",
              boxShadow: "0 0 5px #8245ec, 0 0 10px #8245ec, 0 0 20px #8245ec",
            }}
          >
            <FaDownload className="mr-3" />
            Download Resume
          </a>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <Tilt
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-[28rem] md:h-[28rem] border-4 border-purple-700 rounded-full"
            tiltMaxAngleX={20}
            tiltMaxAngleY={20}
            perspective={1000}
            scale={1.05}
            transitionSpeed={1000}
            gyroscope={true}
          >
            <img
              src={aboutImg}
              alt="Ahsan"
              className="w-full h-full rounded-full object-cover drop-shadow-[0_10px_20px_rgba(130,69,236,0.5)]"
            />
          </Tilt>
        </div>
      </div>
    </section>
  );
};

export default About;
