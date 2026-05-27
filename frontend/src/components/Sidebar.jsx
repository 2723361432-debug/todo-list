import styles from './Sidebar.module.css'

// Inline SVG icon set — renders cleanly at any size on dark bg
const Icons = {
  logo: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" fill="#4361ee"/>
      <path d="M6.5 11l3 3 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  today: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="6" y="10" width="2" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  tomorrow: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  week: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 7h14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 11h8M5 14h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  inbox: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 11h4l1.5 2.5h3L12 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 11V5a2 2 0 012-2h10a2 2 0 012 2v6" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  work: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  personal: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 14a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  health: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 13S2 9.5 2 5.5A3.5 3.5 0 018 3a3.5 3.5 0 016 2.5C14 9.5 8 13 8 13z" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  projects: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M2 4l2-2h4l2 2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  shopping: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2h1.5l2 7h7l1.5-5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor"/>
      <circle cx="12" cy="12.5" r="1" fill="currentColor"/>
    </svg>
  ),
  completed: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 5h12M7 5V3h4v2M14 5l-.8 10a1 1 0 01-1 .9H5.8a1 1 0 01-1-.9L4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const NAV_ITEMS = [
  { key: 'today',    label: 'Today',       icon: 'today' },
  { key: 'tomorrow', label: 'Tomorrow',    icon: 'tomorrow' },
  { key: 'week',     label: 'Next 7 Days', icon: 'week' },
  { key: 'inbox',    label: 'Inbox',       icon: 'inbox' },
]

const LABEL_ITEMS = [
  { key: 'work',     label: 'Work',     color: '#4361ee', icon: 'work' },
  { key: 'personal', label: 'Personal', color: '#f59e0b', icon: 'personal' },
  { key: 'health',   label: 'Health',   color: '#22c55e', icon: 'health' },
  { key: 'projects', label: 'Projects', color: '#8b5cf6', icon: 'projects' },
  { key: 'shopping', label: 'Shopping', color: '#f97316', icon: 'shopping' },
]

export function Sidebar({ activeView, onViewChange, taskCounts = {}, onSettings }) {
  return (
    <div className={styles.sidebarWrapper}>
      {/* Icon strip — dark navy */}
      <div className={styles.iconStrip}>
        <div className={styles.logoIcon}>{Icons.logo}</div>
        <div className={styles.iconDivider} />

        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`${styles.iconBtn} ${activeView === item.key ? styles.iconBtnActive : ''}`}
            onClick={() => onViewChange(item.key)}
            title={item.label}
          >
            {Icons[item.icon]}
          </button>
        ))}

        <div className={styles.iconDivider} />

        {LABEL_ITEMS.map(item => (
          <button key={item.key} className={styles.iconBtn} title={item.label}>
            {Icons[item.icon]}
          </button>
        ))}

        <div className={styles.iconStripSpacer} />
        <button className={styles.iconBtn} title="Completed">{Icons.completed}</button>
        <button className={styles.iconBtn} title="Trash">{Icons.trash}</button>
        <button className={styles.iconBtn} title="Settings" onClick={onSettings}>{Icons.settings}</button>
      </div>

      {/* White sidebar menu */}
      <div className={styles.sidebarMenu}>
        <div className={styles.menuSection}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`${styles.menuItem} ${activeView === item.key ? styles.menuItemActive : ''}`}
              onClick={() => onViewChange(item.key)}
            >
              <span className={styles.menuIcon}>{Icons[item.icon]}</span>
              <span className={styles.menuLabel}>{item.label}</span>
              {taskCounts[item.key] > 0 && (
                <span className={`${styles.badge} ${activeView === item.key ? styles.badgeActive : ''}`}>
                  {taskCounts[item.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.sectionHeader}>MY LABELS</div>
        <div className={styles.menuSection}>
          {LABEL_ITEMS.map(item => (
            <button key={item.key} className={styles.menuItem}>
              <span className={styles.colorDot} style={{ background: item.color }} />
              <span className={styles.menuLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.menuSpacer} />
        <div className={styles.menuSection}>
          <button className={styles.menuItem}>
            <span className={styles.menuIcon}>{Icons.completed}</span>
            <span className={styles.menuLabel}>Completed</span>
          </button>
          <button className={styles.menuItem}>
            <span className={styles.menuIcon}>{Icons.trash}</span>
            <span className={styles.menuLabel}>Trash</span>
          </button>
          <button className={styles.menuItem} onClick={onSettings}>
            <span className={styles.menuIcon}>{Icons.settings}</span>
            <span className={styles.menuLabel}>Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}
