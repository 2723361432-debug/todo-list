import { useState, useEffect } from 'react'
import { useAppState, useAppDispatch, useToast } from '../context/AppContext'
import { getTasks } from '../services/api'
import { TaskItem } from './TaskItem'
import { InputPanel } from './InputPanel'
import VoiceButton from './VoiceButton'
import styles from './TaskListPanel.module.css'

const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'pending', label: 'In Progress' },
  { key: 'done',    label: 'Completed' },
]

export function TaskListPanel({ onTaskCreated }) {
  const { tasks, loading } = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [filter, setFilter] = useState(() => {
    const saved = localStorage.getItem('taskFilter')
    // Map old filter keys to new ones
    if (saved === 'pipeline') return 'all'
    return saved || 'all'
  })
  const [showAddTask, setShowAddTask] = useState(false)
  const [voiceText, setVoiceText] = useState('')

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: { tasks: true } })
    getTasks()
      .then(data => dispatch({ type: 'SET_TASKS', payload: data }))
      .catch(e => toast(e.message, 'error'))
      .finally(() => dispatch({ type: 'SET_LOADING', payload: { tasks: false } }))
  }, [dispatch, toast])

  const handleFilter = (key) => {
    setFilter(key)
    localStorage.setItem('taskFilter', key)
  }

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return t.status !== 'done'
    if (filter === 'done') return t.status === 'done'
    return true
  })

  const handleTaskCreatedInner = (task) => {
    setShowAddTask(false)
    onTaskCreated?.(task)
  }

  const tabCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status !== 'done').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Tasks</h2>
          <span className={styles.countBadge}>{tasks.length}</span>
        </div>
        <button
          className={styles.addTaskBtn}
          onClick={() => setShowAddTask(v => !v)}
        >
          + Add Task
        </button>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.tab} ${filter === f.key ? styles.tabActive : ''}`}
            onClick={() => handleFilter(f.key)}
          >
            {f.label}
            <span className={`${styles.tabCount} ${filter === f.key ? styles.tabCountActive : ''}`}>
              {tabCounts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Add task panel */}
      {showAddTask && (
        <div className={styles.addTaskArea}>
          <div className={styles.inputRow}>
            <InputPanel
              onVoiceResult={t => setVoiceText(t)}
              voiceText={voiceText}
              onTaskCreated={handleTaskCreatedInner}
            />
            <VoiceButton onResult={t => setVoiceText(t)} />
          </div>
        </div>
      )}

      {/* Task list */}
      {loading.tasks ? (
        <div className={styles.loading}>
          <span className={styles.loadingSpinner} />
          <span>加载中…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            {filter === 'done' ? '🎉' : '📋'}
          </div>
          <div className={styles.emptyText}>
            {filter === 'all'
              ? '还没有任务，点击「+ Add Task」开始添加'
              : filter === 'pending'
              ? '没有进行中的任务'
              : '还没有已完成的任务'}
          </div>
        </div>
      ) : (
        <ul className={styles.list}>
          {filtered.map(task => (
            <li key={task.id}>
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}

      {/* Inline + Add task at bottom */}
      {!showAddTask && (
        <button
          className={styles.inlineAddBtn}
          onClick={() => setShowAddTask(true)}
        >
          <span className={styles.inlineAddIcon}>+</span>
          <span className={styles.inlineAddText}>Add task</span>
        </button>
      )}
    </div>
  )
}
