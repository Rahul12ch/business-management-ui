import { Injectable } from '@angular/core';
import {HttpClient,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root'})
export class CustomerService {
   private readonly apiUrl = `${environment.apiUrl}/Customers`;
  constructor(private http: HttpClient ) { }

  getCustomers( search: string = '', page: number = 1, pageSize: number = 10
  ): Observable<any> { const params = new HttpParams()
      .set('search', search).set('page', page).set('pageSize', pageSize);
    return this.http.get<any>( this.apiUrl, { params } );}

  getCustomer( id: number): Observable<any> { return this.http.get<any>(`${this.apiUrl}/${id}` );}

  addCustomer(customer: any ): Observable<any> { return this.http.post<any>( this.apiUrl, customer); }

  updateCustomer( id: number, customer: any): Observable<any> { return this.http.put<any>( `${this.apiUrl}/${id}`,  customer);}

  deleteCustomer( id: number ): Observable<any> { return this.http.delete<any>(`${this.apiUrl}/${id}` );
}}