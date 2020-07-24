import { EventEmitter, Injectable } from '@angular/core';

import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { auditTime, take } from 'rxjs/operators';

import { ActiveMeetingService } from './active-meeting.service';
import { Group } from 'app/shared/models/users/group';
import { ViewUser } from 'app/site/users/models/view-user';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { CollectionMapperService } from './collection-mapper.service';
import { CommunicationManagerService } from './communication-manager.service';
import { DataStoreService } from './data-store.service';
import { HttpService } from './http.service';
import { SimplifiedModelRequest, SpecificStructuredField } from './model-request-builder.service';
import { OfflineBroadcastService, OfflineReason } from './offline-broadcast.service';
import { OnAfterAppsLoaded } from '../definitions/on-after-apps-loaded';
import { StreamingCommunicationService } from './streaming-communication.service';
import { User } from '../../shared/models/users/user';
import { ShortNameInformation, UserRepositoryService } from '../repositories/users/user-repository.service';

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
    coreCanManageSettings = 'core.can_manage_settings',
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
    group_ids: number[] | null; // Null meaning, that no active meeting is selected, so groups are not relevant.
    short_name_information: ShortNameInformation;
    short_name?: string;
    // auth_type: UserAuthType;
    permissions: Permission[];
}

function isWhoAmI(obj: any): obj is WhoAmI {
    if (!obj) {
        return false;
    }
    const whoAmI = obj as WhoAmI;
    return (
        whoAmI.guest_enabled !== undefined &&
        whoAmI.group_ids !== undefined &&
        whoAmI.user_id !== undefined &&
        whoAmI.short_name_information !== undefined &&
        whoAmI.permissions !== undefined
        // whoAmI.auth_type !== undefined
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
export class OperatorService implements OnAfterAppsLoaded {
    private whoAmIData: WhoAmI = this.getDefaultWhoAmIData();

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

    public get isAuthenticated(): boolean {
        return this.isAnonymous || this.guestEnabled;
    }

    /**
     * Subject for the operator as a view user.
     */
    private operatorIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

    public get operatorIdObservable(): Observable<number | null> {
        return this.operatorIdSubject.asObservable();
    }

    /**
     * This eventemitter gets fired on every change:
     * Either the operator itself changed or the model or permission changed.
     */
    public readonly operatorUpdatedEvent: EventEmitter<void> = new EventEmitter();

    private operatorShortNameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    public get operatorShortNameObservable(): Observable<string | null> {
        return this.operatorShortNameSubject.asObservable();
    }

    // public readonly authType: BehaviorSubject<UserAuthType> = new BehaviorSubject(DEFAULT_AUTH_TYPE);

    private userRepository: UserRepositoryService | null;

    private _loaded: Promise<void>;
    public get loaded(): Promise<void> {
        return this._loaded;
    }

    private currentUserSubscription: ModelSubscription | null = null;
    private currentDefaultGroupSubscription: ModelSubscription | null = null;

    private activeMeetingId: number | null = null;

    public constructor(
        private http: HttpService,
        private DS: DataStoreService,
        private autoupdateService: AutoupdateService,
        private activeMeetingService: ActiveMeetingService,
        private collectionMapper: CollectionMapperService,
        private streamingCommunicationService: StreamingCommunicationService
    ) {
        this._loaded = this.operatorUpdatedEvent.pipe(take(1)).toPromise();

        this.activeMeetingService.getMeetingIdObservable().subscribe(id => {
            this.activeMeetingId = id;

            if (!this.isAnonymous) {
                this.updateGroupIds();
            }
        });

        this.DS.getChangeObservable(User).subscribe(user => {
            if (user !== undefined && this.whoAmIData && this.whoAmIData.user_id === user.id) {
                if (this.userRepository) {
                    this.whoAmIData.short_name = this.userRepository.getShortName(user);
                }
                this.whoAmIData.permissions = this.calcPermissions();

                if (this.activeMeetingId) {
                    this.whoAmIData.group_ids = user.group_ids(this.activeMeetingId);
                }

                this.operatorShortNameSubject.next(this.whoAmIData.short_name);
                this.operatorUpdatedEvent.emit();
            }
        });
        this.DS.getChangeObservable(Group)
            .pipe(auditTime(10))
            .subscribe(group => {
                if (this.isAnonymous && group.id === 1) {
                    this.whoAmIData.permissions = this.calcPermissions();
                    this.operatorUpdatedEvent.emit();
                } else {
                    this.updateGroupIds();
                    if (
                        this.whoAmIData.group_ids === null ||
                        this.whoAmIData.group_ids.includes(group.id) ||
                        (this.whoAmIData.group_ids.length === 0 && group.id === 1)
                    ) {
                        this.whoAmIData.permissions = this.calcPermissions();
                        this.operatorUpdatedEvent.emit();
                    }
                }
            });
    }

    public onAfterAppsLoaded(): void {
        this.userRepository = this.collectionMapper.getRepository(User.COLLECTION) as UserRepositoryService;
    }

    private updateGroupIds(): void {
        if (!this.whoAmIData.user_id) {
            return;
        }
        if (this.activeMeetingId) {
            const user = this.DS.get(User, this.whoAmIData.user_id);
            if (!user) {
                return;
            }
            this.whoAmIData.group_ids = user.group_ids(this.activeMeetingId);
        } else {
            this.whoAmIData.group_ids = null;
        }
    }

    /**
     * Calls `/apps/users/whoami` to find out the real operator.
     *
     * @returns The response of the WhoAmI request.
     */
    public async doWhoAmIRequest(): Promise<{ whoami: WhoAmI; online: boolean }> {
        let online = true;
        try {
            // const response = await this.http.get(environment.urlPrefix + '/users/whoami/');

            // FAKE WhoAmI
            const response = {
                user_id: 1,
                guest_enabled: true,
                group_ids: [2],
                short_name_information: { username: 'TODO' },
                auth_type: 'default',
                permissions: []
            };

            if (isWhoAmI(response)) {
                await this.setWhoAmI(response);
            } else {
                online = false;
            }
        } catch (e) {
            online = false;
        }
        return { whoami: this.whoAmIData, online };
    }

    /**
     * Sets the operator user. Will be saved to storage
     * @param user The new operator.
     */
    public async setWhoAmI(whoami: WhoAmI | null): Promise<void> {
        if (whoami === null) {
            whoami = this.getDefaultWhoAmIData();
        }
        this.whoAmIData = whoami;

        if (this.userRepository) {
            this.whoAmIData.short_name = this.userRepository.getShortName(this.whoAmIData.short_name_information);
        }

        if (this.currentDefaultGroupSubscription) {
            this.currentDefaultGroupSubscription.close();
            this.currentDefaultGroupSubscription = null;
        }

        this.operatorIdSubject.next(this.whoAmIData.user_id);
        this.streamingCommunicationService.setIsOperatorAuthenticated(this.isAuthenticated);

        if (this.whoAmIData.user_id) {
            await this.refreshUserSubscription();
        }
    }

    /**
     * Returns a default WhoAmI response
     */
    private getDefaultWhoAmIData(): WhoAmI {
        return {
            user_id: null,
            guest_enabled: false,
            group_ids: null,
            short_name_information: {
                username: 'TODO'
            },
            // auth_type: DEFAULT_AUTH_TYPE,
            permissions: []
        };
    }

    private async refreshUserSubscription(): Promise<void> {
        if (this.currentUserSubscription) {
            this.currentUserSubscription.close();
            this.currentUserSubscription = null;
        }

        const simpleUserRequest: SimplifiedModelRequest = {
            ids: [this.whoAmIData.user_id],
            viewModelCtor: ViewUser,
            fieldset: 'shortName',
            follow: [
                {
                    idField: SpecificStructuredField('group_$_ids', '1'), // TODO: active meeting id
                    fieldset: ['permissions']
                }
            ]
        };
        // Do not wait for the subscription to be done...
        (async () => {
            this.currentUserSubscription = await this.autoupdateService.simpleRequest(simpleUserRequest);
        })();
    }

    /**
     * Update the operators permissions and publish the operator afterwards.
     * Saves the current WhoAmI to storage with the updated permissions
     */
    private calcPermissions(): Permission[] {
        let permissions;
        if (this.whoAmIData.group_ids === null) {
            permissions = [];
        } else if (this.isAnonymous || this.whoAmIData.group_ids.length === 0) {
            // Anonymous or users in the default group.
            const defaultGroup = this.DS.get<Group>('users/group', 1);
            if (defaultGroup && defaultGroup.permissions instanceof Array) {
                permissions = defaultGroup.permissions;
            }
        } else {
            const permissionSet = new Set<string>();
            this.DS.getMany(Group, this.whoAmIData.group_ids).forEach(group => {
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
        if (this.whoAmIData.group_ids === null) {
            return false;
        }
        if (this.whoAmIData.user_id && this.whoAmIData.group_ids.includes(2)) {
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
        if (this.whoAmIData.group_ids === null) {
            return false;
        }
        if (!this.isInGroupIdsNonAdminCheck(...groupIds)) {
            // An admin has all perms and is technically in every group.
            return this.whoAmIData.group_ids.includes(2);
        }
        return true;
    }

    /**
     * Returns true, if the operator is in at least one group.
     * @param groups The group ids to check
     */
    public isInGroupIdsNonAdminCheck(...groupIds: number[]): boolean {
        if (this.whoAmIData.group_ids === null) {
            return false;
        }
        if (this.isAnonymous) {
            return groupIds.includes(1); // any anonymous is in the default group.
        }
        return groupIds.some(id => this.whoAmIData.group_ids.includes(id));
    }

    /**
     * Set the operators presence to isPresent
     */
    public async setPresence(isPresent: boolean): Promise<void> {
        await this.http.post(environment.urlPrefix + '/users/setpresence/', isPresent);
    }
}
