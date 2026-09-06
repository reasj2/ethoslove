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
    <header className={cn("container-x pt-12 pb-10 sm:pt-16 sm:pb-12", className)}>
      {eyebrow ? <p className="text-eyebrow mb-5 text-ink-soft">{eyebrow}</p> : null}
      <h1 className="display-xl max-w-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">{subtitle}</p>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}
