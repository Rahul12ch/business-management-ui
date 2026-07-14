import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/Payments`;
  constructor(private http: HttpClient) {}

  getPayments( search: string = '', page: number = 1, pageSize: number = 10): Observable<any> {
   let params = new HttpParams() .set('search', search).set('page', page).set('pageSize', pageSize);
  return this.http.get<any>( this.apiUrl, { params });
  }
  getPayment(id: number): Observable<any> { return this.http.get<any>( `${this.apiUrl}/${id}`);}

  addPayment(payment: any): Observable<any> { return this.http.post(this.apiUrl,payment);}

  updatePayment( id: number, payment: any): Observable<any> { return this.http.put(`${this.apiUrl}/${id}`,payment);} 

  deletePayment(id: number): Observable<any> { return this.http.delete( `${this.apiUrl}/${id}`);
}}