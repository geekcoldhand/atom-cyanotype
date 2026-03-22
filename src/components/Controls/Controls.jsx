import { useState } from 'react'
import { TabBar }     from './TabBar.jsx'
import { SliderPanel } from './SliderPanel.jsx'
import styles from './Controls.module.css'

/**
 * Bottom controls panel: tab bar + scrollable slider panel.
 */
export function Controls({ controls, setControl }) {
  const [activeTab, setActiveTab] = useState('Color')

  return (
    <div className={styles.controls}>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <SliderPanel
        activeTab={activeTab}
        controls={controls}
        setControl={setControl}
      />
    </div>
  )
}
