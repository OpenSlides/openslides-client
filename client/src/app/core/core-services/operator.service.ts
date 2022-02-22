import { EventEmitter, Injectable } from '@angular/core';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Committee } from 'app/shared/models/event-management/committee';
import { Group } from 'app/shared/models/users/group';
import { User } from 'app/shared/models/users/user';
import { ViewUser } from 'app/site/users/models/view-user';
import { BehaviorSubject, Observable } from 'rxjs';

import { Id } from '../definitions/key-types';
import { Deferred } from '../promises/deferred';
import { GroupRepositoryService } from '../repositories/users/group-repository.service';
import { UserRepositoryService } from '../repositories/users/user-repository.service';
import { ActiveMeetingService } from './active-meeting.service';
import { NoActiveMeetingError } from './active-meeting-id.service';
import { AuthService } from './auth.service';
import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { DataStoreService } from './data-store.service';
import { LifecycleService } from './lifecycle.service';
import { SimplifiedModelRequest, SpecificStructuredField, TypedFieldset } from './model-request-builder.service';
import { OpenSlidesRouterService } from './openslides-router.service';
import { CML, cmlNameMapping, OML, omlNameMapping } from './organization-permission';
import { Permission } from './permission';
import { childPermissions } from './permission-children';

const UNKOWN_USER_ID = -1; // this is an invalid id **and** not equal to 0, null, undefined.

const OPERATOR_FIELDS: TypedFieldset<User> = [
    `organization_management_level`,
    { templateField: `committee_$_management_level` },
    `committee_ids`,
    `can_change_own_password`,
    `is_present_in_meeting_ids`,
    `default_structure_level`,
    `is_physical_person`,
    `meeting_ids`,
    `group_$_ids`
];

function getUserCML(user: ViewUser): { [id: number]: string } | null {
    if (!user.committee_$_management_level) {
        return null;
    }

    const committeeManagementLevel = {};
    for (const replacement of user.committee_$_management_level) {
        if (!user.committee_management_level_ids(replacement)) {
            continue;
        }
        for (const committeeId of user.committee_management_level_ids(replacement)) {
            committeeManagementLevel[+committeeId] = replacement;
        }
    }
    return committeeManagementLevel;
}

/**
 * The operator represents the user who is using OpenSlides.
 *
 * Changes in operator can be observed, directives do so on order to show
 * or hide certain information.
 */
@Injectable({
    providedIn: `root`
})
export class OperatorService {
    public get operatorId(): number | null {
        return this.isAnonymous ? null : this.authService.authToken.userId;
    }

    public get isAnonymous(): boolean {
        return !this.authService.authToken;
    }

    public get isAuthenticated(): boolean {
        return !this.isAnonymous;
    }

    public get shortName(): string {
        return this._shortName;
    }
    private _shortName: string;

    // permissions and groupIds are bound to the active meeting.
    // If there is no active meeting, both will be undefined.
    // If groupIds is undefined or [], the default group must be used (given, there is an active meeting).
    private _permissions: Permission[] | undefined = undefined;
    private _groupIds: Id[] | undefined = undefined;
    private _meetingIds: Id[] | undefined = undefined;
    private _OML: string | null | undefined = undefined; //  null is valid, so use undefined here
    private _CML: { [id: number]: string } | undefined = undefined;

    public get isMeetingAdmin(): boolean {
        if (this.defaultGroupId) {
            return this.isInGroupIdsNonAdminCheck(this.defaultGroupId);
        } else {
            throw new NoActiveMeetingError();
        }
    }

    public get isSuperAdmin(): boolean {
        return this.hasOrganizationPermissions(OML.superadmin);
    }

    public get isOrgaManager(): boolean {
        return this.hasOrganizationPermissions(OML.can_manage_organization);
    }

    private get isCommitteeManager(): boolean {
        return (this.user.committee_$_management_level || []).includes(CML.can_manage);
    }

    public get isAnyManager(): boolean {
        return this.isSuperAdmin || this.isOrgaManager || this.isCommitteeManager;
    }

    public get knowsMultipleMeetings(): boolean {
        return this.isAnyManager || this.user.hasMultipleMeetings;
    }

    public get onlyMeeting(): Id {
        return this.user.onlyMeeting;
    }

    public get canChangeOwnPassword(): boolean {
        return this.isAuthenticated && this.userSubject.value?.can_change_own_password;
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
    private userSubject = new BehaviorSubject<ViewUser | null>(null);

    public get operatorShortNameObservable(): Observable<string | null> {
        return this.operatorShortNameSubject.asObservable();
    }

    public get user(): ViewUser {
        if (!this.userSubject.value) {
            throw new Error(`Operator has not fully loaded yet.`);
        }
        return this.userSubject.value;
    }

    public get userObservable(): Observable<ViewUser | null> {
        return this.userSubject.asObservable();
    }

    // State management
    private _ready = false;

    private _readyDeferred: Deferred<void>;
    public get ready(): Deferred<void> {
        return this._readyDeferred;
    }

    public get isReadyObservable(): Observable<boolean> {
        return this.operatorReadySubject.asObservable();
    }

    private currentOperatorDataSubscription: ModelSubscription | null = null;

    private operatorReadySubject = new BehaviorSubject<boolean>(false);

    private get activeMeetingId(): number | null {
        return this.activeMeetingService.meetingId;
    }
    private get activeMeeting(): ViewMeeting | null {
        return this.activeMeetingService.meeting;
    }
    private get anonymousEnabled(): boolean {
        return this.activeMeetingService.guestsEnabled;
    }
    private get defaultGroupId(): number | null {
        const activeMeeting = this.activeMeetingService.meeting;
        return activeMeeting ? activeMeeting.default_group_id : null;
    }
    private get adminGroupId(): number | null {
        const activeMeeting = this.activeMeetingService.meeting;
        return activeMeeting ? activeMeeting.admin_group_id : null;
    }

    private get currentCommitteeIds(): Id[] {
        return this.userSubject?.value?.committee_ids || [];
    }

    private _hasOperatorDataSubscriptionInitiated = false;
    private _lastActiveMeetingId = undefined;
    private _lastUserId = UNKOWN_USER_ID;

    /**
     * Helper to identify if there is already one request fired if an active-meeting is present.
     */
    private _lockActiveMeeting = false;

    public constructor(
        private authService: AuthService,
        private DS: DataStoreService,
        private autoupdateService: AutoupdateService,
        private activeMeetingService: ActiveMeetingService,
        private userRepo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private lifecycle: LifecycleService,
        private osRouter: OpenSlidesRouterService
    ) {
        this.setNotReady();

        this.authService.logoutObservable.subscribe(() =>
            osRouter.navigateToLogin(this.activeMeetingId || this._lastActiveMeetingId)
        );

        // General environment in which the operator moves
        this.authService.authTokenObservable.subscribe(token => {
            if (token === undefined) {
                return;
            }
            const id = token ? token.userId : null;
            if (id !== this._lastUserId) {
                console.debug(`operator: user changed from `, this._lastUserId, `to`, id);
                this._lastUserId = id;

                this.operatorStateChange();
            }
        });
        // The meeting observable (below) is too slow since it waits for updates from the
        // repos after the meeting id changes -> if the meeting id changes, set the operator
        // to not being ready. Do not call operatorStateChange since the meeting is not there yet.
        // The meeting observable below will trigger a bit later.
        this.activeMeetingService.meetingIdObservable.subscribe(meetingId => {
            if (meetingId === undefined) {
                return;
            }
            if (this._lastActiveMeetingId !== meetingId) {
                console.debug(`operator: active meeting id changed from `, this._lastActiveMeetingId, `to`, meetingId);

                this.setNotReady();
            }
        });
        this.activeMeetingService.meetingObservable.subscribe(meeting => {
            if (meeting === undefined) {
                return;
            }
            const newMeetingId = meeting?.id || null;
            if (this._lastActiveMeetingId !== newMeetingId) {
                console.debug(`operator: active meeting changed from `, this._lastActiveMeetingId, `to`, newMeetingId);
                this._lastActiveMeetingId = newMeetingId;

                this.operatorStateChange();
            }
        });

        // Specific operator data: The user itself and the groups for permissions.
        this.userRepo.getGeneralViewModelObservable().subscribe(user => {
            if (user !== undefined && this.operatorId === user.id) {
                this._shortName = this.userRepo.getShortName(user);

                if (this.activeMeetingId) {
                    this._groupIds = user.group_ids(this.activeMeetingId);
                    this._permissions = this.calcPermissions();
                }

                // The OML has to be changed only if new data come in.
                if (user.organization_management_level !== undefined || this._OML === undefined) {
                    this._OML = user.organization_management_level || null;
                }

                this._meetingIds = (user.group_$_ids || []).map(idString => parseInt(idString, 10));

                this._CML = getUserCML(user);

                this.operatorShortNameSubject.next(this._shortName);
                this.userSubject.next(user);
                this.operatorUpdatedEvent.emit();
            }
        });
        this.groupRepo.getGeneralViewModelObservable().subscribe(group => {
            if (!this.activeMeetingId || !group) {
                return;
            }

            if (this.isAnonymous && group.id === this.defaultGroupId) {
                this._groupIds = this._groupIds || [];
                this._permissions = this.calcPermissions();
                this.operatorUpdatedEvent.emit();
            } else if (!this.isAnonymous) {
                if (
                    ((!this._groupIds || this._groupIds.length === 0) && group.id === this.defaultGroupId) ||
                    (this._groupIds && this._groupIds.length > 0 && this._groupIds.includes(group.id))
                ) {
                    this._permissions = this.calcPermissions();
                    this.operatorUpdatedEvent.emit();
                }
            }
        });

        this.operatorUpdatedEvent.subscribe(() => {
            if (this._ready) {
                return;
            }

            // Not ready: Check, if we are ready:
            // - groups and permissions are needed, if there is a active meeting
            // - OML and CML are needed, if the user is authenticated.

            let isReady = true;
            if (this.activeMeetingId) {
                isReady =
                    isReady && !!this.activeMeeting && this._groupIds !== undefined && this._permissions !== undefined;
            }
            if (this.isAuthenticated) {
                isReady = isReady && this._OML !== undefined && this._CML !== undefined;
            }

            if (isReady) {
                this._ready = true;
                this._readyDeferred.resolve();
                this.operatorReadySubject.next(true);
            }
        });
    }

    private setNotReady(): void {
        this._lockActiveMeeting = false;
        this._ready = false;
        this.operatorReadySubject.next(false);

        this._meetingIds = undefined;
        this._groupIds = undefined;
        this._permissions = undefined;
        this._OML = undefined;
        this._CML = undefined;

        if (!this._readyDeferred || this._readyDeferred.wasResolved) {
            console.log(`operator: not ready`);
            this._readyDeferred = new Deferred();
        }
    }

    // The surrounding environment changes:
    // - changed meeting
    // - changed user
    // Results in the operator not being ready until all necessary data is there.
    private async operatorStateChange(): Promise<void> {
        this.setNotReady();

        if (this.currentOperatorDataSubscription) {
            this.currentOperatorDataSubscription.close();
            this.currentOperatorDataSubscription = null;
        }

        if (this._hasOperatorDataSubscriptionInitiated) {
            this._hasOperatorDataSubscriptionInitiated = false;
        }

        await this.lifecycle.booted;

        // Prevent races:
        // There are multiple reasons of calling this function on startup.
        // We wait for the booted deferred above. The first executer should win,
        // so this lines block another promises for waiting. This results in the code
        // below the guard to be executed onces.
        if (this._hasOperatorDataSubscriptionInitiated) {
            return;
        }
        this._hasOperatorDataSubscriptionInitiated = true;

        let operatorRequest: SimplifiedModelRequest | null = null;
        if (this.activeMeetingId) {
            // Prevent races, too:
            // Since this will execute multiple times at startup, but we have to wait for
            // the active meeting, because the operator starts before an active meeting is
            // present. Therefore, it is necessary to insert a second "lock" to prevent multiple
            // operator-requests will fire.
            await this.activeMeetingService.ensureActiveMeetingIsAvailable();
            if (this._lockActiveMeeting) {
                return;
            }
            this._lockActiveMeeting = true;
            operatorRequest = this.getOperatorRequestWithActiveMeeting();
        } else {
            operatorRequest = this.getOperatorRequestWithoutActiveMeeting();
        }

        if (operatorRequest) {
            // Do not wait for the subscription to be done...
            (async () => {
                console.log(`operator: Do operator model request`, operatorRequest);
                console.log(
                    `operator: configuration: meeting`,
                    this.activeMeetingId,
                    `authenticated`,
                    this.isAuthenticated,
                    `anonymous enabled`,
                    this.anonymousEnabled
                );
                this.currentOperatorDataSubscription = await this.autoupdateService.subscribe(
                    operatorRequest,
                    `OperatorService`
                );
            })();
        }
    }

    /**
     * Update the operators permissions and publish the operator afterwards.
     * Saves the current WhoAmI to storage with the updated permissions
     */
    private calcPermissions(): Permission[] {
        const permissionSet = new Set<Permission>();
        if (this.isAnonymous) {
            // Anonymous is always in the default group.
            this.activeMeeting?.default_group?.permissions.forEach(perm => permissionSet.add(perm));
        } else {
            if (this._groupIds?.length) {
                this.DS.getMany(Group, this._groupIds).forEach(group => {
                    group.permissions?.forEach(permission => {
                        permissionSet.add(permission);
                    });
                });
            }
        }
        // add implicitly given children
        // copy set beforehand to not iterate over the newly added members
        for (const permission of new Set(permissionSet)) {
            for (const childPermission of childPermissions[permission]) {
                permissionSet.add(childPermission);
            }
        }
        const permissions = Array.from(permissionSet.values());
        return permissions;
    }

    /**
     * Checks, if the operator has at least one of the given permissions.
     * Only works in the current meeting.
     * @param checkPerms The permissions to check, if at least one matches.
     */
    public hasPerms(...checkPerms: Permission[]): boolean {
        if (!this._ready) {
            console.warn(`has perms: Operator is not ready!`);
            return false;
        }
        if (!this.activeMeetingId) {
            console.warn(`has perms: Usage outside of meeting!`);
            return false;
        }
        if (this.isSuperAdmin) {
            return true;
        }

        let result: boolean;
        if (!this._groupIds) {
            result = false;
        } else if (this.isAuthenticated && this._groupIds.includes(this.adminGroupId)) {
            result = true;
        } else {
            result = checkPerms.some(permission => this._permissions.includes(permission));
        }
        return result;
    }

    /**
     * Checks, if the own OML is equals or higher than at least one of the given permissions.
     *
     * @param permissionsToCheck The required permissions to check.
     *
     * @returns A boolean whether an operator's OML is high enough.
     */
    public hasOrganizationPermissions(...permissionsToCheck: OML[]): boolean {
        return permissionsToCheck.some(permission => (omlNameMapping[this._OML] || 0) >= omlNameMapping[permission]);
    }

    /**
     * Checks, if the own CML is equals or higher than at least one of the given permissions.
     * If an operator has the permission `OML.can_manage_organization` or higher, then it will always return `true`.
     *
     * @param committeeId The committee's id to know for which committee the CML is checked.
     * @param permissionsToCheck The required permissions to check.
     *
     * @returns A boolean whether an operator's CML is high enough.
     */
    public hasCommitteePermissions(committeeId: Id | undefined, ...permissionsToCheck: CML[]): boolean {
        // If a user can manage an entire organization, they can also manage every committee.
        // Regardless, if they have no CML.
        if (this.isOrgaManager) {
            return true;
        }
        return this.hasCommitteePermissionsNonAdminCheck(committeeId, ...permissionsToCheck);
    }

    public hasCommitteePermissionsNonAdminCheck(committeeId: Id | undefined, ...permissionsToCheck: CML[]): boolean {
        // A superadmin can still do everything
        if (this.isSuperAdmin) {
            return true;
        }
        // A user can have a CML for any committee but they could be not present in some of them.
        if (!this._CML || !this.currentCommitteeIds.includes(committeeId)) {
            return false;
        }
        const currentCommitteePermission = cmlNameMapping[(this._CML || {})[committeeId]] || 0;
        return permissionsToCheck.some(permission => currentCommitteePermission >= cmlNameMapping[permission]);
    }

    /**
     * Determines whether the current operator is included in at least one of the committees, which are passed.
     * This function checks also if an operator is a "superadmin" -> then, they is technically in every committee.
     *
     * @param committees Several committees to check if the current operator is included in them.
     *
     * @returns `true`, if the current operator is included in at least one of the given committees.
     */
    public isInCommittees(...committees: Committee[]): boolean {
        if (this.isSuperAdmin) {
            return true;
        }
        return this.isInCommitteesNonAdminCheck(...committees);
    }

    /**
     * A plain check if an operator is in at least one of the given committees. There is no permission check,
     * so this function will not return `true` even though an operator is a superadmin.
     *
     * @param committees Several committees to check if the current operator is included in them.
     *
     * @returns `true` if the operator is in at least one of the given committees.
     */
    public isInCommitteesNonAdminCheck(...committees: Committee[]): boolean {
        return committees.some(committee => this.currentCommitteeIds.includes(committee.id));
    }

    /**
     * This function checks if the operator is in one of the given groups. It is also a permission check.
     * That means, if the operator is an admin or a superadmin, this function will return `true`, too.
     *
     * TODO: what if no active meeting??
     *
     * @param groups The groups to check
     *
     * @returns true, if the operator is in at least one group or he is in the admin group.
     */
    public isInGroup(...groups: Group[]): boolean {
        return this.isInGroupIds(...groups.map(group => group.id));
    }

    /**
     * This checks if an operator is in at least one of the given groups. It is also a permission check.
     * That means, if the operator is an admin or a superadmin, this function returns `true`, too.
     *
     * TODO: what if no active meeting??
     *
     * @param groups The group ids to check
     *
     * @returns `true`, if the operator is in at least one group or they are an admin or a superadmin.
     */
    public isInGroupIds(...groupIds: Id[]): boolean {
        if (!this._groupIds) {
            return false;
        }
        if (this.isSuperAdmin) {
            return true;
        }
        if (!this.isInGroupIdsNonAdminCheck(...groupIds)) {
            // An admin has all perms and is technically in every group.
            return this._groupIds.includes(this.adminGroupId);
        }
        return true;
    }

    public isInMeetingIds(...meetingIds: Id[]): boolean {
        if (this.isSuperAdmin) {
            return true;
        }
        if (!this._meetingIds) {
            return false;
        }
        return meetingIds.some(meetingId => this._meetingIds.includes(meetingId));
    }

    /**
     * Function to clear check if an operator is in at least of the given groups.
     * This check is not a check for permissions and does neither include a check for an admin
     * nor include a check for a superadmin.
     *
     * @param groups The group ids to check
     *
     * @returns `true` if the operator is in at least one of the given groups.
     */
    public isInGroupIdsNonAdminCheck(...groupIds: number[]): boolean {
        if (!this._groupIds) {
            return false;
        }
        if (this.isAnonymous) {
            return groupIds.includes(this.defaultGroupId); // any anonymous is in the default group.
        }
        return groupIds.some(id => this._groupIds.includes(id));
    }

    /**
     * Function to build an operator-request, if an active-meeting is present.
     * Requested fields depend on the active-meeting.
     *
     * @returns Either a `SimplifiedModelRequest` if staying at the startpage is allowed
     * (e.g. when signed in or anonymous) or `null` if staying at the startpage is not allowed.
     * Then a user will be redirected to `/login`.
     */
    private getOperatorRequestWithActiveMeeting(): SimplifiedModelRequest | null {
        let operatorRequest: SimplifiedModelRequest | null = null;

        if (this.isAuthenticated) {
            operatorRequest = {
                ids: [this.operatorId],
                viewModelCtor: ViewUser,
                fieldset: `shortName`,
                additionalFields: [
                    ...OPERATOR_FIELDS,
                    { templateField: `structure_level_$` },
                    { templateField: `vote_delegated_$_to_id` },
                    { templateField: `vote_delegations_$_from_ids` }
                ],
                follow: [
                    {
                        idField: SpecificStructuredField(`group_$_ids`, this.activeMeetingId),
                        fieldset: [`permissions`]
                    }
                ]
            };
        } else if (this.anonymousEnabled) {
            operatorRequest = {
                ids: [this.activeMeetingId],
                viewModelCtor: ViewMeeting,
                follow: [
                    {
                        idField: `default_group_id`,
                        fieldset: [`permissions`]
                    }
                ],
                fieldset: []
            };
        } else {
            // has active meeting without the anonymous enabled *and* not authenticated. This is
            // forbidden and can happen, if someone enters a URL of the meeting.
            this.osRouter.navigateToLogin(this.activeMeetingId);
        }
        return operatorRequest;
    }

    /**
     * Function to build an operator-request if no active-meeting is present.
     *
     * @returns Either a `SimplifiedModelRequest` if a user is signed in
     * or `null` if a user is not signed in. Then they will be redirected to `/login`.
     */
    private getOperatorRequestWithoutActiveMeeting(): SimplifiedModelRequest | null {
        if (this.isAuthenticated) {
            return {
                ids: [this.operatorId],
                viewModelCtor: ViewUser,
                fieldset: `shortName`,
                additionalFields: OPERATOR_FIELDS
            };
        } else {
            // not logged in and no anonymous. We are done with loading, so we have
            // to emit the operator update event
            this.operatorUpdatedEvent.emit();
        }
        return null;
    }
}
