/* eslint-disable @typescript-eslint/naming-convention */
import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { FormValidator, MaskedTextBoxComponent, MaskedTextBox } from '@syncfusion/ej2-angular-inputs';
import { EJ2Instance } from '@syncfusion/ej2-angular-schedule';
import { DialogComponent, BeforeOpenEventArgs } from '@syncfusion/ej2-angular-popups';
import { DropDownList, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { specializationData, experienceData, dutyTimingsData } from '../datasource';
import { DataService } from '../data.service';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-add-edit-doctor',
  templateUrl: './add-edit-doctor.component.html',
  styleUrls: ['./add-edit-doctor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddEditDoctorComponent {
  @Output() refreshDoctors = new EventEmitter<string>();
  @ViewChild('newDoctorObj') newDoctorObj: DialogComponent;
  @ViewChild('specializationObj') specializationObj: DropDownListComponent;

  public doctorsData: Record<string, any>[];
  public activeDoctorData: Record<string, any>;
  public dialogState: string;
  public animationSettings: Record<string, any> = { effect: 'None' };
  public title = 'New Doctor';
  public selectedGender = 'Male';
  public specializationData: Record<string, any>[] = specializationData;
  public fields: Record<string, any> = { text: 'Text', value: 'Id' };
  public experienceData: Record<string, any>[] = experienceData;
  public dutyTimingsData: Record<string, any>[] = dutyTimingsData;

  constructor(private dataService: DataService, private calendarComponent: CalendarComponent) {
    this.doctorsData = this.dataService.getDoctorsData();
    this.activeDoctorData = this.dataService.getActiveDoctorData();
  }

  public onAddDoctor(): void {
    this.dialogState = 'new';
    this.title = 'New Doctor';
    this.newDoctorObj.show();
  }

  public onCancelClick(): void {
    this.resetFormFields();
    this.newDoctorObj.hide();
  }

  public onSaveClick(): void {
    const formElementContainer: HTMLElement = document.querySelector('.new-doctor-dialog #new-doctor-form');
    if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
      !((formElementContainer as EJ2Instance).ej2_instances[0] as FormValidator).validate()) {
      return;
    }
    let obj: Record<string, any> = this.dialogState === 'new' ? {} : this.activeDoctorData;
    const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    for (const curElement of formElement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          obj[columnName] = instance.value;
          if (columnName === 'Specialization') {
            obj['DepartmentId'] = (instance.getDataByValue(obj[columnName]) as Record<string, any>)['DepartmentId'];
          }
        } else if (columnName === 'Gender') {
          obj[columnName] = curElement.querySelector('input').checked ? 'Male' : 'Female';
        } else {
          obj[columnName] = curElement.querySelector('input').value;
        }
      }
    }
    if (this.dialogState === 'new') {
      obj['Id'] = Math.max.apply(Math, this.doctorsData.map((data: Record<string, any>) => data['Id'])) + 1;
      obj['Text'] = 'default';
      obj['Availability'] = 'available';
      obj['NewDoctorClass'] = 'new-doctor';
      obj['Color'] = '#7575ff';
      const initialData: Record<string, any> = JSON.parse(JSON.stringify(this.doctorsData[0]));
      obj['AvailableDays'] = initialData['AvailableDays'];
      obj['WorkDays'] = initialData['WorkDays'];
      obj = this.updateWorkHours(obj);
      this.doctorsData.push(obj);
      this.dataService.setDoctorsData(this.doctorsData);
    } else {
      this.activeDoctorData = this.updateWorkHours(obj);
      this.dataService.setActiveDoctorData(this.activeDoctorData);
    }
    const activityObj: Record<string, any> = {
      Name: this.dialogState === 'new' ? 'Added New Doctor' : 'Updated Doctor',
      Message: `Dr.${obj['Name']}, ${obj['Specialization'].charAt(0).toUpperCase() + obj['Specialization'].slice(1)}`,
      Time: '10 mins ago',
      Type: 'doctor',
      ActivityTime: new Date()
    };
    this.dataService.addActivityData(activityObj);
    this.refreshDoctors.emit();
    if(!isNullOrUndefined(this.calendarComponent) && !isNullOrUndefined(this.calendarComponent.dropdownObj)) {
      this.calendarComponent.dropdownObj.dataSource = [];
      this.calendarComponent.dropdownObj.dataSource = this.doctorsData;
    }
    this.resetFormFields();
    this.newDoctorObj.hide();
  }

  public updateWorkHours(data: Record<string, any>): Record<string, any> {
    const dutyString: string = this.dutyTimingsData.filter((item: Record<string, any>) => item['Id'] === data['DutyTiming'])[0]['Text'];
    let startHour: string;
    let endHour: string;
    let startValue: number;
    let endValue: number;
    if (dutyString === '10:00 AM - 7:00 PM') {
      startValue = 10;
      endValue = 19;
      startHour = '10:00';
      endHour = '19:00';
    } else if (dutyString === '08:00 AM - 5:00 PM') {
      startValue = 8;
      endValue = 17;
      startHour = '08:00';
      endHour = '17:00';
    } else {
      startValue = 12;
      endValue = 21;
      startHour = '12:00';
      endHour = '21:00';
    }
    data['WorkDays'].forEach((item: Record<string, any>) => {
      item['WorkStartHour'] = new Date(new Date(item['WorkStartHour']).setHours(startValue));
      item['WorkEndHour'] = new Date(new Date(item['WorkEndHour']).setHours(endValue));
      item['BreakStartHour'] = new Date(item['BreakStartHour']);
      item['BreakEndHour'] = new Date(item['BreakEndHour']);
    });
    data['StartHour'] = startHour;
    data['EndHour'] = endHour;
    return data;
  }

  public resetFormFields(): void {
    const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    this.dataService.destroyErrorElement(document.querySelector('#new-doctor-form'), formElement);
    for (const curElement of formElement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          instance.value = (instance as any).dataSource[0];
        } else if (columnName === 'Gender') {
          curElement.querySelectorAll('input')[0].checked = true;
        } else if(columnName === 'Mobile') {
          ((curElement.parentElement as EJ2Instance).ej2_instances[0] as MaskedTextBox).value = '';
        } else {
          curElement.querySelector('input').value = '';
        }
      }
    }
  }

  public onGenderChange(args: Record<string, any>): void {
    this.selectedGender = args['target'].value;
  }

  public showDetails(): void {
    this.dialogState = 'edit';
    this.title = 'Edit Doctor';
    this.newDoctorObj.show();
    this.activeDoctorData = this.dataService.getActiveDoctorData();
    const obj: Record<string, any> = this.activeDoctorData;
    const formElement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    for (const curElement of formElement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          instance.value = obj[columnName] as string;
          instance.dataBind();
        } else if (columnName === 'Gender') {
          if (obj[columnName] === 'Male') {
            curElement.querySelectorAll('input')[0].checked = true;
          } else {
            curElement.querySelectorAll('input')[1].checked = true;
          }
        } else if (columnName === 'Mobile') {
          ((curElement.parentElement as EJ2Instance).ej2_instances[0] as MaskedTextBox).value =
            obj[columnName].replace(/[ -.*+?^${}()|[\]\\]/g, '');
        } else {
          curElement.querySelector('input').value = obj[columnName] as string;
        }
      }
    }
  }

  public onBeforeOpen(args: BeforeOpenEventArgs): void {
    const formElement: HTMLFormElement = args.element.querySelector('#new-doctor-form');
    if (formElement && formElement['ej2_instances']) {
      return;
    }
    const customFn: (args: { [key: string]: HTMLElement }) => boolean = (e: { [key: string]: HTMLElement }) => {
      const argsLength = ((e['element'] as EJ2Instance).ej2_instances[0] as MaskedTextBoxComponent).value.length;
      return (argsLength !== 0) ? argsLength >= 10 : false;
    };
    const rules: Record<string, any> = {};
    rules['Name'] = { required: [true, 'Enter valid name'] };
    rules['Mobile'] = { required: [customFn, 'Enter valid mobile number'] };
    rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Email address is invalid'] };
    rules['Education'] = { required: [true, 'Enter valid education'] };
    this.dataService.renderFormValidator(formElement, rules, this.newDoctorObj.element);
  }
}
