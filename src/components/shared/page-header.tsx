import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("container-x pt-14 pb-10 sm:pt-20 sm:pb-14", className)}>
      {eyebrow ? <p className="text-eyebrow mb-4 text-coral">{eyebrow}</p> : null}
      <h1 className="display-xl max-w-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">{subtitle}</p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
