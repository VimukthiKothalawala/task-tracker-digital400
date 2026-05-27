import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      secondary: "text-secondary-foreground",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    variant: "default",
  },
});

export interface TextProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof textVariants> {
  as?: React.ElementType;
}

function Text({
  className,
  size,
  weight,
  variant,
  as: Component = "div",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ size, weight, variant }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
