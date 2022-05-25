import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TopicPollModule } from './modules/topic-poll/topic-poll.module';
import { TopicsRoutingModule } from './topics-routing.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, TopicsRoutingModule, TopicPollModule]
})
export class TopicsModule {}
