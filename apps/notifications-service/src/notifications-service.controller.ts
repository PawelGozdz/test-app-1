import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Transport } from '@nestjs/microservices';
import { TCPPatterns } from '@libs/common';


@Controller()
export class NotificationsServiceController {
  constructor(
  ) {}

  @MessagePattern(TCPPatterns.HEALTH_CHECK, Transport.TCP)
  healthCheck(
    @Payload() _data: any
  ) {
    return {
      status: 'UP'
    }
  }
}
