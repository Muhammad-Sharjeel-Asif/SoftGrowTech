import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", title, description, action }: CardHeaderProps) {
  return (
    <div className={`border-b border-gray-200 bg-gray-50/50 px-6 py-4 ${className}`}>
      {(title || description || action) ? (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`text-base font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p className={`mt-1 text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`border-t border-gray-200 bg-gray-50/50 px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}
