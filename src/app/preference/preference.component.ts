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
  public timeSlots: Object[];
  public startHours: Object[];
  public endHours: Object[];
  public views: Object[];
  public colorCategory: Object[];
  public dayOfWeeks: Object[];
  public fields: Object = { text: 'Text', value: 'Value' };
  public selectedView: string;
  public selectedStartHour: string;
  public selectedEndHour: string;
  public selectedCategory: string;
  public timeInterval: number;
  public calendarSettings: CalendarSettings;
  public width: String = '335px';
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

  ngOnInit() {
    this.dataService.updateActiveItem('preference');
    this.calendarSettings = this.dataService.getCalendarSettings();
    this.timeInterval = this.calendarSettings.interval;
    this.selectedView = this.calendarSettings.currentView;
    this.selectedStartHour = <string>this.calendarSettings.calendar['start'];
    this.selectedEndHour = <string>this.calendarSettings.calendar['end'];
    this.selectedCategory = this.calendarSettings.bookingColor;
    this.selectedDayOfWeek = this.calendarSettings.firstDayOfWeek;
  }

  onValueChange(args: ChangeEventArgs) {
    switch (args.element.getAttribute('id')) {
      case 'CurrentView':
        this.calendarSettings.currentView = <string>args.value;
        break;
      case 'CalendarStart':
        this.calendarSettings.calendar.start = args.value;
        break;
      case 'CalendarEnd':
        this.calendarSettings.calendar.end = args.value;
        break;
      case 'Duration':
        this.calendarSettings.interval = <number>args.value;
        break;
      case 'BookingColor':
        this.calendarSettings.bookingColor = <string>args.value;
        break;
      case 'FirstDayOfWeek':
        this.calendarSettings.firstDayOfWeek = <number>args.value;
        break;
    }
    this.dataService.setCalendarSettings(this.calendarSettings);
  }
}
