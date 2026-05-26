import { useEffect, useRef, useState } from 'react'
import { useToast } from '../context/AppContext'
import styles from './PipelineTriggerModal.module.css'

const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { code: data?.error?.code, status: res.status })
  }
  return data
}

const getPipelineConfigs = () => request('/pipeline-configs')
const triggerPipeline = (taskId, pipelineId) =>
  request('/pipelines/trigger', { method: 'POST', body: JSON.stringify({ taskId, pipelineId }) })

/**
 * PipelineTriggerModal
 *
 * Props:
 *   taskId  {string|null} – task to associate with the triggered pipeline
 *   onClose {function}    – called when modal should close
 */
export default function PipelineTriggerModal({ taskId, onClose }) {
  const toast = useToast()

  const [configs, setConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)

  // Two-step confirmation state
  const [confirming, setConfirming] = useState(false)

  const [triggering, setTriggering] = useState(false)

  // Ref for default-focus button ("取消")
  const cancelBtnRef = useRef(null)
  const confirmCancelBtnRef = useRef(null)

  // ── Fetch pipeline configs on mount ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setFetchError(null)

    getPipelineConfigs()
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : (data?.data ?? data?.configs ?? [])
        setConfigs(list)
        if (list.length > 0) {
          setSelectedId(list[0].pipeline_id ?? list[0].id ?? null)
        }
      })
      .catch((err) => {
        if (cancelled) return
        setFetchError(err.message || '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // ── Auto-focus "取消" once configs load ─────────────────────────────────
  useEffect(() => {
    if (!loading && !confirming && cancelBtnRef.current) {
      cancelBtnRef.current.focus()
    }
  }, [loading, confirming])

  // Auto-focus cancel button in confirmation step
  useEffect(() => {
    if (confirming && confirmCancelBtnRef.current) {
      confirmCancelBtnRef.current.focus()
    }
  }, [confirming])

  // ── Close modal on Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (confirming) {
          setConfirming(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [confirming, onClose])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (confirming) {
        setConfirming(false)
      } else {
        onClose()
      }
    }
  }

  const handleTriggerClick = () => {
    if (!selectedId) return
    setConfirming(true)
  }

  const handleConfirm = async () => {
    if (triggering) return
    setTriggering(true)
    try {
      await triggerPipeline(taskId, selectedId)
      toast('管线已触发', 'success')
      onClose()
    } catch (err) {
      toast(err.message || '触发失败', 'error')
      setTriggering(false)
      setConfirming(false)
    }
  }

  const handleCancelConfirm = () => {
    setConfirming(false)
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const selectedConfig = configs.find(
    (c) => (c.pipeline_id ?? c.id) === selectedId
  )
  const selectedName = selectedConfig
    ? (selectedConfig.display_name || selectedConfig.pipeline_id || selectedConfig.id)
    : ''

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="触发管线"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>选择管线</h2>
          <button
            className={styles.closeIcon}
            onClick={onClose}
            aria-label="关闭"
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.body}>
          {/* Loading state */}
          {loading && (
            <p className={styles.statusMsg}>加载中…</p>
          )}

          {/* Fetch error */}
          {!loading && fetchError && (
            <p className={styles.errorMsg}>{fetchError}</p>
          )}

          {/* Empty list */}
          {!loading && !fetchError && configs.length === 0 && (
            <p className={styles.statusMsg}>暂无管线配置</p>
          )}

          {/* Pipeline list */}
          {!loading && !fetchError && configs.length > 0 && !confirming && (
            <ul className={styles.pipelineList} role="radiogroup" aria-label="管线列表">
              {configs.map((cfg) => {
                const id = cfg.pipeline_id ?? cfg.id
                const label = cfg.display_name || cfg.pipeline_id || cfg.id
                const isSelected = id === selectedId
                return (
                  <li
                    key={id}
                    className={`${styles.pipelineItem} ${isSelected ? styles.pipelineItemSelected : ''}`}
                    onClick={() => setSelectedId(id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedId(id)
                      }
                    }}
                  >
                    <span className={styles.radioIndicator} aria-hidden="true">
                      {isSelected ? '◉' : '○'}
                    </span>
                    <span className={styles.pipelineLabel}>{label}</span>
                    {cfg.description && (
                      <span className={styles.pipelineDesc}>{cfg.description}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {/* Inline confirmation step */}
          {confirming && (
            <div className={styles.confirmBox} role="alert">
              <p className={styles.confirmText}>
                确认触发 <strong>{selectedName}</strong>？
              </p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!confirming ? (
            <>
              {/* Default focus on 取消 per SRS */}
              <button
                ref={cancelBtnRef}
                type="button"
                className={styles.btnSecondary}
                onClick={onClose}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleTriggerClick}
                disabled={!selectedId || loading}
              >
                触发
              </button>
            </>
          ) : (
            <>
              {/* Default focus on 取消 in confirmation step too */}
              <button
                ref={confirmCancelBtnRef}
                type="button"
                className={styles.btnSecondary}
                onClick={handleCancelConfirm}
                disabled={triggering}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleConfirm}
                disabled={triggering}
              >
                {triggering ? '触发中…' : '确认'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
