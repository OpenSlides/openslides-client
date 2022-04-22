import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TopicsRoutingModule } from './topics-routing.module';
import { TopicPollModule } from './modules/topic-poll/topic-poll.module';

@NgModule({
    declarations: [],
    imports: [CommonModule, TopicsRoutingModule, TopicPollModule]
})
export class TopicsModule {}
