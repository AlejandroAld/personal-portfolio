import { Mail, Linkedin, Github, MapPin } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center px-6 pt-20"
    >
      <div className="max-w-3xl w-full">
        <p className="text-accent font-mono text-sm mb-4">Hi, my name is</p>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
          Alejandro Aldama<span className="text-accent">.</span>
        </h1>
        <h2 className="text-2xl sm:text-4xl font-bold text-muted mb-6">
          I build intelligent systems.
        </h2>
        <p className="text-muted max-w-xl leading-relaxed mb-4">
          AI Engineer specializing in{" "}
          <span className="text-foreground font-medium">
            Generative AI, Agentic Workflows, and Cloud Architecture
          </span>
          . I design and deploy scalable AI-driven applications — from NLP
          pipelines and RAG architectures to full-stack dashboards and
          event-driven backends.
        </p>
        <div className="flex items-center gap-2 text-muted text-sm mb-8">
          <MapPin size={14} />
          <span>Zapopan, Jalisco, Mexico</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="mailto:josealejandroaldamaramos@gmail.com"
            className="inline-flex items-center gap-2 border border-accent text-accent px-5 py-2.5 rounded text-sm font-mono hover:bg-accent/10 transition-colors"
          >
            <Mail size={16} />
            Get in touch
          </a>
          <a
            href="https://www.linkedin.com/in/jose-alejandro-aldama-ramos/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={22} />
          </a>
          <a
            href="https://github.com/AlejandroAld"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent transition-colors"
            aria-label="GitHub"
          >
            <Github size={22} />
          </a>
        </div>
      </div>
    </section>
  );
}
