import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MeetingProjectionType } from 'src/app/gateways/repositories/meeting-repository.service';

import { SlideManifest } from './slide-manifest';

/**
 * Here, all slides has to be registered.
 *
 * `path` is the slidename.
 *
 * Note: When adding or removing slides here, you may need to restart yarn/npm, because
 * the angular CLI scans this file just at it's start time and creates the modules then. There
 * is no such thing as "dynamic update" in this case..
 */
export const Slides: SlideManifest[] = [
    {
        path: `agenda_item_list`,
        loadChildren: () =>
            import(`../components/agenda-item-list-slide/agenda-item-list-slide.module`).then(
                m => m.AgendaItemListSlideModule
            ),
        verboseName: _(`Agenda`),
        scaleable: true,
        scrollable: true
    },
    {
        path: MeetingProjectionType.WiFiAccess,
        loadChildren: () =>
            import(`../components/wifi-access-data-slide/wifi-access-data-slide.module`).then(
                m => m.WifiAccessDataSlideModule
            ),
        verboseName: _(`WiFi access data`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `assignment`,
        loadChildren: () =>
            import(`../components/assignment-slide/assignment-slide.module`).then(m => m.AssignmentSlideModule),
        verboseName: _(`Election`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `current_list_of_speakers`,
        loadChildren: () =>
            import(
                `../components/list-of-speakers/modules/current-list-of-speakers-slide/current-list-of-speakers-slide.module`
            ).then(m => m.CurrentListOfSpeakersSlideModule),
        verboseName: _(`Current list of speakers`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `current_speaker_chyron`,
        loadChildren: () =>
            import(`../components/current-speaker-chyron-slide/current-speaker-chyron-slide.module`).then(
                m => m.CurrentSpeakerChyronSlideModule
            ),
        verboseName: _(`Current speaker chyron`),
        scaleable: false,
        scrollable: false
    },
    {
        path: `list_of_speakers`,
        loadChildren: () =>
            import(`../components/list-of-speakers/modules/list-of-speakers-slide/list-of-speakers-slide.module`).then(
                m => m.ListOfSpeakersSlideModule
            ),
        verboseName: _(`List of speakers`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `mediafile`,
        loadChildren: () =>
            import(`../components/mediafile-slide/mediafile-slide.module`).then(m => m.MediafileSlideModule),
        verboseName: _(`File`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `motion`,
        loadChildren: () =>
            import(`../components/motions/modules/motion-slide/motion-slide.module`).then(m => m.MotionSlideModule),
        verboseName: _(`Motion`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `motion_block`,
        loadChildren: () =>
            import(`../components/motions/modules/motion-block-slide/motion-block-slide.module`).then(
                m => m.MotionBlockSlideModule
            ),
        verboseName: _(`Motion block`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `poll`,
        loadChildren: () => import(`../components/poll-slide/poll-slide.module`).then(m => m.PollSlideModule),
        verboseName: _(`Vote`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `projector_countdown`,
        loadChildren: () =>
            import(`../components/projector-countdown-slide/projector-countdown-slide.module`).then(
                m => m.ProjectorCountdownSlideModule
            ),
        verboseName: _(`Countdown`),
        scaleable: false,
        scrollable: false
    },
    {
        path: `projector_message`,
        loadChildren: () =>
            import(`../components/projector-message-slide/projector-message-slide.module`).then(
                m => m.ProjectorMessageSlideModule
            ),
        verboseName: _(`Message`),
        scaleable: false,
        scrollable: false
    },
    {
        path: `topic`,
        loadChildren: () => import(`../components/topic-slide/topic-slide.module`).then(m => m.TopicSlideModule),
        verboseName: _(`Topic`),
        scaleable: true,
        scrollable: true
    },
    {
        path: `user`,
        loadChildren: () => import(`../components/user-slide/user-slide.module`).then(m => m.UserSlideModule),
        verboseName: _(`Participant`),
        scaleable: true,
        scrollable: true
    }
];
