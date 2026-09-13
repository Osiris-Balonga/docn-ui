declare module "pako" {
  export interface InflateOptions {
    chunkSize?: number;
  }

  export class Inflate {
    constructor(options?: InflateOptions);
    err: number;
    msg: string;
    onData(chunk: Uint8Array): void;
    push(data: Uint8Array, final: boolean): boolean;
  }
}
