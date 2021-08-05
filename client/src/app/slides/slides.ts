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
        path: 'agenda_item_list',
        loadChildren: () => import('./agenda-item-list/agenda-item-list-slide.module').then(m => m.ItemListSlideModule),
        verboseName: 'Agenda',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'assignment',
        loadChildren: () => import('./assignment/assignment-slide.module').then(m => m.AssignmentSlideModule),
        verboseName: 'Election',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'current_list_of_speakers',
        loadChildren: () =>
            import('./current-list-of-speakers/current-list-of-speakers-slide.module').then(
                m => m.CurrentListOfSpeakersSlideModule
            ),
        verboseName: 'Current list of speakers',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'current_speaker_chyron',
        loadChildren: () =>
            import('./current-speaker-chyron/current-speaker-chyron-slide.module').then(
                m => m.CurrentSpeakerChyronSlideModule
            ),
        verboseName: 'Current speaker chyron',
        scaleable: false,
        scrollable: false
    },
    {
        path: 'list_of_speakers',
        loadChildren: () =>
            import('./list-of-speakers/list-of-speakers-slide.module').then(m => m.ListOfSpeakersSlideModule),
        verboseName: 'List of speakers',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'mediafile',
        loadChildren: () => import('./mediafile/mediafile-slide.module').then(m => m.MediafileSlideModule),
        verboseName: 'File',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'motion',
        loadChildren: () => import('./motion/motion-slide.module').then(m => m.MotionSlideModule),
        verboseName: 'Motion',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'motion_block',
        loadChildren: () => import('./motion-block/motion-block-slide.module').then(m => m.MotionBlockSlideModule),
        verboseName: 'Motion block',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'poll',
        loadChildren: () => import('./poll/poll-slide.module').then(m => m.PollSlideModule),
        verboseName: 'Vote',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'projector_countdown',
        loadChildren: () =>
            import('./projector-countdown/projector-countdown-slide.module').then(m => m.ProjectorCountdownSlideModule),
        verboseName: 'Countdown',
        scaleable: false,
        scrollable: false
    },
    {
        path: 'projector_message',
        loadChildren: () =>
            import('./projector-message/projector-message-slide.module').then(m => m.ProjectorMessageSlideModule),
        verboseName: 'Message',
        scaleable: false,
        scrollable: false
    },
    {
        path: 'topic',
        loadChildren: () => import('./topic/topic-slide.module').then(m => m.TopicSlideModule),
        verboseName: 'Topic',
        scaleable: true,
        scrollable: true
    },
    {
        path: 'user',
        loadChildren: () => import('./user/user-slide.module').then(m => m.UserSlideModule),
        verboseName: 'Participant',
        scaleable: true,
        scrollable: true
    }
    /*
    {
        slide: 'agenda/current-list-of-speakers-overlay',
        path: 'agenda/current-list-of-speakers-overlay',
        loadChildren: () =>
            import('./current-list-of-speakers-overlay/current-list-of-speakers-overlay-slide.module').then(
                m => m.CurrentListOfSpeakersOverlaySlideModule
            ),
        verboseName: 'Current list of speakers overlay',
    },*/
];
