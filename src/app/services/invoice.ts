import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService { 
  private readonly apiUrl = `${environment.apiUrl}/Invoice`;
  
  constructor( private http: HttpClient ) {}

  downloadInvoice(taskId: number): void { this.http.get( `${this.apiUrl}/${taskId}/pdf`,
   { responseType: 'blob' } ) .subscribe({  next: (pdf) => {
 const file = new Blob( [pdf], { type: 'application/pdf' });
 const url =  window.URL.createObjectURL(file);
 const link = document.createElement('a');
 link.href = url;
 
 link.download = `Invoice-${taskId}.pdf`; link.click(); window.URL.revokeObjectURL(url); },
 error: (err) => { console.error('Invoice download failed', err ); }});
 }
}