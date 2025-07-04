import { FULL_FIELDSET } from '../../fieldsets/misc';
import { FONT_PLACES, FontPlace, LOGO_PLACES, LogoPlace } from '../mediafiles/mediafile.constants';
import { PROJECTIONDEFAULTS, ProjectiondefaultValue } from '../projector/projection-default';

export type ExportCsvEncoding = `utf-8` | `iso-8859-15`;

/**
 * Server side ballot choice definitions.
 * Server-defined methods to determine the number of ballots to print
 * Options are:
 * - NUMBER_OF_DELEGATES Amount of users belonging to the predefined 'delegates' group (group id 2)
 * - NUMBER_OF_ALL_PARTICIPANTS The amount of all registered users
 * - CUSTOM_NUMBER a given number of ballots
 */
export type BallotPaperSelection = `NUMBER_OF_DELEGATES` | `NUMBER_OF_ALL_PARTICIPANTS` | `CUSTOM_NUMBER`;

export type ViewMeetingMediafileUsageKey = `logo_${LogoPlace}` | `font_${FontPlace}`;

export type MeetingMediafileUsageIdKey = `${ViewMeetingMediafileUsageKey}_id`;

export const MEETING_MEDIAFILE_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `logo_${place}_id` as MeetingMediafileUsageIdKey),
    ...FONT_PLACES.map(place => `font_${place}_id` as MeetingMediafileUsageIdKey)
];

export type MeetingDefaultProjectorIdsKey = `default_projector_${ProjectiondefaultValue}_ids`;

export const MEETING_DEFAULT_PROJECTOR_IDS_KEYS = PROJECTIONDEFAULTS.map(
    place => {
        return { idField: `default_projector_${place}_ids` as MeetingDefaultProjectorIdsKey, fieldset: FULL_FIELDSET };
    }
);

export type ViewMeetingDefaultProjectorsKey = `default_projectors_${ProjectiondefaultValue}`;

export const MEETING_PDF_EXPORT_HEADING_STYLES = {
    // specified heading styles for OpenSlides
    h1: [`font-size:18`, `font-weight:bold`],
    h2: [`font-size:15`, `font-weight:bold`],
    h3: [`font-size:11`, `font-weight:bold`],
    h4: [`font-size:10`, `font-weight:bold`],
    h5: [`font-size:10`, `font-style:italic`],
    h6: [`font-size:10`]
};
