import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "./notification.gateway";

@Injectable()
export class NotificationService {
  constructor(
    private readonly gateway: NotificationGateway,
  ) {}

  sendWelcome(data: any) {
   
    this.gateway.server.emit("welcome", data);
  }
}
