import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { sendFeedbackDto } from './dtos/send-feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('/')
  async sendFeedback(@Body() dto: sendFeedbackDto) {
    await this.feedbackService.sendFeedback(dto.content);
    return true;
  }
}
