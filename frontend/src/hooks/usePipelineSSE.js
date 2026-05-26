import { useEffect } from 'react'
import { useAppDispatch } from '../context/AppContext'

export function usePipelineSSE() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const es = new EventSource('/api/pipeline/status-stream')

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        dispatch({ type: 'UPDATE_PIPELINE_STATUS', payload: data })
      } catch {
        // ignore malformed frames
      }
    }

    es.onerror = () => {
      // browser will auto-reconnect; no action needed
    }

    return () => es.close()
  }, [dispatch])
}
