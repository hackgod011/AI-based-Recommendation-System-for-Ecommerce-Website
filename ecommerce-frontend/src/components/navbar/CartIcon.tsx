import { ShoppingCart } from "lucide-react";

export default function CartIcon() {
  return (
    <div className="relative cursor-pointer text-white">
      <ShoppingCart size={22} />
      <span className="absolute -top-1 -right-2 bg-amber-400 text-black text-xs rounded-full px-1">
        0
      </span>
    </div>
  );
}
