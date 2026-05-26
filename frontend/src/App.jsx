import { useState } from 'react'
import { AppProvider, useAppDispatch, useToast } from './context/AppContext'
import { InputPanel } from './components/InputPanel'
import { TaskListPanel } from './components/TaskListPanel'
import { RecommendationPanel } from './components/RecommendationPanel'
import { ConfigPanel } from './components/ConfigPanel'
import { Toast } from './components/Toast'
import VoiceButton from './components/VoiceButton'
import PipelineTriggerModal from './components/PipelineTriggerModal'
import { usePipelineSSE } from './hooks/usePipelineSSE'
import styles from './App.module.css'

function AppInner() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [showConfig, setShowConfig] = useState(false)
  const [voiceText, setVoiceText] = useState('')
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [pendingTaskId, setPendingTaskId] = useState(null)

  usePipelineSSE()

  // Called by InputPanel after a task is successfully created
  const handleTaskCreated = (task) => {
    if (task?.id) {
      setPendingTaskId(task.id)
      setShowPipelineModal(true)
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>智能待办</h1>
        <button
          className={styles.settingsBtn}
          onClick={() => setShowConfig(true)}
          aria-label="设置"
        >
          ⚙️
        </button>
      </header>

      <main className={styles.main}>
        <RecommendationPanel />
        <div className={styles.inputArea}>
          <InputPanel
            onVoiceResult={(t) => setVoiceText(t)}
            voiceText={voiceText}
          />
          <VoiceButton onResult={(t) => setVoiceText(t)} />
        </div>
        <TaskListPanel />
      </main>

      {showPipelineModal && (
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
