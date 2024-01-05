import { Component, ElementRef, inject, Input, OnDestroy, ViewChild } from '@angular/core';
import {
    auditTime,
    BehaviorSubject,
    combineLatest,
    distinctUntilChanged,
    map,
    merge,
    mergeMap,
    Observable
} from 'rxjs';
import { UnsafeHtml } from 'src/app/domain/definitions/key-types';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { MediaManageService } from 'src/app/site/pages/meetings/services/media-manage.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ConnectionStatusService } from 'src/app/site/services/connection-status.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { Dimension, SlideData } from '../../../../pages/projectors/definitions';

@Component({
    selector: `os-projector`,
    templateUrl: `./projector.component.html`,
    styleUrls: [`./projector.component.scss`]
})
export class ProjectorComponent extends BaseUiComponent implements OnDestroy {
    private readonly projectorSubject = new BehaviorSubject<ViewProjector | null>(null);

    @Input()
    public set projector(projector: ViewProjector | null) {
        this.projectorSubject.next(projector);
    }

    public get projector(): ViewProjector | null {
        return this.projectorSubject.getValue();
    }

    /**
     * The current projector size. This is for checking,
     * if the size actually has changed.
     */
    private currentProjectorSize: Dimension = { width: 0, height: 0 };

    /**
     * The container element. THis is neede to get the size of the element,
     * in which the projector must fit and be scaled to.
     */
    @ViewChild(`container`, { static: true })
    private containerElement: ElementRef | null = null;

    /**
     * The css class assigned to this projector.
     */
    private projectorClass: string;

    /**
     * The styleelement for setting projector-specific styles.
     */
    private styleElement: HTMLStyleElement | null = null;

    /**
     * All current css rules for the projector. when updating this, call `updateCSS()` afterwards.
     */
    public css: {
        container: {
            height: string;
        };
        projector: {
            transform: string;
            width: string;
            height: string;
            color: string;
            backgroundColor: string;
            H1Color: string;
        };
        headerFooter: {
            color: string;
            backgroundColor: string;
            backgroundImage: string;
        };
    } = {
        container: {
            height: `0px`
        },
        projector: {
            transform: `none`,
            width: `0px`,
            height: `0px`,
            color: `black`,
            backgroundColor: `white`,
            H1Color: `#317796`
        },
        headerFooter: {
            color: `white`,
            backgroundColor: `#317796`,
            backgroundImage: `none`
        }
    };

    /**
     * All slides to show on this projector
     */
    public slides: Observable<SlideData<object>[]> = new Observable<SlideData<object>[]>();

    /**
     * Info about if the user is offline.
     */
    public isOffline = false;

    public get eventNameObservable(): Observable<UnsafeHtml> {
        return this.meetingSettingsService.get(`name`);
    }

    public get eventDescriptionObservable(): Observable<UnsafeHtml> {
        return this.meetingSettingsService.get(`description`);
    }

    public get projectorLogoObservable(): Observable<string> {
        return this.mediaManageService.getLogoUrlObservable(`projector_main`);
    }

    // Some settings for the view from the config.
    public enableHeaderAndFooter = true;
    public enableTitle = true;

    private offlineService = inject(ConnectionStatusService);
    private elementRef = inject(ElementRef);
    private mediaManageService = inject(MediaManageService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        super();

        this.projectorClass = `projector-` + Math.random().toString(36).substring(4);
        this.elementRef.nativeElement.classList.add(this.projectorClass);
        this.styleElement = document.createElement(`style`);
        this.styleElement.appendChild(document.createTextNode(``)); // Hack for WebKit to trigger update
        document.head.appendChild(this.styleElement);

        // projector logo / background-image
        this.mediaManageService.getLogoUrlObservable(`projector_header`).subscribe(url => {
            this.css.headerFooter.backgroundImage = url ? `url('${url}')` : `none`;
            this.updateCSS();
        });

        this.subscriptions.push(
            this.offlineService.isOfflineObservable.subscribe(isOffline => (this.isOffline = isOffline))
        );

        const trigger$ = merge(
            this.projectorSubject,
            this.projectorSubject.pipe(mergeMap(projector => projector?.current_projections_as_observable || []))
        );

        this.slides = combineLatest([this.projectorSubject, trigger$])
            .pipe(
                map(([projector, _]) =>
                    (projector?.current_projections || []).map(
                        projection =>
                            ({
                                collection: projection.content?.collection,
                                data: projection.content,
                                stable: !!projection.stable,
                                type: projection.type || ``,
                                options: projection.options || {},
                                ...(!!projection.content?.[`error`] && { error: projection.content[`error`] })
                            } as SlideData)
                    )
                )
            )
            .pipe(auditTime(20))
            .pipe(distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)));

        this.subscriptions.push(
            this.projectorSubject.subscribe(projector => {
                if (!projector) {
                    return;
                }

                const oldSize: Dimension = { ...this.currentProjectorSize };
                this.currentProjectorSize.height = projector.height;
                this.currentProjectorSize.width = projector.width;
                if (
                    oldSize.height !== this.currentProjectorSize.height ||
                    oldSize.width !== this.currentProjectorSize.width
                ) {
                    this.updateScaling();
                }
                this.css.projector.color = projector.color;
                this.css.projector.backgroundColor = projector.background_color;
                this.css.projector.H1Color = projector.header_h1_color;
                this.css.headerFooter.color = projector.header_font_color;
                this.css.headerFooter.backgroundColor = projector.header_background_color;
                this.updateCSS();
            })
        );
    }

    public onResized(): void {
        if (this.containerElement) {
            this.updateScaling();
        }
    }

    /**
     * Scales the projector to the right format.
     */
    private updateScaling(): void {
        if (
            !this.containerElement ||
            this.currentProjectorSize.width === 0 ||
            this.containerElement.nativeElement.offsetWidth === 0
        ) {
            return;
        }
        const scale = this.containerElement.nativeElement.offsetWidth / this.currentProjectorSize.width;
        if (isNaN(scale)) {
            return;
        }
        this.css.projector.transform = `scale(` + scale + `)`;
        this.css.projector.width = this.currentProjectorSize.width + `px`;
        this.css.projector.height = this.currentProjectorSize.height + `px`;
        this.css.container.height = Math.round(scale * this.currentProjectorSize.height) + `px`;
        this.updateCSS();
    }

    /**
     * Update the css element with the current css settings in `this.css`.
     */
    private updateCSS(): void {
        if (!this.styleElement) {
            return;
        }
        this.styleElement.innerHTML = `
            .${this.projectorClass} .projector-container {
                height: ${this.css.container.height};
                min-height: 1px;
            }
            .${this.projectorClass} .projector {
                transform: ${this.css.projector.transform};
                width: ${this.css.projector.width};
                height: ${this.css.projector.height};
                background-color: ${this.css.projector.backgroundColor};
                color: ${this.css.projector.color};
            }
            .${this.projectorClass} .projector h1 {
                color: ${this.css.projector.H1Color};
            }
            .${this.projectorClass} .headerFooter {
                color: ${this.css.headerFooter.color};
                background-color: ${this.css.headerFooter.backgroundColor};
                background-image: ${this.css.headerFooter.backgroundImage};
            }`;
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }
}
