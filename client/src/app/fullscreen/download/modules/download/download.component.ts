import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'app/core/core-services/auth.service';

@Component({
    selector: 'os-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})
export class DownloadComponent implements OnInit {
    public get resourceUrl(): string {
        return this._resourceUrl;
    }

    public get hasLoaded(): boolean {
        return this.loaded;
    }

    private loaded = false;

    private _resourceUrl: string;

    public constructor(private activeRoute: ActivatedRoute, private auth: AuthService) {}

    public ngOnInit(): void {
        this.auth.firstTimeWhoAmI.subscribe(loaded => {
            if (loaded) {
                this.loaded = loaded;
                this.loadResourceById();
            }
        });
    }

    private loadResourceById(): void {
        const params = this.activeRoute.snapshot.params;
        if (params.id) {
            this._resourceUrl = `/system/media/get/${params.id}`;
        }
    }
}
