// src/app/health.test.tsx
import { render, screen } from "@testing-library/react";
import Page from "./page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

test("renders homepage", () => {
  render(<Page />);
  expect(screen.getByText(/MedLink/i)).toBeInTheDocument();
});