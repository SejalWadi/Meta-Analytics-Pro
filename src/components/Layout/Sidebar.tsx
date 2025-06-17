import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Target, 
  Settings, 
  FileText,
  Home,
  Facebook,
  Instagram,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Audience', href: '/audience', icon: Users },
  { name: 'Optimization', href: '/optimization', icon: Target },
  { name: 'Accounts', href: '/accounts', icon: Settings },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const Sidebar: React.FC = () => {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col"
    >
      <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Meta Analytics</h1>
            <p className="text-xs text-gray-400">Performance Analyzer</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Connected Platforms
          </h3>
          <div className="space-y-2">
            <div className="flex items-center px-3 py-2 text-sm text-gray-300">
              <Facebook className="mr-3 h-4 w-4 text-blue-500" />
              Facebook Pages
              <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                3 Active
              </span>
            </div>
            <div className="flex items-center px-3 py-2 text-sm text-gray-300">
              <Instagram className="mr-3 h-4 w-4 text-pink-500" />
              Instagram
              <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                2 Active
              </span>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
};

export default Sidebar;