import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers, hasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { InteractionService } from 'src/app/site/pages/meetings/pages/interaction/services/interaction.service';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ColumnRestriction, ListComponent } from 'src/app/ui/modules/list';
import { BaseListComponent } from 'src/app/ui/modules/list/base/base-list.component';
import {
    END_POSITION,
    START_POSITION
} from 'src/app/ui/modules/scrolling-table/directives/scrolling-table-cell-position';

import { ProjectableListService } from '../../services/projectable-list.service';

export interface CssClassDefinition {
    [key: string]: boolean;
}

/**
 * List of projectable view models
 */
@Component({
    selector: `os-projectable-list`,
    templateUrl: `./projectable-list.component.html`,
    styleUrls: [`./projectable-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: ListComponent, useExisting: ProjectableListComponent }]
})
export class ProjectableListComponent<V extends BaseViewModel | BaseProjectableViewModel> extends BaseListComponent<V> {
    public readonly END_POSITION = END_POSITION;
    public readonly START_POSITION = START_POSITION;

    /**
     * If a Projector column should be shown (at all)
     */
    @Input()
    public allowProjector = true;

    /**
     * If the speaker tab should appear
     */
    @Input()
    public showListOfSpeakers = true;

    @Input()
    public getSpeakerButtonObject: ((viewModel: V) => BaseViewModel & HasListOfSpeakers) | null = null;

    @Input()
    public override toRestrictFn = (restriction: ColumnRestriction<Permission>) =>
        !this.operator.hasPerms(restriction.permission);

    @Input()
    public override toHideFn = () => {
        const columnsToHide = [];

        // hide the projector columns
        if (this.multiSelect || this.isMobile || !this.allowProjector) {
            columnsToHide.push(`projector`);
        }

        // hide the speakers in mobile
        if (
            this.isMobile ||
            !this.showListOfSpeakers ||
            !this.operator.hasPerms(Permission.listOfSpeakersCanSee, Permission.listOfSpeakersCanBeSpeaker)
        ) {
            columnsToHide.push(`speaker`);
        }

        return columnsToHide;
    };

    @Input()
    public override alsoFilterByProperties: string[] = [`sequential_number`, `id`];

    public get projectorButtonColumnWidth(): number {
        if (this.operator.hasPerms(Permission.projectorCanManage)) {
            return 60;
        } else {
            return 24;
        }
    }

    public get hasInteractionState(): Observable<boolean> {
        return this.interactionService.isConfStateNone.pipe(map(isNone => !isNone));
    }

    public readonly permission = Permission;

    public readonly isProjectedFn = (model: BaseProjectableViewModel) => this.service.isProjected(model);

    private operator = inject(OperatorService);
    private service = inject(ProjectableListService);
    private interactionService = inject(InteractionService);

    public _getSpeakerButtonObject(viewModel: V): (BaseViewModel & HasListOfSpeakers) | null {
        if (this.getSpeakerButtonObject === null) {
            if (hasListOfSpeakers(viewModel)) {
                return viewModel;
            }
        } else {
            return this.getSpeakerButtonObject(viewModel);
        }
        return null;
    }
}
