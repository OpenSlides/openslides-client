import { Injectable } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'src/app/site/modules/global-spinner';

import { InteractionServiceModule } from './interaction-service.module';

const givePermsMessage = _(`Please allow OpenSlides to access your microphone and/or camera`);
const accessDeniedMessage = _(`Media access is denied`);
const noMicMessage = _(`Your device has no microphone`);

@Injectable({
    providedIn: InteractionServiceModule
})
export class OperatorMediaPermissionService {
    private hasAudioDevice = false;
    private hasVideoDevice = false;

    public constructor(private translate: TranslateService, private spinnerService: SpinnerService) {}

    public async requestMediaAccess(): Promise<void> {
        await this.detectAvailableDevices();

        if (!this.hasAudioDevice) {
            throw new Error(noMicMessage);
        }
        const hasMediaAccess: PermissionState | null = await this.detectPermStatus();
        if (!hasMediaAccess || hasMediaAccess === `prompt`) {
            await this.tryMediaAccess();
        } else if (hasMediaAccess === `denied`) {
            this.throwPermError();
        }
    }

    /**
     * `navigator.permissions.query` does only work in chrome
     * This function detects if this method works at all.
     * If it does not work, we try to access the media anyways without
     * detecting the set permission beforehand.
     * The negative result would be, that the user sees the
     * overlay for a very short time.
     * This cannot be avoided, but rather solves itself if more browsers
     * start to support the given media query
     */
    private async detectPermStatus(): Promise<PermissionState | null> {
        try {
            const micPermStatus = await navigator.permissions.query({ name: `microphone` } as any);
            const camPermStatus = await navigator.permissions.query({ name: `camera` } as any);

            if (!this.hasVideoDevice || micPermStatus.state === camPermStatus.state) {
                return micPermStatus.state;
            } else if (micPermStatus.state === `denied` || camPermStatus.state === `denied`) {
                return `denied`;
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    private async detectAvailableDevices(): Promise<void> {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        this.hasAudioDevice = !!mediaDevices.find(device => device.kind === `audioinput`);
        this.hasVideoDevice = !!mediaDevices.find(device => device.kind === `videoinput`);
    }

    private async tryMediaAccess(): Promise<void> {
        this.showAwaitPermInfo();
        try {
            const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
                audio: this.hasAudioDevice,
                video: this.hasVideoDevice
            });
            this.hideAwaitPermInfo();

            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        } catch (e) {
            if (e instanceof DOMException && e.name === `NotAllowedError`) {
                this.throwPermError();
            } else {
                this.throwPermError(e as any);
            }
        }
    }

    private throwPermError(error: Error = new Error(accessDeniedMessage)): void {
        this.hideAwaitPermInfo();
        console.error(error);
        throw new Error(this.translate.instant(error.message));
    }

    /**
     * Show:
     * Please allow OpenSlides to use your microphone
     */
    private showAwaitPermInfo(): void {
        this.spinnerService.show(this.translate.instant(givePermsMessage));
    }

    private hideAwaitPermInfo(): void {
        this.spinnerService.hide();
    }
}
