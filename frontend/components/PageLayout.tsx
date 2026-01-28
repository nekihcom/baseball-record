import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageLayoutProps {
  headerContent?: ReactNode;
  children: ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export function PageLayout({
  headerContent,
  children,
  headerClassName = "",
  contentClassName = "",
}: PageLayoutProps) {
  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none py-0">
        {headerContent && (
          <CardHeader className={`px-0 ${headerClassName}`}>
            <div className="py-4 border-b">{headerContent}</div>
          </CardHeader>
        )}
        <CardContent className={`px-0 ${contentClassName}`}>{children}</CardContent>
      </Card>
    </div>
  );
}
