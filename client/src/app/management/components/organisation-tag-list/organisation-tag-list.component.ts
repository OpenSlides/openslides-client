import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PblColumnDefinition } from '@pebula/ngrid';

import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OrganisationTagRepositoryService } from 'app/core/repositories/management/organisation-tag-repository.service';
import { ColorService } from 'app/core/ui-services/color.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewOrganisation } from 'app/management/models/view-organisation';
import { ViewOrganisationTag } from 'app/management/models/view-organisation-tag';
import { mediumDialogSettings } from 'app/shared/utils/dialog-settings';
import { BaseListViewComponent } from 'app/site/base/components/base-list-view.component';
import { OrganisationTagDialogComponent } from '../organisation-tag-dialog/organisation-tag-dialog.component';

@Component({
    selector: 'os-organisation-tag-list',
    templateUrl: './organisation-tag-list.component.html',
    styleUrls: ['./organisation-tag-list.component.scss']
})
export class OrganisationTagListComponent extends BaseListViewComponent<ViewOrganisationTag> implements OnInit {
    public tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: 'name',
            width: 'auto'
        },
        {
            prop: 'info',
            width: '65%'
        },
        {
            prop: 'actions',
            width: 'auto'
        }
    ];

    public constructor(
        serviceCollector: ComponentServiceCollector,
        public repo: OrganisationTagRepositoryService,
        private dialog: MatDialog,
        private promptService: PromptService,
        private colorService: ColorService
    ) {
        super(serviceCollector);
        super.setTitle('Organization tags');
        this.canMultiSelect = true;
    }

    public ngOnInit(): void {
        super.ngOnInit();
    }

    public createOrganizationTag(): Promise<void> {
        return this.editOrganizationTag();
    }

    public async editOrganizationTag(orgaTag?: ViewOrganisationTag): Promise<void> {
        const dialogRef = this.dialog.open(OrganisationTagDialogComponent, {
            ...mediumDialogSettings,
            data: {
                organisationTag: orgaTag,
                getRandomColor: () => this.colorService.getRandomHtmlColor()
            }
        });
        const result = await dialogRef.afterClosed().toPromise();
        if (result) {
            if (!orgaTag) {
                // Creating a new tag...
                this.repo.create(result);
            } else {
                this.repo.update(result, orgaTag);
            }
        }
    }

    public async deleteOrganizationTags(...orgaTags: ViewOrganisationTag[]): Promise<void> {
        const dialogTitle =
            orgaTags.length === 1
                ? this.translate.instant('Are you sure you want to delete this organization tag?')
                : this.translate.instant('Are you sure you want to delete all selected tags?');
        const dialogSubtitle = orgaTags.length === 1 ? orgaTags[0].name : '';
        if (await this.promptService.open(dialogTitle, dialogSubtitle)) {
            await this.repo.delete(...orgaTags);
        }
    }

    public deleteSelectedTags(): void {
        this.deleteOrganizationTags(...this.selectedRows);
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganisation,
            ids: [1],
            fieldset: 'list',
            follow: [
                {
                    idField: 'organisation_tag_ids',
                    follow: [
                        {
                            idField: 'committee_ids'
                        },
                        {
                            idField: 'meeting_ids'
                        }
                    ]
                }
            ]
        };
    }
}
