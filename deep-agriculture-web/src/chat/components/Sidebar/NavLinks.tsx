// src/chat/components/Sidebar/NavLinks.tsx
import React from 'react';
import Link from 'next/link'; // 使用 Next.js 的 Link 组件进行客户端导航
import Icon from '@/chat/components/common/Icon';

// 定义导航项类型
interface NavItem {
  href: string;
  icon: React.ComponentProps<typeof Icon>['name']; // 使用 Icon 组件的 name 类型
  label: string;
  isActive: boolean; // 标记是否为当前活动项
}

// 定义 NavLinks 组件 props 类型
interface NavLinksProps {
  // 可以传入 activePathname 来确定哪个链接是活动的
  activePathname?: string;
}

/**
 * 侧边栏的主要导航链接列表
 * @param activePathname - 当前页面的路径，用于高亮活动链接 (可选)
 */
const NavLinks: React.FC<NavLinksProps> = ({ activePathname = '/chat' }) => {
  // 定义导航链接数据
  const navItems: NavItem[] = [
    { href: '/chat', icon: 'MessageCircle', label: '对话', isActive: activePathname === '/chat' },
    { href: '/discover', icon: 'Grid', label: '发现', isActive: activePathname === '/discover' },
    { href: '/my-creations', icon: 'Archive', label: '我创建的', isActive: activePathname === '/my-creations' },
  ];

  return (
    <ul className="nav-links">
      {navItems.map((item) => (
        <li key={item.href} className={item.isActive ? 'active' : ''}>
          <Link href={item.href}>
            {/* Link 组件内部的 a 标签会自动添加 */}
              <Icon name={item.icon} size={18} className="feather" />
              {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;