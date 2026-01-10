import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Equipment } from './models';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  // côté navigateur, "localhost" est OK
  private api = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  list(params?: { type?: string; status?: string }) {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    const q = qs.toString() ? `?${qs.toString()}` : '';
    return this.http.get<Equipment[]>(`${this.api}/equipment${q}`);
  }

  create(e: { name: string; type: string; status: string; owner: string }) {
    return this.http.post<Equipment>(`${this.api}/equipment`, e);
  }

  setStatus(id: number, status: string) {
    return this.http.patch<Equipment>(`${this.api}/equipment/${id}/status?status=${encodeURIComponent(status)}`, {});
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/equipment/${id}`);
  }
}
