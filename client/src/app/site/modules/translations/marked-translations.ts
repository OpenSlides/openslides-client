import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

/**
 * Add strings here that require translations but have never been declared
 * in code nor views.
 *
 * I.e: words transmitted by the server
 *
 * @example
 * ```ts
 * _('my new sentence to translate that has not been anywhere');
 * ```
 */

// Core config strings
_(
    `<a href="https://openslides.com">OpenSlides</a> is a free web based presentation and assembly system for visualizing and controlling agenda, motions and elections of an assembly.`
);
_(`Front page text`);
_(`[Place for your welcome text.]`);
_(`Livestream poster image url`);
_(`Shows if livestream is not started. Recommended image format: 500x200px, PNG or JPG`);
_(`Number of next speakers automatically connecting to the live conference`);
_(`Live conference has to be active. Choose 0 to disable auto connect.`);
_(`Automatically open the microphone for new conference speakers`);
_(`Automatically open the web cam for new conference speakers`);

// Projector config strings
_(`Projector`);
_(`Default projector`);
_(`Projector logo`);
_(`Projector header image`);
_(`PDF header logo (left)`);
_(`PDF header logo (right)`);
_(`PDF footer logo (left)`);
_(`PDF footer logo (right)`);
_(`Web interface header logo`);
_(`PDF ballot paper logo`);
_(`Foreground color`);
_(`Background color`);
_(`Header background color`);
_(`Header font color`);
_(`Headline color`);
_(`Chyron background color`);
_(`Chyron font color`);
_(`You can't delete the last projector.`);

// Agenda config strings
_(`The list of speakers is closed.`);
_(`public`);
_(`internal`);
_(`hidden`);
// agenda misc strings
_(`Topics`);
_(`Only main agenda items`);
_(`Open requests to speak`);

// ** Motions **

// motion workflow 1
_(`Simple Workflow`);
_(`submitted`);
_(`accepted`);
_(`Accept`);
_(`Acceptance`);
_(`rejected`);
_(`Reject`);
_(`Rejection`);
_(`not decided`);
_(`Do not decide`);
_(`No decision`);
// motion workflow 2
_(`Complex Workflow`);
_(`in progress`);
_(`published`);
_(`permitted`);
_(`Permit`);
_(`Permission`);
_(`accepted`);
_(`Accept`);
_(`Acceptance`);
_(`rejected`);
_(`Reject`);
_(`Rejection`);
_(`withdrawn`);
_(`adjourned`);
_(`Adjourn`);
_(`Adjournment`);
_(`not concerned`);
_(`Do not concern`);
_(`No concernment`);
_(`referred to committee`);
_(`Refer to committee`);
_(`Referral to committee`);
_(`needs review`);
_(`Needs review`);
_(`rejected (not authorized)`);
_(`Reject (not authorized)`);
_(`Rejection (not authorized)`);
// motion workflow manager
_(`Recommendation label`);
_(`Allow support`);
_(`Allow create poll`);
_(`Allow forwarding of motions`);
_(`Allow submitter edit`);
_(`Set number`);
_(`Set timestamp of creation`);
_(`Show state extension field`);
_(`Show recommendation extension field`);
_(`Show amendment in parent motion`);
_(`Restrictions`);
_(`Label color`);
_(`Next states`);
_(`grey`);
_(`red`);
_(`green`);
_(`lightblue`);
_(`yellow`);
_(`You cannot delete the first state of the workflow.`);
_(`You cannot delete the last workflow.`);
// misc for motions
_(`Amendment`);
_(`Statute amendment for`);
_(`Statute paragraphs`);
_(`Called`);
_(`Called with`);
_(`Recommendation`);
_(`Motion block`);
_(`The text field may not be blank.`);
_(`The reason field may not be blank.`);

// ** Assignments **
// misc for assignments
_(`Searching for candidates`);
_(`In the election process`);
_(`Finished`);

// Voting strings
_(`Motion votes`);
_(`Ballots`);
_(`You cannot delegate a vote to a user who has already delegated his vote.`);
_(`You cannot delegate a delegation of vote to another user (cascading not allowed).`);
_(`You cannot delegate a vote to yourself.`);

// ** Users **
// permission strings (see models.py of each Django app)
// agenda
_(`Can see agenda`);
_(`Can manage agenda`);
_(`Can see list of speakers`);
_(`Can manage list of speakers`);
_(`Can see internal items and time scheduling of agenda`);
_(`Can put oneself on the list of speakers`);
_(`Can manage polls`);
// assignments
_(`Can see elections`);
_(`Can nominate another participant`);
_(`Can nominate oneself`);
_(`Can manage elections`);
_(`Electronic voting is disabled. Only analog polls are allowed`);
_(`Anonymizing can only be done after finishing a poll.`);
_(`You can just anonymize named polls`);
_(`You cannot vote since your vote right is delegated.`);
// core
_(`Can see the projector`);
_(`Can manage the projector`);
_(`Can see the autopilot`);
_(`Can see the front page`);
_(`Can manage tags`);
_(`Can manage settings`);
_(`Can manage logos and fonts`);
_(`Can see history`);
_(`Can see the live stream`);
_(`Can manage the chat`);
// mediafiles
_(`Can see the list of files`);
_(`Can upload files`);
_(`Can manage files`);
_(`Can see hidden files`);
_(`A file with this title or filename already exists in this directory.`);
_(`The name contains invalid characters: "/"`);
_(`The directory does not exist`);
// motions
_(`Can see motions`);
_(`Can see motions in internal state`);
_(`Can create motions`);
_(`Can support motions`);
_(`Can manage motions`);
_(`Can forward motions into this meeting`);
_(`Can see comments`);
_(`Can manage comments`);
_(`Can manage motion metadata`);
_(`Can create amendments`);
_(`Can manage motion polls`);

// users
_(`Can see participants`);
_(`Can manage presence of others`);
_(`Can manage participants`);

// users config
_(`Email body`);
_(
    `Dear {name},\n\nthis is your personal OpenSlides login:\n\n{url}\nUsername: {username}\nPassword: {password}\n\n\nThis email was generated automatically.`
);

// users misc
_(`Username or password is not correct.`);
_(`Please login via your identity provider`);
_(`You are not authenticated.`);
_(`Guest`);
_(`Participant`);
_(`No users with email {0} found.`);
_(`You can not delete yourself.`);
_(`You can not deactivate yourself.`);
_(`Natural person`);
_(`No.`);
_(`Full name`);

// default groups
_(`Default`);
_(`Admin`);
_(`Delegates`);
_(`Staff`);
_(`Committees`);

// history strings
_(`Motion created`);
_(`Motion deleted`);
_(`Motion updated`);
_(`Forwarding created`);
_(`Submitters changed`);
_(`Supporters changed`);
_(`State set to {}`);
_(`State changed`);
_(`Recommendation set to {}`);
_(`Recommendation changed`);
_(`Recommendation reset`);
_(`Category set to {}`);
_(`Category removed`);
_(`Category changed`);
_(`Motion block set to {}`);
_(`Motion block removed`);
_(`Motion block changed`);
_(`Recommendation changed`);
_(`Recommendation reset`);
_(`Voting anonymized`);
_(`Voting started`);
_(`Voting stopped`);
_(`Voting published`);
_(`Voting stopped/published`);
_(`Voting reset`);
_(`Number set`);
_(`OpenSlides is temporarily reset to following timestamp`);
_(`Motion change recommendation created`);
_(`Motion change recommendation updated`);
_(`Motion change recommendation deleted`);
_(`Poll created`);
_(`Poll updated`);
_(`Poll deleted`);
_(`Comment {} created`);
_(`Comment {} updated`);
_(`Comment {} deleted`);
_(`Comment created`);
_(`Comment updated`);
_(`Comment deleted`);

// core misc strings
_(`items per page`);
_(`Tag`);
_(`Not allowed in demo mode`);

// strings which are not extracted as translateable strings from client code
_(`Foreground color`);
_(`Background color`);
_(`Header background color`);
_(`Header font color`);
_(`Headline color`);
_(`Chyron background color`);
_(`Chyron font color`);
_(`Show full text`);
_(`Hide more text`);
_(`Show password`);
_(`Hide password`);
_(`result`);
_(`results`);
_(`Voting`);
_(`Speaking time`);

// organization strings
_(`Administrator`);
_(`Default committee`);
_(`Default meeting`);
_(`Assigned accounts`);
_(`Amount of meetings`);
_(`Amount of accounts`);
