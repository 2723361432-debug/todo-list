import { useState } from 'react'
import { AppProvider, useAppState, useAppDispatch, useToast } from './context/AppContext'
import { Sidebar } from './components/Sidebar'
import { TaskListPanel } from './components/TaskListPanel'
import { CalendarWidget } from './components/CalendarWidget'
import { ConfigPanel } from './components/ConfigPanel'
import { Toast } from './components/Toast'
import PipelineTriggerModal from './components/PipelineTriggerModal'
import { usePipelineSSE } from './hooks/usePipelineSSE'
import styles from './App.module.css'

function AppInner() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { tasks } = useAppState()
  const [showConfig, setShowConfig] = useState(false)
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState(null)
  const [activeView, setActiveView] = useState('inbox')

  usePipelineSSE()

  // Called by TaskListPanel after a task is successfully created
  const handleTaskCreated = (task) => {
    if (task?.id) {
      setPendingTaskId(task.id)
      setShowPipelineModal(true)
    }
  }

  // Compute task counts for sidebar badges
  const taskCounts = {
    inbox: tasks.filter(t => t.status !== 'done').length,
    today: 0,
    tomorrow: 0,
    week: 0,
  }

  return (
    <div className={styles.app}>
      {/* Left: Sidebar (icon strip + menu) */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        taskCounts={taskCounts}
        onSettings={() => setShowConfig(true)}
      />

      {/* Center: Main content */}
      <main className={styles.main}>
        <TaskListPanel onTaskCreated={handleTaskCreated} />
      </main>

      {/* Right: Calendar */}
      <CalendarWidget tasks={tasks} />

      {/* Modals & overlays */}
      {showPipelineModal && pendingTaskId && (
        <PipelineTriggerModal
          taskId={pendingTaskId}
          onClose={() => {
            setShowPipelineModal(false)
            setPendingTaskId(null)
          }}
        />
      )}

      {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}

      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
