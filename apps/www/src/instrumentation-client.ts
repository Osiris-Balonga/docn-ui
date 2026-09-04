import { capturePageView, initializeAnalytics } from "@/lib/analytics-client";

try {
  if (initializeAnalytics())
    capturePageView(window.location.pathname, "initial");
} catch {
  // Analytics must never block hydration or product behavior.
}

export function onRouterTransitionStart(url: string) {
  try {
    capturePageView(
      new URL(url, window.location.origin).pathname,
      "navigation",
    );
  } catch {
    // Navigation remains independent from analytics delivery.
  }
}
