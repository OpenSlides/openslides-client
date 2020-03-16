import { EventEmitter, Injectable } from '@angular/core';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { auditTime, take } from 'rxjs/operators';

import { Group } from 'app/shared/models/users/group';
import { AutoupdateService, ModelRequest, ModelSubscription } from './autoupdate.service';
import { DataStoreService } from './data-store.service';
import { HttpService } from './http.service';
import { OfflineService } from './offline.service';
import { DEFAULT_AUTH_TYPE, User, UserAuthType } from '../../shared/models/users/user';

/**
 * Permissions on the client are just strings. This makes clear, that
 * permissions instead of arbitrary strings should be given.
 */
export enum Permission {
    agendaCanManage = 'agenda.can_manage',
    agendaCanSee = 'agenda.can_see',
    agendaCanSeeInternalItems = 'agenda.can_see_internal_items',
    agendaCanManageListOfSpeakers = 'agenda.can_manage_list_of_speakers',
    agendaCanSeeListOfSpeakers = 'agenda.can_see_list_of_speakers',
    agendaCanBeSpeaker = 'agenda.can_be_speaker',
    assignmentsCanManage = 'assignments.can_manage',
    assignmentsCanNominateOther = 'assignments.can_nominate_other',
    assignmentsCanNominateSelf = 'assignments.can_nominate_self',
    assignmentsCanSee = 'assignments.can_see',
    coreCanManageConfig = 'core.can_manage_config',
    coreCanManageLogosAndFonts = 'core.can_manage_logos_and_fonts',
    coreCanSeeHistory = 'core.can_see_history',
    coreCanManageProjector = 'core.can_manage_projector',
    coreCanSeeFrontpage = 'core.can_see_frontpage',
    coreCanSeeProjector = 'core.can_see_projector',
    coreCanManageTags = 'core.can_manage_tags',
    coreCanSeeLiveStream = 'core.can_see_livestream',
    coreCanSeeAutopilot = 'core.can_see_autopilot',
    mediafilesCanManage = 'mediafiles.can_manage',
    mediafilesCanSee = 'mediafiles.can_see',
    motionsCanCreate = 'motions.can_create',
    motionsCanCreateAmendments = 'motions.can_create_amendments',
    motionsCanManage = 'motions.can_manage',
    motionsCanManageMetadata = 'motions.can_manage_metadata',
    motionsCanManagePolls = 'motions.can_manage_polls',
    motionsCanSee = 'motions.can_see',
    motionsCanSeeInternal = 'motions.can_see_internal',
    motionsCanSupport = 'motions.can_support',
    usersCanChangePassword = 'users.can_change_password',
    usersCanManage = 'users.can_manage',
    usersCanSeeExtraData = 'users.can_see_extra_data',
    usersCanSeeName = 'users.can_see_name'
}

/**
 * Response format of the WhoAmI request.
 */
export interface WhoAmI {
    user_id: number | null;
    guest_enabled: boolean;
    groups_id: number[] | null;
    short_name: string;
    auth_type: UserAuthType;
    permissions: Permission[];
}

function isWhoAmI(obj: any): obj is WhoAmI {
    if (!obj) {
        return false;
    }
    const whoAmI = obj as WhoAmI;
    return (
        whoAmI.guest_enabled !== undefined &&
        whoAmI.groups_id !== undefined &&
        whoAmI.user_id !== undefined &&
        whoAmI.short_name !== undefined &&
        whoAmI.permissions !== undefined &&
        whoAmI.auth_type !== undefined
    );
}

/**
 * The operator represents the user who is using OpenSlides.
 *
 * Changes in operator can be observed, directives do so on order to show
 * or hide certain information.
 */
@Injectable({
    providedIn: 'root'
})
export class OperatorService {
    private whoAmIData: WhoAmI = this.getDefaultWhoAmIResponse();

    public get operatorId(): number | null {
        return this.whoAmIData.user_id;
    }

    public get shortName(): string {
        return this.whoAmIData.short_name;
    }

    public get isAnonymous(): boolean {
        return !this.whoAmIData.user_id;
    }

    public get isSuperAdmin(): boolean {
        return this.isInGroupIdsNonAdminCheck(2);
    }

    public get guestEnabled(): boolean {
        return this.whoAmIData.guest_enabled;
    }

    /**
     * Subject for the operator as a view user.
     */
    private operatorIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

    public get operatorIdObservable(): Observable<number | null> {
        return this.operatorIdSubject.asObservable();
    }

    public readonly operatorUpdatedEvent: EventEmitter<void> = new EventEmitter();

    private operatorShortNameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    public get operatorShortNameObservable(): Observable<string | null> {
        return this.operatorShortNameSubject.asObservable();
    }

    public readonly authType: BehaviorSubject<UserAuthType> = new BehaviorSubject(DEFAULT_AUTH_TYPE);

    private _loaded: Promise<void>;
    public get loaded(): Promise<void> {
        return this._loaded;
    }

    private currentUserSubscription: ModelSubscription | null = null;
    private currentDefaultGroupSubscription: ModelSubscription | null = null;

    public constructor(
        private http: HttpService,
        private DS: DataStoreService,
        private offlineService: OfflineService,
        private autoupdateService: AutoupdateService
    ) {
        this._loaded = this.operatorUpdatedEvent.pipe(take(1)).toPromise();

        this.DS.getChangeObservable(User).subscribe(user => {
            if (user !== undefined && this.whoAmIData && this.whoAmIData.user_id === user.id) {
                this.whoAmIData.groups_id = user.groups_id;
                this.whoAmIData.short_name = ''; // TODO: calc short name.
                this.whoAmIData.permissions = this.calcPermissions();

                this.operatorShortNameSubject.next(this.whoAmIData.short_name);
            }
        });
        this.DS.getChangeObservable(Group)
            .pipe(auditTime(10))
            .subscribe(group => {
                if (this.isAnonymous && group.id === 1) {
                    this.whoAmIData.permissions = this.calcPermissions();
                } else {
                    if (!this.whoAmIData.groups_id) {
                        const user = this.DS.get(User, this.whoAmIData.user_id);
                        if (!user) {
                            return;
                        }
                        this.whoAmIData.groups_id = user.groups_id;
                    }
                    if (
                        this.whoAmIData.groups_id.includes(group.id) ||
                        (this.whoAmIData.groups_id.length === 0 && group.id === 1)
                    ) {
                        this.whoAmIData.permissions = this.calcPermissions();
                    }
                }
            });
    }

    /**
     * Calls `/apps/users/whoami` to find out the real operator.
     *
     * @returns The response of the WhoAmI request.
     */
    public async doWhoAmIRequest(): Promise<void> {
        try {
            // const response = await this.http.get(environment.urlPrefix + '/users/whoami/');

            // FAKE WhoAmI
            const response = {
                user_id: 1,
                guest_enabled: true,
                groups_id: [2],
                short_name: 'username',
                auth_type: 'default',
                permissions: []
            };

            if (isWhoAmI(response)) {
                await this.setWhoAmI(response);
            } else {
                this.offlineService.goOfflineBecauseFailedWhoAmI();
            }
        } catch (e) {
            this.offlineService.goOfflineBecauseFailedWhoAmI();
        }
    }

    /**
     * Sets the operator user. Will be saved to storage
     * @param user The new operator.
     */
    public async setWhoAmI(whoami: WhoAmI | null): Promise<void> {
        if (whoami === null) {
            whoami = this.getDefaultWhoAmIResponse();
        }
        this.whoAmIData = whoami;

        if (this.currentDefaultGroupSubscription) {
            this.currentDefaultGroupSubscription.close();
            this.currentDefaultGroupSubscription = null;
        }

        this.operatorIdSubject.next(this.whoAmIData.user_id);

        if (this.whoAmIData.user_id) {
            await this.refreshUserSubscription();
        }
    }

    /**
     * Returns a default WhoAmI response
     */
    private getDefaultWhoAmIResponse(): WhoAmI {
        return {
            user_id: null,
            guest_enabled: false,
            groups_id: null,
            short_name: '',
            auth_type: DEFAULT_AUTH_TYPE,
            permissions: []
        };
    }

    private async refreshUserSubscription(): Promise<void> {
        if (this.currentUserSubscription) {
            this.currentUserSubscription.close();
            this.currentUserSubscription = null;
        }

        const userReqeust: ModelRequest = {
            ids: [this.whoAmIData.user_id],
            collection: User.COLLECTION,
            fields: {
                groups_id: {
                    type: 'relation-list',
                    collection: Group.COLLECTION,
                    fields: {
                        permissions: null
                    }
                }
                // TODO: Fields for short name.
            }
        };
        this.currentUserSubscription = this.autoupdateService.request(userReqeust);

        this.operatorShortNameSubject.next(this.whoAmIData.short_name);
        this.operatorUpdatedEvent.next();
    }

    /**
     * Update the operators permissions and publish the operator afterwards.
     * Saves the current WhoAmI to storage with the updated permissions
     */
    private calcPermissions(): Permission[] {
        let permissions = [];
        // Anonymous or users in the default group.
        if (this.isAnonymous || this.whoAmIData.groups_id.length === 0) {
            const defaultGroup = this.DS.get<Group>('users/group', 1);
            if (defaultGroup && defaultGroup.permissions instanceof Array) {
                permissions = defaultGroup.permissions;
            }
        } else {
            const permissionSet = new Set<string>();
            this.DS.getMany(Group, this.whoAmIData.groups_id).forEach(group => {
                group.permissions.forEach(permission => {
                    permissionSet.add(permission);
                });
            });
            permissions = Array.from(permissionSet.values());
        }

        this.operatorUpdatedEvent.next();
        return permissions;
    }

    /**
     * Checks, if the operator has at least one of the given permissions.
     * @param checkPerms The permissions to check, if at least one matches.
     */
    public hasPerms(...checkPerms: Permission[]): boolean {
        if (this.whoAmIData.user_id && this.whoAmIData.groups_id.includes(2)) {
            return true;
        }
        return checkPerms.some(permission => {
            return this.whoAmIData.permissions.includes(permission);
        });
    }

    /**
     * Returns true, if the operator is in at least one group or he is in the admin group.
     * @param groups The groups to check
     */
    public isInGroup(...groups: Group[]): boolean {
        return this.isInGroupIds(...groups.map(group => group.id));
    }

    /**
     * Returns true, if the operator is in at least one group or he is in the admin group.
     * @param groups The group ids to check
     */
    public isInGroupIds(...groupIds: number[]): boolean {
        if (!this.isInGroupIdsNonAdminCheck(...groupIds)) {
            // An admin has all perms and is technically in every group.
            return this.whoAmIData.groups_id.includes(2);
        }
        return true;
    }

    /**
     * Returns true, if the operator is in at least one group.
     * @param groups The group ids to check
     */
    public isInGroupIdsNonAdminCheck(...groupIds: number[]): boolean {
        if (this.isAnonymous) {
            return groupIds.includes(1); // any anonymous is in the default group.
        }
        return groupIds.some(id => this.whoAmIData.groups_id.includes(id));
    }

    /**
     * Set the operators presence to isPresent
     */
    public async setPresence(isPresent: boolean): Promise<void> {
        await this.http.post(environment.urlPrefix + '/users/setpresence/', isPresent);
    }
}
