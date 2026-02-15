import { Code2 } from "lucide-react";

const skillCategories = [
  {
    title: "AI, DL & ML",
    skills: [
      "LLMs (OpenAI, Gemini)",
      "RAG Architectures",
      "LangChain",
      "LangGraph",
      "Google Genkit",
      "Transformers",
      "PyTorch",
      "TensorFlow",
    ],
  },
  {
    title: "Cloud & DevOps",
    skills: [
      "Azure AI Services",
      "GCP (Firebase, Functions)",
      "Oracle Cloud (OCI)",
      "Docker",
      "Kubernetes",
      "CI/CD Pipelines",
      "Git",
      "GitHub",
    ],
  },
  {
    title: "Languages",
    skills: [
      "Python (Advanced)",
      "SQL (Advanced)",
      "TypeScript (Intermediate)",
      "C++ (Basic+)",
      "JavaScript",
      "R",
      "Flutter",
    ],
  },
  {
    title: "Backend & Data",
    skills: [
      "FastAPI",
      "Node.js / Next.js",
      "Firestore (NoSQL)",
      "BigQuery",
      "SQLite",
      "MySQL",
      "Vector Databases",
      "PowerBI",
      "n8n",
      "MS Dynamics 365",
    ],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Code2 size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Skills</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        <div className="grid sm:grid-cols-2 gap-8">
          {skillCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-sm font-semibold text-accent mb-4 font-mono uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs text-muted border border-border px-2.5 py-1.5 rounded hover:border-accent/40 hover:text-foreground transition-colors"
                  >
                    {skill}
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
