import { Mail, Linkedin, Github, Send } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <Send size={20} className="text-accent mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
        <p className="text-muted leading-relaxed mb-8">
          I&apos;m currently open to new opportunities and collaborations. Whether
          you have a project idea, a question, or just want to connect — feel
          free to reach out.
        </p>

        <a
          href="mailto:josealejandroaldamaramos@gmail.com"
          className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-3 rounded text-sm font-mono hover:bg-accent/10 transition-colors mb-8"
        >
          <Mail size={16} />
          Say Hello
        </a>

        <div className="flex items-center justify-center gap-6 mt-4">
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
          <a
            href="mailto:josealejandroaldamaramos@gmail.com"
            className="text-muted hover:text-accent transition-colors"
            aria-label="Email"
          >
            <Mail size={22} />
          </a>
        </div>
      </div>
    </section>
  );
}
