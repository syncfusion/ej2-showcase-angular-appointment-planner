import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Internationalization } from '@syncfusion/ej2-base';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { TimePicker } from '@syncfusion/ej2-angular-calendars';
import { EJ2Instance } from '@syncfusion/ej2-angular-schedule';
import { AddEditDoctorComponent } from '../add-edit-doctor/add-edit-doctor.component';
import { DataService } from '../data.service';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorDetailsComponent implements OnInit {
  @ViewChild('addEditDoctorObj')
  public addEditDoctorObj: AddEditDoctorComponent;
  @ViewChild('breakHourObj')
  public breakHourObj: DialogComponent;
  public activeData: { [key: string]: Object };
  public doctorData: { [key: string]: Object }[];
  public intl: Internationalization = new Internationalization();
  public specializationData: Object[];
  public animationSettings: Object = { effect: 'None' };
  public breakDays: Object;
  public doctorId: number;

  constructor(public dataService: DataService, public router: Router, private route: ActivatedRoute, ) {
    this.doctorData = this.dataService.getDoctorsData();
    this.specializationData = this.dataService.specialistData;
  }

  ngOnInit() {
    this.dataService.updateActiveItem('doctors');
    this.route.params.subscribe((params: any) => this.doctorId = parseInt(params.id, 10));
    this.doctorData = this.dataService.getDoctorsData();
    this.activeData = this.doctorData.filter(item => item.Id === this.doctorId)[0];
    const isDataDiffer: boolean = JSON.stringify(this.activeData) === JSON.stringify(this.dataService.getActiveDoctorData());
    if (!isDataDiffer) {
      this.dataService.setActiveDoctorData(this.activeData);
    }
    this.breakDays = JSON.parse(JSON.stringify(this.activeData.WorkDays));
  }

  onBackIconClick() {
    this.router.navigateByUrl('/doctors');
  }

  onDoctorDelete() {
    const filteredData: { [key: string]: Object }[] = this.doctorData.filter(
      (item: any) => item.Id !== parseInt(this.activeData['Id'] as string, 10));
    this.doctorData = filteredData;
    this.activeData = this.doctorData[0];
    this.dataService.setActiveDoctorData(this.activeData);
    this.dataService.setDoctorsData(this.doctorData);
  }

  onDoctorEdit() {
    this.addEditDoctorObj.showDetails();
  }

  onAddBreak() {
    this.breakHourObj.show();
  }

  getDayName(day: string) {
    return day.split('')[0].toUpperCase();
  }

  getWorkDayName(day: string) {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  onCancelClick() {
    this.breakDays = this.dataService.getActiveDoctorData()['WorkDays'];
    this.breakHourObj.hide();
  }

  onSaveClick() {
    const formelement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.break-hour-dialog .e-field'));
    const workDays: { [key: string]: Object }[] = JSON.parse(JSON.stringify(this.breakDays));
    for (const curElement of formelement) {
      const dayName: string = curElement.parentElement.getAttribute('id').split('_')[0];
      const valueName: string = curElement.parentElement.getAttribute('id').split('_')[1];
      const instance: TimePicker = (curElement.parentElement as EJ2Instance).ej2_instances[0] as TimePicker;
      for (let i = 0; i < workDays.length; i++) {
        if (workDays[i].Day === dayName) {
          if (valueName === 'start') {
            workDays[i].BreakStartHour = instance.value;
            workDays[i].WorkStartHour = new Date(<Date>workDays[i].WorkStartHour);
          } else {
            workDays[i].BreakEndHour = instance.value;
            workDays[i].WorkEndHour = new Date(<Date>workDays[i].WorkEndHour);
          }
        }
        workDays[i].Enable = !(workDays[i].State === 'TimeOff');
      }
    }
    const availableDays: Array<number> = [];
    workDays.forEach(workDay => {
      if (workDay.Enable) {
        availableDays.push(<number>workDay['Index']);
      }
    });
    this.activeData.AvailableDays = availableDays;
    this.activeData.WorkDays = workDays;
    this.dataService.onUpdateData('WorkDays', workDays, 'doctor', this.activeData);
    this.breakHourObj.hide();
  }

  getStatus(state: string) {
    return state === 'RemoveBreak' ? false : true;
  }

  onChangeStatus(args: any) {
    args.preventDefault();
    const activeState: string = args.target.getAttribute('data-state');
    const activeDay: string = args.target.getAttribute('id').split('_')[0];
    let newState: String = '';
    switch (activeState) {
      case 'TimeOff':
        newState = 'RemoveBreak';
        break;
      case 'RemoveBreak':
        newState = 'AddBreak';
        break;
      case 'AddBreak':
        newState = 'TimeOff';
        break;
    }
    for (let i = 0; i < (<{ [key: string]: Object }[]>this.breakDays).length; i++) {
      if (this.breakDays[i].Day === activeDay) {
        this.breakDays[i].State = newState;
      }
    }
  }

  getBreakDetails(data: any) {
    if (data.State === 'TimeOff') {
      return 'TIME OFF';
    } else if (data.State === 'RemoveBreak') {
      return '---';
    } else {
      // tslint:disable-next-line:max-line-length
      return `${this.intl.formatDate(data.BreakStartHour, { skeleton: 'hm' })} - ${this.intl.formatDate(data.BreakEndHour, { skeleton: 'hm' })}`;
    }
  }

  getAvailability(data: { [key: string]: Object }) {
    const workDays: { [key: string]: Object }[] = <{ [key: string]: Object }[]>data.WorkDays;
    const filteredData: { [key: string]: Object }[] = workDays.filter(
      (item: any) => item.Enable !== false);
    const result = filteredData.map(item => (<string>item.Day).slice(0, 3).toLocaleUpperCase()).join(',');
    // tslint:disable-next-line:max-line-length
    return `${result} - ${this.intl.formatDate(new Date(<Date>filteredData[0].WorkStartHour), { skeleton: 'hm' })} - ${this.intl.formatDate(new Date(<Date>filteredData[0].WorkEndHour), { skeleton: 'hm' })}`;
  }

  getSpecializationText(text: Object) {
    return <string>(this.specializationData.filter((item: { [key: string]: Object }) => item.Id === text)[0]['Text']);
  }

  getEducation(text: Object) {
    return (<string>text).toUpperCase();
  }

  refreshDetails() {
    this.activeData = this.dataService.getActiveDoctorData();
  }
}
