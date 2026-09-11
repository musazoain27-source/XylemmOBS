export default function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label} {required && <span className="text-ember-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-charcoal-500">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
