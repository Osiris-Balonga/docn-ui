export type ContentAnalyticsContext = {
  contentId: string;
  contentType: "component" | "documentation" | "template";
  contentFamily: string;
  source: "catalog" | "component-page" | "documentation" | "registry";
};

export type AnalyticsEvent =
  | {
      name: "page_viewed";
      properties: {
        pageId:
          | "component-detail"
          | "components"
          | "documentation"
          | "formats"
          | "home"
          | "not-found"
          | "template-detail"
          | "templates"
          | "themes";
        pageType: "catalog" | "detail" | "documentation" | "site";
        source: "initial" | "navigation";
      };
    }
  | {
      name: "content_viewed" | "preview_opened";
      properties: ContentAnalyticsContext;
    }
  | {
      name: "download_started";
      properties: ContentAnalyticsContext & { format: "pdf" };
    }
  | {
      name: "install_command_copied";
      properties: {
        packageId: string;
        packageFamily: "component" | "template";
        source: "drawer" | "page";
      };
    };

const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedPageIds = new Set([
  "component-detail",
  "components",
  "documentation",
  "formats",
  "home",
  "not-found",
  "template-detail",
  "templates",
  "themes",
]);
const allowedPageTypes = new Set([
  "catalog",
  "detail",
  "documentation",
  "site",
]);
const allowedContentTypes = new Set(["component", "documentation", "template"]);
const allowedContentSources = new Set([
  "catalog",
  "component-page",
  "documentation",
  "registry",
]);

function controlledIdentifier(value: unknown, maximumLength = 80) {
  return typeof value === "string" &&
    value.length <= maximumLength &&
    identifierPattern.test(value)
    ? value
    : undefined;
}

function enumValue(value: unknown, allowed: Set<string>) {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

function sanitizeCustomProperties(
  eventName: string,
  properties: Record<string, unknown>,
) {
  if (eventName === "page_viewed") {
    const pageId = enumValue(properties.page_id, allowedPageIds);
    const pageType = enumValue(properties.page_type, allowedPageTypes);
    const source = enumValue(
      properties.source,
      new Set(["initial", "navigation"]),
    );
    return pageId && pageType && source
      ? { page_id: pageId, page_type: pageType, source }
      : undefined;
  }

  if (eventName === "install_command_copied") {
    const packageId = controlledIdentifier(properties.package_id);
    const packageFamily = enumValue(
      properties.package_family,
      new Set(["component", "template"]),
    );
    const source = enumValue(properties.source, new Set(["drawer", "page"]));
    return packageId && packageFamily && source
      ? { package_id: packageId, package_family: packageFamily, source }
      : undefined;
  }

  if (
    eventName === "content_viewed" ||
    eventName === "preview_opened" ||
    eventName === "download_started"
  ) {
    const contentId = controlledIdentifier(properties.content_id);
    const contentType = enumValue(properties.content_type, allowedContentTypes);
    const contentFamily = controlledIdentifier(properties.content_family);
    const source = enumValue(properties.source, allowedContentSources);
    const format =
      eventName === "download_started"
        ? enumValue(properties.format, new Set(["pdf"]))
        : undefined;
    if (
      !contentId ||
      !contentType ||
      !contentFamily ||
      !source ||
      (eventName === "download_started" && !format)
    )
      return undefined;
    return {
      content_id: contentId,
      content_type: contentType,
      content_family: contentFamily,
      visibility: "public",
      source,
      ...(format ? { format } : {}),
    };
  }

  return undefined;
}

function transportContext(properties: Record<string, unknown>) {
  const context: Record<string, unknown> = {};
  const requiredKeys = [
    "token",
    "distinct_id",
    "$cookieless_mode",
    "$process_person_profile",
  ];
  for (const key of requiredKeys) {
    if (properties[key] !== undefined) context[key] = properties[key];
  }

  const referringDomain = properties.$referring_domain;
  if (typeof referringDomain === "string" && referringDomain.length <= 253) {
    context.$referring_domain = referringDomain;
  }
  const medium = controlledIdentifier(properties.$utm_medium, 40);
  if (medium) context.$utm_medium = medium;

  return context;
}

export function sanitizeTransportEvent(
  event: CaptureResult | null,
): CaptureResult | null {
  if (!event) return null;
  const properties = event.properties;
  const customProperties = sanitizeCustomProperties(event.event, properties);
  if (!customProperties) return null;

  return {
    uuid: event.uuid,
    event: event.event,
    properties: {
      ...transportContext(properties),
      ...customProperties,
    },
    ...(event.timestamp ? { timestamp: event.timestamp } : {}),
  };
}

export function pageEventForPathname(
  pathname: string,
  source: "initial" | "navigation",
): AnalyticsEvent {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return {
      name: "page_viewed",
      properties: { pageId: "home", pageType: "site", source },
    };
  }
  if (segments[0] === "templates") {
    return {
      name: "page_viewed",
      properties: {
        pageId: segments.length > 1 ? "template-detail" : "templates",
        pageType: segments.length > 1 ? "detail" : "catalog",
        source,
      },
    };
  }
  if (segments[0] === "components") {
    return {
      name: "page_viewed",
      properties: {
        pageId: segments.length > 1 ? "component-detail" : "components",
        pageType: segments.length > 1 ? "detail" : "catalog",
        source,
      },
    };
  }
  if (segments[0] === "docs") {
    return {
      name: "page_viewed",
      properties: {
        pageId: "documentation",
        pageType: "documentation",
        source,
      },
    };
  }
  if (segments[0] === "formats" || segments[0] === "themes") {
    return {
      name: "page_viewed",
      properties: {
        pageId: segments[0],
        pageType: "site",
        source,
      },
    };
  }
  return {
    name: "page_viewed",
    properties: { pageId: "not-found", pageType: "site", source },
  };
}

export function eventProperties(event: AnalyticsEvent): Record<string, string> {
  if (event.name === "page_viewed") {
    return {
      page_id: event.properties.pageId,
      page_type: event.properties.pageType,
      source: event.properties.source,
    };
  }
  if (event.name === "install_command_copied") {
    return {
      package_id: event.properties.packageId,
      package_family: event.properties.packageFamily,
      source: event.properties.source,
    };
  }

  return {
    content_id: event.properties.contentId,
    content_type: event.properties.contentType,
    content_family: event.properties.contentFamily,
    visibility: "public",
    source: event.properties.source,
    ...(event.name === "download_started"
      ? { format: event.properties.format }
      : {}),
  };
}
import type { CaptureResult } from "posthog-js";
