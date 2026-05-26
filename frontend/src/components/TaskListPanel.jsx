import { useState, useEffect } from 'react'
import { useAppState, useAppDispatch, useToast } from '../context/AppContext'
import { getTasks } from '../services/api'
import { TaskItem } from './TaskItem'
import styles from './TaskListPanel.module.css'

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待办' },
  { key: 'done', label: '已完成' },
  { key: 'pipeline', label: '流水线' },
]

export function TaskListPanel() {
  const { tasks, loading } = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [filter, setFilter] = useState(() => localStorage.getItem('taskFilter') || 'all')

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
    if (filter === 'pipeline') return !!t.pipelineStatus
    return true
  })

  return (
    <div className={styles.panel}>
      <div className={styles.filterBar}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
            onClick={() => handleFilter(f.key)}
          >
            {f.label}
            <span className={styles.count}>
              {f.key === 'all' ? tasks.length
                : f.key === 'pending' ? tasks.filter(t => t.status !== 'done').length
                : f.key === 'done' ? tasks.filter(t => t.status === 'done').length
                : tasks.filter(t => !!t.pipelineStatus).length}
            </span>
          </button>
        ))}
      </div>

      {loading.tasks ? (
        <div className={styles.loading}>加载中…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'all' ? '还没有任务，输入待办事项开始吧 👋' : '没有匹配的任务'}
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
    </div>
  )
}
