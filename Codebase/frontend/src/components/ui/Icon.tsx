import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  FileText,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  Zap,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Folder,
  Globe,
  MessageSquare,
  Megaphone,
  Star,
  Ticket,
  Target,
  Package,
  Store,
  Heart,
  Palette,
  File,
  PanelLeft,
  Image,
  Compass,
  Link,
  BarChart3,
  TrendingUp,
  PieChart,
  MousePointerClick,
  ClipboardList,
} from 'lucide-react';

export type IconName = 
  | 'layout-dashboard' 
  | 'folder-kanban' 
  | 'users' 
  | 'settings' 
  | 'file-text' 
  | 'bell' 
  | 'search' 
  | 'chevron-down' 
  | 'menu' 
  | 'x'
  | 'zap'
  | 'shopping-bag'
  | 'shopping-cart'
  | 'tag'
  | 'folder'
  | 'globe'
  | 'message-square'
  | 'megaphone'
  | 'star'
  | 'ticket'
  | 'target'
  | 'package'
  | 'store'
  | 'heart'
  | 'palette'
  | 'file'
  | 'panel-left'
  | 'image'
  | 'compass'
  | 'link'
  | 'bar-chart-3'
  | 'trending-up'
  | 'pie-chart'
  | 'mouse-pointer-click'
  | 'clipboard-list';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const iconMap: Record<IconName, React.ComponentType<{ className?: string; size?: number }>> = {
  'layout-dashboard': LayoutDashboard,
  'folder-kanban': FolderKanban,
  'users': Users,
  'settings': Settings,
  'file-text': FileText,
  'bell': Bell,
  'search': Search,
  'chevron-down': ChevronDown,
  'menu': Menu,
  'x': X,
  'zap': Zap,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'tag': Tag,
  'folder': Folder,
  'globe': Globe,
  'message-square': MessageSquare,
  'megaphone': Megaphone,
  'star': Star,
  'ticket': Ticket,
  'target': Target,
  'package': Package,
  'store': Store,
  'heart': Heart,
  'palette': Palette,
  'file': File,
  'panel-left': PanelLeft,
  'image': Image,
  'compass': Compass,
  'link': Link,
  'bar-chart-3': BarChart3,
  'trending-up': TrendingUp,
  'pie-chart': PieChart,
  'mouse-pointer-click': MousePointerClick,
  'clipboard-list': ClipboardList,
};

export const Icon: React.FC<IconProps> = ({ name, className, size = 16 }) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default Icon;
