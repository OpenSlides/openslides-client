import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Fqid } from 'src/app/domain/definitions/key-types';
import { HttpService } from 'src/app/gateways/http.service';
import { collectionFromFqid, idFromFqid } from 'src/app/infrastructure/utils/transform-functions';

@Component({
    selector: `os-global-search`,
    templateUrl: `./global-search.component.html`,
    styleUrls: [`./global-search.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchComponent {
    public searchTerm = ``;

    public readonly availableFilters = [
        { label: `Committees`, field: `committee` },
        { label: `Meetings`, field: `meeting` },
        { label: `Motions`, field: `motion` },
        { label: `Elections`, field: `assignment` },
        { label: `Files`, field: `mediafile` },
        { label: `Participants`, field: `user` }
    ];

    public currentFilters = this.formBuilder.group(Object.fromEntries(this.availableFilters.map(f => [f.field, true])));

    public results: { title: string; text: string; fqid: string; url?: string }[] = [];

    constructor(private http: HttpService, private formBuilder: FormBuilder, private cd: ChangeDetectorRef) {}

    public async searchChange() {
        console.log(this.searchTerm);
        this.http.get(`/system/search`, null, { q: this.searchTerm }).then((rawResults: { [fqid: string]: any }) => {
            console.log(this.currentFilters);
            this.results = Object.keys(rawResults)
                .filter(fqid => {
                    const collection = collectionFromFqid(fqid);
                    return this.currentFilters.get(collection) && this.currentFilters.get(collection).getRawValue();
                })
                .map(fqid => this.getResult(fqid, rawResults[fqid]));
            this.cd.markForCheck();
            console.log(this.results);
        });
    }

    private getResult(fqid: Fqid, content: any) {
        const collection = collectionFromFqid(fqid);
        const id = idFromFqid(fqid);
        let title = content.title || content.name;
        let text = content.text || content.description;
        let url = ``;

        switch (collection) {
            case `committee`:
                url = `/committees/${id}`;
                break;
            case `meeting`:
                url = `/${id}`;
                break;
            case `motion`:
                url = `/${content.meeting_id}/motions/${id}`;
                break;
            case `assignment`:
                url = `/${content.meeting_id}/assignments/${id}`;
                break;
            case `mediafile`:
                url = `/system/media/get/${id}`;
                break;
            case `user`:
                const firstName = content.first_name?.trim() || ``;
                const lastName = content.last_name?.trim() || ``;
                const userName = content.username?.trim() || ``;
                const name = firstName || lastName ? `${firstName} ${lastName}` : userName;
                title = name?.trim() || ``;
                break;
        }

        return {
            title,
            text,
            fqid,
            url
        };
    }
}
