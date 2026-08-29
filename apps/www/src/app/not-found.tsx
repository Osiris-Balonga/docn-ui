import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col justify-center gap-6 px-6 py-16 sm:px-12">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-4xl font-semibold tracking-tight">
        This page is not here.
      </h1>
      <p className="max-w-xl leading-7 text-muted-foreground">
        The project is still taking shape. Return to the home page for its
        current status.
      </p>
      <Link
        className="w-fit underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        href="/"
      >
        Back to docn-ui
      </Link>
    </main>
  );
}
