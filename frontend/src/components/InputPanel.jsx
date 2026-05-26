import { useState, useRef, useCallback, useEffect } from 'react'
import { createTask } from '../services/api'
import { useAppDispatch, useToast } from '../context/AppContext'
import styles from './InputPanel.module.css'

export function InputPanel({ onVoiceResult, voiceText, onTaskCreated }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const dispatch = useAppDispatch()
  const toast = useToast()
  const pasteTimerRef = useRef(null)

  // When parent provides recognized voice text, fill into input (do NOT auto-submit)
  useEffect(() => {
    if (voiceText) {
      setText(voiceText)
    }
  }, [voiceText])

  const submit = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const created = await createTask({ name: trimmed, title: trimmed })
      dispatch({ type: 'ADD_TASK', payload: created })
      onTaskCreated?.(created)
      setText('')
      toast('任务已添加', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [text, loading, dispatch, toast])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text')
    clearTimeout(pasteTimerRef.current)
    pasteTimerRef.current = setTimeout(() => {
      if (pasted.trim()) setText(pasted.trim())
    }, 300)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.inputRow}>
        <textarea
          className={`${styles.textarea} ${shake ? styles.shake : ''}`}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="输入待办事项，按 Enter 提交…"
          rows={3}
          disabled={loading}
        />
      </div>
      <div className={styles.footer}>
        <button
          className={styles.submitBtn}
          onClick={submit}
          disabled={loading || !text.trim()}
        >
          {loading ? '处理中…' : '提交'}
        </button>
        <span className={styles.hint}>Shift+Enter 换行</span>
      </div>
    </div>
  )
}
