import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { CalendarSettings } from '../calendar-settings';
import { timeSlots, startHours, endHours, views, colorCategory, dayOfWeekList } from '../datasource';
import { DataService } from '../data.service';
import { Browser } from '@syncfusion/ej2-base';

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreferenceComponent implements OnInit {
  public timeSlots: Record<string, any>[];
  public startHours: Record<string, any>[];
  public endHours: Record<string, any>[];
  public views: Record<string, any>[];
  public colorCategory: Record<string, any>[];
  public dayOfWeeks: Record<string, any>[];
  public fields: Record<string, any> = { text: 'Text', value: 'Value' };
  public selectedView: string;
  public selectedStartHour: string;
  public selectedEndHour: string;
  public selectedCategory: string;
  public timeInterval: number;
  public calendarSettings: CalendarSettings;
  public width = '335px';
  public selectedDayOfWeek: number;

  constructor(public dataService: DataService) {
    this.timeSlots = timeSlots;
    this.startHours = startHours;
    this.endHours = endHours;
    this.views = views;
    this.colorCategory = colorCategory;
    this.dayOfWeeks = dayOfWeekList;
    if (Browser.isDevice) {
      this.width = '100%';
    }
  }

  public ngOnInit() {
    this.dataService.updateActiveItem('preference');
    this.calendarSettings = this.dataService.getCalendarSettings();
    this.timeInterval = this.calendarSettings.interval;
    this.selectedView = this.calendarSettings.currentView;
    this.selectedStartHour = this.calendarSettings.calendar.start as string;
    this.selectedEndHour = this.calendarSettings.calendar.end as string;
    this.selectedCategory = this.calendarSettings.bookingColor;
    this.selectedDayOfWeek = this.calendarSettings.firstDayOfWeek;
  }

  public onValueChange(args: ChangeEventArgs) {
    switch (args.element.getAttribute('id')) {
      case 'CurrentView':
        this.calendarSettings.currentView = args.value as string;
        break;
      case 'CalendarStart':
        this.calendarSettings.calendar.start = args.value;
        break;
      case 'CalendarEnd':
        this.calendarSettings.calendar.end = args.value;
        break;
      case 'Duration':
        this.calendarSettings.interval = args.value as number;
        break;
      case 'BookingColor':
        this.calendarSettings.bookingColor = args.value as string;
        break;
      case 'FirstDayOfWeek':
        this.calendarSettings.firstDayOfWeek = args.value as number;
        break;
    }
    this.dataService.setCalendarSettings(this.calendarSettings);
  }
}
