import { TABS } from '../../constants/controls.js'
import styles from './TabBar.module.css'

export function TabBar({ activeTab, onTabChange }) {
  return (
    <div className={styles.bar}>
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
