import { Briefcase } from "lucide-react";

const experiences = [
  {
    company: "Grupo Dalton",
    role: "Mid Artificial Intelligence Developer",
    period: "Nov 2025 – Present",
    location: "Hybrid - Guadalajara, Jalisco, MX",
    highlights: [
      "Architected intelligent automation using Google Genkit, N8N, LangChain and LangGraph. Developed agentic workflows for document parsing (XML/PDF) and anomaly detection with Vector Databases for RAG.",
      "Designed the \"Dalton Plan Piso Platform\" — a scalable Event-Driven Architecture on Firebase (GCP) and Azure with serverless Cloud Functions for high-concurrency financial logic.",
      "Engineered a deterministic Finite State Machine (FSM) governing the lifecycle of financed assets, from XML ingestion through validation, funding, and liquidation.",
      "Orchestrated ETL pipelines using n8n and REST APIs to synchronize real-time data between MS Dynamics 365 and Firestore databases.",
      "Developed responsive dashboards using Next.js, TypeScript, and ShadCN UI for real-time credit line monitoring with automated PDF report generation.",
    ],
  },
  {
    company: "Grupo TI Mexico",
    role: "Junior Artificial Intelligence Engineer",
    period: "Aug 2025 – Nov 2025",
    location: "Mexico City, MX",
    highlights: [
      "Designed and deployed AI-driven applications integrating NLP and RAG pipelines using Oracle Cloud Infrastructure (OCI).",
      "Built Python and JavaScript-based backends to orchestrate data ingestion and Computer Vision analysis services via RESTful APIs in Oracle APEX.",
    ],
  },
  {
    company: "L'Oreal",
    role: "Beauty Tech Intern (IT and Data)",
    period: "Nov 2024 – July 2025",
    location: "Hybrid - Mexico City, MX",
    highlights: [
      "Designed a centralized data architecture for the Procurement department, including automated ETL processes for financial calculations and sampling.",
      "Developed an interactive financial media dashboard providing strategic visibility across Mexico operations for 40+ users.",
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Briefcase size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Experience</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        <div className="space-y-12">
          {experiences.map((exp, i) => (
            <div key={i} className="relative pl-6 border-l border-border">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <h3 className="text-lg font-semibold">{exp.company}</h3>
                <span className="text-sm text-muted font-mono">
                  {exp.period}
                </span>
              </div>
              <p className="text-accent text-sm mb-1">{exp.role}</p>
              <p className="text-muted text-xs mb-4">{exp.location}</p>
              <ul className="space-y-2">
                {exp.highlights.map((item, j) => (
                  <li
                    key={j}
                    className="text-sm text-muted leading-relaxed flex gap-2"
                  >
                    <span className="text-accent mt-1 shrink-0">▹</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
