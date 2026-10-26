/**
 * Presentation visual primitives. All sizes are in the 1920×1080 design space of the stage.
 * Reused by the main masterclass deck and the Debt & Credit Studio deck.
 *
 * Arrow semantics (tone): green = money · gold = ownership · blue = control · red = liability · violet = fiduciary/trust · amber = warning.
 */
export { SlideFrame, Glass, Reveal, BigChip, ObjectiveChips, ArrowLegend, TONE_COLOR, OBJECTIVE_TONE } from './Frame';
export type { Tone } from './Frame';
export { BuildList, Counter, SplitTitle, ConfidenceBanner } from './Text';
export { EntityNode, FlowEdge, NetworkAssemble, Fence, anchor } from './Network';
export type { NetNode, NetEdge, Pt } from './Network';
export { BalanceSheet } from './BalanceSheet';
export type { BsRow } from './BalanceSheet';
export { TimelineBar } from './TimelineBar';
export type { TimelineMark } from './TimelineBar';
export { BarChart, LineChart, StackedArea, Waterfall } from './Charts';
export type { Bar, Series } from './Charts';
export { useReducedMotion, useCountUp, useElapsedSeconds, fmtClock } from './motion';
