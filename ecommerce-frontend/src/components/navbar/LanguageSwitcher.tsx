import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function LanguageSwitcher() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-gray-300 text-m font-bold">
        🌐 EN
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>English</DropdownMenuItem>
        <DropdownMenuItem>हिन्दी</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
