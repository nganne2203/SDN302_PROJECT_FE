import HeaderLayout from './HeaderLayout'
import FooterLayout from './FooterLayout'
import React from 'react'

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderLayout />
      <main className="flex-1">
        {children}
      </main>
      <FooterLayout />
    </div>
  )
}

export default CustomerLayout
