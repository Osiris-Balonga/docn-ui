import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.min.mjs";

WorkerMessageHandler.initializeFromPort(globalThis);
