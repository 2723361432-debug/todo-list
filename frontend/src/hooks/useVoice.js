import { useRef, useState, useCallback } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function useVoice({ onResult, onError }) {
  const recogRef = useRef(null)
  const [active, setActive] = useState(false)

  const start = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.('浏览器不支持语音识别')
      return
    }
    if (active) return

    const recog = new SpeechRecognition()
    recog.lang = 'zh-CN'
    recog.interimResults = false
    recog.continuous = false

    recog.onstart = () => setActive(true)
    recog.onend = () => {
      setActive(false)
      recogRef.current = null
    }
    recog.onerror = (e) => {
      setActive(false)
      recogRef.current = null
      if (e.error !== 'no-speech') onError?.(e.error)
    }
    recog.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('')
      if (transcript) onResult?.(transcript)
    }

    recogRef.current = recog
    recog.start()
  }, [active, onResult, onError])

  const stop = useCallback(() => {
    recogRef.current?.stop()
  }, [])

  const longPressHandlers = {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: (e) => { e.preventDefault(); start() },
    onTouchEnd: stop,
  }

  return { active, longPressHandlers }
}
