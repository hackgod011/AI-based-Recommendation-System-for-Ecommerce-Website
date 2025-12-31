import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import CartIcon from "./CartIcon";

export default function Navbar() { 
  return ( 
    <header className="sticky top-0 z-50 bg-gradient-to-r from-zinc-900 via-slate-900 to-neutral-900 border-b border-white/10">
      <div className="relative w-full flex items-center px-8 py-6"> {/* Logo */}
        
        <div className="flex items-center gap-2 text-white text-3xl h-12 w-12 min-w-[220px] font-bold cursor-pointer">   
          <img src="/images/logo2.svg" alt="Logo" className="h-10 w-10" />
            <span> Shop<span className="text-amber-400">AI</span></span> 
        </div> 
        
        {/* Search */} 
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
          <SearchBar /> 
        </div> {/* Right Actions (Far Right) */}
            
        <div className="flex items-center gap-8 text-white ml-auto text-m">
          <LanguageSwitcher />
          <UserMenu />
          <CartIcon /> 
        </div> 
      </div> 
    </header> 
  ); 
}