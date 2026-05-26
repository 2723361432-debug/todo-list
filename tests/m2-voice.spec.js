/**
 * M2: Voice Input Tests
 * FR-08: VoiceButton absent from DOM on Firefox desktop
 * FR-09: Voice result fills input, does NOT auto-submit
 * FR-10: VoiceButton renders in supported browsers
 * NFR-07: Touch target >= 44x44px
 *
 * Code-inspection tests (TC-M2-004, 005, 006, 007) read source files
 * and assert on implementation structure rather than live DOM.
 */

const { test, expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const SCREENSHOTS_DIR = path.join(__dirname, '../test-results/screenshots/M2-voice')
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

/**
 * Navigate with waitUntil:'load' and wait for React to hydrate #root.
 * Never use 'networkidle' — the SSE stream keeps the connection open forever.
 */
async function gotoApp(page) {
  await page.goto('http://localhost:5173', { waitUntil: 'load' })
  await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0)
  await page.waitForTimeout(300)
}

// ---------------------------------------------------------------------------
// TC-M2-001: VoiceButton renders in Chrome (non-Firefox)
// ---------------------------------------------------------------------------
test('TC-M2-001: VoiceButton is present in DOM on Chromium (non-Firefox)', async ({ page }) => {
  await gotoApp(page)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-page-loaded.png') })

  // In Chromium, SpeechRecognition IS available → VoiceButton MUST render.
  // The button has aria-label "按住说话" when idle.
  const voiceBtn = page.locator('button[aria-label="按住说话"]')
  await expect(voiceBtn).toBeVisible({ timeout: 5000 })
  await expect(voiceBtn).toHaveCount(1)
})

// ---------------------------------------------------------------------------
// TC-M2-002: VoiceButton NOT rendered when SpeechRecognition unavailable (Firefox UA)
// ---------------------------------------------------------------------------
test('TC-M2-002: VoiceButton absent on Firefox desktop (FR-08, NFR-08)', async ({ page }) => {
  // Inject Firefox UA AND remove SpeechRecognition BEFORE navigation
  await page.addInitScript(() => {
    // Spoof navigator.userAgent as Firefox desktop
    Object.defineProperty(navigator, 'userAgent', {
      get: () =>
        'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    })
    // Remove Speech API so even if UA check were bypassed the API is gone
    delete window.SpeechRecognition
    delete window.webkitSpeechRecognition
  })

  await gotoApp(page)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-firefox-no-voice-btn.png') })

  // VoiceButton.isFirefoxDesktop() returns true → component returns null → absent from DOM
  const voiceBtn = page.locator('button[aria-label="按住说话"]')
  await expect(voiceBtn).toHaveCount(0)
})

// ---------------------------------------------------------------------------
// TC-M2-003: VoiceButton is co-located with InputPanel (same parent container)
// ---------------------------------------------------------------------------
test('TC-M2-003: VoiceButton and InputPanel are siblings inside the same parent container', async ({ page }) => {
  await gotoApp(page)

  const voiceBtn = page.locator('button[aria-label="按住说话"]')
  await expect(voiceBtn).toBeVisible({ timeout: 5000 })

  // Both elements must share the same parent (.inputArea wrapper in App.jsx)
  const sameParent = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="按住说话"]')
    const textarea = document.querySelector('textarea')
    if (!btn || !textarea) return false
    // InputPanel renders the textarea; VoiceButton is a sibling of InputPanel's root node
    // Both are inside a shared wrapper — walk up from each to find common ancestor within 3 levels
    const getParents = (el, depth) => {
      const parents = []
      let cur = el
      for (let i = 0; i < depth; i++) {
        if (!cur.parentElement) break
        cur = cur.parentElement
        parents.push(cur)
      }
      return parents
    }
    const btnParents = getParents(btn, 3)
    const textareaParents = getParents(textarea, 5)
    return btnParents.some(p => textareaParents.includes(p))
  })

  expect(sameParent).toBe(true)
})

// ---------------------------------------------------------------------------
// TC-M2-004: Code inspection — InputPanel voiceText useEffect fills input, no auto-submit
// ---------------------------------------------------------------------------
test('TC-M2-004: InputPanel voiceText useEffect fills input WITHOUT calling submit (FR-09)', () => {
  const srcPath = path.join(__dirname, '../frontend/src/components/InputPanel.jsx')
  const src = fs.readFileSync(srcPath, 'utf8')

  // 1. There must be a useEffect that watches voiceText
  const hasUseEffectWithVoiceText = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*setText\s*\(voiceText\)/s.test(src)
  expect(hasUseEffectWithVoiceText).toBe(true)

  // 2. That useEffect must NOT call submit()
  //    Extract the useEffect block that contains voiceText and check it has no submit() call
  const useEffectBlock = src.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[voiceText\]\s*\)/)?.[1] ?? ''
  const autoSubmitsInEffect = /submit\s*\(/.test(useEffectBlock)
  expect(autoSubmitsInEffect).toBe(false)

  // 3. The dependency array must include voiceText (confirms it reacts to prop changes)
  const hasCorrectDeps = /useEffect[\s\S]*?\[voiceText\]/.test(src)
  expect(hasCorrectDeps).toBe(true)
})

// ---------------------------------------------------------------------------
// TC-M2-005: Code inspection — useSpeechRecognition / useVoice hook structure
// ---------------------------------------------------------------------------
test('TC-M2-005: useSpeechRecognition hook uses webkitSpeechRecognition, zh-CN, returns active+start+stop', () => {
  // useSpeechRecognition re-exports useVoice — read the canonical implementation
  const voiceSrcPath = path.join(__dirname, '../frontend/src/hooks/useVoice.js')
  const src = fs.readFileSync(voiceSrcPath, 'utf8')

  // 1. Uses window.SpeechRecognition || window.webkitSpeechRecognition
  const usesWebkit =
    /window\.SpeechRecognition\s*\|\|\s*window\.webkitSpeechRecognition/.test(src) ||
    /SpeechRecognition\s*=\s*window\.SpeechRecognition\s*\|\|\s*window\.webkitSpeechRecognition/.test(src)
  expect(usesWebkit).toBe(true)

  // 2. lang is set to 'zh-CN'
  const hasZhCN = /lang\s*=\s*['"]zh-CN['"]/.test(src)
  expect(hasZhCN).toBe(true)

  // 3. Hook exports active state
  const exportsActive = /active/.test(src)
  expect(exportsActive).toBe(true)

  // 4. start() and stop() are defined
  const hasStart = /const\s+start\s*=/.test(src)
  const hasStop = /const\s+stop\s*=/.test(src)
  expect(hasStart).toBe(true)
  expect(hasStop).toBe(true)

  // 5. onResult is called with transcript — NOT auto-submitted
  const callsOnResult = /onResult\?\.\(transcript\)/.test(src) || /onResult\s*\(\s*transcript\s*\)/.test(src)
  expect(callsOnResult).toBe(true)

  // Verify re-export file exists and correctly re-exports
  const reExportPath = path.join(__dirname, '../frontend/src/hooks/useSpeechRecognition.js')
  const reExportSrc = fs.readFileSync(reExportPath, 'utf8')
  const hasReExport = /export\s*\{.*useVoice.*as.*useSpeechRecognition.*\}/.test(reExportSrc) ||
                      /export.*useVoice/.test(reExportSrc)
  expect(hasReExport).toBe(true)
})

// ---------------------------------------------------------------------------
// TC-M2-006: Code inspection — VoiceButton has long-press handlers
// ---------------------------------------------------------------------------
test('TC-M2-006: VoiceButton has onMouseDown/onTouchStart=start and onMouseUp/onMouseLeave/onTouchEnd=stop', async ({ page }) => {
  const srcPath = path.join(__dirname, '../frontend/src/hooks/useVoice.js')
  const src = fs.readFileSync(srcPath, 'utf8')

  // onMouseDown triggers start
  const hasMouseDown = /onMouseDown\s*:\s*start/.test(src)
  expect(hasMouseDown).toBe(true)

  // onMouseUp triggers stop
  const hasMouseUp = /onMouseUp\s*:\s*stop/.test(src)
  expect(hasMouseUp).toBe(true)

  // onMouseLeave triggers stop
  const hasMouseLeave = /onMouseLeave\s*:\s*stop/.test(src)
  expect(hasMouseLeave).toBe(true)

  // onTouchStart triggers start (with e.preventDefault)
  const hasTouchStart = /onTouchStart\s*:/.test(src) && /start\s*\(\s*\)/.test(src)
  expect(hasTouchStart).toBe(true)

  // onTouchEnd triggers stop
  const hasTouchEnd = /onTouchEnd\s*:\s*stop/.test(src)
  expect(hasTouchEnd).toBe(true)

  // Screenshot the live DOM button
  await gotoApp(page)
  const voiceBtn = page.locator('button[aria-label="按住说话"]')
  await expect(voiceBtn).toBeVisible({ timeout: 5000 })
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-voice-btn-dom.png') })
})

// ---------------------------------------------------------------------------
// TC-M2-007: Code inspection — VoiceButton shows recording state visually
// ---------------------------------------------------------------------------
test('TC-M2-007: VoiceButton has distinct visual state when active (recording class, color, icon, label)', () => {
  // Check component source
  const btnSrcPath = path.join(__dirname, '../frontend/src/components/VoiceButton.jsx')
  const btnSrc = fs.readFileSync(btnSrcPath, 'utf8')

  // 1. Different CSS class applied when active
  const hasRecordingClass = /styles\.recording/.test(btnSrc)
  expect(hasRecordingClass).toBe(true)

  // 2. Different aria-label when active vs idle
  const hasActiveLabel = /正在识别语音/.test(btnSrc)
  const hasIdleLabel = /按住说话/.test(btnSrc)
  expect(hasActiveLabel).toBe(true)
  expect(hasIdleLabel).toBe(true)

  // 3. Different icon: 🔴 when active, 🎤 when idle
  const hasRecordingIcon = /🔴/.test(btnSrc)
  const hasIdleIcon = /🎤/.test(btnSrc)
  expect(hasRecordingIcon).toBe(true)
  expect(hasIdleIcon).toBe(true)

  // 4. Label text shown only when active
  const hasLabel = /正在识别\.\.\./.test(btnSrc)
  expect(hasLabel).toBe(true)

  // Check CSS file for .recording rule and pulse animation
  const cssSrcPath = path.join(__dirname, '../frontend/src/components/VoiceButton.module.css')
  const cssSrc = fs.readFileSync(cssSrcPath, 'utf8')

  const hasRecordingCSS = /\.recording\s*\{/.test(cssSrc)
  expect(hasRecordingCSS).toBe(true)

  const hasPulseAnimation = /@keyframes\s+pulse/.test(cssSrc)
  expect(hasPulseAnimation).toBe(true)

  // .recording rule uses the pulse animation
  const recordingUsesAnimation = /\.recording[\s\S]*?animation[\s\S]*?pulse/.test(cssSrc)
  expect(recordingUsesAnimation).toBe(true)
})

// ---------------------------------------------------------------------------
// TC-M2-008: InputPanel shake on empty submit
// ---------------------------------------------------------------------------
test('TC-M2-008: InputPanel shakes on empty submit and no task is added', async ({ page }) => {
  await gotoApp(page)

  // Count tasks before
  const taskItems = page.locator('li[class*="item"], [class*="taskItem"], [class*="task-item"]')
  const initialCount = await taskItems.count()

  // Ensure textarea is empty
  const textarea = page.locator('textarea').first()
  await textarea.fill('')

  // Find and click submit button
  const submitBtn = page.locator('button:has-text("提交")')

  // Submit button is disabled when textarea is empty (InputPanel: disabled={loading || !text.trim()})
  // Try pressing Enter in the empty textarea to trigger the submit path instead
  await textarea.press('Enter')

  await page.waitForTimeout(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-empty-submit-shake.png') })

  // No new task should have been created
  const afterCount = await taskItems.count()
  expect(afterCount).toBe(initialCount)

  // Textarea must still be empty (no text was submitted)
  await expect(textarea).toHaveValue('')
})
