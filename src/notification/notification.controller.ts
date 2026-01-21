import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiCreatedResponse({
    description: 'Notification created successfully',
  })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiOkResponse({
    description: 'List of all notifications',
  })
  async findAll() {
    return this.notificationService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all notifications for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({
    description: 'List of notifications for the user',
  })
  async findAllForUser(@Param('userId') userId: string) {
    return this.notificationService.findAllForUser(userId);
  }

  @Get('unread-count/:userId')
  @ApiOperation({ summary: 'Get unread notification count for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({
    description: 'Unread notification count',
    schema: {
      example: {
        count: 5,
      },
    },
  })
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiOkResponse({
    description: 'Notification details',
  })
  async findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })

  @ApiOkResponse({
    description: 'Notification marked as reads',
  })
  async markAsRead(@Req() req, @Param('id') id: string) {
    const userId = req.user?.id;
    return this.notificationService.markAsRead(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
 
  @ApiOkResponse({
    description: 'All notifications marked as read',
    schema: {
      example: {
        message: 'All notifications marked as read',
        modifiedCount: 10,
      },
    },
  })
  async markAllAsRead(@Req() req) {
    const userId = req.user?.id;
    console.log(userId);
    return this.notificationService.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiQuery({ name: 'userId', description: 'User ID', required: true })
  @ApiOkResponse({
    description: 'Notification deleted successfully',
    schema: {
      example: {
        message: 'Notification deleted successfully',
      },
    },
  })
  async remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.notificationService.remove(id, userId);
  }
}
