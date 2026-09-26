type SectionProps = {
  number: string | number;
  title: string;
  text: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminFormSection({ number, title, text, children, className = "" }: SectionProps) {
  return <section className={`product-form-section admin-form-section ${className}`.trim()}>
    <header><span className="admin-form-section-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></header>
    {children}
  </section>;
}

export function AdminFormGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`product-form-grid ${className}`.trim()}>{children}</div>;
}
