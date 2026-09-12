import rootPackage from "../../../../package.json";

export const releasePackageVersion = rootPackage.version;
export const releaseRegistryVersion = `v${releasePackageVersion}`;
export const registryVersion =
  process.env.NODE_ENV === "development" ? "dev" : releaseRegistryVersion;
export const registryPath = `/r/${registryVersion}`;
