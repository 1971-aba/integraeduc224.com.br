type GestorPageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function GestorPageHeader({
  title,
  description,
  actions,
}: GestorPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="w-full shrink-0 sm:w-auto [&_a]:block [&_button]:w-full sm:[&_button]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
