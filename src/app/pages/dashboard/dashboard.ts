import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports:[CommonModule,FormsModule,CardModule,TableModule,ButtonModule,TagModule,ChartModule,SelectButtonModule],
  templateUrl:'./dashboard.html',
  styleUrls:['./dashboard.css']
})
export class DashboardComponent implements OnInit{

  loading=false;
  username='';
  period='Month';

  periods=[
    {label:'Week',value:'Week'},
    {label:'Month',value:'Month'},
    {label:'Year',value:'Year'}
  ];

  summary:any={};
  priorityTasks:any[]=[];
  pendingPayments:any[]=[];
  revenueChartData:any;
  revenueChartOptions:any;
  taskChartData:any;
  taskChartOptions:any;

  constructor(private dashboardService:DashboardService){}

  ngOnInit():void{
    this.username=localStorage.getItem('username')??'User';
    this.loadDashboard();
  }

  loadDashboard():void{
    this.loading=true;
    this.dashboardService.getDashboard(this.period).subscribe({
      next:data=>{
        this.summary=data.summary;
        this.priorityTasks=data.priorityTasks;
        this.pendingPayments=data.recentPayments;
        this.buildRevenueChart(data.revenueChart);
        this.buildTaskChart(data.taskChart);
        this.loading=false;
      },
      error:err=>{
        console.error(err);
        this.loading=false;
      }
    });
  }

  buildRevenueChart(chart:any[]):void{
    this.revenueChartData={
      labels:chart.map(x=>x.month),
      datasets:[{label:'Revenue',data:chart.map(x=>x.revenue),tension:.4,fill:false}]
    };
    this.revenueChartOptions={responsive:true,maintainAspectRatio:false};
  }

  buildTaskChart(chart:any[]):void{
    this.taskChartData={
      labels:chart.map(x=>x.status),
      datasets:[{data:chart.map(x=>x.count)}]
    };
    this.taskChartOptions={
      responsive:true,
      maintainAspectRatio:false,
      plugins:{legend:{position:'bottom'}}
    };
  }

  refresh(){this.loadDashboard();}

  getSeverity(status:string):'success'|'warn'|'danger'{
    switch(status){
      case'Completed':return'success';
      case'Pending':return'warn';
      default:return'danger';
    }
  }
}