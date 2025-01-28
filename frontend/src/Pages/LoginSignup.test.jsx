import { render, screen, fireEvent } from "@testing-library/react";
import LoginSignup from "./LoginSignup";

describe("LoginSignup Component", () => {
  test("renders Login state correctly", () => {
    render(<LoginSignup />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("validates email input", () => {
    render(<LoginSignup />);
    const emailInput = screen.getByPlaceholderText("Email address");

    // Test invalid email
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    expect(screen.getByText("Invalid email format.")).toBeInTheDocument();

    // Test valid email
    fireEvent.change(emailInput, { target: { value: "valid@example.com" } });
    expect(screen.queryByText("Invalid email format.")).not.toBeInTheDocument();
  });

  test("validates password input", () => {
    render(<LoginSignup />);
    const passwordInput = screen.getByPlaceholderText("Password");

    // Test invalid password
    fireEvent.change(passwordInput, { target: { value: "weakpass" } });
    expect(
      screen.getByText(
        "Password must include uppercase, lowercase, number, and special character."
      )
    ).toBeInTheDocument();

    // Test valid password
    fireEvent.change(passwordInput, { target: { value: "Strong@123" } });
    expect(
      screen.queryByText(
        "Password must include uppercase, lowercase, number, and special character."
      )
    ).not.toBeInTheDocument();
  });

  test("submits login form with valid inputs", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, token: "mock-token" }),
      })
    );

    render(<LoginSignup />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "Strong@123" },
    });
    fireEvent.click(screen.getByText("Continue"));

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:4000/login", expect.any(Object));
  });

  test("displays errors for invalid form submission", () => {
    render(<LoginSignup />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "invalidemail" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "weakpass" },
    });
    fireEvent.click(screen.getByText("Continue"));

    expect(screen.getByText("Invalid email format.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Password must include uppercase, lowercase, number, and special character."
      )
    ).toBeInTheDocument();
  });
});
