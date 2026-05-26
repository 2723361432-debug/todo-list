import { useAppState } from '../context/AppContext'
import styles from './Toast.module.css'

export function Toast() {
  const { toast } = useAppState()
  if (!toast) return null
  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      {toast.message}
    </div>
  )
}
