import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { HomeVideoBackground } from "./home-video-background";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("offers one responsive video source per useful resolution", () => {
  mockReducedMotion(false);
  const { container } = render(<HomeVideoBackground />);
  const video = container.querySelector("video");
  const sources = [...container.querySelectorAll("source")];

  expect(video).toHaveAttribute("autoplay");
  expect(video).toHaveAttribute("loop");
  expect(video).toHaveProperty("muted", true);
  expect(video).toHaveAttribute("playsinline");
  expect(video).toHaveAttribute("preload", "metadata");
  expect(sources).toHaveLength(3);
  expect(sources[0]).toHaveAttribute("src", "/media/home-hero-720.mp4");
  expect(sources[0]).toHaveAttribute("media", "(max-width: 767px)");
  expect(sources[1]).toHaveAttribute("src", "/media/home-hero-1440.mp4");
  expect(sources[1]).toHaveAttribute("media", "(min-width: 1921px)");
  expect(sources[2]).toHaveAttribute("src", "/media/home-hero-1080.mp4");
});

test("does not load the animated background when reduced motion is requested", () => {
  mockReducedMotion(true);
  const { container } = render(<HomeVideoBackground />);

  expect(container.querySelector("video")).not.toBeInTheDocument();
});
