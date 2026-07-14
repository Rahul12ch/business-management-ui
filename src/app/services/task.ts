import { Injectable } from '@angular/core';
import {HttpClient,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class TaskService {
private readonly apiUrl = `${environment.apiUrl}/Tasks`;
constructor( private http: HttpClient) {}

  getTasks( search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams() .set('search', search) .set('page', page) .set('pageSize', pageSize);
    return this.http.get<any>( this.apiUrl, { params } );}

  getTask(id: number ): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}`);}

  addTask( task: any ): Observable<any> { return this.http.post<any>( this.apiUrl, task );}
  
  getNextOrderNo(): Observable<any> { return this.http.get<any>(`${this.apiUrl}/next-order-no`);}
  
  updateTask(id: number, task: any ): Observable<any> { return this.http.put<any>( `${this.apiUrl}/${id}`, task );}

  deleteTask(id: number): Observable<any> { return this.http.delete<any>( `${this.apiUrl}/${id}`);
}}