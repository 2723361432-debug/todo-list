import { useState, useRef } from 'react'
import { updateTask, deleteTask } from '../services/api'
import { useAppDispatch, useToast } from '../context/AppContext'
import styles from './TaskItem.module.css'

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
}

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
  const [showMenu, setShowMenu] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputRef = useRef(null)

  const isDone = task.status === 'done' || task.status === 'completed'

  const handleToggle = async () => {
    const newStatus = isDone ? 'pending' : 'done'
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

  const timeDisplay = task.timeLabel
    || (task.dueAt ? new Date(task.dueAt * 1000).toLocaleDateString('zh-CN') : null)

  return (
    <div className={`${styles.item} ${isDone ? styles.done : ''}`}>
      {/* Circle checkbox */}
      <button
        className={`${styles.circleCheckbox} ${isDone ? styles.circleChecked : ''}`}
        onClick={handleToggle}
        aria-label={isDone ? '标记未完成' : '标记完成'}
        title={isDone ? '标记未完成' : '标记完成'}
      >
        {isDone && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <span
        className={styles.priorityDot}
        style={{ background: priorityColor }}
        title={task.priority}
      />

      {/* Task name */}
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

        {/* Sub-badges: pipeline status, category */}
        {(task.pipelineStatus && task.pipelineStatus !== 'completed') && (
          <span className={`${styles.badge} ${styles[task.pipelineStatus]}`}>
            {PIPELINE_STATUS_LABEL[task.pipelineStatus] || task.pipelineStatus}
          </span>
        )}
        {task.completedSource === 'pipeline' && (
          <span className={`${styles.badge} ${styles.badgePipeline}`}>流水线</span>
        )}
      </div>

      {/* Time label */}
      {timeDisplay && (
        <span className={styles.timeLabel}>{timeDisplay}</span>
      )}

      {/* "..." overflow menu */}
      <div className={styles.menuWrapper}>
        {confirmDelete ? (
          <span className={styles.confirmRow}>
            <button
              className={styles.confirmBtn}
              onClick={handleDelete}
              aria-label="确认删除"
            >
              删除
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => { setConfirmDelete(false); setShowMenu(false) }}
              aria-label="取消"
            >
              取消
            </button>
          </span>
        ) : (
          <>
            <button
              className={styles.moreBtn}
              onClick={() => setShowMenu(v => !v)}
              aria-label="更多操作"
            >
              •••
            </button>
            {showMenu && (
              <div className={styles.dropdown}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setConfirmDelete(true) }}
                >
                  🗑 删除
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { handleDoubleClick(); setShowMenu(false) }}
                >
                  ✏️ 编辑
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
