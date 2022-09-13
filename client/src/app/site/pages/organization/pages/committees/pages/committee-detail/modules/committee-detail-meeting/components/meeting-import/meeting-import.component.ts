import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { ImportMeeting } from 'src/app/gateways/repositories/meeting-repository.service';
import { BaseComponent } from 'src/app/site/base/base.component';
import { WRONG_JSON_IMPORT_FORMAT_ERROR_MSG } from 'src/app/site/pages/meetings/pages/motions/pages/workflows/components/workflow-import/workflow-import.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { FileData } from 'src/app/ui/modules/file-upload/components/file-upload/file-upload.component';

@Component({
    selector: `os-meeting-import`,
    templateUrl: `./meeting-import.component.html`,
    styleUrls: [`./meeting-import.component.scss`]
})
export class MeetingImportComponent extends BaseComponent implements OnInit {
    private _committeeId: Id | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private repo: MeetingControllerService,
        private osRouter: OpenSlidesRouterService,
        private location: Location,
        private snackbar: MatSnackBar
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                if (params[`committeeId`]) {
                    this._committeeId = +params[`committeeId`];
                }
            })
        );
    }

    public onUploadSucceeded(): void {
        this.location.back();
    }

    public getUploadFileFn(): (file: FileData) => Promise<Identifiable> {
        return async file => {
            const meeting = await new Promise<ImportMeeting>(resolve => {
                const reader = new FileReader();
                reader.addEventListener(`load`, progress => {
                    let result;
                    try {
                        result = JSON.parse(progress.target.result as string);
                    } catch (e) {
                        this.snackbar.open(
                            `${this.translate.instant(`Error`)}: ${this.translate.instant(
                                WRONG_JSON_IMPORT_FORMAT_ERROR_MSG
                            )}`,
                            `OK`
                        );
                        throw new Error(WRONG_JSON_IMPORT_FORMAT_ERROR_MSG);
                    }
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(this._committeeId, meeting);
        };
    }
}
