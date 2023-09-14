/// <reference types="svelte" />
import Tree from './Tree.svelte'
import { type Formatter, getTypeSummary } from './utils'
export default Tree

export { getTypeSummary }
export type { Formatter }
