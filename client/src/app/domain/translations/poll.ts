import { _ } from '@ngx-translate/core';

export default {
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
    'poll_percent_base.Y': _(`Sum of votes without general options`), // TODO: Key incorrect
    'poll_percent_base.YN': _(`Yes/No`), // TODO: Key incorrect
    'poll_percent_base.YNA': _(`Yes/No/Abstain`), // TODO: Key incorrect
    'poll_percent_base.valid': _(`All valid ballots`),
    'poll_percent_base.cast': _(`All casted ballots`),
    'poll_percent_base.entitled': _(`All entitled users`),
    'poll_percent_base.entitled_present': _(`Present entitled users`),
    'poll_percent_base.disabled': _(`Disabled (no percents)`)
};
