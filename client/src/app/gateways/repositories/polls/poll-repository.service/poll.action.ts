export class PollAction {
    public static readonly CREATE = `poll.create`;
    public static readonly UPDATE = `poll.update`;
    public static readonly DELETE = `poll.delete`;

    public static readonly PUBLISH = `poll.publish`;
    public static readonly RESET = `poll.reset`;
    public static readonly START = `poll.start`;
    public static readonly STOP = `poll.stop`;
    public static readonly ANONYMIZE = `poll.anonymize`;
    public static readonly VOTE = `poll.vote`;
    public static readonly UPDATE_OPTION = `option.update`;
}
