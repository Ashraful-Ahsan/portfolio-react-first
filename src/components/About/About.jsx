import React from "react";
import { TypeAnimation } from "react-type-animation";
import { FaDownload, FaCode, FaServer, FaRocket } from "react-icons/fa6";
import Tilt from "react-parallax-tilt";
import aboutImg from "../../assets/profile.png";

const About = () => {
  const highlights = [
    { icon: <FaCode className="text-[#8245ec]" />, title: "Frontend", text: "React, Tailwind, modern UI systems" },
    { icon: <FaServer className="text-[#8245ec]" />, title: "Backend", text: "Laravel, APIs, databases, authentication" },
    { icon: <FaRocket className="text-[#8245ec]" />, title: "Delivery", text: "Fast, responsive, maintainable applications" },
  ];

  return (
    <section id="about" className="px-[7vw] py-16 md:px-[7vw] md:py-24 lg:px-[20vw] lg:py-28">
      <div className="flex flex-col-reverse items-center justify-between gap-12 lg:flex-row">
        <div className="w-full text-center md:text-left lg:w-[55%]">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-purple-300">Full-Stack Developer</p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            Hi, I&apos;m <span className="text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-300 bg-clip-text">Ahsan</span>
          </h1>
          <h2 className="mt-3 text-2xl font-semibold text-slate-300 sm:text-3xl">
            Building polished web experiences with
            <span className="ml-2 text-[#dbff59]">
              <TypeAnimation
                sequence={[
                  "React",
                  1800,
                  "Laravel",
                  1800,
                  "REST APIs",
                  1800,
                  "Modern UI",
                  1800,
                ]}
                speed={45}
                repeat={Infinity}
                cursor={true}
              />
            </span>
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-400 sm:text-lg">
            I create thoughtful, user-friendly digital products that combine clean design, strong architecture, and smooth performance. From scalable APIs to elegant single-page applications, I focus on delivering practical solutions that feel effortless to use.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:justify-start">
            <a href="#projects" className="btn-primary">
              Explore My Work
            </a>
            <a href="/Md_Ashraful_Ahsan_Resume.pdf" download="Ahsan-Resume" className="btn-secondary">
              <FaDownload className="mr-2" />
              Download Resume
            </a>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-4 text-left">
                <div className="mb-3 inline-flex rounded-full bg-purple-500/10 p-2">{item.icon}</div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full justify-center lg:w-[45%] lg:justify-end">
          <Tilt
            className="w-56 h-56 rounded-full border-4 border-purple-500/70 shadow-[0_0_80px_rgba(130,69,236,0.35)] sm:w-72 sm:h-72 md:w-80 md:h-80"
            tiltMaxAngleX={18}
            tiltMaxAngleY={18}
            perspective={1000}
            scale={1.03}
            transitionSpeed={1000}
            gyroscope={true}
          >
            <img src={aboutImg} alt="Ahsan" className="h-full w-full rounded-full object-cover" />
          </Tilt>
        </div>
      </div>
    </section>
  );
};

export default About;
