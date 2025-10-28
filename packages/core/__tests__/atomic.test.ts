import { atomic } from "../src";

describe("atomic", () => {
  it("returns base and override classes when no variants are provided", () => {
    const variants = atomic({
      base: "text-center",
      override: "font-bold",
      variants: {
        size: {
          small: "test",
        },
        padding: {
          medium: "test",
          small: "test",
        },
        color: {
          backlground: "test",
          red: "best",
        },
      },
      responsiveVariants: true,
    });

    expect(variants()).toBe("text-center font-bold");
  });

  it("applies variant classes correctly", () => {
    const variants = atomic({
      base: "text-center",
      override: "font-bold",
      variants: {
        size: {
          small: "text-sm",
          large: "text-lg",
        },
        color: {
          red: "text-red-500",
          blue: "text-blue-500",
        },
      },
    });

    expect(variants({ size: "small", color: "red" })).toBe(
      "text-center text-sm text-red-500 font-bold"
    );
  });

  it("merges className correctly and prioritizes it over override and variants", () => {
    const variants = atomic({
      base: "text-center",
      override: "font-bold",
      variants: {
        size: {
          small: "text-sm",
        },
      },
    });

    expect(
      variants({ size: "small", className: "text-lg font-extrabold" })
    ).toBe("text-center text-sm font-bold text-lg font-extrabold");
  });

  it("supports boolean variants", () => {
    const variants = atomic({
      base: "flex",
      variants: {
        isActive: {
          true: "bg-green-500",
          false: "bg-gray-300",
        },
      },
    });

    expect(variants({ isActive: true })).toBe("flex bg-green-500");
    expect(variants({ isActive: false })).toBe("flex bg-gray-300");
  });

  it("handles responsive variants with true flag (all variants)", () => {
    const variants = atomic({
      base: "w-20 h-20",
      variants: {
        padding: {
          small: "p-1",
          large: "p-2",
        },
      },
      responsiveVariants: true,
    });

    expect(variants({ padding: { xs: "small", md: "large" } })).toBe(
      "w-20 h-20 p-1 md:p-2"
    );
  });

  it("handles responsive variants with specific keys", () => {
    const variants = atomic({
      base: "w-20 h-20",
      variants: {
        padding: {
          small: "p-1",
          large: "p-2",
        },
        color: {
          red: "text-red-500",
          blue: "text-blue-500",
        },
      },
      responsiveVariants: ["padding"],
    });

    expect(
      variants({ padding: { xs: "small", lg: "large" }, color: "red" })
    ).toBe("w-20 h-20 p-1 lg:p-2 text-red-500");
  });

  it("treats xs value as default without prefix", () => {
    const variants = atomic({
      base: "block",
      variants: {
        padding: {
          sm: "p-2",
          md: "p-4",
        },
      },
      responsiveVariants: true,
    });

    expect(variants({ padding: { xs: "sm", md: "md" } })).toBe(
      "block p-2 md:p-4"
    );
  });

  it("ignores responsive variants when not enabled", () => {
    const variants = atomic({
      base: "block",
      variants: {
        padding: {
          sm: "p-2",
          md: "p-4",
        },
      },
    });

    expect(variants({ padding: { xs: "sm", md: "md" } as any })).toBe("block");
  });

  it("returns correct class order: base → variants → override → className", () => {
    const variants = atomic({
      base: "text-base",
      override: "text-red-500",
      variants: {
        color: {
          blue: "text-blue-500",
        },
      },
    });

    expect(variants({ color: "blue", className: "text-green-500" })).toBe(
      "text-base text-blue-500 text-red-500 text-green-500"
    );
  });
});
