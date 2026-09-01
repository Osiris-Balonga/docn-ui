"use client";

import { useLayoutEffect, useRef } from "react";
import { DesktopDocsNavigation } from "./docs-navigation";

const SCROLL_STORAGE_KEY = "docn-ui:documentation-sidebar-scroll";

function readStoredScrollPosition() {
  try {
    const value = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (value === null) return 0;
    const position = Number(value);
    return Number.isFinite(position) && position >= 0 ? position : 0;
  } catch {
    return 0;
  }
}

export function PersistentDocsSidebar() {
  const sidebarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const scrollContainer = sidebar;
    scrollContainer.scrollTop = readStoredScrollPosition();

    function rememberPosition() {
      try {
        window.sessionStorage.setItem(
          SCROLL_STORAGE_KEY,
          String(scrollContainer.scrollTop),
        );
      } catch {
        // Navigation remains fully usable when session storage is unavailable.
      }
    }

    scrollContainer.addEventListener("scroll", rememberPosition, {
      passive: true,
    });
    return () => {
      rememberPosition();
      scrollContainer.removeEventListener("scroll", rememberPosition);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="scrollbar-hidden sticky top-16 hidden h-[calc(100svh-4rem)] overflow-y-auto py-8 pr-6 md:block"
      data-testid="documentation-sidebar"
    >
      <DesktopDocsNavigation />
    </aside>
  );
}
