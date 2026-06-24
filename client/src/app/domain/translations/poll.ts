import { _ } from '@ngx-translate/core';

export default {
    'poll_option.yes': _(`Yes`),
    'poll_option.no': _(`No`),
    'poll_option.abstain': _(`Abstain`),
    'poll_visibility.manually': _(`Analog`),
    'poll_visibility.open': _(`Open`),
    'poll_visibility.secret': _(`Secret`),
    'poll_visibility.named': _(`Named`),
    'poll_state.created': _(`created`),
    'poll_state.started': _(`started`),
    'poll_state.finished': _(`finished`),
    'poll_state_change_action.created': _(`Reset`),
    'poll_state_change_action.started': _(`Start voting`),
    'poll_state_change_action.finished': _(`Stop voting`),
    'poll_state_change_action.published': _(`Publish`),
    'poll_percent_base.no_general': _(`Sum of votes without general options`),
    'poll_percent_base.yes_no': _(`Yes/No`),
    'poll_percent_base.YNA': _(`Yes/No/Abstain`), // TODO: Key incorrect
    'poll_percent_base.valid': _(`All valid ballots`),
    'poll_percent_base.cast': _(`All casted ballots`),
    'poll_percent_base.entitled': _(`All entitled users`),
    'poll_percent_base.entitled_present': _(`Present entitled users`),
    'poll_percent_base.disabled': _(`Disabled (no percents)`)
};
