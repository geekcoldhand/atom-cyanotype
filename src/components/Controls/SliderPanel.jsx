import { SLIDER_CONFIG } from '../../constants/controls.js'
import { SliderRow } from './SliderRow.jsx'
import styles from './SliderPanel.module.css'

/**
 * Maps SLIDER_CONFIG[activeTab] to a list of <SliderRow> components.
 */
export function SliderPanel({ activeTab, controls, setControl }) {
  const sliders = SLIDER_CONFIG[activeTab] ?? []

  return (
    <div className={styles.panel}>
      {sliders.map(({ key, label }) => (
        <SliderRow
          key={key}
          sliderKey={key}
          label={label}
          value={controls[key]}
          onChange={setControl(key)}
        />
      ))}
    </div>
  )
}
