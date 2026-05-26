import { createContext, useContext, useReducer, useCallback } from 'react'

const AppContext = createContext(null)
const AppDispatch = createContext(null)

const initialState = {
  tasks: [],
  config: null,
  recommendations: [],
  pipelineConfigs: [],
  toast: null, // { message, type: 'error'|'success'|'info' }
  loading: { tasks: false, config: false },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t),
      }
    case 'REMOVE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) }
    case 'UPDATE_PIPELINE_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.taskId
            ? { ...t, pipelineStatus: action.payload.pipelineStatus }
            : t
        ),
      }
    case 'SET_CONFIG':
      return { ...state, config: action.payload }
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload }
    case 'REMOVE_RECOMMENDATION':
      return { ...state, recommendations: state.recommendations.filter(r => r.id !== action.payload) }
    case 'SET_TOAST':
      return { ...state, toast: action.payload }
    case 'CLEAR_TOAST':
      return { ...state, toast: null }
    case 'SET_LOADING':
      return { ...state, loading: { ...state.loading, ...action.payload } }
    case 'SET_PIPELINE_CONFIGS':
      return { ...state, pipelineConfigs: action.payload }
    case 'ADD_PIPELINE_CONFIG':
      return { ...state, pipelineConfigs: [...state.pipelineConfigs, action.payload] }
    case 'REMOVE_PIPELINE_CONFIG':
      return { ...state, pipelineConfigs: state.pipelineConfigs.filter(p => p.id !== action.payload) }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={state}>
      <AppDispatch.Provider value={dispatch}>
        {children}
      </AppDispatch.Provider>
    </AppContext.Provider>
  )
}

export const useAppState = () => useContext(AppContext)
export const useAppDispatch = () => useContext(AppDispatch)

export function useToast() {
  const dispatch = useAppDispatch()
  return useCallback((message, type = 'info') => {
    dispatch({ type: 'SET_TOAST', payload: { message, type } })
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3500)
  }, [dispatch])
}
