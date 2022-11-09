import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { Identifiable } from 'src/app/domain/interfaces';

import { FilterListService, OsFilterOption, OsFilterOptions } from '../../definitions/filter-service';

const MAX_CHECKBOX_WIDTH = 290; // Maximum width of a checkbox (in px).

/**
 * Component for selecting the filters in a filter menu.
 * It expects to be opened inside a sidenav container,
 *
 * ## Examples:
 *
 * ### Usage of the selector:
 * ```html
 * <os-filter-menu (dismissed)="this.filterMenu.close()">
 * ```
 */
@Component({
    selector: `os-filter-menu`,
    templateUrl: `./filter-menu.component.html`,
    styleUrls: [`./filter-menu.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterMenuComponent<V extends Identifiable> implements OnInit, OnDestroy {
    /**
     * The height of one row in an action list
     */
    public readonly ROW_HEIGHT = 24;

    /**
     * An event emitter to submit a desire to close this component
     * TODO: Might be an easier way to do this
     */
    @Output()
    public dismissed = new EventEmitter<boolean>();

    /**
     * A filterListService for the listView. There are several Services extending
     * the FilterListService; unsure about how to get them in any other way.
     */
    @Input()
    public service!: FilterListService<V>;

    public constructor(private cd: ChangeDetectorRef) {}

    /**
     * Directly closes again if no sorting is available
     */
    public ngOnInit(): void {
        this.cd.markForCheck();
        this.cd.detectChanges();
        this.cd.markForCheck();
        this.service.outputObservable.subscribe(() => {
            this.cd.markForCheck();
        });
    }

    /**
     *
     */
    public ngOnDestroy(): void {
        this.dismissed.unsubscribe();
    }

    /**
     * Tests for escape key (to colose the sidebar)
     * @param event
     */
    public checkKeyEvent(event: KeyboardEvent): void {
        if (event.key === `Escape`) {
            this.dismissed.next(true);
        }
    }

    /**
     * Determines whether a tooltip should be shown on hovering over a checkbox
     */
    public shouldShowTooltip(element: MatCheckbox): boolean {
        return element._elementRef.nativeElement.clientWidth > MAX_CHECKBOX_WIDTH;
    }

    public isFilter(option: string | OsFilterOption): option is OsFilterOption {
        return !!option && typeof option !== `string`;
    }

    public getActionListContentHeight(filterOptions: OsFilterOptions): string {
        const contentHeight = Math.min(400, filterOptions.length * this.ROW_HEIGHT);
        return `${contentHeight}px`;
    }
}
