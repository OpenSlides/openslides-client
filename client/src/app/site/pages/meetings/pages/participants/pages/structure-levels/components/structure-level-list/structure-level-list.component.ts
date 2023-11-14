import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ViewStructureLevel } from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models/view-structure-level';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { StructureLevelControlService } from '../../services/structure-level-controller.service';

@Component({
    selector: `os-structure-level-list`,
    templateUrl: `./structure-level-list.component.html`,
    styleUrls: [`./structure-level-list.component.scss`]
})
export class StructureLevelListComponent extends BaseListViewComponent<ViewStructureLevel> {
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        public repo: StructureLevelControlService,
        protected override translate: TranslateService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`StructureLevels`);
        this.canMultiSelect = true;
    }

    public createStructureLevel(): Promise<void> {
        console.log(`create SD`);
        return this.editStructureLevel();
    }

    public async editStructureLevel(structure_level?: ViewStructureLevel): Promise<void> {
        console.log(`edit SD`, structure_level);
        /* const dialogRef = await this.dialog.open({
            organizationTag: orgaTag,
            defaultColor: this.theme.currentAccentColor,
            getRandomColor: () => this.colorService.getRandomHtmlColor()
        });*/
        const result = { name: `test` }; /* await firstValueFrom(dialogRef.afterClosed()); */
        if (result) {
            if (!structure_level) {
                // Creating a new structure_level...
                this.repo.create(result);
            } else {
                this.repo.update(result, structure_level);
            }
        }
    }

    public async deleteStructureLevels(...structure_levels: ViewStructureLevel[]): Promise<void> {
        console.log(`SD delete`, structure_levels);
        const title =
            structure_levels.length === 1
                ? this.translate.instant(`Are you sure you want to delete this structure_level?`)
                : this.translate.instant(`Are you sure you want to delete all selected subdivsions?`);
        const content = structure_levels.length === 1 ? structure_levels[0].name : ``;
        if (await this.promptService.open(title, content)) {
            await this.repo.delete(...structure_levels);
        }
    }
}
