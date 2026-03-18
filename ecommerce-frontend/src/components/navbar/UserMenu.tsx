import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, UserCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserMenu() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // While auth is resolving, show a neutral placeholder to avoid a flash
  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse" />;
  }

  if (!user) {
    return (
      <button
        onClick={() => navigate('/signin')}
        className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
      >
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  const initials = (user.full_name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        aria-label="Account menu"
      >
        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
          <span className="text-white text-sm font-semibold">{initials}</span>
        </div>
        <span className="hidden sm:inline max-w-[120px] truncate">
          {user.full_name || user.email}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-neutral-100">
            <p className="text-xs font-semibold text-neutral-900 truncate">
              {user.full_name || 'My Account'}
            </p>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1">
            <MenuButton
              icon={<UserCircle className="h-4 w-4" />}
              label="My Profile"
              onClick={() => { navigate('/profile'); setIsOpen(false); }}
            />
            <MenuButton
              icon={<Sparkles className="h-4 w-4" />}
              label="For You"
              onClick={() => { navigate('/profile?tab=recommendations'); setIsOpen(false); }}
            />
            <MenuButton
              icon={<Package className="h-4 w-4" />}
              label="My Orders"
              onClick={() => { navigate('/orders'); setIsOpen(false); }}
            />
          </div>

          <div className="border-t border-neutral-100 py-1">
            <MenuButton
              icon={<LogOut className="h-4 w-4" />}
              label="Sign Out"
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
