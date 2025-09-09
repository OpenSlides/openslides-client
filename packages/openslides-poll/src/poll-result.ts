import { Poll, PollOption, PollVote } from "./models/poll";

export class PollResult {
  constructor(private poll: Poll, private options: PollOption[], private votes: PollVote[]) {}
}
