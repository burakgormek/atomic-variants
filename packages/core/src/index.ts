export type GetVariants<T extends (...args: never) => unknown> =
  Parameters<T>[0];

export type ClassNameProps<T extends string = never> = {
  className?: string;
} & {
  [K in T as `${K}ClassName`]?: string;
};

type KeysOf<T> = T extends readonly (infer K)[] ? K : never;
type ConvertBoolean<T> = T extends "true" | "false" ? boolean : T;

type HasRequiredKeys<T> = T extends true
  ? true
  : KeysOf<T> extends never
  ? false
  : true;
type ConditionalArgs<Condition extends boolean, Args> = Condition extends true
  ? [Args]
  : [Args?];

type BreakPoints = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

type VariantObject<
  Variant,
  ResponsiveVariants extends true | Array<keyof Variant>
> = {
  [K in keyof Variant]: VariantValues<K, Variant, ResponsiveVariants>;
};

type VariantValues<
  K extends keyof Variant,
  Variant,
  ResponsiveVariants extends true | Array<keyof Variant>
> =
  | ConvertBoolean<keyof Variant[K]>
  | (ResponsiveVariants extends true
      ? Partial<Record<BreakPoints, ConvertBoolean<keyof Variant[K]>>>
      : ResponsiveVariants extends Array<keyof Variant>
      ? Extract<K, ResponsiveVariants[number]> extends never
        ? undefined
        : Partial<Record<BreakPoints, ConvertBoolean<keyof Variant[K]>>>
      : undefined);

type VariantParams<
  Variant,
  ResponsiveVariants extends true | Array<keyof Variant>,
  RequiredVariants extends true | Array<keyof Variant>
> = ClassNameProps &
  (RequiredVariants extends true
    ? Required<VariantObject<Variant, ResponsiveVariants>>
    : Required<
        Pick<
          VariantObject<Variant, ResponsiveVariants>,
          KeysOf<RequiredVariants>
        >
      > &
        Partial<
          Omit<
            VariantObject<Variant, ResponsiveVariants>,
            KeysOf<RequiredVariants>
          >
        >);

export let config = {
  finalize: (result: string) => result,
};

export function atomic<
  Variants extends Record<string, Record<string, string>>,
  ResponsiveVariants extends true | Array<keyof Variants> = [],
  RequiredVariants extends true | Array<keyof Variants> = []
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
  defaultVariants?: VariantParams<
    Variants,
    ResponsiveVariants,
    RequiredVariants
  >;
  responsiveVariants?: ResponsiveVariants;
  requiredVariants?: RequiredVariants;
}) {
  return (
    ...args: ConditionalArgs<
      HasRequiredKeys<RequiredVariants>,
      VariantParams<Variants, ResponsiveVariants, RequiredVariants>
    >
  ) => {
    const [{ className, ...paramVariants } = { className: undefined }] = args;

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
