import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DeliveryDto, DeliveryAgentDto } from '../models/delivery.models';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private base = `${environment.apiUrl}/delivery`;
  private agentBase = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  getByOrder(orderId: string) {
    return this.http.get<DeliveryDto>(`${this.base}/${orderId}`);
  }

  updateLocation(agentId: string, lat: number, lng: number) {
    return this.http.patch(`${this.base}/location`, { agentId, lat, lng });
  }

  complete(orderId: string) {
    return this.http.patch(`${this.base}/${orderId}/complete`, {});
  }

  // Agent profile
  registerAgent(vehicleType: string) {
    return this.http.post<DeliveryAgentDto>(`${this.agentBase}/register`, { vehicleType });
  }

  getMyProfile() {
    return this.http.get<DeliveryAgentDto>(`${this.agentBase}/me`);
  }

  toggleAvailability() {
    return this.http.patch<{ id: string; isAvailable: boolean }>(`${this.agentBase}/me/availability`, {});
  }

  getAllAgents() {
    return this.http.get<DeliveryAgentDto[]>(this.agentBase);
  }
}
