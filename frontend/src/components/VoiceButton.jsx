import { useVoice } from '../hooks/useVoice.js'
import styles from './VoiceButton.module.css'

/**
 * Detects Firefox on desktop (not mobile).
 * FR-08: VoiceButton must be absent from the DOM on Firefox desktop.
 */
const isFirefoxDesktop = () => {
  const ua = navigator.userAgent
  const isFirefox = /Firefox\//.test(ua)
  const isMobile = /Android|iPhone|iPad/.test(ua)
  return isFirefox && !isMobile
}

/**
 * VoiceButton
 *
 * Props:
 *   onResult(text: string) — called with the recognized transcript.
 *                            Does NOT auto-submit (FR-09).
 *
 * Behaviour:
 *   - Returns null on Firefox desktop (FR-08).
 *   - Long-press mic icon to start recording; release to stop.
 *   - Visual idle state : 🎤
 *   - Visual recording state: 🔴 + pulse animation + "正在识别..." label
 */
export default function VoiceButton({ onResult }) {
  // FR-08: absent from DOM on Firefox desktop
  if (isFirefoxDesktop()) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { active, longPressHandlers } = useVoice({
    onResult,           // FR-09: caller decides what to do with text
    onError: (err) => console.warn('[VoiceButton] recognition error:', err),
  })

  return (
    <button
      type="button"
      aria-label={active ? '正在识别语音' : '按住说话'}
      aria-pressed={active}
      className={`${styles.btn}${active ? ` ${styles.recording}` : ''}`}
      {...longPressHandlers}
    >
      {active ? '🔴' : '🎤'}
      {active && <span className={styles.label}>正在识别...</span>}
    </button>
  )
}
