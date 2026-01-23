import { useState, type ReactNode } from 'react'
import { Layout, Button, Dropdown, Avatar, Badge } from 'antd'
import type { MenuProps } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import SidebarLayout from './SidebarLayout'
import useAuth from '@/hooks/useAuth'
import { ROUTES, ROLE_LABELS } from '@/constants/constant'

const { Header, Sider, Content } = Layout

interface ManagementLayoutProps {
  children: ReactNode
}

const ManagementLayout = ({ children }: ManagementLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate(ROUTES.PROFILE),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ]

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        className="fixed left-0 top-0 bottom-0 z-10 shadow-md"
        theme="light"
      >
        <SidebarLayout collapsed={collapsed} userRole={user?.role} />
      </Sider>

      <Layout className={`transition-all duration-200 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Header className="bg-white px-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <div className="flex items-center gap-4">
            <Badge count={5} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="text-lg"
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg">
                <Avatar
                  src={user?.avatar}
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 m-0 leading-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 m-0 leading-tight">
                    {user?.role ? ROLE_LABELS[user.role] : ''}
                  </p>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="m-4 p-6 bg-white rounded-lg min-h-[calc(100vh-96px)]">
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default ManagementLayout
