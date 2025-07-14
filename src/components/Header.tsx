import React from 'react';
import { Sun, Moon, LogOut, User, FileAudio } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={`flex items-center justify-between p-4 md:p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex items-center">
        <div className="h-8 w-8 mr-2 bg-spotify-green rounded-full flex items-center justify-center">
          <FileAudio className="h-4 w-4 text-black" />
        </div>
        <h1 className="text-xl font-bold">PodModerator</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-300" />
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-colors ${
            theme === 'dark' 
              ? 'bg-gray-800 hover:bg-gray-700' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;