import { useState, useEffect } from 'react'
import { useAppState, useAppDispatch, useToast } from '../context/AppContext'
import { getRecommendations, acceptRecommendation, dismissRecommendation } from '../services/api'
import styles from './RecommendationPanel.module.css'

export function RecommendationPanel() {
  const { recommendations } = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [accepting, setAccepting] = useState(null) // rec being confirmed
  const [form, setForm] = useState({ pipelineName: '', keywords: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRecommendations()
      .then(data => dispatch({ type: 'SET_RECOMMENDATIONS', payload: data }))
      .catch(() => {})
  }, [dispatch])

  if (!recommendations.length) return null

  const handleAcceptClick = (rec) => {
    setAccepting(rec)
    setForm({ pipelineName: rec.suggestedPipelineName || '', keywords: rec.keywords?.join(', ') || '' })
  }

  const handleAcceptConfirm = async () => {
    if (!form.pipelineName.trim()) {
      toast('请输入流水线名称', 'error')
      return
    }
    setLoading(true)
    try {
      await acceptRecommendation(accepting.id)
      dispatch({ type: 'REMOVE_RECOMMENDATION', payload: accepting.id })
      toast('已采纳推荐，流水线规则已创建', 'success')
      setAccepting(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = async (id) => {
    try {
      await dismissRecommendation(id)
      dispatch({ type: 'REMOVE_RECOMMENDATION', payload: id })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>💡 智能推荐</h3>
      <ul className={styles.list}>
        {recommendations.map(rec => (
          <li key={rec.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{rec.suggestedPipelineName}</span>
              <span className={styles.freq}>频次 {rec.frequency}</span>
            </div>
            <p className={styles.reason}>{rec.reason}</p>
            <div className={styles.keywords}>
              {rec.keywords?.map(k => (
                <span key={k} className={styles.kw}>{k}</span>
              ))}
            </div>
            <div className={styles.actions}>
              <button className={styles.acceptBtn} onClick={() => handleAcceptClick(rec)}>采纳</button>
              <button className={styles.dismissBtn} onClick={() => handleDismiss(rec.id)}>忽略</button>
            </div>
          </li>
        ))}
      </ul>

      {accepting && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h4 className={styles.modalTitle}>确认创建流水线规则</h4>
            <label className={styles.label}>
              流水线名称
              <input
                className={styles.input}
                value={form.pipelineName}
                onChange={e => setForm(f => ({ ...f, pipelineName: e.target.value }))}
                placeholder="如：每日站会"
              />
            </label>
            <label className={styles.label}>
              关键词（逗号分隔）
              <input
                className={styles.input}
                value={form.keywords}
                onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                placeholder="如：站会, 会议, scrum"
              />
            </label>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setAccepting(null)} disabled={loading}>
                取消
              </button>
              <button className={styles.confirmBtn} onClick={handleAcceptConfirm} disabled={loading}>
                {loading ? '创建中…' : '确认创建'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
