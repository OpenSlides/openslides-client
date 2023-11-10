import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewSubdivision } from 'src/app/site/pages/organization/pages/accounts/pages/subdivisions/view-models/view-subdivision';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { SubdivisionControlService } from '../../services/subdivision-controller.service';

@Component({
    selector: `os-subdivision-list`,
    templateUrl: `./subdivision-list.component.html`,
    styleUrls: [`./subdivision-list.component.scss`]
})
export class SubdivisionListComponent extends BaseListViewComponent<ViewSubdivision> {
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        public repo: SubdivisionControlService,
        protected override translate: TranslateService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Subdivisions`);
        this.canMultiSelect = true;
    }

    public createSubdivision(): Promise<void> {
        console.log(`create SD`);
        return this.editSubdivision();
    }

    public async editSubdivision(subdivision?: ViewSubdivision): Promise<void> {
        console.log(`edit SD`, subdivision);
        /* const dialogRef = await this.dialog.open({
            organizationTag: orgaTag,
            defaultColor: this.theme.currentAccentColor,
            getRandomColor: () => this.colorService.getRandomHtmlColor()
        });*/
        const result = { name: `test` }; /* await firstValueFrom(dialogRef.afterClosed()); */
        if (result) {
            if (!subdivision) {
                // Creating a new subdivision...
                this.repo.create(result);
            } else {
                this.repo.update(result, subdivision);
            }
        }
    }

    public async deleteSubdivisions(...subdivisions: ViewSubdivision[]): Promise<void> {
        console.log(`SD delete`, subdivisions);
        const title =
            subdivisions.length === 1
                ? this.translate.instant(`Are you sure you want to delete this subdivision?`)
                : this.translate.instant(`Are you sure you want to delete all selected subdivsions?`);
        const content = subdivisions.length === 1 ? subdivisions[0].name : ``;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(...subdivisions);
        }
    }
}
