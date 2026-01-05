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
  standalone: false,
  templateUrl: './doctor-details.component.html',
  styleUrls: ['./doctor-details.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorDetailsComponent implements OnInit {
  @ViewChild('addEditDoctorObj') addEditDoctorObj: AddEditDoctorComponent;
  @ViewChild('breakHourObj') breakHourObj: DialogComponent;
  @ViewChild('deleteConfirmationDialogObj') deleteConfirmationDialogObj: DialogComponent;

  public activeData: Record<string, any>;
  public doctorData: Record<string, any>[];
  public intl: Internationalization = new Internationalization();
  public specializationData: Record<string, any>[];
  public animationSettings: Record<string, any> = { effect: 'None' };
  public breakDays: Record<string, any>[];
  public doctorId: number;

  constructor(public dataService: DataService, public router: Router, private route: ActivatedRoute) {
    this.doctorData = this.dataService.getDoctorsData();
    this.specializationData = this.dataService.specialistData;
  }

  public ngOnInit(): void {
    this.dataService.updateActiveItem('doctors');
    this.route.params.subscribe((params: any) => this.doctorId = parseInt(params.id, 10));
    this.doctorData = this.dataService.getDoctorsData();
    this.activeData = this.doctorData.filter(item => item['Id'] === this.doctorId)[0];
    const isDataDiffer: boolean = JSON.stringify(this.activeData) === JSON.stringify(this.dataService.getActiveDoctorData());
    if (!isDataDiffer) {
      this.dataService.setActiveDoctorData(this.activeData);
    }
    this.breakDays = JSON.parse(JSON.stringify(this.activeData['WorkDays']));
  }

  public onBackIconClick(): void {
    this.router.navigateByUrl('/doctors');
  }

  public onDoctorDelete(): void {
    this.deleteConfirmationDialogObj.show();
  }

  public onDeleteClick(): void {
    const filteredData: Record<string, any>[] = this.doctorData.filter((item: Record<string, any>) =>
      item['Id'] !== parseInt(this.activeData['Id'] as string, 10));
    this.doctorData = filteredData;
    this.activeData = this.doctorData[0];
    this.dataService.setActiveDoctorData(this.activeData);
    this.dataService.setDoctorsData(this.doctorData);
    this.deleteConfirmationDialogObj.hide();
  }

  public onDeleteCancelClick(): void {
    this.deleteConfirmationDialogObj.hide();
  }

  public onDoctorEdit(): void {
    this.addEditDoctorObj.showDetails();
  }

  public onAddBreak(): void {
    this.breakHourObj.show();
  }

  public getDayName(day: string): string {
    return day.split('')[0].toUpperCase();
  }

  public getWorkDayName(day: string): string {
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  public onCancelClick(): void {
    this.breakDays = this.dataService.getActiveDoctorData()['WorkDays'] as Record<string, any>[];
    this.breakHourObj.hide();
  }

  public onSaveClick(): void {
    const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.break-hour-dialog .e-field'));
    const workDays: Record<string, any>[] = JSON.parse(JSON.stringify(this.breakDays));
    for (const curElement of formElement) {
      const dayName: string = curElement.parentElement.getAttribute('id').split('_')[0];
      const valueName: string = curElement.parentElement.getAttribute('id').split('_')[1];
      const instance: TimePicker = (curElement.parentElement as EJ2Instance).ej2_instances[0] as TimePicker;
      for (const workDay of workDays) {
        if (workDay['Day'] === dayName) {
          if (valueName === 'start') {
            workDay['BreakStartHour'] = instance.value;
            workDay['WorkStartHour'] = new Date(workDay['WorkStartHour'] as Date);
          } else {
            workDay['BreakEndHour'] = instance.value;
            workDay['WorkEndHour'] = new Date(workDay['WorkEndHour'] as Date);
          }
        }
        workDay['Enable'] = !(workDay['State'] === 'TimeOff');
      }
    }
    const availableDays: Array<number> = [];
    workDays.forEach(workDay => {
      if (workDay['Enable']) {
        availableDays.push(workDay['Index']);
      }
    });
    this.activeData['AvailableDays'] = availableDays.length === 0 ? [this.activeData['AvailableDays'][0]] : availableDays;
    if(availableDays.length === 0) {
      workDays[this.activeData['AvailableDays'][0]]['Enable'] = true;
      workDays[this.activeData['AvailableDays'][0]]['State'] = 'AddBreak';
    }
    this.activeData['WorkDays'] = workDays;
    this.breakDays = workDays;
    this.dataService.onUpdateData('WorkDays', workDays, 'doctor', this.activeData);
    this.breakHourObj.hide();
  }

  public getStatus(state: string): boolean {
    return state === 'RemoveBreak' ? false : true;
  }

  public onChangeStatus(args: Record<string, any>): void {
    args['preventDefault']();
    const activeState: string = args['target'].getAttribute('data-state');
    const activeDay: string = args['target'].getAttribute('id').split('_')[0];
    let newState = '';
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
    for (const breakDay of this.breakDays) {
      if (breakDay['Day'] === activeDay) {
        breakDay['State'] = newState;
      }
    }
  }

  public getBreakDetails(data: Record<string, any>): string {
    if (data['State'] === 'TimeOff') {
      return 'TIME OFF';
    } else if (data['State'] === 'RemoveBreak') {
      return '---';
    } else {
      // eslint-disable-next-line max-len
      return `${this.intl.formatDate(data['BreakStartHour'], { skeleton: 'hm' })} - ${this.intl.formatDate(data['BreakEndHour'], { skeleton: 'hm' })}`;
    }
  }

  public getAvailability(data: Record<string, any>): string {
    const workDays: Record<string, any>[] = data['WorkDays'] as Record<string, any>[];
    const filteredData: Record<string, any>[] = workDays.filter((item: any) => item.Enable !== false);
    const result = filteredData.map(item => item['Day'].slice(0, 3).toLocaleUpperCase()).join(',');
    // eslint-disable-next-line max-len
    return `${result} - ${this.intl.formatDate(new Date(filteredData[0]['WorkStartHour']), { skeleton: 'hm' })} - ${this.intl.formatDate(new Date(filteredData[0]['WorkEndHour']), { skeleton: 'hm' })}`;
  }

  public getSpecializationText(text: Record<string, any>): string {
    return this.specializationData.filter((item: Record<string, any>) => item['Id'] === text)[0]['Text'] as string;
  }

  public getEducation(text: string): string {
    return text.toUpperCase();
  }

  public refreshDetails(): void {
    this.activeData = this.dataService.getActiveDoctorData();
  }
}
