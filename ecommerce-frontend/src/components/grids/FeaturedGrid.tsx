type FeaturedItem = {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
};

type FeaturedGridProps = {
  featuredItem: FeaturedItem;
  sideItems: FeaturedItem[];
};

export default function FeaturedGrid({ featuredItem, sideItems }: FeaturedGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Featured Item - Takes full left column */}
      <div 
        className="row-span-2 cursor-pointer group"
        onClick={featuredItem.onClick}
      >
        <div className="bg-white rounded-sm overflow-hidden h-full">
          <div className="relative h-full min-h-[400px]">
            <img
              src={featuredItem.image}
              alt={featuredItem.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white text-xl font-semibold">{featuredItem.title}</h3>
              {featuredItem.subtitle && (
                <p className="text-white/90 text-sm mt-1">{featuredItem.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side Items - Right column */}
      <div className="space-y-4">
        {sideItems.slice(0, 2).map((item, index) => (
          <div 
            key={index}
            className="cursor-pointer group"
            onClick={item.onClick}
          >
            <div className="bg-white rounded-sm overflow-hidden">
              <div className="relative h-[192px]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-gray-600 mt-1">{item.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}