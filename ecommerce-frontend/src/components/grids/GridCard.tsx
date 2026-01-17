import { useNavigate } from 'react-router-dom';

type GridCardProps = {
  image: string;
  title: string;
  category?: string; // Category slug for navigation
  onClick?: () => void;
};

export default function GridCard({ image, title, category }: GridCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (category) {
      navigate(`/category/${category}`);
    }
  };

  return (
    <div 
      className="cursor-pointer group"
      onClick={handleClick}
    >
      <div className="bg-white rounded-sm overflow-hidden">
        <div className="relative h-[240px] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-3 text-center bg-white">
          <p className="text-sm font-medium text-gray-900">{title}</p>
        </div>
      </div>
    </div>
  );
}