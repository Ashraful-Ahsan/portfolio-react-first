import React from "react";
import { education } from "../../constants";

const Education = () => {
  return (
    <section id="education" className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
      <div className="text-center">
        <h2 className="section-title">Education</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
        <p className="section-subtitle">
          A steady academic foundation that continues to shape my technical growth and problem-solving mindset.
        </p>
      </div>

      <div className="mt-14 space-y-6">
        {education.map((edu) => (
          <div key={edu.id} className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                  <img src={edu.img} alt={edu.school} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>
                  <p className="text-sm text-slate-400">{edu.school}</p>
                </div>
              </div>
              <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-sm text-purple-200">
                {edu.date}
              </div>
            </div>

            <p className="mt-5 font-semibold text-slate-200">Grade: {edu.grade}</p>
            <p className="mt-3 text-slate-400">{edu.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Education;
