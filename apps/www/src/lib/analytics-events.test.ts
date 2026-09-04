import { describe, expect, it } from "vitest";
import {
  eventProperties,
  pageEventForPathname,
  sanitizeTransportEvent,
} from "./analytics-events";

describe("privacy-minimal analytics events", () => {
  it("maps routes to coarse page identifiers without sending the path", () => {
    expect(
      pageEventForPathname("/templates/private-looking-slug/", "navigation"),
    ).toEqual({
      name: "page_viewed",
      properties: {
        pageId: "template-detail",
        pageType: "detail",
        source: "navigation",
      },
    });
    expect(
      eventProperties(pageEventForPathname("/docs/installation/", "initial")),
    ).toEqual({
      page_id: "documentation",
      page_type: "documentation",
      source: "initial",
    });
    expect(pageEventForPathname("/formats/", "initial")).toMatchObject({
      properties: { pageId: "formats", pageType: "site" },
    });
  });

  it("keeps only required cookieless context and approved controlled properties", () => {
    const result = sanitizeTransportEvent({
      uuid: "11111111-1111-4111-8111-111111111111",
      event: "preview_opened",
      properties: {
        token: "phc_public-token",
        distinct_id: "$posthog_cookieless",
        $cookieless_mode: true,
        $process_person_profile: false,
        $referring_domain: "github.com",
        $current_url: "https://example.com/?document=private",
        $referrer: "https://example.com/private",
        $browser: "Browser",
        content_id: "invoice-standard",
        content_type: "template",
        content_family: "invoice",
        visibility: "public",
        source: "catalog",
        document_text: "Private invoice content",
        search_query: "secret terms",
      },
      $set: { email: "person@example.com" },
    });

    expect(result).toEqual({
      uuid: "11111111-1111-4111-8111-111111111111",
      event: "preview_opened",
      properties: {
        token: "phc_public-token",
        distinct_id: "$posthog_cookieless",
        $cookieless_mode: true,
        $process_person_profile: false,
        $referring_domain: "github.com",
        content_id: "invoice-standard",
        content_type: "template",
        content_family: "invoice",
        visibility: "public",
        source: "catalog",
      },
    });
    expect(JSON.stringify(result)).not.toMatch(
      /private|search_query|email|current_url|referrer/i,
    );
  });

  it("drops unknown events and uncontrolled identifiers", () => {
    expect(
      sanitizeTransportEvent({
        uuid: "22222222-2222-4222-8222-222222222222",
        event: "$autocapture",
        properties: { token: "public" },
      }),
    ).toBeNull();
    expect(
      sanitizeTransportEvent({
        uuid: "33333333-3333-4333-8333-333333333333",
        event: "download_started",
        properties: {
          token: "public",
          content_id: "invoice/customer@example.com",
          content_type: "template",
          content_family: "invoice",
          source: "catalog",
          format: "pdf",
        },
      }),
    ).toBeNull();
  });
});
