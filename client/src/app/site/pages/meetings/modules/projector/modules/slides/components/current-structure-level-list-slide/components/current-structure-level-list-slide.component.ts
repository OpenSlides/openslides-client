import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import {
    CurrentStructureLevelListSlideData,
    CurrentStructureLevelListSlideStructureLevelRepresentation
} from '../current-structure-level-list-slide-data';

const ROWS_PER_COLUMN_SHORT = 8;
const ROWS_PER_COLUMN_LONG = 16;
const SHORT_LAYOUT_THRESHOLD = 8;
const MAX_COLUMNS = 3;

@Component({
    selector: `os-current-structure-level-list-slide`,
    templateUrl: `./current-structure-level-list-slide.component.html`,
    styleUrls: [`./current-structure-level-list-slide.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentStructureLevelListSlideComponent extends BaseSlideComponent<CurrentStructureLevelListSlideData> {
    /**
     * For sorting motion blocks by their displayed title
     */
    private languageCollator: Intl.Collator;
    private maxColumns: number = MAX_COLUMNS;

    /**
     * If this is set, all motions have the same recommendation, saved in this variable.
     */
    public commonRecommendation: string | null = null;

    public get structureLevels(): CurrentStructureLevelListSlideStructureLevelRepresentation[] {
        return this.data.data?.structure_levels || [];
    }

    /**
     * @returns the amount of motions in this block
     */
    public get structureLevelsAmount(): number {
        if (this.data && this.data.data.structure_levels) {
            return this.data.data.structure_levels.length;
        } else {
            return 0;
        }
    }

    public get shortDisplayStyle(): boolean {
        return this.structureLevelsAmount > SHORT_LAYOUT_THRESHOLD;
    }

    /**
     * @returns the amount of rows to display.
     */
    public get rows(): number {
        return Math.ceil(this.structureLevelsAmount / this.columns);
    }

    /**
     * @returns an aray with [0, ..., this.rows-1]
     */
    public get rowsArray(): number[] {
        return this.makeIndicesArray(this.rows);
    }

    public get columns(): number {
        const rowsPerColumn = this.shortDisplayStyle ? ROWS_PER_COLUMN_SHORT : ROWS_PER_COLUMN_LONG;
        const columns = Math.ceil(this.structureLevelsAmount / rowsPerColumn);
        return Math.min(columns, this.maxColumns);
    }

    /**
     * @returns an aray with [0, ..., this.columns-1]
     */
    public get columnsArray(): number[] {
        return this.makeIndicesArray(this.columns);
    }

    public constructor(translate: TranslateService) {
        super();
        this.languageCollator = new Intl.Collator(translate.currentLang);
    }

    /**
     * @returns an array [0, ..., n-1]
     */
    public makeIndicesArray(n: number): number[] {
        const indices = [];
        for (let i = 0; i < n; i++) {
            indices.push(i);
        }
        return indices;
    }

    /**
     * Get the motion for the cell given by i and j
     *
     * @param i the row
     * @param j the column
     */
    public getStructureLevel(i: number, j: number): CurrentStructureLevelListSlideStructureLevelRepresentation {
        const index = i + this.rows * j;
        return this.data.data.structure_levels[index];
    }
}
