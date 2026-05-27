import { Card } from "@/components/ui/card";
import { Heading } from "@/components/atoms";

export interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="space-y-6 p-8">
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heading as="h1" size="h3" className="text-white">
                  ✓
                </Heading>
              </div>
            </div>
            <Heading as="h1" size="h2">
              {title}
            </Heading>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </Card>
    </div>
  );
}
