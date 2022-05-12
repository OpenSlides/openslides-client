import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { Observable, of } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { BaseMeetingListViewComponent } from 'src/app/site/pages/meetings/base/base-meeting-list-view.component';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ViewMotionBlock } from '../../../../modules';
import { AgendaItemControllerService } from '../../../../../agenda/services/agenda-item-controller.service/agenda-item-controller.service';
import { MotionBlockControllerService } from '../../../../modules/motion-blocks/services';
import { TranslateService } from '@ngx-translate/core';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { MotionBlockSortService } from '../../services/motion-block-sort.service';
import { MotionBlockCreateDialogService } from '../motion-block-create-dialog/services/motion-block-create-dialog.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

const MOTION_BLOCK_LIST_STORAGE_INDEX = `motion_blocks`;
@Component({
    selector: 'os-motion-block-list',
    templateUrl: './motion-block-list.component.html',
    styleUrls: ['./motion-block-list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MotionBlockListComponent extends BaseMeetingListViewComponent<ViewMotionBlock> implements OnInit {
    /**
     * Holds the agenda items to select the parent item
     */
    public items: Observable<ViewAgendaItem[]> = of([]);

    /**
     * Determine the default agenda visibility
     */
    public defaultVisibility = AgendaItemType.INTERNAL;

    /**
     * Defines the properties the `sort-filter-bar` can search for.
     */
    public filterProps = [`title`];

    /**
     * helper for permission checks
     *
     * @returns true if the user may alter motions or their metadata
     */
    public get canEdit(): boolean {
        return this.operator.hasPerms(Permission.motionCanManage, Permission.motionCanManageMetadata);
    }

    /**
     * Define the columns to show
     */
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `title`,
            label: _(`Title`),
            width: `100%`
        },
        {
            prop: `amount`,
            label: _(`Motions`),
            width: `40px`
        }
    ];

    public constructor(
        componentServiceCollector: MeetingComponentServiceCollectorService,
        translate: TranslateService,
        public repo: MotionBlockControllerService,
        private dialog: MotionBlockCreateDialogService,
        private itemRepo: AgendaItemControllerService,
        private operator: OperatorService,
        public sortService: MotionBlockSortService
    ) {
        super(componentServiceCollector, translate);
        this.listStorageIndex = MOTION_BLOCK_LIST_STORAGE_INDEX;
    }

    /**
     * Observe the agendaItems for changes.
     */
    public ngOnInit(): void {
        super.setTitle(`Motion blocks`);
        this.items = this.itemRepo.getViewModelListObservable();
    }

    /**
     * Click handler for the plus button.
     * Opens the dialog for motion block creation.
     */
    public async onPlusButton(): Promise<void> {
        const dialogRef = await this.dialog.open();
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.repo.create(result);
            }
        });
    }

    public getMotionAmount(block: ViewMotionBlock): number {
        return block.motions.length;
    }

    public getIndicatingIcon(block: ViewMotionBlock): string {
        if (block.isFinished) {
            return `check`;
        } else if (block.internal) {
            return `lock`;
        } else {
            return ``;
        }
    }

    public getIndicatingTooltip(block: ViewMotionBlock): string {
        if (block.isFinished) {
            return `Finished`;
        } else if (block.internal) {
            return `Internal`;
        } else {
            return ``;
        }
    }
}
