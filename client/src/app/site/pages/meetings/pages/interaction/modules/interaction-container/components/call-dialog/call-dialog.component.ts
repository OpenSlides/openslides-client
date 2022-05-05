import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    AfterViewInit,
    ViewChild,
    ElementRef,
    ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs';
import { RtcService } from '../../../../services/rtc.service';
import { ViewPortService } from 'src/app/site/services/view-port.service';
import { Permission } from 'src/app/domain/definitions/permission';

@Component({
    selector: 'os-call-dialog',
    templateUrl: './call-dialog.component.html',
    styleUrls: ['./call-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallDialogComponent implements AfterViewInit {
    @ViewChild(`jitsi`)
    private jitsiNode!: ElementRef;

    public readonly permission = Permission;

    public jitsiMeetUrl: Observable<string> = this.rtcService.jitsiMeetUrl;

    public isMobile: Observable<boolean> = this.vp.isMobileSubject;

    public constructor(private cd: ChangeDetectorRef, private rtcService: RtcService, private vp: ViewPortService) {}

    public ngAfterViewInit(): void {
        this.rtcService.setJitsiNode(this.jitsiNode);
        this.cd.markForCheck();
    }

    public fullScreen(): void {
        this.rtcService.enterFullScreen();
        this.cd.markForCheck();
    }

    public hangUp(): void {
        this.rtcService.stopJitsi();
        this.cd.markForCheck();
    }

    public hideDialog(): void {
        this.rtcService.showCallDialog = false;
    }
}
