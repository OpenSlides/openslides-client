/**
 * Interface, that defines the type of the `ClickEvent`.
 */
export interface GridTileClickEvent<T = object> {
    data: T | null;
    source: MouseEvent | Event;
}

/**
 * Interface, that defines the possible shape of `@Input() preferredSize`
 */
export interface GridTileDimension {
    mobile?: number;
    tablet?: number;
    medium?: number;
    large?: number;
}

/**
 * Enumeration to define of which the big block is.
 */
export enum GridBlockTileType {
    text = `text`,
    node = `node`
}

/**
 * Tells, whether to align the block and content next to each other or one below the other.
 */
export type GridBlockTileOrientation = 'horizontal' | 'vertical';

/**
 * Tells, if the tile should only display the content or the title in the content part.
 */
export type GridBlockTileShowOnly = 'title' | 'content' | null;
