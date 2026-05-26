import { useState, useRef } from 'react'
import { updateTask, deleteTask } from '../services/api'
import { useAppDispatch, useToast } from '../context/AppContext'
import styles from './TaskItem.module.css'

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }
const PIPELINE_STATUS_LABEL = {
  triggered: '流水线进行中',
  completed: '已完成',
  failed: '流水线失败',
}

export function TaskItem({ task }) {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(task.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef(null)

  const handleToggle = async () => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    try {
      const updated = await updateTask(task.id, { status: newStatus })
      dispatch({ type: 'UPDATE_TASK', payload: updated })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const handleDoubleClick = () => {
    setEditing(true)
    setEditText(task.name)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const commitEdit = async () => {
    setEditing(false)
    const trimmed = editText.trim()
    if (!trimmed || trimmed === task.name) return
    try {
      const updated = await updateTask(task.id, { name: trimmed })
      dispatch({ type: 'UPDATE_TASK', payload: updated })
    } catch (e) {
      toast(e.message, 'error')
      setEditText(task.name)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') { setEditing(false); setEditText(task.name) }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      dispatch({ type: 'REMOVE_TASK', payload: task.id })
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const priorityColor = PRIORITY_COLORS[task.priority] || '#94a3b8'

  return (
    <div className={`${styles.item} ${task.status === 'done' ? styles.done : ''}`}>
      <span
        className={styles.priorityDot}
        style={{ background: priorityColor }}
        title={task.priority}
      />

      <label className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.status === 'done' || task.status === 'completed'}
          onChange={handleToggle}
        />
      </label>

      <div className={styles.content}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.editInput}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className={styles.name}
            onDoubleClick={handleDoubleClick}
            title="双击编辑"
          >
            {task.name}
          </span>
        )}

        <div className={styles.meta}>
          {task.category && <span className={styles.category}>{task.category}</span>}
          {task.timeLabel && <span className={styles.timeLabel}>{task.timeLabel}</span>}
          {task.dueAt && (
            <span className={styles.dueAt}>
              {new Date(task.dueAt * 1000).toLocaleDateString('zh-CN')}
            </span>
          )}
          {task.completedSource === 'pipeline' && (
            <span className={styles.badgePipeline}>流水线</span>
          )}
          {task.pipelineStatus && task.pipelineStatus !== 'completed' && (
            <span className={`${styles.pipelineStatus} ${styles[task.pipelineStatus]}`}>
              {PIPELINE_STATUS_LABEL[task.pipelineStatus] || task.pipelineStatus}
            </span>
          )}
        </div>
      </div>

      {confirmDelete ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>确认删除？</span>
          <button
            onClick={handleDelete}
            aria-label="确认删除"
            style={{ minHeight: '44px', padding: '4px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            确认
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            aria-label="取消删除"
            style={{ minHeight: '44px', padding: '4px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            取消
          </button>
        </span>
      ) : (
        <button
          className={styles.deleteBtn}
          onClick={() => setConfirmDelete(true)}
          aria-label="删除"
          title="删除"
        >
          ×
        </button>
      )}
    </div>
  )
}
