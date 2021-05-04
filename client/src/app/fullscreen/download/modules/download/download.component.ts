import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { saveAs } from 'file-saver';

import { HttpService } from 'app/core/core-services/http.service';
import { OperatorService } from 'app/core/core-services/operator.service';

@Component({
    selector: 'os-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
    public constructor(
        private activeRoute: ActivatedRoute,
        private operator: OperatorService,
        private http: HttpService
    ) {}

    public async ngOnInit(): Promise<void> {
        await this.operator.ready;
        this.loadResourceById();
    }

    private loadResourceById(): void {
        const { queryParams }: { queryParams: any } = this.activeRoute.snapshot;
        if (queryParams.id) {
            const resourceUrl = `/system/media/get/${queryParams.id}`;
            this.http.get<Blob>(resourceUrl, null, null, null, 'blob').then(response => {
                this.readBlobData(response, queryParams.name);
            });
        }
    }

    private readBlobData(data: Blob, fileName: string): void {
        saveAs(data, fileName);
        setTimeout(() => window.close(), 100); // file-saver works not synchronously. So, wait some ms.
    }
}
