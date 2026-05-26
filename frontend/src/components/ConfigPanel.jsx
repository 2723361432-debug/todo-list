import { useState, useEffect } from 'react'
import { useAppState, useAppDispatch, useToast } from '../context/AppContext'
import { getConfig, updateConfig } from '../services/api'
import styles from './ConfigPanel.module.css'

export function ConfigPanel({ onClose }) {
  const { config } = useAppState()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [newRule, setNewRule] = useState({ keyword: '', pipelineId: '', priority: 0 })

  useEffect(() => {
    if (config) {
      setForm({ ...config })
    } else {
      getConfig()
        .then(data => {
          dispatch({ type: 'SET_CONFIG', payload: data })
          setForm({ ...data })
        })
        .catch(e => toast(e.message, 'error'))
    }
  }, [config, dispatch, toast])

  if (!form) return <div className={styles.loading}>加载配置…</div>

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateConfig({
        defaultPipelineId: form.defaultPipelineId,
        pollingInterval: Number(form.pollingInterval),
        analyzerWindowDays: Number(form.analyzerWindowDays),
        analyzerFrequencyThreshold: Number(form.analyzerFrequencyThreshold),
        keywordRules: form.keywordRules,
      })
      dispatch({ type: 'SET_CONFIG', payload: updated })
      toast('配置已保存', 'success')
      onClose?.()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const addRule = () => {
    if (!newRule.keyword.trim() || !newRule.pipelineId.trim()) {
      toast('关键词和流水线 ID 不能为空', 'error')
      return
    }
    setForm(f => ({
      ...f,
      keywordRules: [
        ...f.keywordRules,
        { keyword: newRule.keyword.trim(), pipelineId: newRule.pipelineId.trim(), priority: Number(newRule.priority) || 0 }
      ]
    }))
    setNewRule({ keyword: '', pipelineId: '', priority: 0 })
  }

  const removeRule = (idx) =>
    setForm(f => ({ ...f, keywordRules: f.keywordRules.filter((_, i) => i !== idx) }))

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>系统设置</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>默认流水线</h3>
          <input
            className={styles.input}
            value={form.defaultPipelineId}
            onChange={e => setForm(f => ({ ...f, defaultPipelineId: e.target.value }))}
            placeholder="默认 Pipeline ID"
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>关键词规则</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>关键词</th>
                <th>流水线 ID</th>
                <th>优先级</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {form.keywordRules.map((rule, idx) => (
                <tr key={idx}>
                  <td>{rule.keyword}</td>
                  <td>{rule.pipelineId}</td>
                  <td>{rule.priority}</td>
                  <td>
                    <button className={styles.removeBtn} onClick={() => removeRule(idx)}>×</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <input
                    className={styles.inputSmall}
                    value={newRule.keyword}
                    onChange={e => setNewRule(r => ({ ...r, keyword: e.target.value }))}
                    placeholder="关键词"
                  />
                </td>
                <td>
                  <input
                    className={styles.inputSmall}
                    value={newRule.pipelineId}
                    onChange={e => setNewRule(r => ({ ...r, pipelineId: e.target.value }))}
                    placeholder="Pipeline ID"
                  />
                </td>
                <td>
                  <input
                    className={styles.inputSmall}
                    type="number"
                    value={newRule.priority}
                    onChange={e => setNewRule(r => ({ ...r, priority: e.target.value }))}
                    placeholder="0"
                    style={{ width: '3.5rem' }}
                  />
                </td>
                <td>
                  <button className={styles.addRuleBtn} onClick={addRule}>+</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>分析器参数</h3>
          <div className={styles.row}>
            <label className={styles.label}>
              统计窗口（天）
              <input
                className={styles.inputSmall}
                type="number"
                value={form.analyzerWindowDays}
                onChange={e => setForm(f => ({ ...f, analyzerWindowDays: e.target.value }))}
              />
            </label>
            <label className={styles.label}>
              频次门槛
              <input
                className={styles.inputSmall}
                type="number"
                value={form.analyzerFrequencyThreshold}
                onChange={e => setForm(f => ({ ...f, analyzerFrequencyThreshold: e.target.value }))}
              />
            </label>
          </div>
        </section>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>取消</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
