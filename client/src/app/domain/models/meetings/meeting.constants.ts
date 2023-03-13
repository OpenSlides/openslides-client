import { FONT_PLACES, FontPlace, LOGO_PLACES, LogoPlace } from '../mediafiles/mediafile.constants';
import { Projectiondefault, PROJECTIONDEFAULTS } from '../projector/projection-default';

export type ExportCsvEncoding = 'utf-8' | 'iso-8859-15';

/**
 * Server side ballot choice definitions.
 * Server-defined methods to determine the number of ballots to print
 * Options are:
 * - NUMBER_OF_DELEGATES Amount of users belonging to the predefined 'delegates' group (group id 2)
 * - NUMBER_OF_ALL_PARTICIPANTS The amount of all registered users
 * - CUSTOM_NUMBER a given number of ballots
 */
export type BallotPaperSelection = 'NUMBER_OF_DELEGATES' | 'NUMBER_OF_ALL_PARTICIPANTS' | 'CUSTOM_NUMBER';

export type ViewMeetingMediafileUsageKey = `logo_${LogoPlace}` | `font_${FontPlace}`;

export type MeetingMediafileUsageIdKey = `${ViewMeetingMediafileUsageKey}_id`;

export const MEETING_MEDIAFILE_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `logo_${place}_id` as MeetingMediafileUsageIdKey),
    ...FONT_PLACES.map(place => `font_${place}_id` as MeetingMediafileUsageIdKey)
];

export type MeetingDefaultProjectorIdsKey = `default_projector_${Projectiondefault}_ids`;

export const MEETING_DEFAULT_PROJECTOR_IDS_KEYS = PROJECTIONDEFAULTS.map(
    place => `default_projector_${place}_ids`
) as MeetingDefaultProjectorIdsKey[];

export type ViewMeetingDefaultProjectorsKey = `default_projectors_${Projectiondefault}`;
