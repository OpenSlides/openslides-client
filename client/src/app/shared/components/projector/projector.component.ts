import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Follow } from 'app/core/core-services/model-request-builder.service';
import { UnsafeHtml } from 'app/core/definitions/key-types';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MediaManageService } from 'app/core/ui-services/media-manage.service';
import { SlideData } from 'app/core/ui-services/projector.service';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { Size } from 'app/site/projector/size';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { OfflineService } from '../../../core/core-services/offline.service';

export const PROJECTOR_CONTENT_FOLLOW: Follow = {
    idField: `current_projection_ids`,
    follow: [{ idField: `content_object_id` }],
    fieldset: `content`
};

/**
 * THE projector. Cares about scaling and the right size and resolution.
 * Watches the given projector and creates slide-containers for each projectorelement.
 */
@Component({
    selector: `os-projector`,
    templateUrl: `./projector.component.html`,
    styleUrls: [`./projector.component.scss`]
})
export class ProjectorComponent extends BaseComponent implements OnDestroy {
    private readonly projectorSubject = new BehaviorSubject<ViewProjector | null>(null);

    @Input()
    public set projector(projector: ViewProjector) {
        this.projectorSubject.next(projector);
    }

    public get projector(): ViewProjector {
        return this.projectorSubject.getValue();
    }

    /**
     * The current projector size. This is for checking,
     * if the size actually has changed.
     */
    private currentProjectorSize: Size = { width: 0, height: 0 };

    /**
     * The container element. THis is neede to get the size of the element,
     * in which the projector must fit and be scaled to.
     */
    @ViewChild(`container`, { static: true })
    private containerElement: ElementRef;

    /**
     * The css class assigned to this projector.
     */
    private projectorClass: string;

    /**
     * The styleelement for setting projector-specific styles.
     */
    private styleElement?: HTMLStyleElement;

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

    /**
     * A subject that fires, if the container is resized.
     */
    public resizeSubject = new Subject<void>();

    public get eventNameObservable(): Observable<UnsafeHtml> {
        return this.meetingSettingService.get(`name`);
    }

    public get eventDescriptionObservable(): Observable<UnsafeHtml> {
        return this.meetingSettingService.get(`description`);
    }

    public get projectorLogoObservable(): Observable<string> {
        return this.mediaManageService.getLogoUrlObservable(`projector_main`);
    }

    // Some settings for the view from the config.
    public enableHeaderAndFooter = true;
    public enableTitle = true;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private offlineService: OfflineService,
        private elementRef: ElementRef,
        private mediaManageService: MediaManageService
    ) {
        super(componentServiceCollector, translate);

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

        // Watches for resizing of the container.
        this.resizeSubject.subscribe(() => {
            if (this.containerElement) {
                this.updateScaling();
            }
        });

        this.subscriptions.push(
            this.offlineService.isOfflineObservable.subscribe(isOffline => (this.isOffline = isOffline))
        );

        const trigger$ = merge(
            this.projectorSubject,
            this.projectorSubject.pipe(mergeMap(projector => projector?.current_projections_as_observable || []))
        );

        this.slides = combineLatest([this.projectorSubject, trigger$]).pipe(
            map((data: [ViewProjector, any]) =>
                (data[0]?.current_projections || []).map(
                    projection =>
                        ({
                            collection: projection.content?.collection,
                            data: projection.content,
                            stable: !!projection.stable,
                            type: projection.type || ``,
                            options: projection.options || {},
                            ...(!!projection.content?.error && { error: projection.content.error })
                        } as SlideData)
                )
            )
        );

        this.subscriptions.push(
            this.projectorSubject.subscribe(projector => {
                if (!projector) {
                    return;
                }

                const oldSize: Size = { ...this.currentProjectorSize };
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

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        document.head.removeChild(this.styleElement);
        this.styleElement = null;
    }
}
