import { Color, FillPatterns } from 'exceljs';

// interface required for filling cells (`cell.fill`)
export interface CellFillingDefinition {
    type: `pattern`;
    pattern: FillPatterns;
    fgColor: Partial<Color>;
    bgColor: Partial<Color>;
}
