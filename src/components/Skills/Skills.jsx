import React from "react";
import { SkillsInfo } from "../../constants";
import Tilt from "react-parallax-tilt";

const Skills = () => (
  <section id="skills" className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
    <div className="text-center">
      <h2 className="section-title">Skills</h2>
      <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
      <p className="section-subtitle">
        A focused toolkit built around modern web development, APIs, and clean user experiences.
      </p>
    </div>

    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      {SkillsInfo.map((category) => (
        <Tilt
          key={category.title}
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          perspective={1000}
          scale={1.01}
          transitionSpeed={800}
          gyroscope={true}
        >
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <h3 className="mb-5 text-center text-2xl font-semibold text-white">{category.title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {category.skills.map((skill) => (
                <div key={skill.name} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                  <img src={skill.logo} alt={`${skill.name} logo`} className="h-7 w-7 object-contain" />
                  <span className="text-xs font-medium text-slate-300 sm:text-sm">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Tilt>
      ))}
    </div>
  </section>
);

export default Skills;
