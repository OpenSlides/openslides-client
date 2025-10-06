import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StructureLevelRepositoryService } from 'src/app/gateways/repositories/structure-levels';
import { BaseMeetingComponent } from 'src/app/site/pages/meetings/base/base-meeting.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';

@Component({
    selector: 'os-mandate-check-list',
    imports: [TranslateModule, HeadBarModule],
    templateUrl: './mandate-check-list.component.html',
    styleUrl: './mandate-check-list.component.scss',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MandateCheckListComponent extends BaseMeetingComponent implements OnInit {
    public structureLevels = [];
    public constructor(
        private structureLevelRepo: StructureLevelRepositoryService,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        this.structureLevelRepo.getViewModelListObservable().subscribe(strLvls => {
            this.structureLevels = strLvls;
            console.log(`XXX`, strLvls);
            this.cd.markForCheck();
        });
    }
}
