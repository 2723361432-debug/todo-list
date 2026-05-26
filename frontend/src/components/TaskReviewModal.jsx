import { useState } from 'react'
import styles from './TaskReviewModal.module.css'

export function TaskReviewModal({ decomposed, originalInput, onConfirm, onCancel }) {
  const { tasks, isFallback } = decomposed
  const [items, setItems] = useState(tasks.map(t => ({ ...t, selected: true })))

  const toggle = (idx) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, selected: !item.selected } : item))

  const updateText = (idx, val) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, correctedText: val } : item))

  const handleConfirm = () => {
    const selected = items.filter(i => i.selected)
    if (!selected.length) return
    onConfirm(selected)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>确认添加任务</h2>

        {isFallback && (
          <div className={styles.fallbackNotice}>
            ⚠️ AI 解析失败，已按句子分割。请检查以下任务。
          </div>
        )}

        <p className={styles.original}>原始输入：{originalInput}</p>

        <ul className={styles.list}>
          {items.map((item, idx) => (
            <li key={idx} className={styles.item}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggle(idx)}
                />
                <div className={styles.itemDetails}>
                  <input
                    className={styles.textInput}
                    value={item.correctedText || item.text}
                    onChange={e => updateText(idx, e.target.value)}
                    disabled={!item.selected}
                  />
                  <div className={styles.meta}>
                    {item.priority && <span className={styles.priority}>{item.priority}</span>}
                    {item.category && <span className={styles.category}>{item.category}</span>}
                    {item.timeLabel && <span className={styles.timeLabel}>{item.timeLabel}</span>}
                    {item.dueAt && (
                      <span className={styles.dueAt}>
                        截止：{new Date(item.dueAt * 1000).toLocaleDateString('zh-CN')}
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>取消</button>
          <button
            className={styles.confirmBtn}
            onClick={handleConfirm}
            disabled={!items.some(i => i.selected)}
          >
            添加 {items.filter(i => i.selected).length} 项
          </button>
        </div>
      </div>
    </div>
  )
}
