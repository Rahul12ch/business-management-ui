import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CustomerService } from '../../services/customer';
import { TaskService } from '../../services/task';
import { TaskDetailService } from '../../services/task-detail';
import { PaymentService } from '../../services/payment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, DatePickerModule, ToggleSwitchModule, ToastModule],
  providers: [MessageService],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  customers: any[] = [];
  customerOptions: any[] = [];
  selectedCustomerId: number | null = null;
  selectedCustomer: any = null;
  showNewCustomerForm = false;
  isSaving = false;
  submitted = false;
  customerSubmitted = false;
  nextOrderLabel = 'Auto';
  newCustomer = { customerName: '', phoneNumber: '', email: '', address: '' };
  
  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ];
  paymentModeOptions = [
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Bank Transfer', value: 'Bank Transfer' }
  ];

  task = {
    taskName: '', dueDate: null as Date | null, status: 'Pending',
   subTotal: 0, isGstApplied: true, gstPercent: 18,
    gstAmount: 0, grandTotal: 0, totalAmount: 0 };

  workDetails: any[] = [{ description: '', qty: 1, rate: 0, amount: 0 }];
  payment = { paidAmount: 0, balanceAmount: 0, paymentMode: 'Cash', paymentStatus: 'Pending' };

  constructor(
    private customerService: CustomerService,
    private taskService: TaskService,
    private taskDetailService: TaskDetailService,
    private paymentService: PaymentService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef ) { }

  ngOnInit(): void {
    this.loadCustomers();
    this.previewNextOrderNo(); }

  previewNextOrderNo(): void {
    setTimeout(() => {
      this.taskService.getNextOrderNo().subscribe({ next: (res: any) => {
          this.nextOrderLabel = String(res.nextOrderNo ?? res); this.cdr.markForCheck(); },
        error: () => { this.nextOrderLabel = 'Auto'; this.cdr.markForCheck();
        } });
    }, 0);
  }

  loadCustomers(): void {
    this.customerService.getCustomers('', 1, 100).subscribe({ next: (res: any) => {
        setTimeout(() => {
          this.customers = res.data ?? res;
          this.buildCustomerOptions();
          this.cdr.markForCheck();
        }, 0);},
         error: (err) => console.error('Failed to load customers', err)
    });}

  buildCustomerOptions(): void {
    this.customerOptions = this.customers.map((c: any) => ({
      label: c.customerName, value: c.customerId
    }));
  }

  onCustomerChange(): void {
    this.selectedCustomer = this.customers.find(x => x.customerId == this.selectedCustomerId) ?? null;
    if (this.selectedCustomer) this.showNewCustomerForm = false;
  }

  toggleNewCustomerForm(): void {
    this.showNewCustomerForm = !this.showNewCustomerForm;
    if (this.showNewCustomerForm) {
      this.newCustomer = { customerName: '', phoneNumber: '', email: '', address: '' };
      this.selectedCustomerId = null;
      this.selectedCustomer = null;
      this.customerSubmitted = false;
}}

  cancelNewCustomer(): void {
    this.showNewCustomerForm = false;
    this.customerSubmitted = false;
    this.newCustomer = { customerName: '', phoneNumber: '', email: '', address: '' };
  }

  isValidEmail(email: string): boolean { return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.(com|in|org|net|edu|gov|co\.in|gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/.test(email.trim()); }
  isValidPhone(phone: string): boolean { return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));}

  get customerNameError(): string {
    if (!this.customerSubmitted) return '';
    if (!this.newCustomer.customerName?.trim()) return 'Customer name is required.';
    return '';
  }

  get customerPhoneError(): string {
    if (!this.customerSubmitted) return '';
    if (!this.newCustomer.phoneNumber?.trim()) return 'Phone number is required.';
    if (!this.isValidPhone(this.newCustomer.phoneNumber)) return 'Enter a valid 10-digit Indian mobile number.';
    return '';
  }

 get customerEmailError(): string {
  if (!this.customerSubmitted) return '';
  if (this.newCustomer.email?.trim() && !this.isValidEmail(this.newCustomer.email)) return 'Enter a valid email (e.g. name@gmail.com)';
  return '';
}

  get taskNameError(): string {
    if (!this.submitted) return '';
    if (!this.task.taskName?.trim()) return 'Task name is required.';
    return '';
  }

  get customerSelectError(): string {
    if (!this.submitted) return '';
    if (!this.selectedCustomerId) return 'Please select a customer.';
    return '';
  }

  saveNewCustomer(): void {
    this.customerSubmitted = true;
    if (this.customerNameError || this.customerPhoneError || this.customerEmailError) return;

    const payload = { customerName: this.newCustomer.customerName.trim(), phoneNumber: this.newCustomer.phoneNumber.trim(),
      email: this.newCustomer.email.trim(), address: this.newCustomer.address.trim() };

    this.customerService.addCustomer(payload).subscribe({
      next: (created: any) => {
        this.customers.push(created); this.buildCustomerOptions(); this.selectedCustomerId = created.customerId;
        this.selectedCustomer = created; this.showNewCustomerForm = false; this.customerSubmitted = false;
        this.messageService.add({ severity: 'success', summary: 'Customer Added', detail: `${created.customerName} saved and selected.` });
      },
      error: (err) => { console.error('Customer save error:', err);
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save customer. Please try again.' });
      }});
  }
  addRow(): void {this.workDetails.push({ description: '', qty: 1, rate: 0, amount: 0 });}
  removeRow(index: number): void {
    if (this.workDetails.length === 1) return;
    this.workDetails.splice(index, 1);
    this.calculateTotal();
  }

  calculateRow(item: any): void {
    item.amount = Number(item.qty || 0) * Number(item.rate || 0);
    this.calculateTotal();
  }

  onGstChange(): void { this.calculateTotal(); }

  calculateTotal(): void {
    this.task.subTotal = this.workDetails.reduce((s, i) => s + Number(i.amount || 0), 0);
    this.task.gstAmount = this.task.isGstApplied ? (this.task.subTotal * (this.task.gstPercent || 0)) / 100 : 0;
    this.task.grandTotal = this.task.subTotal + this.task.gstAmount;
    this.task.totalAmount = this.task.grandTotal;
    this.calculateBalance();
  }

  calculateBalance(): void {
    this.payment.balanceAmount = this.task.grandTotal - (this.payment.paidAmount || 0);
    this.updatePaymentStatus();
  }

  updatePaymentStatus(): void {
    const { balanceAmount: bal, paidAmount: paid } = this.payment;
    const total = this.task.grandTotal;
    if (total === 0) this.payment.paymentStatus = 'Pending';
    else if (bal <= 0) this.payment.paymentStatus = 'Paid';
    else if (paid > 0) this.payment.paymentStatus = 'Partial';
    else this.payment.paymentStatus = 'Pending';
  }

  saveTask(): void {
    this.submitted = true;
    if (!this.selectedCustomerId || !this.task.taskName.trim()) return;
    if (this.isSaving) return;
    this.isSaving = true;

   const taskPayload = {customerId: Number(this.selectedCustomerId),
  taskName: this.task.taskName.trim(), dueDate: this.task.dueDate? new Date(this.task.dueDate).toISOString(): null, status: this.task.status, isGstApplied: this.task.isGstApplied,
  gstPercent: Number(this.task.gstPercent) || 0, gstAmount: Number(this.task.gstAmount) || 0, subTotal: Number(this.task.subTotal) || 0, grandTotal: Number(this.task.grandTotal) || 0,
  totalAmount: Number(this.task.totalAmount) || 0,taskDetails: this.workDetails.map(x => ({ description: x.description || '', qty: Number(x.qty) || 0, rate: Number(x.rate) || 0, amount: Number(x.amount) || 0 }))
};
   console.log('Sending task payload:', JSON.stringify(taskPayload, null, 2)); this.taskService.addTask(taskPayload).subscribe({
      next: (createdTask: any) => { const taskId = createdTask.taskId ?? createdTask.id;
        if (createdTask.orderNo) { this.nextOrderLabel = String(createdTask.orderNo + 1); }
            const paymentPayload = { taskId, amountPaid: Number(this.payment.paidAmount) || 0, paymentMode: this.payment.paymentMode, paymentStatus: this.payment.paymentStatus };
            this.paymentService.addPayment(paymentPayload).subscribe({ next: () => { this.isSaving = false; this.submitted = false;
            this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Service entry saved successfully!' }); this.resetForm(); },
              error: err => { this.isSaving = false; console.error('Payment error:', err);
               this.messageService.add({ severity: 'warn', summary: 'Partial Save', detail: 'Task saved but payment could not be recorded.' });
              }});
         },
      error: err => { this.isSaving = false; console.error('Task error:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Task could not be saved.' });
      }});

  }
  resetForm(): void {
    this.submitted = false; this.customerSubmitted = false; this.selectedCustomerId = null; this.selectedCustomer = null; this.showNewCustomerForm = false;
    this.newCustomer = { customerName: '', phoneNumber: '', email: '', address: '' };
    this.task = { taskName: '', dueDate: null, status: 'Pending', subTotal: 0, isGstApplied: true, gstPercent: 18, gstAmount: 0, grandTotal: 0, totalAmount: 0 };
    this.payment = { paidAmount: 0, balanceAmount: 0, paymentMode: 'Cash', paymentStatus: 'Pending' }; this.workDetails = [{ description: '', qty: 1, rate: 0, amount: 0 }];
    this.previewNextOrderNo();
  }
}