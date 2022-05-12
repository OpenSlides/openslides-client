import { Component, OnInit } from '@angular/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { TranslateService } from '@ngx-translate/core';
import { OrganizationTagDialogService } from '../../../../modules/organization-tag-dialog/services/organization-tag-dialog.service';
import { filter, firstValueFrom, map, Observable } from 'rxjs';
import { ViewOrganizationTag } from '../../../../view-models';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OrganizationTagControllerService } from '../../../../services/organization-tag-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { ColorService } from 'src/app/site/services/color.service';
import { ThemeService } from 'src/app/site/services/theme.service';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: `os-organization-tag-list`,
    templateUrl: `./organization-tag-list.component.html`,
    styleUrls: [`./organization-tag-list.component.scss`]
})
export class OrganizationTagListComponent extends BaseListViewComponent<ViewOrganizationTag> {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `name`,
            width: `100%`
        },
        {
            prop: `edit`,
            width: this.singleButtonWidth
        },
        {
            prop: `delete`,
            width: this.singleButtonWidth
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        public repo: OrganizationTagControllerService,
        private promptService: PromptService,
        private dialog: OrganizationTagDialogService,
        private colorService: ColorService,
        private theme: ThemeService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Tags`);
        this.canMultiSelect = true;
    }

    public createOrganizationTag(): Promise<void> {
        return this.editOrganizationTag();
    }

    public async editOrganizationTag(orgaTag?: ViewOrganizationTag): Promise<void> {
        const dialogRef = await this.dialog.open({
            organizationTag: orgaTag,
            defaultColor: this.theme.currentAccentColor,
            getRandomColor: () => this.colorService.getRandomHtmlColor()
        });
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (result) {
            if (!orgaTag) {
                // Creating a new tag...
                this.repo.create(result);
            } else {
                this.repo.update(result, orgaTag);
            }
        }
    }

    public async deleteOrganizationTags(...orgaTags: ViewOrganizationTag[]): Promise<void> {
        const dialogTitle =
            orgaTags.length === 1
                ? _(`Are you sure you want to delete this tag?`)
                : _(`Are you sure you want to delete all selected tags?`);
        const dialogSubtitle = orgaTags.length === 1 ? orgaTags[0].name : ``;
        if (await this.promptService.open(dialogTitle, dialogSubtitle)) {
            await this.repo.delete(...orgaTags);
        }
    }

    public deleteSelectedTags(): void {
        this.deleteOrganizationTags(...this.selectedRows);
    }
}
