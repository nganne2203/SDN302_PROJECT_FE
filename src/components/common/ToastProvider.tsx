import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import type { ReactNode } from 'react'

interface ToastProviderProps {
  children: ReactNode
}

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
