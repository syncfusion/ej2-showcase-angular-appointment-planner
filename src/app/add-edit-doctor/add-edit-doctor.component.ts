import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { FormValidator } from '@syncfusion/ej2-angular-inputs';
import { EJ2Instance } from '@syncfusion/ej2-angular-schedule';
import { DialogComponent, BeforeOpenEventArgs } from '@syncfusion/ej2-angular-popups';
import { DropDownList, DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { specializationData, experienceData, dutyTimingsData } from '../datasource';
import { DataService } from '../data.service';

@Component({
  selector: 'app-add-edit-doctor',
  templateUrl: './add-edit-doctor.component.html',
  styleUrls: ['./add-edit-doctor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddEditDoctorComponent {
  @Output() refreshDoctors = new EventEmitter<string>();
  public doctorsData: { [key: string]: Object }[];
  public activeDoctorData: { [key: string]: Object; };
  public dialogState: string;
  @ViewChild('newDoctorObj')
  public newDoctorObj: DialogComponent;
  public animationSettings: Object = { effect: 'None' };
  public title = 'New Doctor';
  public selectedGender = 'Male';
  @ViewChild('specializationObj')
  public specializationObj: DropDownListComponent;
  public specializationData: Object[] = specializationData;
  public fields: Object = { text: 'Text', value: 'Id' };
  public experienceData: Object[] = experienceData;
  public dutyTimingsData: Object[] = dutyTimingsData;

  constructor(private dataService: DataService) {
    this.doctorsData = this.dataService.getDoctorsData();
    this.activeDoctorData = this.dataService.getActiveDoctorData();
  }

  onAddDoctor() {
    this.dialogState = 'new';
    this.title = 'New Doctor';
    this.newDoctorObj.show();
  }

  onCancelClick() {
    this.resetFormFields();
    this.newDoctorObj.hide();
  }

  onSaveClick() {
    const formElementContainer: HTMLElement = document.querySelector('.new-doctor-dialog #new-doctor-form');
    if (formElementContainer && formElementContainer.classList.contains('e-formvalidator') &&
      !((formElementContainer as EJ2Instance).ej2_instances[0] as FormValidator).validate()) {
      return;
    }
    let obj: { [key: string]: Object; } = this.dialogState === 'new' ? {} : this.activeDoctorData;
    const formelement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    for (const curElement of formelement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          obj[columnName] = instance.value;
          if (columnName === 'Specialization') {
            obj['DepartmentId'] = instance.getDataByValue(instance.value)['DepartmentId'];
          }
        } else if (columnName === 'Gender') {
          obj[columnName] = this.selectedGender;
        } else {
          obj[columnName] = curElement.querySelector('input').value;
        }
      }
    }
    if (this.dialogState === 'new') {
      obj['Id'] = Math.max.apply(Math, this.doctorsData.map((data: { [key: string]: Object }) => data.Id)) + 1;
      obj['Text'] = 'default';
      obj['Availability'] = 'available';
      obj['NewDoctorClass'] = 'new-doctor';
      const initialData: { [key: string]: Object; } = JSON.parse(JSON.stringify(this.doctorsData[0]));
      obj['AvailableDays'] = initialData['AvailableDays'];
      obj['WorkDays'] = initialData['WorkDays'];
      obj = this.updateWorkHours(obj);
      this.doctorsData.push(obj);
      this.dataService.setDoctorsData(this.doctorsData);
    } else {
      this.activeDoctorData = this.updateWorkHours(obj);
      this.dataService.setActiveDoctorData(this.activeDoctorData);
    }
    const activityObj: { [key: string]: Object } = {
      Name: this.dialogState === 'new' ? 'Added New Doctor' : 'Updated Doctor',
      Message: `Dr.${obj['Name']}, ${(<string>obj['Specialization']).charAt(0).toUpperCase() + (<string>obj['Specialization']).slice(1)}`,
      Time: '10 mins ago',
      Type: 'doctor',
      ActivityTime: new Date()
    };
    this.dataService.addActivityData(activityObj);
    this.refreshDoctors.emit();
    this.resetFormFields();
    this.newDoctorObj.hide();
  }

  updateWorkHours(data: { [key: string]: Object; }) {
    const dutyString: string = this.dutyTimingsData.filter((item: { [key: string]: Object }) => item.Id === data.DutyTiming)[0]['Text'];
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
    (<{ [key: string]: Object }[]>data.WorkDays).forEach(item => {
      item.WorkStartHour = new Date(new Date(<Date>item.WorkStartHour).setHours(startValue));
      item.WorkEndHour = new Date(new Date(<Date>item.WorkEndHour).setHours(endValue));
      item.BreakStartHour = new Date(<Date>item.BreakStartHour);
      item.BreakEndHour = new Date(<Date>item.BreakEndHour);
    });
    data['StartHour'] = startHour;
    data['EndHour'] = endHour;
    return data;
  }

  resetFormFields(): void {
    const formelement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    this.dataService.destroyErrorElement(document.querySelector('#new-doctor-form'), formelement);
    for (const curElement of formelement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          instance.value = instance.dataSource[0];
        } else if (columnName === 'Gender') {
          curElement.querySelectorAll('input')[0].checked = true;
        } else {
          curElement.querySelector('input').value = '';
        }
      }
    }
  }

  onGenderChange(args: any) {
    this.selectedGender = args.target.value;
  }

  showDetails() {
    this.dialogState = 'edit';
    this.title = 'Edit Doctor';
    this.newDoctorObj.show();
    this.activeDoctorData = this.dataService.getActiveDoctorData();
    const obj: { [key: string]: Object; } = this.activeDoctorData;
    const formelement: HTMLInputElement[] = [].slice.call(document.querySelectorAll('.new-doctor-dialog .e-field'));
    for (const curElement of formelement) {
      let columnName: string = curElement.querySelector('input').name;
      const isCustomElement: boolean = curElement.classList.contains('e-ddl');
      if (!isNullOrUndefined(columnName) || isCustomElement) {
        if (columnName === '' && isCustomElement) {
          columnName = curElement.querySelector('select').name;
          const instance: DropDownList = (curElement.parentElement as EJ2Instance).ej2_instances[0] as DropDownList;
          instance.value = <string>obj[columnName];
          instance.dataBind();
        } else if (columnName === 'Gender') {
          if (obj[columnName] === 'Male') {
            curElement.querySelectorAll('input')[0].checked = true;
          } else {
            curElement.querySelectorAll('input')[1].checked = true;
          }
        } else {
          curElement.querySelector('input').value = <string>obj[columnName];
        }
      }
    }
  }

  onBeforeOpen(args: BeforeOpenEventArgs) {
    const formElement: HTMLFormElement = args.element.querySelector('#new-doctor-form');
    if (formElement && formElement.ej2_instances) {
      return;
    }
    const rules: { [key: string]: Object } = {};
    rules['Name'] = { required: [true, 'Enter valid Name'] };
    rules['Mobile'] = { required: [true, 'Enter valid Mobile No'] };
    rules['Email'] = { required: [true, 'Enter valid email'], email: [true, 'Enter valid email'] };
    rules['Education'] = { required: [true, 'Enter valid Education'] };
    this.dataService.renderFormValidator(formElement, rules, this.newDoctorObj.element);
  }
}
