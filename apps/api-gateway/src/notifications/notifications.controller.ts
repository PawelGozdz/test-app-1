import {  Controller, Get } from '@nestjs/common';
import { Observable } from 'rxjs';

import { NotificationsService } from './notifications.service';

@Controller('/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/health')
  healthCheck(): Observable<{ status: 'UP' | 'DOWN' }> {
    return this.notificationsService.getHealth();
  }
}
