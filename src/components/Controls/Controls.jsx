import { useState } from "react";
import { TabBar } from "./TabBar.jsx";
import { SliderPanel } from "./SliderPanel.jsx";
import styles from "./Controls.module.css";

/**
 * Bottom controls panel: tab bar + scrollable slider panel.
 */
export function Controls({ controls, setControl, visible, onTabChange }) {
	const [activeTab, setActiveTab] = useState("Color");

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		onTabChange(tab); // always shows controls when a tab is tapped
	};

	return (
		<div className={`${styles.controls} ${!visible ? styles.collapsed : ""}`}>
			{/* Tab bar always rendered — acts as the re-show trigger when collapsed */}
			<TabBar activeTab={activeTab} onTabChange={handleTabChange} />

			{/* Slider panel only mounts when visible */}
			{visible && (
				<SliderPanel
					activeTab={activeTab}
					controls={controls}
					setControl={setControl}
				/>
			)}
		</div>
	);
}
