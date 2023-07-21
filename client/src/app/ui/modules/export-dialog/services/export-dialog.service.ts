import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Permission } from 'src/app/domain/definitions/permission';
import { largeDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { ExportFileFormat } from 'src/app/site/pages/meetings/pages/motions/services/export/definitions';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { ExportDialogComponent } from '../components';
import { ExportDialogModule } from '../export-dialog.module';

export type ExportInfoChoiceType<T> = T extends Array<any> ? T[number] : T;

type ExportDialogSettingsKeys<ExportInfo extends { format: ExportFileFormat }> = keyof ExportInfo;

export type ExportDialogSettings<ExportInfo extends { format: ExportFileFormat }> = {
    title: string;
    settings: {
        [key in ExportDialogSettingsKeys<ExportInfo>]: {
            label?: string;
            weight: number;
            multiple: ExportInfo[key] extends Array<any> ? true : false;
            offState?: ExportInfoChoiceType<ExportInfo[key]>;
            disableForFormat?: ExportFileFormat[];
            choices: Map<
                ExportInfoChoiceType<ExportInfo[key]>,
                {
                    label?: string;
                    perms?: Permission;
                    mandatory?: boolean; // If true, this option will not be shown but still returned as part of the selection
                    disableWhen?: { otherValue: ExportInfo[key]; checked: boolean }[];
                    disableForFormat?: ExportFileFormat[];
                }
            >;
        };
    };
};

@Injectable({
    providedIn: ExportDialogModule
})
export class ExportDialogService<
    T extends BaseViewModel,
    ExportInfo extends { format: ExportFileFormat }
> extends BaseDialogService<
    ExportDialogComponent<T, ExportInfo>,
    {
        data: T[];
        settings: ExportDialogSettings<ExportInfo>;
        storageKey: string;
        defaults: ExportInfo;
    },
    ExportInfo
> {
    public constructor(dialog: MatDialog) {
        super(dialog);
    }

    public override async open(data: {
        data: T[];
        settings: ExportDialogSettings<ExportInfo>;
        storageKey: string;
        defaults: ExportInfo;
    }): Promise<MatDialogRef<ExportDialogComponent<T, ExportInfo>, ExportInfo>> {
        const module = await import(`../export-dialog.module`).then(m => m.ExportDialogModule);
        return this.dialog.open(module.getComponent()<T, ExportInfo>, {
            data,
            ...largeDialogSettings
        });
    }
}
