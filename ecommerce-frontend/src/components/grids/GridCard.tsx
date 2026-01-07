type GridCardProps = {
  image: string;
  title: string;
};

export default function GridCard({ image, title }: GridCardProps) {
  return (
    <div className="cursor-pointer">
      <img
        src={image}
        alt={title}
        className="w-full h-36 object-cover rounded"
      />
      <p className="text-sm mt-2">{title}</p>
    </div>
  );
}
