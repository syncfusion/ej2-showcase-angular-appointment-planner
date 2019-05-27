import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-recent-activity',
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RecentActivityComponent implements OnInit, OnDestroy {
  public dataSource: Object;
  public interval: any;

  constructor(private dataService: DataService) {
    this.dataSource = this.dataService.getActivityData();
  }

  ngOnInit() {
    this.updateTimeString();
    this.interval = setInterval(() => {
      this.updateTimeString();
    }, 60000);
  }

  updateTimeString() {
    (<any>this.dataSource).map((item: { [key: string]: Object; }) => {
      item['Time'] = this.timeSince(<Date>item.ActivityTime);
    });
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  timeSince(activityTime: Date): string {
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
