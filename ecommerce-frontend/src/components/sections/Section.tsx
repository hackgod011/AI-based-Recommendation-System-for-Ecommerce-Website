type SectionProps = {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
  children: React.ReactNode;
  backgroundColor?: string;
};

export default function Section({ 
  title, 
  actionText, 
  onActionClick, 
  children,
  backgroundColor = "white"
}: SectionProps) {
  return (
    <section 
      className="mb-5"
      style={{ backgroundColor }}
    >
      <div className="px-4 py-5">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {title}
          </h2>
          {actionText && (
            <button
              onClick={onActionClick}
              className="text-sm text-[#007185] hover:text-[#C7511F] hover:underline font-medium"
            >
              {actionText}
            </button>
          )}
        </div>

        {/* Section Content */}
        <div>
          {children}
        </div>
      </div>
    </section>
  );
}