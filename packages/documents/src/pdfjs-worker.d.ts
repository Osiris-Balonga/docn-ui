declare module "pdfjs-dist/legacy/build/pdf.worker.min.mjs" {
  export const WorkerMessageHandler: {
    initializeFromPort(port: unknown): void;
  };
}
