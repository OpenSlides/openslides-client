import { Injectable } from '@angular/core';

import { OrganisationSettingsService } from 'app/core/ui-services/organisation-settings.service';
import { ViewMediafile } from '../../site/mediafiles/models/view-mediafile';

/**
 * The structure of an image config object
 */
export interface ImageConfigObject {
    display_name: string;
    key: string;
    path: string;
}

/**
 * The structure of a font config
 */
export interface FontConfigObject {
    display_name: string;
    default: string;
    path: string;
}

/**
 * Holds the required structure of the manage payload
 */
interface ManagementPayload {
    id: number;
    key?: string;
    default?: string;
    value: ImageConfigObject | FontConfigObject;
}

export const LogoOptions = [
    'projector_main',
    'projector_header',
    'web_header',
    'pdf_header_L',
    'pdf_header_R',
    'pdf_footer_L',
    'pdf_footer_R',
    'pdf_ballot_paper'
];

export const FontOptions = ['regular', 'italic', 'bold', 'bold_italic', 'monospace'];

/**
 * The service to manage Mediafiles.
 *
 * Declaring images as logos (web, projector, pdf, ...) is handles here.
 */
@Injectable({
    providedIn: 'root'
})
export class MediaManageService {
    public get logoSettings(): string[] {
        return LogoOptions;
    }

    public get fontSettings(): string[] {
        return FontOptions;
    }

    /**
     * Constructor for the MediaManage service
     *
     * @param httpService OpenSlides own HttpService
     */
    public constructor(private config: OrganisationSettingsService) {}

    /**
     * Sets the given Mediafile to using the given management option
     * i.e: setting another projector logo
     *
     * TODO: Feels overly complicated. However, the server seems to requires a strictly shaped payload
     *
     * @param file the selected Mediafile
     * @param action determines the action
     */
    public async setAs(file: ViewMediafile, action: string): Promise<void> {
        const restPath = `/rest/core/config/${action}/`;

        const config = this.getMediaConfig(action);
        const path = config.path !== file.url ? file.url : '';

        // Create the payload that the server requires to manage a mediafile
        const payload: ManagementPayload = {
            id: file.id,
            key: (config as ImageConfigObject).key,
            default: (config as FontConfigObject).default,
            value: {
                display_name: config.display_name,
                key: (config as ImageConfigObject).key,
                default: (config as FontConfigObject).default,
                path: path
            }
        };

        throw new Error('TODO');
        // return this.httpService.put<void>(restPath, payload);
    }

    /**
     * Checks if an image is an imageConfig Object
     *
     * @param object instance of something to check
     * @returns boolean if an object is a ImageConfigObject
     */
    public isImageConfigObject(object: any): object is ImageConfigObject {
        if (object !== undefined) {
            return (<ImageConfigObject>object).path !== undefined;
        }
    }

    /**
     * returns the config object to a given action
     *
     * @param action the logo action or font action
     * @returns A media config object containing the requested values
     */
    public getMediaConfig(action: string): ImageConfigObject | FontConfigObject | null {
        return this.config.instant(action);
    }
}
