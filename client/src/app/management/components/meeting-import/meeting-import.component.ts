import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { Id } from 'app/core/definitions/key-types';
import { ImportMeeting, MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { FileData } from 'app/shared/components/file-upload/file-upload.component';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-meeting-import',
    templateUrl: './meeting-import.component.html',
    styleUrls: ['./meeting-import.component.scss']
})
export class MeetingImportComponent extends BaseComponent implements OnInit {
    public columns: PblColumnDefinition[] = [
        {
            prop: 'title',
            label: this.translate.instant('Title')
        }
    ];

    private committeeId: Id | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private repo: MeetingRepositoryService,
        private route: ActivatedRoute,
        private location: Location
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params.committeeId) {
                    this.committeeId = +params.committeeId;
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
                reader.addEventListener('load', progress => {
                    const result = JSON.parse(progress.target.result as string);
                    resolve(result);
                });
                reader.readAsText(file.mediafile);
            });
            return this.repo.import(this.committeeId, meeting);
        };
    }
}
