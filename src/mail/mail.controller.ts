import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MailService } from './mail.service';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a test email using a template' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', example: 'test@example.com' },
        template: {
          type: 'string',
          enum: [
            'activation',
            'confirm-new-email',
            'reset-password',
            'lesson-scheduled',
            'course-created',
            'user-registered',
          ],
        },
      },
      required: ['to', 'template'],
    },
  })
  async sendTestEmail(@Body() body: { to: string; template: string }) {
    const { to, template } = body;

    try {
      switch (template) {
        case 'activation':
          await this.mailService.userSignUp({
            to,
            data: { hash: 'test-hash-123' },
          });
          break;
        case 'confirm-new-email':
          await this.mailService.confirmNewEmail({
            to,
            data: { hash: 'test-hash-456' },
          });
          break;
        case 'reset-password':
          await this.mailService.forgotPassword({
            to,
            data: { hash: 'test-hash-789', tokenExpires: Date.now() + 3600000 },
          });
          break;
        case 'lesson-scheduled':
          await this.mailService.lessonScheduled({
            to,
            data: {
              courseName: 'Introduction to Web Development',
              instructorName: 'John Doe',
              lessonDate: 'November 15, 2025',
              lessonTime: '10:00 AM EST',
              duration: 60,
              googleMeetLink: 'https://meet.google.com/abc-defg-hij',
            },
          });
          break;
        case 'course-created':
          await this.mailService.courseCreated({
            to,
            data: {
              courseTitle: 'Advanced JavaScript Programming',
              instructorName: 'Jane Smith',
              description:
                'Learn advanced JavaScript concepts including async/await, closures, and design patterns.',
              price: 99.99,
              courseUrl: 'http://localhost:3000/courses/test-course-123',
            },
          });
          break;
        case 'user-registered':
          await this.mailService.userRegistered({
            to,
            data: {
              userName: 'John Smith',
              userEmail: 'john.smith@example.com',
              userRole: 'Student',
              registrationDate: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
            },
          });
          break;
        default:
          throw new Error(
            'Invalid template. Use: activation, confirm-new-email, reset-password, lesson-scheduled, course-created, or user-registered',
          );
      }
      return {
        success: true,
        message: `Test email sent to ${to} using template: ${template}`,
        note: 'Check Maildev at http://localhost:1080 to view the email',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send email',
        error: error.message,
      };
    }
  }
}
