import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  Send, // aviãozinho Telegram
  MessageSquare,
  Wallet,
  BarChart2,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  Settings,
  FileText,
  Wand2,
  LogOut,
  HelpCircle,
  Pencil,
} from 'lucide-react';
import { EditAccountNameDialog } from './EditAccountNameDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isAdmin = profile?.role === 'admin';

  // Sidebar exclusivo para admin: apenas Lista de Modelos
  const adminNavItems = [
    { title: 'Lista de Modelos', path: '/lista-modelos', icon: Users },
  ];

  // Sidebar normal para usuários não-admin
  const userNavItems = [
    { title: 'Dashboard', path: '/', icon: Home },
    { title: 'Contatos', path: '/contatos', icon: Users },
    { title: 'Disparos', path: '/disparos', icon: Send },
    { title: 'Boas-Vindas', path: '/boas-vindas', icon: Wand2 },
    { title: 'Suporte', path: '/suporte', icon: HelpCircle },
    { title: 'Conectar Perfil', path: '/conectar-perfil', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Botão mobile */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:translate-x-0 flex flex-col h-full overflow-y-auto`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              {/* Logo aviãozinho */}
              <Send className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">AtendiGram</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {profile?.role === 'admin' && (
            <div className="mt-2 px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary text-center">
              Modo administrador ativo
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-primary' : ''}`} />
              <span>{item.title}</span>

              {isActive(item.path) && (
                <div className="ml-auto flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-slow"></span>
                  <ChevronRight className="h-4 w-4 text-primary ml-1" />
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2 mb-3 group">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
              <AvatarFallback className="text-sm bg-gray-200 dark:bg-gray-700">
                {profile?.account_name 
                  ? profile.account_name.substring(0, 2).toUpperCase()
                  : profile?.email 
                    ? profile.email.substring(0, 2).toUpperCase()
                    : 'AD'
                }
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.account_name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email || 'usuario@atendigram.com'}
              </p>
            </div>
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Editar perfil da conta"
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <EditAccountNameDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </>
  );
};

export default Navbar;
