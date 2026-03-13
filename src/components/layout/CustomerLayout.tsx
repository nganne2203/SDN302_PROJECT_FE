import HeaderLayout from './HeaderLayout'
import FooterLayout from './FooterLayout'
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace(/^#/, '')
      const el = document.getElementById(elementId)
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname, location.search, location.hash])

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
