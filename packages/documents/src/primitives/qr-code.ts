import QRCodeEncoder, { type QRCode } from "qrcode";
import { DocumentValidationError } from "../core/errors";

const QR_PAYLOAD_BYTES = 512;
const PRINT_QUIET_ZONE_MODULES = 4;

export interface PrintableQrGeometry {
  code: QRCode;
  matrixSize: number;
  moduleSize: number;
  quietZone: number;
  totalModules: number;
}

export function createPrintableQrGeometry(
  payload: string,
  size: number,
  minimumModuleSize: number,
): PrintableQrGeometry {
  if (!Number.isFinite(minimumModuleSize) || minimumModuleSize <= 0) {
    throw new Error("QR minimumModuleSize must be a positive point value.");
  }
  if (new TextEncoder().encode(payload).byteLength > QR_PAYLOAD_BYTES) {
    throw new DocumentValidationError([
      {
        code: "LIMIT_EXCEEDED",
        message: `QR payload exceeds ${QR_PAYLOAD_BYTES} UTF-8 bytes.`,
        path: ["data", "qrPayload"],
      },
    ]);
  }
  const code = QRCodeEncoder.create(payload, { errorCorrectionLevel: "M" });
  const matrixSize = code.modules.size;
  const totalModules = matrixSize + PRINT_QUIET_ZONE_MODULES * 2;
  const moduleSize = size / totalModules;
  if (moduleSize < minimumModuleSize) {
    throw new DocumentValidationError([
      {
        code: "QR_TOO_DENSE",
        message: "QR content is too dense for the selected printable area.",
        path: ["data", "qrPayload"],
      },
    ]);
  }
  return {
    code,
    matrixSize,
    moduleSize,
    quietZone: PRINT_QUIET_ZONE_MODULES,
    totalModules,
  };
}
