import { ExternalLink, Github, FolderOpen, BookOpen } from "lucide-react";

const featuredPaper = {
  title: "Detection of Tendency to Depression through Text Analysis",
  journal: "Computacion y Sistemas",
  journalDescription: "International Journal of Computing Science and Applications — IPN, Mexico",
  description:
    "Developed a depression detection system using PyTorch and Transformer models (BERT, RoBERTa, DeBERTa). Fine-tuned on the DAIC-WOZ dataset and deployed the best performing model via Amazon SageMaker API.",
  tags: ["PyTorch", "Transformers", "BERT", "DeBERTa", "NLP", "SageMaker"],
  link: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887",
};

const projects = [
  {
    title: "NutriScan — Mobile Fruit Classification",
    description:
      "Real-time fruit classification and nutritional analysis system using TensorFlow Lite on mobile devices. Optimized neural networks for edge computing performance.",
    tags: ["TensorFlow Lite", "Mobile", "Computer Vision", "Edge Computing"],
    link: null,
    github: "https://github.com/AlejandroAld/NutriScan",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <FolderOpen size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Projects</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        {/* Featured Research Paper */}
        <div className="mb-8">
          <a
            href={featuredPaper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-card border-2 border-accent/40 rounded-lg p-6 hover:border-accent transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-accent/10 px-3 py-1 rounded-bl-lg">
              <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-accent" />
                <span className="text-xs font-mono text-accent font-medium">
                  Research Paper
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold pr-28 mb-2 group-hover:text-accent transition-colors">
              {featuredPaper.title}
            </h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded font-mono">
                {featuredPaper.journal}
              </span>
              <span className="text-xs text-muted">
                {featuredPaper.journalDescription}
              </span>
            </div>

            <p className="text-sm text-muted leading-relaxed mb-4">
              {featuredPaper.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {featuredPaper.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted group-hover:text-accent transition-colors">
              <ExternalLink size={14} />
              <span>Read the full paper</span>
            </div>
          </a>
        </div>

        {/* Other Projects */}
        <div className="grid gap-6">
          {projects.map((project, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-accent transition-colors"
                      aria-label="GitHub repository"
                    >
                      <Github size={18} />
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-accent transition-colors"
                      aria-label="External link"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
