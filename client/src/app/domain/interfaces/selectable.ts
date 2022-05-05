import { Displayable } from './displayable';
import { Identifiable } from './identifiable';

/**
 * Base Type for everything that should be displayable
 * in Shared Components
 */
export type Selectable = Displayable & Identifiable & { disabled?: boolean };
