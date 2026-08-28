import { ProjectLink } from "@/features/home/project-link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col justify-center gap-8 px-6 py-16 sm:px-12">
      <p className="font-mono text-xs text-muted-foreground">docn-ui <span aria-hidden="true" className="mx-2">/</span> In development</p>
      <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">PDF templates.<br />In your codebase.</h1>
      <p className="max-w-xl text-base leading-7 text-muted-foreground">A toolkit for documents that deserve thoughtful design. We are building the foundation; templates and PDF generation are not available yet.</p>
      <ProjectLink />
    </main>
  );
}
