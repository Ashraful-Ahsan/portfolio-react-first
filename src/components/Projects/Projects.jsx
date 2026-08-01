import React, { useState } from "react";
import { projects } from "../../constants";

const Projects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  const handleOpenModal = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <section id="projects" className="px-[7vw] py-24 md:px-[7vw] lg:px-[20vw]">
      <div className="text-center">
        <h2 className="section-title">Projects</h2>
        <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400"></div>
        <p className="section-subtitle">
          A collection of practical builds that reflect strong UI design, development discipline, and thoughtful product choices.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleOpenModal(project)}
            className="group cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(2,6,23,0.35)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_80px_rgba(130,69,236,0.2)]"
          >
            <img src={project.image} alt={project.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white">{project.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="flex justify-end p-4">
              <button onClick={handleCloseModal} className="rounded-full border border-white/10 bg-white/5 p-2 text-3xl text-white transition hover:text-purple-400">
                &times;
              </button>
            </div>

            <div className="flex flex-col px-4 pb-6 sm:px-8">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full rounded-2xl object-contain" />
              <div className="mt-6">
                <h3 className="text-2xl font-semibold text-white">{selectedProject.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">{selectedProject.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag, index) => (
                    <span key={`${selectedProject.title}-${index}`} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center">
                    View Code
                  </a>
                  <a href={selectedProject.webapp} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
                    View Live
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;
