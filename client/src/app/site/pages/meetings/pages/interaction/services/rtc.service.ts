import { ElementRef, Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { OperatorService } from 'src/app/site/services/operator.service';

import { MeetingSettingsService } from '../../../services/meeting-settings.service';
import { CallRestrictionService } from './call-restriction.service';
import { InteractionServiceModule } from './interaction-service.module';
import { OperatorMediaPermissionService } from './operator-media-permission.service';

interface JitsiMember {
    id: string;
    displayName: string;
}

interface ConferenceJoinedResult {
    roomName: string;
    id: string;
    displayName: string;
    formattedDisplayName: string;
}

export interface ConferenceMemberCollection {
    [key: number]: ConferenceMember;
}
export interface ConferenceMember {
    name: string;
    focus?: boolean;
}

interface DisplayNameChangeResult {
    // Yes, in this case "displayname" really does not have a capital n. Thank you jitsi.
    displayname: string;
    formattedDisplayName: string;
    id: string;
}

interface MemberKicked {
    kicked: {
        id: string;
        local: boolean;
    };
    kicker: {
        id: string;
    };
}

/**
 * Jitsi
 */
declare let JitsiMeetExternalAPI: any;

const configOverwrite = {
    startAudioOnly: false,
    // allows jitsi on mobile devices
    deeplinking: { disabled: true },
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    welcomePage: { disabled: true },
    disableThirdPartyRequests: true,
    enableNoAudioDetection: false,
    enableNoisyMicDetection: false,
    hideLobbyButton: true,
    prejoinConfig: { enabled: false },
    toolbarButtons: [
        `microphone`,
        `camera`,
        `desktop`,
        `livestreaming`,
        `settings`,
        `videoquality`,
        `filmstrip`,
        `stats`,
        `shortcuts`,
        `tileview`,
        `help`,
        `mute-everyone`,
        `hangup`
    ],
    toolbarConfig: {
        alwaysVisible: true
    }
};

const interfaceConfigOverwrite = {
    DISABLE_VIDEO_BACKGROUND: true,
    DISABLE_FOCUS_INDICATOR: true,
    INVITATION_POWERED_BY: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    DISABLE_PRESENCE_STATUS: true
};

export interface JitsiConfig {
    JITSI_DOMAIN: string;
    JITSI_ROOM_NAME: string;
    JITSI_ROOM_PASSWORD: string;
}

export const RTC_LOGGED_STORAGE_KEY = `rtcIsLoggedIn`;

@Injectable({
    providedIn: InteractionServiceModule
})
export class RtcService {
    private jitsiConfig!: JitsiConfig;
    private isJitsiEnabledSubject = new BehaviorSubject<boolean>(false);
    public isJitsiEnabledObservable = this.isJitsiEnabledSubject as Observable<boolean>;

    public autoConnect: Observable<boolean>;

    // JitsiMeet api object
    private api: any | null;
    private get isJitsiActive(): boolean {
        return !!this.api;
    }

    private options!: Object;
    private jitsiNode!: ElementRef;

    private actualRoomName = ``;

    public isSupportEnabled: Observable<boolean>;
    private connectedToHelpDeskSubject = new BehaviorSubject<boolean>(false);
    public connectedToHelpDesk = this.connectedToHelpDeskSubject as Observable<boolean>;

    private isJoinedSubject = new BehaviorSubject<boolean>(false);
    public isJoinedObservable = this.isJoinedSubject as Observable<boolean>;

    private isPasswordSet = false;

    private isJitsiActiveSubject = new BehaviorSubject<boolean>(false);
    public isJitsiActiveObservable = this.isJitsiActiveSubject as Observable<boolean>;

    private get defaultRoomName(): string {
        return this.jitsiConfig?.JITSI_ROOM_NAME;
    }

    private jitsiMeetUrlSubject = new Subject<string>();
    public jitsiMeetUrl = this.jitsiMeetUrlSubject as Observable<string>;

    private members: { [id: string]: any } = {};
    private memberSubject = new BehaviorSubject<ConferenceMemberCollection>(this.members);
    public memberObservableObservable = this.memberSubject as Observable<ConferenceMemberCollection>;

    private dominantSpeaker: JitsiMember | null = null;
    private dominantSpeakerSubject = new Subject<JitsiMember | null>();
    public dominantSpeakerObservable = this.dominantSpeakerSubject as Observable<JitsiMember | null>;

    private isMutedSubject = new BehaviorSubject<boolean>(false);
    public isMuted = this.isMutedSubject as Observable<boolean>;

    private canEnterCall = false;

    private showCallDialogSubject = new BehaviorSubject<boolean>(false);
    public showCallDialogObservable = this.showCallDialogSubject as Observable<boolean>;
    public set showCallDialog(show: boolean) {
        this.showCallDialogSubject.next(show);
    }

    public constructor(
        callRestrictionService: CallRestrictionService,
        settingService: MeetingSettingsService,
        private userMediaPermService: OperatorMediaPermissionService,
        private storageMap: StorageMap,
        private operator: OperatorService
    ) {
        this.isSupportEnabled = settingService.get(`conference_enable_helpdesk`);
        this.autoConnect = settingService.get(`conference_auto_connect`);

        combineLatest([
            settingService.get(`conference_show`),
            settingService.get(`jitsi_domain`),
            settingService.get(`jitsi_room_name`),
            settingService.get(`jitsi_room_password`)
        ]).subscribe(([showLiveConf, domain, roomName, roomPassword]) => {
            this.jitsiConfig = { JITSI_DOMAIN: domain, JITSI_ROOM_NAME: roomName, JITSI_ROOM_PASSWORD: roomPassword };
            this.isJitsiEnabledSubject.next(showLiveConf && !!domain && !!roomName);
        });
        settingService.get(`conference_open_microphone`).subscribe(open => {
            configOverwrite.startWithAudioMuted = !open;
        });
        settingService.get(`conference_open_video`).subscribe(open => {
            configOverwrite.startWithVideoMuted = !open;
        });
        callRestrictionService.canEnterCallObservable.subscribe(canEnter => {
            this.canEnterCall = canEnter;
        });
    }

    public setJitsiNode(jitsiNode: ElementRef): void {
        this.jitsiNode = jitsiNode;
    }

    public toggleMute(): void {
        if (this.isJitsiActive) {
            this.api.executeCommand(`toggleAudio`);
        }
    }

    public async enterSupportRoom(): Promise<void> {
        this.connectedToHelpDeskSubject.next(true);
        this.actualRoomName = `${this.defaultRoomName}-SUPPORT`;
        await this.enterConversation();
    }

    public async enterConferenceRoom(force?: boolean): Promise<void> {
        if (!this.canEnterCall) {
            return;
        }
        if (force) {
            this.disconnect();
        }
        this.connectedToHelpDeskSubject.next(false);
        this.actualRoomName = this.defaultRoomName;
        await this.enterConversation();
    }

    public stopJitsi(): void {
        this.disconnect();
        this.connectedToHelpDeskSubject.next(false);
        this.isJitsiActiveSubject.next(false);
    }

    /**
     * https://github.com/jitsi/jitsi-meet/issues/8244
     */
    public enterFullScreen(): void {}

    private setRoomPassword(): void {
        if (this.jitsiConfig?.JITSI_ROOM_PASSWORD && !this.isPasswordSet) {
            // You can only set the password after the server has recognized that you are
            // the moderator. There is no event listener for that.
            setTimeout(() => {
                this.api.executeCommand(`password`, this.jitsiConfig?.JITSI_ROOM_PASSWORD);
                this.isPasswordSet = true;
            }, 1000);
        }
    }

    private async enterConversation(): Promise<void> {
        await this.operator.ready;
        await this.userMediaPermService.requestMediaAccess();
        this.storageMap.set(RTC_LOGGED_STORAGE_KEY, true).subscribe(() => {});
        this.setOptions();
        if (this.api) {
            this.api.dispose();
            this.api = undefined;
        }
        this.api = new JitsiMeetExternalAPI(this.jitsiConfig?.JITSI_DOMAIN, this.options);
        this.isJitsiActiveSubject.next(true);
        this.loadApiCallbacks();
    }

    private loadApiCallbacks(): void {
        this.isMutedSubject.next(configOverwrite.startWithAudioMuted);

        this.api.on(`videoConferenceJoined`, (info: ConferenceJoinedResult) => {
            this.onEnterConference(info);
        });

        this.api.on(`participantJoined`, (newMember: JitsiMember) => {
            this.addMember(newMember);
        });

        this.api.on(`participantLeft`, (oldMember: { id: string }) => {
            this.removeMember(oldMember);
        });

        this.api.on(`displayNameChange`, (member: DisplayNameChangeResult) => {
            this.renameMember(member);
        });

        this.api.on(`audioMuteStatusChanged`, (isMuted: { muted: boolean }) => {
            this.isMutedSubject.next(isMuted.muted);
        });

        this.api.on(`readyToClose`, () => {
            this.stopJitsi();
        });

        this.api.on(`dominantSpeakerChanged`, (newSpeaker: { id: string }) => {
            this.newDominantSpeaker(newSpeaker.id);
        });

        this.api.on(`passwordRequired`, () => {
            this.setRoomPassword();
        });

        this.api.on(`participantKickedOut`, (kicked: MemberKicked) => {
            this.onMemberKicked(kicked);
        });
    }

    private onEnterConference(info: ConferenceJoinedResult): void {
        this.isJoinedSubject.next(true);
        this.showCallDialogSubject.next(true);
        this.addMember({ displayName: info.displayName, id: info.id });
        this.setRoomPassword();
    }

    private addMember(newMember: JitsiMember): void {
        this.members[newMember.id] = {
            name: newMember.displayName,
            focus: false
        } as ConferenceMember;
        this.updateMemberSubject();
    }

    private onMemberKicked(kick: MemberKicked): void {
        if (kick.kicked.local) {
            this.stopJitsi();
        }
    }

    private removeMember(oldMember: { id: string }): void {
        if (this.members[oldMember.id]) {
            delete this.members[oldMember.id];
            this.updateMemberSubject();
        }
    }

    private renameMember(member: DisplayNameChangeResult): void {
        if (this.members[member.id]) {
            this.members[member.id].name = member.displayname;
            this.updateMemberSubject();
        }
        if (this.dominantSpeaker?.id === member.id) {
            this.newDominantSpeaker(member.id);
        }
    }

    private newDominantSpeaker(newSpeakerId: string): void {
        if (this.dominantSpeaker && this.members[this.dominantSpeaker.id]) {
            this.members[this.dominantSpeaker.id].focus = false;
        }
        this.members[newSpeakerId].focus = true;
        this.updateMemberSubject();
        this.dominantSpeaker = {
            id: newSpeakerId,
            displayName: this.members[newSpeakerId].name
        };
        this.dominantSpeakerSubject.next(this.dominantSpeaker);
    }

    private clearMembers(): void {
        this.members = {};
        this.updateMemberSubject();
    }

    private updateMemberSubject(): void {
        this.memberSubject.next(this.members);
    }

    private disconnect(): void {
        if (this.isJitsiActive) {
            this.api?.executeCommand(`hangup`);
            this.api?.dispose();
            this.api = undefined;
            this.deleteJitsiLock();
        }
        this.clearMembers();
        this.dominantSpeaker = null;
        this.dominantSpeakerSubject.next(this.dominantSpeaker);
        this.isJoinedSubject.next(false);
        this.showCallDialogSubject.next(false);
        this.isPasswordSet = false;
    }

    private setOptions(): void {
        this.setJitsiMeetUrl();
        const jitsiName = this.operator.user.getName();
        this.options = {
            roomName: this.actualRoomName,
            parentNode: this.jitsiNode.nativeElement,
            configOverwrite,
            interfaceConfigOverwrite,
            userInfo: {
                displayName: jitsiName
            }
        };
    }

    private setJitsiMeetUrl(): void {
        this.jitsiMeetUrlSubject.next(`https://${this.jitsiConfig.JITSI_DOMAIN}/${this.actualRoomName}`);
    }

    private deleteJitsiLock(): void {
        this.storageMap.set(RTC_LOGGED_STORAGE_KEY, false).subscribe(() => {});
    }
}
