import { Injectable } from '@angular/core';
import {
  patientsData, doctorsData, specializationData, activityData, hospitalData,
  bloodGroupData, waitingList, shift1BlockData, shift2BlockData, shift3BlockData
} from './datasource';
import { EventFieldsMapping } from '@syncfusion/ej2-schedule';
import { CalendarSettings } from './calendar-settings';
import { FormValidator, FormValidatorModel } from '@syncfusion/ej2-angular-inputs';
import { createElement, remove, removeClass } from '@syncfusion/ej2-base';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public patientsData: { [key: string]: Object }[];
  public doctorsData: { [key: string]: Object }[];
  public calendarSettings: CalendarSettings;
  public selectedDate: Date;
  public eventFields: EventFieldsMapping;
  public activeDoctorData: { [key: string]: Object };
  public activePatientData: { [key: string]: Object };
  public specialistData: { [key: string]: Object }[];
  public activityData: { [key: string]: Object }[];
  public hospitalData: { [key: string]: Object }[];
  public bloodGroupData: Object[] = bloodGroupData;
  public waitingList: { [key: string]: Object }[] = waitingList;
  public shift1BlockEvents: { [key: string]: Object }[] = shift1BlockData;
  public shift2BlockEvents: { [key: string]: Object }[] = shift2BlockData;
  public shift3BlockEvents: { [key: string]: Object }[] = shift3BlockData;

  constructor() {
    this.patientsData = patientsData as { [key: string]: Object }[];
    this.doctorsData = doctorsData as { [key: string]: Object }[];
    this.calendarSettings = {
      bookingColor: 'Doctors',
      calendar: {
        start: '08:00',
        end: '21:00'
      },
      currentView: 'Week',
      interval: 60,
      firstDayOfWeek: 0
    };
    this.selectedDate = new Date(2018, 6, 5);
    this.activeDoctorData = this.doctorsData[0];
    this.activePatientData = this.patientsData[0];
    this.specialistData = specializationData as { [key: string]: Object }[];
    this.activityData = <{ [key: string]: Object }[]>activityData;
    this.hospitalData = <{ [key: string]: Object }[]>hospitalData;
  }

  onUpdateData(field: string, value: any, className: string, activeData: any) {
    if (className.indexOf('doctor') !== -1) {
      for (let i = 0; i < this.doctorsData.length; i++) {
        if (this.doctorsData[i].Id === activeData.Id) {
          this.doctorsData[i][field] = value;
        }
      }
    } else {
      for (let i = 0; i < this.patientsData.length; i++) {
        if (this.patientsData[i].Id === activeData.Id) {
          this.patientsData[i][field] = value;
        }
      }
    }
  }

  getCalendarSettings() {
    return this.calendarSettings;
  }

  setCalendarSettings(args: CalendarSettings) {
    this.calendarSettings = args;
  }

  setActiveDoctorData(data: { [key: string]: Object }) {
    this.activeDoctorData = data;
  }

  getActiveDoctorData() {
    return this.activeDoctorData;
  }

  setActivePatientData(data: { [key: string]: Object }) {
    this.activePatientData = data;
  }

  getActivePatientData() {
    return this.activePatientData;
  }

  setDoctorsData(data: { [key: string]: Object }[]) {
    this.doctorsData = data;
  }

  getDoctorsData() {
    return this.doctorsData;
  }

  addHospitalData(data: { [key: string]: Object }[]) {
    this.hospitalData = data;
  }

  getHospitalData() {
    return this.hospitalData;
  }

  setPatientsData(data: { [key: string]: Object }[]) {
    this.patientsData = data;
  }

  getPatientsData() {
    return this.patientsData;
  }

  addActivityData(data: { [key: string]: Object }) {
    this.activityData.unshift(data);
  }

  getActivityData() {
    return this.activityData;
  }

  setWaitingList(data: { [key: string]: Object }[]) {
    this.waitingList = data;
  }

  getWaitingList() {
    return this.waitingList;
  }

  renderFormValidator(formElement: HTMLFormElement, rules: { [key: string]: Object }, parentElement: HTMLElement) {
    const model: FormValidatorModel = {
      customPlacement: (inputElement: HTMLElement, error: HTMLElement) => {
        this.errorPlacement(inputElement, error);
      },
      rules: rules as { [name: string]: { [rule: string]: Object } },
      validationComplete: (args: { status: string, inputName: string, element: HTMLElement, message: string }) => {
        this.validationComplete(args, parentElement);
      }
    };
    const obj: FormValidator = new FormValidator(formElement, model);
  }

  validationComplete(args: { status: string, inputName: string, element: HTMLElement, message: string }, parentElement: HTMLElement) {
    const elem: HTMLElement = parentElement.querySelector('#' + args.inputName + '_Error') as HTMLElement;
    if (elem) {
      elem.style.display = (args.status === 'failure') ? '' : 'none';
    }
  }

  errorPlacement(inputElement: HTMLElement, error: HTMLElement): void {
    const id: string = error.getAttribute('for');
    const elem: Element = inputElement.parentElement.querySelector('#' + id + '_Error');
    if (!elem) {
      const div: HTMLElement = createElement('div', {
        className: 'field-error',
        id: inputElement.getAttribute('name') + '_Error'
      });
      const content: Element = createElement('div', { className: 'error-content' });
      content.appendChild(error);
      div.appendChild(content);
      inputElement.parentElement.parentElement.appendChild(div);
    }
  }

  destroyErrorElement(formElement: HTMLFormElement, inputElements: HTMLInputElement[]): void {
    if (formElement) {
      const elements: Element[] = [].slice.call(formElement.querySelectorAll('.field-error'));
      for (const elem of elements) {
        remove(elem);
      }
      for (const element of inputElements) {
        if (element.querySelector('input').classList.contains('e-error')) {
          removeClass([element.querySelector('input')], 'e-error');
        }
      }
    }
  }

  updateActiveItem(text: string) {
    const elements: NodeListOf<Element> = document.querySelectorAll('.active-item');
    elements.forEach(element => {
      if (element.classList.contains('active-item')) {
        element.classList.remove('active-item');
      }
    });
    document.querySelector('.sidebar-item.' + text).classList.add('active-item');
  }
}
