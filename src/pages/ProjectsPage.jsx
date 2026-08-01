import React from "react";
import { projects } from "../constants";

const ProjectsPage = () => {
  return (
    <section className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
      <div className="text-center">
        <h2 className="section-title">All Projects</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
        <p className="section-subtitle">
          A deeper look at the builds I&apos;ve created, from frontend interfaces to full-stack products.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(2,6,23,0.35)]">
            <img src={project.image} alt={project.title} className="h-48 w-full object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="tag-pill">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsPage;
