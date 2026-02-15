import { ExternalLink, Github, FolderOpen } from "lucide-react";

const projects = [
  {
    title: "Depression Tendency Prediction via NLP",
    description:
      "Research paper: Developed a depression detection system using PyTorch and Transformer models (BERT, RoBERTa, DeBERTa). Fine-tuned on the DAIC-WOZ dataset and deployed the best performing model via Amazon SageMaker API.",
    tags: ["PyTorch", "Transformers", "BERT", "NLP", "SageMaker"],
    link: "https://www.cys.cic.ipn.mx/ojs/index.php/CyS/article/view/5887",
    github: null,
  },
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
