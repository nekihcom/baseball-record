import { ReactNode } from "react";

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
      <div>
        {headerContent && (
          <div className={`px-0 ${headerClassName}`}>
            <div className="py-4 border-b">{headerContent}</div>
          </div>
        )}
        <div className={`px-0 ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}
