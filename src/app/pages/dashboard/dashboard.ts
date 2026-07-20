import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ChartModule,
    SelectButtonModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {

  period = 'Month';

  periods = [
    { label: 'Week', value: 'Week' },
    { label: 'Month', value: 'Month' },
    { label: 'Year', value: 'Year' }
  ];

  summary = {
    totalTasks: 154,
    pendingTasks: 24,
    completedTasks: 130,
    revenue: 248300
  };

  priorityTasks = [
    {
      orderNo: 'ORD-101',
      customer: 'ABC Industries',
      task: 'Factory Electrical Work',
      amount: 85000,
      due: 'Today',
      priority: 'High'
    },
    {
      orderNo: 'ORD-102',
      customer: 'XYZ Pvt Ltd',
      task: 'Office Installation',
      amount: 65000,
      due: 'Tomorrow',
      priority: 'High'
    },
    {
      orderNo: 'ORD-103',
      customer: 'Rahul Traders',
      task: 'Maintenance',
      amount: 42000,
      due: '3 Days',
      priority: 'Medium'
    },
    {
      orderNo: 'ORD-104',
      customer: 'Sharma & Sons',
      task: 'Repair',
      amount: 18000,
      due: '5 Days',
      priority: 'Low'
    }
  ];

  pendingPayments = [
    {
      invoice: 'INV-001',
      customer: 'ABC Industries',
      amount: 42000,
      dueDate: '12 Jul',
      late: '8 Days'
    },
    {
      invoice: 'INV-002',
      customer: 'XYZ Pvt Ltd',
      amount: 38000,
      dueDate: '14 Jul',
      late: '6 Days'
    },
    {
      invoice: 'INV-003',
      customer: 'Rahul Traders',
      amount: 15000,
      dueDate: '16 Jul',
      late: '4 Days'
    },
    {
      invoice: 'INV-004',
      customer: 'Sharma & Sons',
      amount: 11000,
      dueDate: '18 Jul',
      late: '2 Days'
    }
  ];

  revenueChartData: any;

  revenueChartOptions: any;

  taskChartData: any;

  taskChartOptions: any;

  constructor() {
    this.initializeCharts();
  }

  initializeCharts() {

    this.revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [120000, 145000, 170000, 160000, 220000, 248300],
          tension: .4,
          fill: false
        }
      ]
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    this.taskChartData = {
      labels: ['Completed', 'Pending', 'In Progress'],
      datasets: [
        {
          data: [130, 24, 18]
        }
      ]
    };

    this.taskChartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

  }

  getSeverity(priority: string) {

    switch (priority) {

      case 'High':
        return 'danger';

      case 'Medium':
        return 'warn';

      default:
        return 'success';

    }

  }

}