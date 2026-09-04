import {
  eventProperties,
  pageEventForPathname,
  sanitizeTransportEvent,
  type AnalyticsEvent,
} from "./analytics-events";

const approvedHost = "https://eu.i.posthog.com";
type PostHogClient =
  typeof import("posthog-js/dist/module.slim.no-external").default;

let client: PostHogClient | undefined;
let initialized = false;
let loading = false;
const pendingEvents: AnalyticsEvent[] = [];

export function initializeAnalytics() {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!token || host !== approvedHost) return false;
  if (initialized || loading) return true;

  loading = true;
  void import("posthog-js/dist/module.slim.no-external")
    .then(({ default: posthog }) => {
      posthog.init(token, {
        api_host: host,
        defaults: "2026-05-30",
        cookieless_mode: "always",
        person_profiles: "never",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_performance: false,
        capture_heatmaps: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        mask_all_text: true,
        mask_all_element_attributes: true,
        before_send: sanitizeTransportEvent,
      });
      client = posthog;
      initialized = true;
      loading = false;
      for (const event of pendingEvents.splice(0)) {
        posthog.capture(event.name, eventProperties(event));
      }
    })
    .catch(() => {
      loading = false;
      pendingEvents.length = 0;
    });
  return true;
}

export function captureAnalyticsEvent(event: AnalyticsEvent) {
  if (initialized && client) {
    client.capture(event.name, eventProperties(event));
    return;
  }
  if (loading && pendingEvents.length < 20) pendingEvents.push(event);
}

export function capturePageView(
  pathname: string,
  source: "initial" | "navigation",
) {
  captureAnalyticsEvent(pageEventForPathname(pathname, source));
}
