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
_(`Live conference has to be active. Choose 0 to disable auto connect.`);
_(
    `Dear {name},\n\nthis is your personal OpenSlides login:\n\n{url}\nUsername: {username}\nPassword: {password}\n\n\nThis email was generated automatically.`
);

// Default model names
// Projectors
_(`Default projector`);
// Simple workflow
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
// Complex workflow
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
// Default groups
_(`Default`);
_(`Admin`);
_(`Delegates`);
_(`Staff`);
_(`Committees`);
// Default users
_(`Administrator`);
// Countdowns
_(`Voting`);
_(`Speaking time`);

// Backend error messages
// Workflows
_(`You cannot delete the last workflow of a meeting.`);
_(
    `You cannot delete the workflow as long as it is selected as default workflow for new motions in the settings. Please set another workflow as default in the settings and try to delete the workflow again.`
);
// Motions
_(`Reason is required`);
// Polls
_(`Anonymizing can only be done after finishing a poll.`);
_(`You can only anonymize named polls.`);
_(`You cannot vote since your vote right is delegated.`);
// Users
_(`Username or password is incorrect.`);
_(`The account is deactivated.`);
_(`You cannot delete yourself.`);

// ** History **
// actual history entries
_(`Motion created`);
_(`Motion deleted`);
_(`Origin motion deleted`);
_(`Forwarded motion deleted`);
_(`Motion updated`);
_(`Forwarding created`);
_(`Submitters changed`);
_(`Supporters changed`);
_(`State set to {}`);
_(`Recommendation set to {}`);
_(`Recommendation reset`);
_(`Category set to {}`);
_(`Category removed`);
_(`Motion block set to {}`);
_(`Motion block removed`);
_(`Recommendation reset`);
_(`Voting created`);
_(`Voting started`);
_(`Voting stopped`);
_(`Voting published`);
_(`Voting stopped/published`);
_(`Voting deleted`);
_(`Voting reset`);
_(`Voting anonymized`);
_(`Number set`);
_(`Motion change recommendation created`);
_(`Motion change recommendation updated`);
_(`Motion change recommendation deleted`);
_(`Forwarded to {}`);
_(`Motion created (forwarded)`);
_(`Ballot started`);
_(`Ballot updated`);
_(`Ballot created`);
_(`Ballot stopped`);
_(`Ballot anonymized`);
_(`Ballot published`);
_(`Ballot stopped/published`);
_(`Ballot deleted`);
_(`Ballot reset`);
_(`Comment {} created`);
_(`Comment {} updated`);
_(`Comment {} deleted`);
_(`Comment created`);
_(`Comment updated`);
_(`Comment deleted`);
_(`Candidate added`);
_(`Candidate removed`);
_(`Password changed`);
_(`Set present in meeting {}`);
_(`Set not present in meeting {}`);
_(`Personal data changed`);
_(`Participant created`);
_(`Participant created in meeting {}`);
_(`Participant deleted`);
_(`Participant deleted in meeting {}`);
_(`Participant data updated in meeting {}`);
_(`Participant data updated in multiple meetings`);
_(`Participant added to group {} in meeting {}`);
_(`Participant added to multiple groups in meeting {}`);
_(`Participant added to multiple groups in multiple meetings`);
_(`Participant removed from group {} in meeting {}`);
_(`Participant removed from multiple groups in meeting {}`);
_(`Participant removed from multiple groups in multiple meetings`);
_(`Groups changed in meeting {}`);
_(`Groups changed in multiple meetings`);
_(`Committee Management Level changed`);
_(`Organization Management Level changed`);
_(`Set active`);
_(`Set inactive`);
// Deprecated entries, might still be in the database
_(`State changed`);
_(`Recommendation changed`);
_(`Category changed`);
_(`Motion block changed`);
_(`Recommendation changed`);
_(`created`);
_(`updated`);
_(`deleted`);
_(`reset`);
_(`started`);
_(`stopped`);
_(`anonymized`);

// strings which are not extracted as translateable strings from client code

// organization strings
_(`Amount of meetings`);
_(`Amount of accounts`);
