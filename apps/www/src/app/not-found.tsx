import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <p>404</p>
      <h1>This page is not here.</h1>
      <p>The project is still taking shape. Return to the home page for its current status.</p>
      <Link href="/">Back to docn-ui</Link>
    </main>
  );
}
