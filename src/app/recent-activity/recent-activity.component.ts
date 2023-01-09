import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecentActivityComponent implements OnInit, OnDestroy {
  public dataSource: Record<string, any>[];
  public interval: any;

  constructor(private dataService: DataService) {
    this.dataSource = this.dataService.getActivityData();
  }

  public ngOnInit(): void {
    this.updateTimeString();
    this.interval = setInterval(() => { this.updateTimeString(); }, 60000);
  }

  public ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  private updateTimeString(): void {
    this.dataSource.map((item: Record<string, any>) => {
      item['Time'] = this.timeSince(item['ActivityTime'] as Date);
    });
  }

  private timeSince(activityTime: Date): string {
    const seconds: number = Math.floor((new Date().getTime() - activityTime.getTime()) / 1000);
    let interval: number = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + ' years ago';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + ' months ago';
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + ' days ago';
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + ' hours ago';
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
  }
}
