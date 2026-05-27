import { useState } from 'react'
import styles from './CalendarWidget.module.css'

const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

function buildCalendarDays(year, month) {
  // month is 0-indexed
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  // Fill leading empty cells
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d)
  }
  return days
}

function formatTime(dueAt) {
  if (!dueAt) return null
  const d = new Date(dueAt * 1000)
  const h = d.getHours()
  const m = d.getMinutes()
  const hh = h % 12 || 12
  const mm = m.toString().padStart(2, '0')
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${hh}:${mm} ${ampm}`
}

const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
}

export function CalendarWidget({ tasks = [] }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const days = buildCalendarDays(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const isToday = (d) =>
    d &&
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear()

  // Today's tasks: filter tasks that are not done and have a dueAt today
  const todayTasks = tasks.filter(t => {
    if (t.status === 'done') return false
    if (!t.dueAt) return false
    const d = new Date(t.dueAt * 1000)
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  })

  // All non-done tasks shown in "today" panel (including those without dueAt)
  const scheduleTasks = tasks.filter(t => t.status !== 'done').slice(0, 5)

  return (
    <div className={styles.widget}>
      {/* Month header */}
      <div className={styles.monthHeader}>
        <span className={styles.monthTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className={styles.grid}>
        {WEEKDAY_HEADERS.map(h => (
          <div key={h} className={styles.weekdayHeader}>{h}</div>
        ))}

        {/* Day cells */}
        {days.map((d, i) => (
          <div
            key={i}
            className={`${styles.dayCell} ${d ? styles.dayCellActive : ''} ${isToday(d) ? styles.dayCellToday : ''}`}
          >
            {d || ''}
          </div>
        ))}
      </div>

      {/* Today schedule */}
      <div className={styles.todaySection}>
        <div className={styles.todayHeader}>Today</div>
        {scheduleTasks.length === 0 ? (
          <div className={styles.noTasks}>No tasks for today</div>
        ) : (
          <ul className={styles.scheduleList}>
            {scheduleTasks.map(task => (
              <li key={task.id} className={styles.scheduleItem}>
                <span
                  className={styles.scheduleColorDot}
                  style={{ background: PRIORITY_COLORS[task.priority] || '#94a3b8' }}
                />
                <div className={styles.scheduleContent}>
                  <span className={styles.scheduleTitle}>{task.name}</span>
                  {task.dueAt && (
                    <span className={styles.scheduleTime}>{formatTime(task.dueAt)}</span>
                  )}
                  {task.timeLabel && (
                    <span className={styles.scheduleTime}>{task.timeLabel}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <button className={styles.viewFullDay}>View full day</button>
      </div>
    </div>
  )
}
