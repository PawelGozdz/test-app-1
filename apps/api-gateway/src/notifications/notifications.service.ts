import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Apps, ITCPRequest, TCPPatterns } from '@libs/common';
import { Observable } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(Apps.NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
  ) {}

  getHealth(): Observable<{ status: 'UP' | 'DOWN' }> {
    const pattern = TCPPatterns.HEALTH_CHECK;
    const payload: ITCPRequest<{}> = {
      data: {
      },
      _metadata: {},
    };

    return this.notificationsService.send<{ status: 'UP' | 'DOWN' }>(
      pattern,
      payload,
    );
  }
}
