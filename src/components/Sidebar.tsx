import React from 'react';
import { Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  onSectionChange: (section: string) => void;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onSectionChange, activeSection }) => {
  const { theme } = useTheme();
  
  const navigation = [
    { name: 'Home', icon: Home, id: 'home' },
  ];

  return (
    <div className={`w-64 flex-shrink-0 hidden md:flex flex-col h-full overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="p-6">
        <nav className="space-y-8">
          <div>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={`
                      w-full flex items-center px-3 py-2 text-sm font-medium rounded-md 
                      ${activeSection === item.id
                        ? 'text-white bg-gray-800' 
                        : `${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-700 hover:text-black hover:bg-gray-200'}`}
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;