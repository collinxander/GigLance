import { Toast } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toasts: ToasterToast[] = []

type ToastActionType = (toast: ToasterToast) => void

const listeners: ToastActionType[] = []

function emitChange() {
  listeners.forEach((listener) => {
    listener(toasts[0])
  })
}

function addToRemoveQueue(toastId: string) {
  setTimeout(() => {
    removeToast(toastId)
  }, TOAST_REMOVE_DELAY)
}

export function toast({
  title,
  description,
  action,
  variant,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}) {
  const id = genId()

  const newToast = {
    id,
    title,
    description,
    action,
    variant,
  }

  toasts.push(newToast)
  emitChange()
  addToRemoveQueue(id)

  return {
    id,
    dismiss: () => removeToast(id),
    update: (props: {
      title?: string
      description?: string
      action?: React.ReactNode
      variant?: "default" | "destructive"
    }) => {
      const index = toasts.findIndex((toast) => toast.id === id)
      if (index !== -1) {
        toasts[index] = { ...toasts[index], ...props }
        emitChange()
      }
    },
  }
}

function removeToast(id: string) {
  const index = toasts.findIndex((toast) => toast.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
    emitChange()
  }
}

export function useToast() {
  function subscribe(listener: ToastActionType) {
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  return {
    toast,
    subscribe,
    dismiss: (id: string) => removeToast(id),
    remove: (id: string) => removeToast(id),
  }
} 