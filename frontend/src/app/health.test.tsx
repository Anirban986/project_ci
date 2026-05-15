import { render, screen } from "@testing-library/react";
import Page from "./page";

test("renders homepage", () => {
  render(<Page />);
  expect(screen.getByText(/MedLink/i)).toBeInTheDocument();
});