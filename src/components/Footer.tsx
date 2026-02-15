export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Built with Next.js & Tailwind CSS
        </p>
        <p className="text-xs text-muted font-mono">
          Jose Alejandro Aldama Ramos &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
