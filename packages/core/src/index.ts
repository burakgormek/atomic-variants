export type GetVariants<T extends (...args: never) => unknown> =
  Parameters<T>[0];

export type ClassNameProps<T extends string = never> = {
  className?: string;
} & {
  [K in T as `${K}ClassName`]?: string;
};

type ConvertBoolean<T> = T extends "true" | "false" ? boolean : T;
type BreakPoints = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type VariantParams<
  Variant,
  ResponsiveVariants extends boolean | Array<keyof Variant>
> = ClassNameProps & {
  [K in keyof Variant]?:
    | ConvertBoolean<keyof Variant[K]>
    | (ResponsiveVariants extends true
        ? Partial<Record<BreakPoints, ConvertBoolean<keyof Variant[K]>>>
        : ResponsiveVariants extends Array<keyof Variant>
        ? Extract<K, ResponsiveVariants[number]> extends never
          ? undefined
          : Partial<Record<BreakPoints, ConvertBoolean<keyof Variant[K]>>>
        : undefined);
};

export let config = {
  finalize: (result: string) => result,
};

export function atomic<
  Variants extends Record<string, Record<string, string>>,
  ResponsiveVariants extends boolean | Array<keyof Variants> = false
>({
  base = "",
  override,
  variants,
  defaultVariants,
  responsiveVariants,
}: {
  base?: string;
  override?: string;
  variants?: Variants;
  defaultVariants?: VariantParams<Variants, ResponsiveVariants>;
  responsiveVariants?: ResponsiveVariants;
}) {
  return (
    {
      className,
      ...paramVariants
    }: VariantParams<Variants, ResponsiveVariants> = { className: undefined }
  ) => {
    let classes: (string | undefined)[] = [base];
    const filteredParamVariants = Object.fromEntries(
      Object.entries(paramVariants).filter(([_, value]) => value !== undefined)
    );

    if (typeof variants == "undefined") {
      return classes.join(" ").trim();
    }

    for (const [key, variant] of Object.entries({
      ...defaultVariants,
      ...filteredParamVariants,
    }) as [keyof Variants, keyof Variants[keyof Variants]][]) {
      // TODO
      if (!variants[key]) {
        continue;
      }

      const isResponsiveVariant = Array.isArray(responsiveVariants)
        ? responsiveVariants.includes(key)
        : responsiveVariants == true;
      if (typeof variant == "object" && isResponsiveVariant) {
        for (const [size, resVariant] of Object.entries(variant) as [
          BreakPoints,
          keyof Variants[keyof Variants]
        ][]) {
          if (size == "xs") {
            classes.push(variants[key][resVariant as string]);
          } else {
            classes.push(`${size}:${variants[key][resVariant as string]}`);
          }
        }
        continue;
      }

      const currentVariant = variants[key][variant as string];
      if (currentVariant) {
        classes.push(currentVariant);
      }
    }

    if (override) {
      classes.push(override);
    }

    if (className) {
      classes.push(className);
    }

    return config.finalize(classes.join(" ").trim());
  };
}
