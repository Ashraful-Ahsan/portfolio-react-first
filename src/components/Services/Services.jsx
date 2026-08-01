import React from "react";
import { experiences } from "../../constants";

const Services = () => {
  return (
    <section id="services" className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
      <div className="text-center">
        <h2 className="section-title">Services</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
        <p className="section-subtitle">
          I build modern web experiences that balance sharp design, reliable development, and practical business value.
        </p>
      </div>

      <div className="mt-14 space-y-6">
        {experiences.map((experience, index) => (
          <div key={experience.id} className={`flex ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}>
            <div className="glass-card w-full rounded-3xl p-6 sm:p-8 lg:max-w-3xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                    <img src={experience.img} alt={experience.role} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{experience.role}</h3>
                    <p className="text-sm text-slate-400">Focused on clean delivery and scalable results</p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-slate-400">{experience.desc}</p>
              <div className="mt-6">
                <h5 className="font-medium text-white">Core skills</h5>
                <div className="mt-3 flex flex-wrap gap-2">
                  {experience.skills.map((skill, idx) => (
                    <span key={`${skill}-${idx}`} className="tag-pill">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
