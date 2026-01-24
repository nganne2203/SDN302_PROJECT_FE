import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { store, persistor } from '@/apps/store'
import { router } from '@/routes/route'
import ToastProvider from '@/components/common/ToastProvider'
import LoaderCommon from '@/components/common/LoaderCommon'

const theme = {
  token: {
    colorPrimary: '#2563eb',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoaderCommon fullScreen />} persistor={persistor}>
        <ConfigProvider locale={viVN} theme={theme}>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </ConfigProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
