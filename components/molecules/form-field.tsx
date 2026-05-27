import { Label, Input } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { Text } from "@/components/atoms/text";

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required = false, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <Text size="sm" variant="muted" className="text-red-600">{error}</Text>}
    </div>
  );
}
