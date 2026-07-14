import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  constructor( private http: HttpClient ) { }

  login(data: any): Observable<any> { return this.http.post
    ( `${this.apiUrl}/login`, data);}
 
  register(data: any): Observable<any> { return this.http.post( `${this.apiUrl}/register`,data );}

  getProfile(): Observable<any> { return this.http.get( `${this.apiUrl}/profile`);}

  updateProfile(data: any): Observable<any> { return this.http.put( `${this.apiUrl}/profile`, data);}

  uploadImage(file: File): Observable<any> { const formData = new FormData(); formData.append('file', file);
    return this.http.post( `${this.apiUrl}/upload-image`, formData );}

  getUsers(): Observable<any> { return this.http.get( this.apiUrl); }

  saveToken(token: string): void { localStorage.setItem('token', token );}

  getToken(): string | null {return localStorage.getItem('token');}

  logout(): void { localStorage.removeItem( 'token'); }

  isLoggedIn(): boolean { return !!this.getToken(); }}