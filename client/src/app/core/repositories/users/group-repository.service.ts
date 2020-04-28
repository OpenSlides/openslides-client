import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpService } from 'app/core/core-services/http.service';
import { Group } from 'app/shared/models/users/group';
import { GroupTitleInformation, ViewGroup } from 'app/site/users/models/view-group';
import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Shape of a permission
 */
interface Permission {
    display_name: string;
    value: string;
}

const PERMISSIONS: Permission[] = [
    { display_name: 'Do it!', value: 'core.can_do_something' },
    { display_name: "Don't do it!", value: 'core.do_something_else' }
];

/**
 * Set rules to define the shape of an app permission
 */
export interface AppPermissions {
    name: string;
    permissions: Permission[];
}

/**
 * Repository service for Groups
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class GroupRepositoryService extends BaseRepository<ViewGroup, Group, GroupTitleInformation> {
    /**
     * holds sorted permissions per app.
     */
    public appPermissions: AppPermissions[] = [];

    /**
     * Constructor calls the parent constructor
     * @param DS The DataStore
     * @param mapperService Maps collection strings to classes
     * @param dataSend sending changed objects
     * @param constantsService reading out the OpenSlides constants
     */
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private http: HttpService) {
        super(repositoryServiceCollector, Group);
        this.sortPermsPerApp();
    }

    public getTitle = (titleInformation: GroupTitleInformation) => {
        return titleInformation.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Groups' : 'Group');
    };

    public getNameForIds(...ids: number[]): string {
        return this.getSortedViewModelList()
            .filter(group => ids.includes(group.id))
            .map(group => this.translate.instant(group.getTitle()))
            .join(', ');
    }

    /**
     * Toggles the given permisson.
     *
     * @param group The group
     * @param perm The permission to toggle
     */
    public async togglePerm(group: ViewGroup, perm: string): Promise<void> {
        const set = !group.permissions.includes(perm);
        return await this.http.post(`/rest/${group.collection}/${group.id}/set_permission/`, {
            perm: perm,
            set: set
        });
    }

    /**
     * Add an entry to appPermissions
     *
     * @param appId number that indicates the app
     * @param perm certain permission as string
     * @param appName Indicates the header in the Permission Matrix
     */
    private addAppPerm(appId: number, perm: Permission, appName: string): void {
        if (!this.appPermissions[appId]) {
            this.appPermissions[appId] = {
                name: appName,
                permissions: []
            };
        }
        this.appPermissions[appId].permissions.push(perm);
    }

    /**
     * read the constants, add them to an array of apps
     */
    private sortPermsPerApp(): void {
        this.appPermissions = [];
        let pluginCounter = 0;
        for (const perm of PERMISSIONS) {
            // extract the apps name
            const permApp = perm.value.split('.')[0];
            switch (permApp) {
                case 'core':
                    if (perm.value.indexOf('projector') > -1) {
                        this.addAppPerm(0, perm, 'Projector');
                    } else {
                        this.addAppPerm(6, perm, 'General');
                    }
                    break;
                case 'agenda':
                    this.addAppPerm(1, perm, 'Agenda');
                    break;
                case 'motions':
                    this.addAppPerm(2, perm, 'Motions');
                    break;
                case 'assignments':
                    this.addAppPerm(3, perm, 'Elections');
                    break;
                case 'mediafiles':
                    this.addAppPerm(4, perm, 'Files');
                    break;
                case 'users':
                    this.addAppPerm(5, perm, 'Participants');
                    break;
                default:
                    // plugins
                    const displayName = `${permApp.charAt(0).toUpperCase()}${permApp.slice(1)}`;
                    // check if the plugin exists as app. The appPermissions array might have empty
                    // entries, so pay attention in the findIndex below.
                    const result = this.appPermissions.findIndex(app => {
                        return app ? app.name === displayName : false;
                    });
                    let pluginId: number;
                    if (result >= 0) {
                        pluginId = result;
                    } else {
                        // Ensure plugins to be behind the 7 core apps.
                        pluginId = pluginCounter + 7;
                        pluginCounter++;
                    }
                    this.addAppPerm(pluginId, perm, displayName);
                    break;
            }
        }
        this.sortPermsByPower();
    }

    /**
     * sort each app: first all permission with 'see', then 'manage', then the rest
     * save the permissions in different lists an concat them in the right order together
     * Special Users: the two "see"-permissions are normally swapped. To create the right
     * order, we could simply reverse the whole permissions.
     */
    private sortPermsByPower(): void {
        this.appPermissions.forEach((app: AppPermissions) => {
            if (app.name === 'Users') {
                app.permissions.reverse();
            } else {
                const see = [];
                const manage = [];
                const others = [];
                for (const perm of app.permissions) {
                    if (perm.value.indexOf('see') > -1) {
                        see.push(perm);
                    } else if (perm.value.indexOf('manage') > -1) {
                        manage.push(perm);
                    } else {
                        others.push(perm);
                    }
                }
                app.permissions = see.concat(manage.concat(others));
            }
        });
    }

    /**
     * Returns an Observable for all groups except the default group.
     */
    public getViewModelListObservableWithoutDefaultGroup(): Observable<ViewGroup[]> {
        // since groups are sorted by id, default is always the first entry
        return this.getViewModelListObservable().pipe(map(groups => groups.slice(1)));
    }
}
