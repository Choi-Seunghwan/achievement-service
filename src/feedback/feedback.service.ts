import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  async sendFeedback(content: string) {
    await this.feedbackRepository.createFeedback({ data: { content } });

    return true;
  }
}
