import { ElementRef, Injectable } from '@angular/core';

import { StorageMap } from '@ngx-pwa/local-storage';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { CallRestrictionService } from './call-restriction.service';
import { UserMediaPermService } from './user-media-perm.service';

export const RTC_LOGGED_STORAGE_KEY = 'rtcIsLoggedIn';

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

interface ConferenceMember {
    name: string;
    focus: boolean;
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
    disableDeepLinking: true,
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    useNicks: true,
    enableWelcomePage: false,
    enableUserRolesBasedOnToken: false,
    enableFeaturesBasedOnToken: false,
    disableThirdPartyRequests: true,
    enableNoAudioDetection: false,
    enableNoisyMicDetection: false,
    hideLobbyButton: true,
    prejoinPageEnabled: false
};

const interfaceConfigOverwrite = {
    DISABLE_VIDEO_BACKGROUND: true,
    DISABLE_FOCUS_INDICATOR: true,
    INVITATION_POWERED_BY: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    DISABLE_PRESENCE_STATUS: true,
    TOOLBAR_ALWAYS_VISIBLE: true,
    TOOLBAR_TIMEOUT: 10000000,
    TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'profile',
        'chat',
        'recording',
        'livestreaming',
        'etherpad',
        'sharedvideo',
        'settings',
        'videoquality',
        'filmstrip',
        'feedback',
        'stats',
        'shortcuts',
        'tileview',
        'download',
        'help',
        'mute-everyone',
        'hangup'
    ]
};

export interface JitsiConfig {
    JITSI_DOMAIN: string;
    JITSI_ROOM_NAME: string;
    JITSI_ROOM_PASSWORD: string;
}

@Injectable({
    providedIn: 'root'
})
export class RtcService {
    private jitsiConfig: JitsiConfig;
    private isJitsiEnabledSubject = new BehaviorSubject<boolean>(false);
    public isJitsiEnabledObservable = this.isJitsiEnabledSubject.asObservable();

    public autoConnect: Observable<boolean>;

    // JitsiMeet api object
    private api: any | null;
    private get isJitsiActive(): boolean {
        return !!this.api;
    }

    private options: Object;
    private jitsiNode: ElementRef;

    private actualRoomName: string;

    public isSupportEnabled: Observable<boolean>;
    private connectedToHelpDeskSubject = new BehaviorSubject<boolean>(false);
    public connectedToHelpDesk = this.connectedToHelpDeskSubject.asObservable();

    public isJitsiActiveInAnotherTab = false;
    private isJoinedSubject = new BehaviorSubject<boolean>(false);
    public isJoinedObservable = this.isJoinedSubject.asObservable();

    private isPasswordSet = false;

    private isJitsiActiveSubject = new BehaviorSubject<boolean>(false);
    public isJitsiActiveObservable = this.isJitsiActiveSubject.asObservable();

    private get defaultRoomName(): string {
        return this.jitsiConfig?.JITSI_ROOM_NAME;
    }

    private jitsiMeetUrlSubject = new Subject<string>();
    public jitsiMeetUrl = this.jitsiMeetUrlSubject.asObservable();

    private members = {};
    private memberSubject = new BehaviorSubject<Object>(this.members);
    public memberObservableObservable = this.memberSubject.asObservable();

    private dominantSpeaker: JitsiMember;
    private dominantSpeakerSubject = new Subject<JitsiMember>();
    public dominantSpeakerObservable = this.dominantSpeakerSubject.asObservable();

    private isMutedSubject = new BehaviorSubject<boolean>(false);
    public isMuted = this.isMutedSubject.asObservable();

    private canEnterCall: boolean;
    public inOtherTab: Observable<boolean>;

    private showCallDialogSubject = new BehaviorSubject<boolean>(false);
    public showCallDialogObservable = this.showCallDialogSubject.asObservable();
    public set showCallDialog(show: boolean) {
        this.showCallDialogSubject.next(show);
    }

    public constructor(
        settingService: MeetingSettingsService,
        callRestrictionService: CallRestrictionService,
        private userMediaPermService: UserMediaPermService,
        private storageMap: StorageMap,
        private operator: OperatorService,
        private userRepo: UserRepositoryService
    ) {
        this.isSupportEnabled = settingService.get('conference_enable_helpdesk');
        this.autoConnect = settingService.get('conference_auto_connect');

        combineLatest([
            settingService.get('jitsi_domain'),
            settingService.get('jitsi_room_name'),
            settingService.get('jitsi_room_password')
        ]).subscribe(([domain, roomName, roomPassword]) => {
            this.jitsiConfig = { JITSI_DOMAIN: domain, JITSI_ROOM_NAME: roomName, JITSI_ROOM_PASSWORD: roomPassword };
            this.isJitsiEnabledSubject.next(!!domain && !!roomName);
        });
        settingService.get('conference_open_microphone').subscribe(open => {
            configOverwrite.startWithAudioMuted = !open;
        });
        settingService.get('conference_open_video').subscribe(open => {
            configOverwrite.startWithVideoMuted = !open;
        });
        callRestrictionService.canEnterCallObservable.subscribe(canEnter => {
            this.canEnterCall = canEnter;
        });

        this.inOtherTab = this.storageMap
            .watch(RTC_LOGGED_STORAGE_KEY, { type: 'boolean' })
            .pipe(distinctUntilChanged());
    }

    public setJitsiNode(jitsiNode: ElementRef): void {
        this.jitsiNode = jitsiNode;
    }

    public toggleMute(): void {
        if (this.isJitsiActive) {
            this.api.executeCommand('toggleAudio');
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

    private setRoomPassword(): void {
        if (this.jitsiConfig?.JITSI_ROOM_PASSWORD && !this.isPasswordSet) {
            // You can only set the password after the server has recognized that you are
            // the moderator. There is no event listener for that.
            setTimeout(() => {
                this.api.executeCommand('password', this.jitsiConfig?.JITSI_ROOM_PASSWORD);
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
        const jitsiName = this.userRepo.getViewModel(this.operator.operatorId).getShortName();
        this.api.executeCommand('displayName', jitsiName);
        this.loadApiCallbacks();
    }

    private loadApiCallbacks(): void {
        this.isMutedSubject.next(configOverwrite.startWithAudioMuted);

        this.api.on('videoConferenceJoined', (info: ConferenceJoinedResult) => {
            this.onEnterConference(info);
        });

        this.api.on('participantJoined', (newMember: JitsiMember) => {
            this.addMember(newMember);
        });

        this.api.on('participantLeft', (oldMember: { id: string }) => {
            this.removeMember(oldMember);
        });

        this.api.on('displayNameChange', (member: DisplayNameChangeResult) => {
            this.renameMember(member);
        });

        this.api.on('audioMuteStatusChanged', (isMuted: { muted: boolean }) => {
            this.isMutedSubject.next(isMuted.muted);
        });

        this.api.on('readyToClose', () => {
            this.stopJitsi();
        });

        this.api.on('dominantSpeakerChanged', (newSpeaker: { id: string }) => {
            this.newDominantSpeaker(newSpeaker.id);
        });

        this.api.on('passwordRequired', () => {
            this.setRoomPassword();
        });

        this.api.on('participantKickedOut', (kicked: MemberKicked) => {
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

    /**
     * https://github.com/jitsi/jitsi-meet/issues/8244
     */
    public enterFullScreen(): void {}

    private disconnect(): void {
        if (this.isJitsiActive) {
            this.api?.executeCommand('hangup');
            this.api?.dispose();
            this.api = undefined;
        }
        this.clearMembers();
        this.deleteJitsiLock();
        this.dominantSpeaker = null;
        this.dominantSpeakerSubject.next(this.dominantSpeaker);
        this.isJoinedSubject.next(false);
        this.showCallDialogSubject.next(false);
        this.isPasswordSet = false;
    }

    public stopJitsi(): void {
        this.disconnect();
        this.connectedToHelpDeskSubject.next(false);
        this.isJitsiActiveSubject.next(false);
    }

    private setOptions(): void {
        this.setJitsiMeetUrl();
        this.options = {
            roomName: this.actualRoomName,
            parentNode: this.jitsiNode.nativeElement,
            configOverwrite,
            interfaceConfigOverwrite
        };
    }

    private setJitsiMeetUrl(): void {
        this.jitsiMeetUrlSubject.next(`https://${this.jitsiConfig.JITSI_DOMAIN}/${this.actualRoomName}`);
    }

    private deleteJitsiLock(): void {
        this.storageMap.delete(RTC_LOGGED_STORAGE_KEY).subscribe();
    }
}
