import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { ReactNode } from 'react'

interface ToastProviderProps {
  children: ReactNode
}

/**
 * ToastProvider wraps the application with react-toastify's ToastContainer
 *
 * Usage:
 * - Import toast from '@/utils/toast'
 * - Use toast.success('message'), toast.error('message'), etc.
 */
const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default ToastProvider
