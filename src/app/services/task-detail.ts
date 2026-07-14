import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class TaskDetailService {
  private apiUrl = `${environment.apiUrl}/TaskDetails`;
  constructor( private http: HttpClient ) {}

  addTaskDetail(data: any): Observable<any> { return this.http.post( this.apiUrl, data );}

  addTaskDetails(data: any[] ): Observable<any> { return this.http.post( `${this.apiUrl}/bulk`,data );
}}