import { Injectable } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewMotion } from '../../../view-models';

@Injectable({
    providedIn: `root`
})
export class MotionPermissionService {
    public configMinSupporters = 0;

    private _amendmentEnabled = false;
    private _amendmentOfAmendmentEnabled = false;

    public constructor(private operator: OperatorService, private meetingSettingsService: MeetingSettingsService) {
        // load config variables
        this.meetingSettingsService
            .get(`motions_supporters_min_amount`)
            .subscribe(supporters => (this.configMinSupporters = supporters));
        this.meetingSettingsService
            .get(`motions_amendments_enabled`)
            .subscribe(enabled => (this._amendmentEnabled = enabled));
        this.meetingSettingsService
            .get(`motions_amendments_of_amendments`)
            .subscribe(enabled => (this._amendmentOfAmendmentEnabled = enabled));
    }

    /**
     * Determine if the operator is allowed to access the per line dot-menu
     * in mobile mode
     */
    public canAccessMobileDotMenu(): boolean {
        return this.operator.hasPerms(
            Permission.listOfSpeakersCanSee,
            Permission.listOfSpeakersCanBeSpeaker,
            Permission.projectorCanManage
        );
    }

    /**
     * Determine if the user (Operator) has the correct permission to perform the given action.
     *
     * actions might be:
     * - create
     * - support
     * - unsupport
     * - createpoll
     * - update
     * - update_submitters
     * - delete
     * - change_metadata
     * - reset_state
     * - change_recommendation
     * - can_create_amendments
     * - manage
     *
     * @param action the action the user tries to perform
     * @param motion the motion for which to perform the action
     */
    public isAllowed(action: string, motion?: ViewMotion): boolean {
        switch (action) {
            case `create`: {
                return this.operator.hasPerms(Permission.motionCanCreate);
            }
            case `support`: {
                if (!motion || !motion.state) {
                    return false;
                }
                return (
                    this.operator.hasPerms(Permission.motionCanSupport) &&
                    this.configMinSupporters > 0 &&
                    motion.state?.allow_support &&
                    (!motion.submitters ||
                        !motion.submitters.map(submitter => submitter.user_id).includes(this.operator.operatorId!)) &&
                    (!motion.supporter_users || !motion.supporter_user_ids?.includes(this.operator.operatorId!))
                );
            }
            case `unsupport`: {
                if (!motion) {
                    return false;
                }
                return (
                    !!motion.state &&
                    motion.state.allow_support &&
                    motion.supporter_users &&
                    !!motion.supporter_user_ids?.includes(this.operator.operatorId!)
                );
            }
            case `createpoll`: {
                if (!motion) {
                    return false;
                }
                return (
                    (this.operator.hasPerms(Permission.motionCanManage) ||
                        this.operator.hasPerms(Permission.motionCanManageMetadata)) &&
                    !!motion.state &&
                    motion.state.allow_create_poll
                );
            }
            case `update`: {
                // check also for empty ViewMotion object (e.g. if motion.id is null)
                // important for creating new motion as normal user
                if (!motion || !motion.id) {
                    return false;
                }
                return (
                    this.operator.hasPerms(Permission.motionCanManage) ||
                    (!!motion.state &&
                        motion.state.allow_submitter_edit &&
                        // !!motion.submitters &&
                        motion.submitters?.length > 0 &&
                        !this.operator.isAnonymous &&
                        motion.submitters.some(submitter => submitter.user_id === this.operator.operatorId!))
                );
            }
            case `update_submitters`: {
                return this.operator.hasPerms(Permission.motionCanManage);
            }
            case `delete`: {
                if (!motion) {
                    return false;
                }
                return (
                    this.operator.hasPerms(Permission.motionCanManage) &&
                    !!motion.state &&
                    motion.state.allow_submitter_edit &&
                    // !!motion.submitters &&
                    motion.submitters?.length > 0 &&
                    motion.submitters.some(submitter => submitter.user_id === this.operator.operatorId)
                );
            }
            case `change_state`: {
                // check also for empty ViewMotion object (e.g. if motion.id is null)
                // important for creating new motion as normal user
                if (!motion || !motion.id) {
                    return false;
                }
                return (
                    this.operator.hasPerms(Permission.motionCanManage) ||
                    this.operator.hasPerms(Permission.motionCanManageMetadata) ||
                    (!!motion.state &&
                        motion.state.allow_submitter_edit &&
                        !this.operator.isAnonymous &&
                        motion.submitters &&
                        motion.submitters.some(submitter => submitter.user_id === this.operator.operatorId))
                );
            }
            case `change_metadata`: {
                return (
                    this.operator.hasPerms(Permission.motionCanManage) ||
                    this.operator.hasPerms(Permission.motionCanManageMetadata)
                );
            }
            case `can_create_amendments`: {
                if (!motion) {
                    return false;
                }
                return (
                    this.operator.hasPerms(Permission.motionCanCreateAmendments) &&
                    this._amendmentEnabled &&
                    (!motion.lead_motion_id || (!!motion.lead_motion_id && this._amendmentOfAmendmentEnabled))
                );
            }
            case `can_manage_config`: {
                return this.operator.hasPerms(Permission.meetingCanManageSettings);
            }
            case `manage`: {
                return this.operator.hasPerms(Permission.motionCanManage);
            }
            default: {
                return false;
            }
        }
    }
}
