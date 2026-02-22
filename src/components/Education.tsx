import { GraduationCap, Award, ExternalLink, BadgeCheck, Database, BarChart3, FolderKanban, Zap } from "lucide-react";

const certifications = [
  {
    title: "Introduction to Agile Development and Scrum",
    issuer: "IBM",
    platform: "Coursera",
    link: "https://www.coursera.org/account/accomplishments/verify/7FZWHVNPBGZG",
    category: "management",
    skills: ["Scrum", "Agile", "Kanban"],
  },
  {
    title: "Foundations of Project Management",
    issuer: "Google",
    platform: "Coursera",
    link: "https://coursera.org/share/3966b82ba3996267650f239f42d23459",
    category: "management",
    skills: ["Project Management", "Planning"],
  },
  {
    title: "Preparing Data with BigQuery",
    issuer: "Google Cloud",
    platform: "Coursera",
    link: "https://coursera.org/share/da7bca3e69bfb7cadb6b1a31d9c33d87",
    category: "data",
    skills: ["BigQuery", "SQL", "GCP"],
  },
  {
    title: "Business Analysis for Data Science",
    issuer: "Professional Diploma",
    platform: "Diploma",
    link: "https://drive.google.com/file/d/1E36UaZyTW_Bt7cP4WbsfVifJxkkJNbKx/view?usp=sharing",
    category: "data",
    skills: ["Business Analysis", "Data Science"],
  },
  {
    title: "Data Quality",
    issuer: "Data Engineering",
    platform: "Udemy",
    link: "https://www.udemy.com/certificate/UC-61307c83-d295-4207-b8e7-fec9ca0e029f/",
    category: "data",
    skills: ["Data Quality", "ETL"],
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  data: <Database size={14} />,
  management: <FolderKanban size={14} />,
};

const categoryLabels: Record<string, string> = {
  data: "Data & AI",
  management: "Management",
};

export default function Education() {
  const grouped = certifications.reduce<Record<string, typeof certifications>>(
    (acc, cert) => {
      if (!acc[cert.category]) acc[cert.category] = [];
      acc[cert.category].push(cert);
      return acc;
    },
    {}
  );

  return (
    <section id="education" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Education Header */}
        <div className="flex items-center gap-3 mb-12">
          <GraduationCap size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Education</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>

        {/* University Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
          <div className="pl-4">
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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono font-medium text-foreground bg-accent/10 px-2 py-0.5 rounded">
                GPA: 9.31 / 10.0
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              <span className="text-foreground font-medium">
                Relevant Coursework:
              </span>{" "}
              Statistics & Probability, Machine Learning, Deep Learning, Parallel
              Computing (C++/CUDA), Algorithms & Data Structures, Databases,
              Object-Oriented Programming.
            </p>
          </div>
        </div>

        {/* Certifications Header */}
        <div className="flex items-center gap-3 mb-3">
          <Award size={20} className="text-accent" />
          <h2 className="text-2xl font-bold">Certifications</h2>
          <div className="flex-1 h-px bg-border ml-4" />
        </div>
        <p className="text-sm text-muted mb-10">
          Professional certifications and courses from leading tech companies and platforms.
        </p>

        {/* Grouped Certifications */}
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, certs]) => (
            <div key={category}>
              {/* Category Label */}
              <div className="flex items-center gap-2 mb-5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1.5 rounded-full">
                  {categoryIcons[category]}
                  {categoryLabels[category]}
                </span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Cert Cards */}
              <div className="grid gap-4">
                {certs.map((cert) => (
                  <a
                    key={cert.title}
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-card border border-border rounded-lg p-5 hover:border-accent/40 transition-all hover:bg-card-hover flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 shrink-0 group-hover:bg-accent/20 transition-colors">
                      <BadgeCheck size={20} className="text-accent" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug">
                            {cert.title}
                          </h4>
                          <p className="text-xs text-muted mt-1">
                            {cert.issuer}
                            <span className="text-border mx-1.5">·</span>
                            {cert.platform}
                          </p>
                        </div>
                        <ExternalLink
                          size={14}
                          className="text-muted group-hover:text-accent transition-colors mt-0.5 shrink-0 hidden sm:block"
                        />
                      </div>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-mono text-muted border border-border/60 px-2 py-0.5 rounded group-hover:border-accent/30 group-hover:text-foreground transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
