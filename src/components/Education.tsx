import { GraduationCap, Award, ExternalLink } from "lucide-react";

const certifications = [
  {
    title: "Preparing Data with BigQuery",
    issuer: "Coursera",
    link: "https://coursera.org/share/da7bca3e69bfb7cadb6b1a31d9c33d87",
  },
  {
    title: "Business Analysis for Data Science",
    issuer: "Diploma",
    link: "https://drive.google.com/file/d/1E36UaZyTW_Bt7cP4WbsfVifJxkkJNbKx/view?usp=sharing",
  },
  {
    title: "Data Quality",
    issuer: "Udemy",
    link: "https://www.udemy.com/certificate/UC-61307c83-d295-4207-b8e7-fec9ca0e029f/",
  },
  {
    title: "Foundations of Project Management",
    issuer: "Coursera",
    link: "https://coursera.org/share/3966b82ba3996267650f239f42d23459",
  },
];

export default function Education() {
  return (
    <section id="education" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <GraduationCap size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Education</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h3 className="text-lg font-semibold">
              Instituto Politecnico Nacional
            </h3>
            <span className="text-sm text-muted font-mono">
              Feb 2021 – Jan 2025
            </span>
          </div>
          <p className="text-accent text-sm mb-2">
            B.S. in Artificial Intelligence Engineering
          </p>
          <p className="text-sm text-muted mb-3">GPA: 9.31 / 10.0</p>
          <p className="text-xs text-muted leading-relaxed">
            <span className="text-foreground font-medium">
              Relevant Coursework:
            </span>{" "}
            Statistics & Probability, Machine Learning, Deep Learning, Parallel
            Computing (C++/CUDA), Algorithms & Data Structures, Databases,
            Object-Oriented Programming.
          </p>
        </div>

        {/* Certifications */}
        <div className="flex items-center gap-3 mb-8">
          <Award size={18} className="text-accent" />
          <h3 className="text-xl font-bold">Certifications</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <a
              key={cert.title}
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium group-hover:text-accent transition-colors">
                  {cert.title}
                </p>
                <p className="text-xs text-muted mt-1">{cert.issuer}</p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted group-hover:text-accent transition-colors mt-0.5 shrink-0"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
