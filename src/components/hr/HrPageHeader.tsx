interface HrPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function HrPageHeader({ title, description, children }: HrPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  );
}
