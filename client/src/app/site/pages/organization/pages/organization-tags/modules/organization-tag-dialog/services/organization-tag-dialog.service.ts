import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HtmlColor } from 'src/app/domain/definitions/key-types';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ViewOrganizationTag } from '../../../view-models';
import { OrganizationTagDialogComponent } from '../components/organization-tag-dialog.component';
import { OrganizationTagDialogModule } from '../organization-tag-dialog.module';

export interface OrganizationTagDialogData {
    organizationTag?: ViewOrganizationTag;
    defaultColor: HtmlColor;
    getRandomColor: () => HtmlColor;
}

interface OrganizationTagDialogResult {
    name: string;
    color: HtmlColor;
}

@Injectable({
    providedIn: OrganizationTagDialogModule
})
export class OrganizationTagDialogService extends BaseDialogService<
    OrganizationTagDialogComponent,
    OrganizationTagDialogData,
    OrganizationTagDialogResult
> {
    public async open(
        data: OrganizationTagDialogData
    ): Promise<MatDialogRef<OrganizationTagDialogComponent, OrganizationTagDialogResult>> {
        const module = await import(`../organization-tag-dialog.module`);
        return this.dialog.open(module.OrganizationTagDialogModule.getComponent(), { ...mediumDialogSettings, data });
    }
}
