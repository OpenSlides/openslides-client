import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ScrollingTableComponent } from '../components/scrolling-table/scrolling-table.component';
import { ScrollingTableCellDefinition } from '../directives/scrolling-table-cell-definition';
import { ScrollingTableCellPosition } from '../directives/scrolling-table-cell-position';
import { ScrollingTableServiceModule } from './scrolling-table-service.module';

class ScrollingTableCellHandler implements Iterable<ScrollingTableCellDefinition> {
    private _registeredDefinitions: ScrollingTableCellDefinition[] = [];

    public set(definition: ScrollingTableCellDefinition): void {
        const existingDefinitionIndex = this._registeredDefinitions.findIndex(
            _definition => definition.property === _definition.property
        );
        if (existingDefinitionIndex > -1) {
            this._registeredDefinitions.splice(existingDefinitionIndex, 1, definition);
        } else {
            this._registeredDefinitions.push(definition);
        }
    }

    public append(definition: ScrollingTableCellDefinition): void {
        const existingDefinitionIndex = this._registeredDefinitions.findIndex(
            _definition => definition.property === _definition.property
        );
        if (existingDefinitionIndex > -1) {
            const oldDefinition = this._registeredDefinitions.splice(existingDefinitionIndex, 1);
            this._registeredDefinitions.push(...oldDefinition);
        } else {
            this._registeredDefinitions.push(definition);
        }
    }

    public clear(): void {
        this._registeredDefinitions = [];
    }

    public *[Symbol.iterator](): Iterator<ScrollingTableCellDefinition, any, undefined> {
        for (const definition of this._registeredDefinitions) {
            yield definition;
        }
    }
}

@Injectable({
    providedIn: ScrollingTableServiceModule
})
export class ScrollingTableManageService {
    public currentScrollingTableComponent: ScrollingTableComponent<any> | null = null;

    public get cellDefinitionsObservable(): Observable<ScrollingTableCellDefinition[]> {
        return this._cellDefinitionsSubject;
    }

    public readonly noDataTemplateSubject = new BehaviorSubject<TemplatePortal | null>(null);

    private readonly _cellDefinitionsSubject = new BehaviorSubject<ScrollingTableCellDefinition[]>([]);

    private _startCells = new ScrollingTableCellHandler();
    private _centerCells = new ScrollingTableCellHandler();
    private _endCells = new ScrollingTableCellHandler();

    public updateCellDefinition(def: ScrollingTableCellDefinition): void {
        this.updateCells(def, `set`);
    }

    public appendCellDefinition(def: ScrollingTableCellDefinition): void {
        this.updateCells(def, `append`);
    }

    public clearRegistry(): void {
        this._startCells.clear();
        this._endCells.clear();
        this._centerCells.clear();
        this._cellDefinitionsSubject.next([]);
    }

    private updateCells(def: ScrollingTableCellDefinition, fn: `set` | `append`): void {
        switch (def.position) {
            case ScrollingTableCellPosition.START:
                this._startCells[fn](def);
                break;
            case ScrollingTableCellPosition.END:
                this._endCells[fn](def);
                break;
            default:
                this._centerCells[fn](def);
        }
        this._cellDefinitionsSubject.next([...this._startCells, ...this._centerCells, ...this._endCells]);
    }
}
