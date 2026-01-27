import { toast as toastify, type ToastOptions as ToastifyOptions, type Id } from 'react-toastify'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'
  onClose?: () => void
}

const getToastConfig = (options?: ToastOptions): ToastifyOptions => ({
  autoClose: options?.duration ? options.duration * 1000 : 3000,
  position: options?.position ?? 'top-right',
  onClose: options?.onClose,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
})

export const toast = {
  success: (content: string, options?: ToastOptions): Id =>
    toastify.success(content, getToastConfig(options)),

  error: (content: string, options?: ToastOptions): Id =>
    toastify.error(content, getToastConfig(options)),

  warning: (content: string, options?: ToastOptions): Id =>
    toastify.warning(content, getToastConfig(options)),

  info: (content: string, options?: ToastOptions): Id =>
    toastify.info(content, getToastConfig(options)),

  loading: (content: string, options?: ToastOptions): Id =>
    toastify.loading(content, {
      ...getToastConfig(options),
      autoClose: false
    }),

  update: (
    id: Id,
    content: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ): void => {
    toastify.update(id, {
      render: content,
      type,
      isLoading: false,
      autoClose: 3000
    })
  },

  dismiss: (id?: Id): void => {
    toastify.dismiss(id)
  },

  dismissAll: (): void => {
    toastify.dismiss()
  }
}

interface PromiseMessages {
  loading: string
  success: string
  error: string
}

export const toastPromise = <T>(
  promise: Promise<T>,
  messages: PromiseMessages
): Promise<T> => {
  return toastify.promise(promise, {
    pending: messages.loading,
    success: messages.success,
    error: messages.error
  })
}

export default toast
