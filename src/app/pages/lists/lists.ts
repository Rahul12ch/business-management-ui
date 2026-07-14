import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TaskService } from '../../services/task';
import { CustomerService } from '../../services/customer';
import { InvoiceService } from '../../services/invoice';
import { Notification } from '../../services/notification';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, TagModule,
    InputTextModule, IconFieldModule, InputIconModule, PaginatorModule,
    DialogModule, ConfirmDialogModule, SelectModule, DatePickerModule,
    ToggleSwitchModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './lists.html',
  styleUrl: './lists.css'
})
export class ListsComponent implements OnInit, OnDestroy {

  private subs = new Subscription();

  tasks: any[] = [];
  customers: any[] = [];
  taskSearch = '';
  customerSearch = '';

  taskPage = 1;
  taskPageSize = 5;
  taskTotalRecords = 0;

  customerPage = 1;
  customerPageSize = 5;
  customerTotalRecords = 0;

  selectedTask: any = null;
  selectedCustomer: any = null;
  customerLinkedTasks: any[] = [];
  taskDialog = false;
  customerDialog = false;

  editTaskDialog = false;
  isSavingTask = false;
  editTask_form: any = {};
  editTask_workDetails: any[] = [];
  editTask_payment = { paymentMode: 'Cash', paidAmount: 0, balanceAmount: 0, paymentStatus: 'Pending' };

  editCustomerDialog = false;
  isSavingCustomer = false;
  editCustomer_form: any = {};
  customerSubmitted = false;

  statusOptions = [
    { label: 'Pending',     value: 'Pending'     },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed',   value: 'Completed'   }
  ];

  paymentModeOptions = [
    { label: 'Cash',          value: 'Cash'          },
    { label: 'UPI',           value: 'UPI'           },
    { label: 'Bank Transfer', value: 'Bank Transfer' },
    { label: 'Cheque',        value: 'Cheque'        }
  ];

  constructor(
    private taskService: TaskService,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notification: Notification
  ) {}

  ngOnInit(): void { this.loadTasks(); this.loadCustomers(); }

  ngOnDestroy(): void { this.subs.unsubscribe(); }

  loadTasks(): void { const sub = this.taskService .getTasks(this.taskSearch, this.taskPage, this.taskPageSize) .subscribe({ next: (res: any) => {
          this.tasks = [...(res.data ?? [])]; this.taskTotalRecords = res.totalRecords ?? this.tasks.length;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error('Failed to load tasks', err);
          this.tasks = [];
        }});
    this.subs.add(sub);
  }

  loadCustomers(): void { const sub = this.customerService .getCustomers(this.customerSearch, this.customerPage, this.customerPageSize) .subscribe({ next: (res: any) => {
          this.customers = [...(res.data ?? [])]; this.customerTotalRecords = res.totalRecords ?? this.customers.length;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error('Failed to load customers', err);
          this.customers = [];
        }});
    this.subs.add(sub);
  }

  searchTasks(): void    { this.taskPage = 1;     this.loadTasks();     }
  searchCustomers(): void { this.customerPage = 1; this.loadCustomers(); }

  onTaskPageChange(event: any): void { this.taskPage = event.page + 1; this.taskPageSize = event.rows;
    this.loadTasks(); }

  onCustomerPageChange(event: any): void { this.customerPage = event.page + 1; this.customerPageSize = event.rows;
    this.loadCustomers();}

  viewTask(task: any): void {const sub = this.taskService.getTask(task.taskId).subscribe({  next: (res: any) => { this.selectedTask = res.data ?? res;
        setTimeout(() => { this.taskDialog = true;
          this.cdr.detectChanges();
        }); },
      error: () => {this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load task details.' });
      }});
    this.subs.add(sub);
  }

  viewCustomer(customer: any): void { this.selectedCustomer = customer; this.customerLinkedTasks = this.tasks.filter(
      t => t.customerId === customer.customerId ||  t.customerName?.toLowerCase().trim() === customer.customerName?.toLowerCase().trim() );
    setTimeout(() => { this.customerDialog = true;
      this.cdr.detectChanges();
    });
  }

  openEditTask(task: any): void {
    const sub = this.taskService.getTask(task.taskId).subscribe({ next: (res: any) => {
        const t = res.data ?? res;
        this.editTask_form = { taskId:  t.taskId, customerId:  t.customerId,
          taskName:   t.taskName, status:   t.status   ?? 'Pending',
          dueDate:      t.dueDate ? new Date(t.dueDate) : null,  subTotal:  t.subTotal ?? 0,
          isGstApplied: t.isGstApplied ?? false, gstPercent:  t.gstPercent ?? 18,
          gstAmount:  t.gstAmount  ?? 0, grandTotal:  t.grandTotal ?? 0, customerName: t.customerName };

        const details = t.taskDetails ?? t.workDetails ?? [];
        this.editTask_workDetails = details.length > 0 ? details.map((w: any) => ({ ...w })) : [{ description: '', qty: 1, rate: 0, amount: 0 }];

        this.editTask_payment = { paymentMode:   t.paymentMode   ?? 'Cash', paidAmount:    t.paidAmount    ?? 0,
          balanceAmount: t.balance       ?? 0, paymentStatus: t.paymentStatus ?? 'Pending'
        };
         setTimeout(() => { this.editTaskDialog = true;
          this.cdr.detectChanges();
        });
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load task.' });
      }});
    this.subs.add(sub);
  }

  addEditTaskRow(): void { this.editTask_workDetails.push({ description: '', qty: 1, rate: 0, amount: 0 }); }

  removeEditTaskRow(i: number): void { if (this.editTask_workDetails.length === 1) return;
    this.editTask_workDetails.splice(i, 1);
    this.calculateEditTaskTotal();
  }

  calculateEditTaskRow(item: any): void { item.amount = (item.qty ?? 0) * (item.rate ?? 0);
    this.calculateEditTaskTotal();
  }

  calculateEditTaskTotal(): void {
    const sub = this.editTask_workDetails.reduce((s, w) => s + (w.amount ?? 0), 0); this.editTask_form.subTotal  = sub;
    const gst = this.editTask_form.isGstApplied ? +(sub * (this.editTask_form.gstPercent ?? 18) / 100).toFixed(2) : 0;
    this.editTask_form.gstAmount  = gst; this.editTask_form.grandTotal = +(sub + gst).toFixed(2);
    this.calculateEditTaskBalance();
  }

  onEditTaskGstChange(): void { this.calculateEditTaskTotal(); }

  calculateEditTaskBalance(): void { const bal = this.editTask_form.grandTotal - (this.editTask_payment.paidAmount ?? 0);
   this.editTask_payment.balanceAmount = +bal.toFixed(2);
    const paid  = this.editTask_payment.paidAmount  ?? 0; const grand = this.editTask_form.grandTotal      ?? 0;
    this.editTask_payment.paymentStatus =
      paid <= 0      ? 'Pending' :  paid < grand   ? 'Partial' : 'Paid'; }

  saveEditTask(): void {
    if (!this.editTask_form.taskName?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Task name is required.' });
      return; }
    if (!this.editTask_form.customerId) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Customer is missing. Please reopen the task.' });
      return; }
    this.isSavingTask = true;
    const payload = { taskId:        this.editTask_form.taskId,  customerId:    this.editTask_form.customerId,
      taskName:      this.editTask_form.taskName,  status:        this.editTask_form.status,
      dueDate:       this.editTask_form.dueDate, subTotal:      this.editTask_form.subTotal,
      isGstApplied:  this.editTask_form.isGstApplied, gstPercent:    this.editTask_form.gstPercent,
      gstAmount:     this.editTask_form.gstAmount, grandTotal:    this.editTask_form.grandTotal,
      totalAmount:   this.editTask_form.grandTotal, workDetails:   this.editTask_workDetails,
      paidAmount:    this.editTask_payment.paidAmount, balance:       this.editTask_payment.balanceAmount,
      paymentMode:   this.editTask_payment.paymentMode, paymentStatus: this.editTask_payment.paymentStatus };
    const sub = this.taskService.updateTask(this.editTask_form.taskId, payload).subscribe({ next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Task updated successfully.' });
        this.editTaskDialog = false; this.isSavingTask   = false;
        this.loadTasks(); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update task.' });
        this.isSavingTask = false;
      }});
    this.subs.add(sub);
  }

  openEditCustomer(customer: any): void {
    const sub = this.customerService.getCustomer(customer.customerId).subscribe({ next: (res: any) => {
        const c = res.data ?? res;  this.editCustomer_form = { customerId:  c.customerId, customerName: c.customerName, phoneNumber: c.phoneNumber, email: c.email, address: c.address };
        this.customerSubmitted = false;
        setTimeout(() => { this.editCustomerDialog = true; this.cdr.detectChanges();
        });
       },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load customer.' });
      }});
    this.subs.add(sub);
  }

  isValidPhone(phone: string): boolean { return /^[6-9]\d{9}$/.test((phone ?? '').replace(/\s/g, ''));}
  isValidEmail(email: string): boolean { return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.(com|in|org|net|edu|gov|co\.in)$/.test((email ?? '').trim()); }

  saveEditCustomer(): void { this.customerSubmitted = true;
    if (!this.editCustomer_form.customerName?.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Customer name is required.' });
      return; }
    if (!this.isValidPhone(this.editCustomer_form.phoneNumber)) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Enter a valid 10-digit phone number.' });
      return; }
    if (this.editCustomer_form.email?.trim() && !this.isValidEmail(this.editCustomer_form.email)) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Enter a valid email address.' });
      return; }
    this.isSavingCustomer = true;

    const sub = this.customerService .updateCustomer(this.editCustomer_form.customerId, this.editCustomer_form).subscribe({ next: () => {
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Customer updated successfully.' });
          this.editCustomerDialog = false; this.customerSubmitted  = false; this.isSavingCustomer   = false;
          this.loadCustomers(); },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update customer.' });
          this.isSavingCustomer = false;
        }});
    this.subs.add(sub);
  }

  deleteTask(id:number):void { this.confirmationService.confirm({
 header:'Delete Task', message:'Are you sure you want to delete this task?', icon:'pi pi-exclamation-triangle', 
 acceptLabel:'Yes', rejectLabel:'No', acceptButtonStyleClass:'p-button-primary', rejectButtonStyleClass:'p-button-primary',
 accept:()=>{ const sub=this.taskService.deleteTask(id) .subscribe(()=>this.loadTasks());
 this.subs.add(sub); }});
}
deleteCustomer(customer: any): void {
  const linkedTasks = this.tasks.filter(t => t.customerId === customer.customerId || t.customerName?.trim().toLowerCase() === customer.customerName?.trim().toLowerCase() );
  const taskCount = linkedTasks.length; const message = taskCount > 0 ? `Removing this customer will delete ${taskCount} related task(s).
Are you sure you want to delete this customer?` : 'Are you sure you want to delete this customer?';
  this.confirmationService.confirm({
 header: 'Delete Customer', message, icon: 'pi pi-exclamation-triangle', acceptLabel: 'Yes', rejectLabel: 'No', acceptButtonStyleClass: 'p-button-primary', rejectButtonStyleClass: 'p-button-primary',
    accept: () => { const sub = this.customerService .deleteCustomer(customer.customerId) .subscribe({ next: (res:any) => {
          this.messageService.add({  severity:'success', summary:'Deleted', detail:res.message });
          this.loadCustomers();
          this.loadTasks(); },
    error: () => { this.messageService.add({ severity:'error', summary:'Error', detail:'Failed to delete customer.' }); }
      });
      this.subs.add(sub);
    }});
}
  generateInvoicePdf(task: any): void { this.invoiceService.downloadInvoice(task.taskId); }
}