import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class Notification {
  private readonly apiUrl = `${environment.apiUrl}/Notifications`;
  constructor(  private http: HttpClient ) { }

  getNotifications(): Observable<any[]> { return this.http.get<any[]>( this.apiUrl);}

  getUnreadCount(): Observable<number> { return this.http.get<number>(  `${this.apiUrl}/unread-count`);}

  markAsRead(id: number): Observable<any> { return this.http.put( `${this.apiUrl}/${id}/read`, {});}

  markAllRead(): Observable<any> { return this.http.put( `${this.apiUrl}/read-all`, {}); }

  deleteNotification(id: number): Observable<any> { 
    return this.http.delete( `${this.apiUrl}/${id}`); }

  clearNotifications(): Observable<any> {
    return this.http.delete( `${this.apiUrl}/clear`); }
}