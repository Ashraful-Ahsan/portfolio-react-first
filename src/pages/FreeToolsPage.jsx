import React from "react";
import { Link } from "react-router-dom";
import { TOOLS } from "../data/toolsData";

export default function FreeToolsPage() {
  return (
    <section className="px-[7vw] py-24 md:px-[7vw] lg:px-[18vw] text-slate-100 font-sans min-h-screen bg-[#050811]">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-400">Free Tools</p>
        <h2 className="text-3xl md:text-4xl font-bold mt-3 text-white">Advanced creator and developer utilities</h2>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">A polished toolbox for portfolio work, design iteration, and everyday developer tasks.</p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[["15+", "Live utilities"], ["100%", "Client-side workflows"], ["Instant", "Copy-ready output"]].map(([value, label]) => (
          <div key={label} className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur-md">
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.id}
            to={`/free-tools/${tool.id}`}
            className="group rounded-3xl border border-white/10 bg-white/5 text-slate-300 hover:border-purple-400/60 hover:bg-white/10 p-5 text-left transition-all duration-300 hover:-translate-y-1 block"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{tool.description}</p>
              </div>
              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-purple-200">
                {tool.badge}
              </span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-purple-300 transition group-hover:translate-x-1">
              Open tool <span aria-hidden="true">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}