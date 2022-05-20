import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { Permission } from 'src/app/domain/definitions/permission';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers, hasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models/base-projectable-model';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { ColumnRestriction, ListComponent } from 'src/app/ui/modules/list/components';

import { ProjectableListService } from '../../services/projectable-list.service';

export interface CssClassDefinition {
    [key: string]: boolean;
}

const PROJECTOR_BUTTON_WIDTH = 60;
const PROJECTOR_VIEW_WIDTH = 24;

/**
 * List of projectable view models
 */
@Component({
    selector: `os-projectable-list`,
    templateUrl: `./projectable-list.component.html`,
    styleUrls: [`./projectable-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ProjectableListComponent<V extends BaseViewModel | BaseProjectableViewModel> extends ListComponent<V> {
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

    public readonly permission = Permission;

    /**
     * Most, of not all list views require these
     */
    @Input()
    public override startColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: `selection`,
            label: ``,
            width: `40px`
        },
        {
            prop: `projector`,
            label: ``,
            width: `${this.projectorColumnWidth}px`
        }
    ];

    /**
     * End columns
     */
    @Input()
    public override endColumnDefinitions: PblColumnDefinition[] = [
        {
            prop: `speaker`,
            label: ``,
            width: `45px`
        },
        {
            prop: `menu`,
            label: ``,
            width: `40px`
        }
    ];

    public readonly isProjectedFn = (model: BaseProjectableViewModel) => this.service.isProjected(model);

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
        if (this.isMobile || !this.showListOfSpeakers || !this.operator.hasPerms(Permission.listOfSpeakersCanSee)) {
            columnsToHide.push(`speaker`);
        }

        return columnsToHide;
    };

    @Input()
    public override alsoFilterByProperties: string[] = [`sequential_number`, `id`];

    private get projectorColumnWidth(): number {
        if (this.operator.hasPerms(Permission.projectorCanManage)) {
            return PROJECTOR_BUTTON_WIDTH;
        } else {
            return PROJECTOR_VIEW_WIDTH;
        }
    }

    public constructor(
        vp: ViewPortService,
        cd: ChangeDetectorRef,
        private operator: OperatorService,
        private service: ProjectableListService
    ) {
        super(vp, cd);
    }

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
