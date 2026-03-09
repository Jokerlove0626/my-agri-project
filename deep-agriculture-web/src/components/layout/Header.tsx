// src/components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Layout, Menu, Button, Avatar, Badge, Dropdown, Space, MenuProps, Tooltip, Drawer } from 'antd';
import {
  RobotOutlined,
  AreaChartOutlined,
  ApartmentOutlined,
  SearchOutlined,
  FormOutlined,
  MoreOutlined,
  BellOutlined,
  UserOutlined,
  GithubOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  StarOutlined,
  BugOutlined,
  TeamOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

// 导航项定义 (保持不变)
const mainNavItems = [
  { key: '/chat', icon: <RobotOutlined />, label: '智能问答', path: '/chat' },
  { key: '/analysis', icon: <AreaChartOutlined />, label: '数据分析', path: '/analysis' },
  { key: '/graph', icon: <ApartmentOutlined />, label: '知识图谱', path: '/graph' },
  { key: '/search', icon: <SearchOutlined />, label: '知识检索', path: '/search' },
  { key: '/entry', icon: <FormOutlined />, label: '数据录入', path: '/entry' },
];

// 用户菜单项 (保持不变)
const userMenuItems: MenuProps['items'] = [
   { key: 'profile', label: '个人中心' },
   { key: 'settings', label: '账户设置' },
   { type: 'divider' },
   { key: 'logout', label: '退出登录', danger: true },
];

/**
 * 全局页头组件 - 修复移动端抽屉菜单点击即关闭的问题
 */
const Header: React.FC = () => {
  const pathname = usePathname();
  const [current, setCurrent] = useState<string>('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 更新导航高亮状态
  useEffect(() => {
    const getActiveKey = () => {
      const exactMatch = mainNavItems.find(item => item.path === pathname);
      if (exactMatch) return exactMatch.key;
      const currentTopLevelPath = '/' + (pathname?.split('/')[1] || '');
      const topLevelMatch = mainNavItems.find(item => item.path === currentTopLevelPath);
      return topLevelMatch ? topLevelMatch.key : '';
    };
    setCurrent(getActiveKey());
    // **移除路由变化时关闭抽屉的逻辑，避免干扰用户操作**
    // if (drawerVisible) {
    //     setDrawerVisible(false);
    // }
  }, [pathname]); // **移除 drawerVisible 依赖**

  // --- 事件处理 ---

  /**
   * 处理导航菜单项点击事件 (仅更新高亮状态)
   * @param e - Antd Menu 点击事件对象
   */
  const handleNavClick: MenuProps['onClick'] = (e) => {
    console.log('[Header] Nav item clicked, setting current key:', e.key);
    setCurrent(e.key);
    // **核心修复：移除在此处关闭抽屉的逻辑**
    // if (drawerVisible) {
    //     setDrawerVisible(false); // <-- 移除这行
    // }
  };

  // 打开抽屉菜单
  const showDrawer = () => {
    setDrawerVisible(true);
  };

  // 关闭抽屉菜单
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  /**
   * 渲染导航菜单项
   * @param isDrawer - 是否在抽屉内渲染 (用于决定是否添加关闭抽屉的 onClick)
   * @returns Antd Menu items 配置数组
   */
  const renderNavItems = (isDrawer = false) => {
    return mainNavItems.map(item => ({
      key: item.key,
      icon: item.icon,
      label: (
        // **为抽屉内的 Link 添加 onClick 事件来关闭抽屉**
        <Link href={item.path} onClick={isDrawer ? closeDrawer : undefined}>
          {item.label}
        </Link>
      ),
    }));
  };

  return (
    <>
      <AntHeader className={styles.appHeader}>
        {/* --- 左侧区域 --- */}
        <div className={styles.leftSection}>
           {/* 汉堡菜单按钮: 通过 CSS 在小屏幕显示 */}
           <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '18px' }} />}
              onClick={showDrawer}
              className={`${styles.menuToggleBtn} ${styles.showOnMobile}`}
              aria-label="打开导航菜单"
           />

          <Link href="/" className={styles.logo}>
            <Image src="/deepforest.jpg" alt="DeepForest Logo" width={128} height={128} className={styles.logoIcon} priority />
            {/* <span className={`${styles.logoText} ${styles.hideOnMobile}`}>DeepForest</span> */}
          </Link>

          {/* 顶部导航 Menu: 始终渲染，通过 CSS 在移动端隐藏 */}
          <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[current]}
              onClick={handleNavClick} // *现在只更新 current 状态*
              items={renderNavItems()} // *渲染时不需特殊处理*
              className={`${styles.mainNav} ${styles.hideOnMobile}`}
              overflowedIndicator={<MoreOutlined style={{ fontSize: '16px', padding: '0 8px' }} />}
          />
        </div>

        {/* --- 右侧区域 (保持不变) --- */}
        <div className={styles.rightSection}>
          <Space size="small" wrap className={styles.actionSpace}>
            {/* ... 开源按钮等保持不变 ... */}
             <Tooltip title="GitHub 仓库"><Button type="default" shape="circle" icon={<GithubOutlined />} href="https://github.com/Azure12355/deep-forest" target="_blank" rel="noopener noreferrer" className={`${styles.actionButton} ${styles.githubButton}`} aria-label="GitHub Repository"/></Tooltip>
             <Tooltip title="提交 Issue 或反馈"><Button type="default" shape="circle" icon={<BugOutlined />} href="https://github.com/Azure12355/deep-forest/issues" target="_blank" rel="noopener noreferrer" className={`${styles.actionButton} ${styles.issueButton}`} aria-label="Report an issue"/></Tooltip>
             <Tooltip title="查看文档"><Button type="text" icon={<BookOutlined />} href="/docs" className={`${styles.actionButton} ${styles.hideOnMobile}`} aria-label="Documentation">文档</Button></Tooltip>
             <Tooltip title="查看文档"><Button type="text" icon={<BookOutlined />} href="/docs" className={`${styles.actionButton} ${styles.showOnMobileOnly}`} aria-label="Documentation"/></Tooltip>
             <Tooltip title="加入社区讨论 (Discord)"><Button type="text" icon={<TeamOutlined />} href="https://discord.gg/your-invite" target="_blank" rel="noopener noreferrer" className={`${styles.actionButton} ${styles.hideOnSmallMobile}`} aria-label="Join Community">社区</Button></Tooltip>
             <Tooltip title="加入社区讨论 (Discord)"><Button type="text" icon={<TeamOutlined />} href="https://discord.gg/your-invite" target="_blank" rel="noopener noreferrer" className={`${styles.actionButton} ${styles.showOnSmallMobileOnly}`} aria-label="Join Community"/></Tooltip>
             <Tooltip title="通知"><Badge count={5} size="small" offset={[-3, 3]}><Avatar shape="circle" icon={<BellOutlined />} className={styles.actionIcon} /></Badge></Tooltip>
             <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }} trigger={['click']}>
               <Avatar shape="circle" icon={<UserOutlined />} className={styles.userAvatar} style={{ cursor: 'pointer' }}/>
             </Dropdown>
          </Space>
        </div>
      </AntHeader>

      {/* --- 抽屉菜单 --- */}
      <Drawer
        title={
            <Link href="/" onClick={closeDrawer} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration:'none' }}>
               <Image src="/deepforest.jpg" alt="DeepForest Logo" width={96} height={24} />
               {/* <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color-primary)'}}>DeepForest</span> */}
            </Link>
        }
        placement="left"
        closable={true}
        onClose={closeDrawer} // 点击关闭图标或遮罩层时关闭
        open={drawerVisible}
        key="left-drawer"
        bodyStyle={{ padding: '16px 0' }}
        width={260}
        className={styles.mobileDrawer}
      >
        {/* 抽屉内的 Menu */}
        <Menu
          mode="inline"
          selectedKeys={[current]}
          onClick={handleNavClick} // *仍然调用 handleNavClick 更新高亮*
          // **核心修复：现在 items 是通过 renderNavItems(true) 生成的，Link 上自带了 onClick={closeDrawer}**
          items={renderNavItems(true)}
          style={{ borderRight: 0 }}
        />
      </Drawer>
    </>
  );
};

export default Header;