import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import {
  remove, addClass, closest, Browser, L10n, Internationalization, extend, isNullOrUndefined, createElement
} from '@syncfusion/ej2-base';
import { Query, Predicate, DataManager } from '@syncfusion/ej2-data';
import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { ClickEventArgs, Button, CheckBox } from '@syncfusion/ej2-angular-buttons';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { ChangeEventArgs } from '@syncfusion/ej2-angular-inputs';
import { ItemModel, TreeViewComponent, DragAndDropEventArgs } from '@syncfusion/ej2-angular-navigations';
import {
  DayService, WeekService, WorkWeekService, MonthService, AgendaService,
  ResizeService, DragAndDropService, EventSettingsModel, ActionEventArgs,
  ToolbarActionArgs, ScheduleComponent, CellClickEventArgs, TimeScaleModel,
  PopupOpenEventArgs, EJ2Instance, getWeekFirstDate, addDays, NavigatingEventArgs, WorkHoursModel
} from '@syncfusion/ej2-angular-schedule';
import { QuickPopups } from '@syncfusion/ej2-schedule/src/schedule/popups/quick-popups';
import { FieldValidator } from '@syncfusion/ej2-schedule/src/schedule/popups/form-validator';
import { DropDownList, ComboBox } from '@syncfusion/ej2-angular-dropdowns';
import { AddEditPatientComponent } from '../add-edit-patient/add-edit-patient.component';
import { AddEditDoctorComponent } from '../add-edit-doctor/add-edit-doctor.component';
import { CalendarSettings } from '../calendar-settings';
import { DataService } from '../data.service';

L10n.load({
  'en-US': {
    'schedule': {
      'newEvent': 'Add Appointment',
      'editEvent': 'Edit Appointment'
    }
  }
});

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [
    DayService, WeekService, WorkWeekService, MonthService, AgendaService,
    ResizeService, DragAndDropService
  ],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {

  constructor(public dataService: DataService) {
    (QuickPopups.prototype as any).applyFormValidation = () => { };
    (FieldValidator.prototype as any).errorPlacement = this.dataService.errorPlacement;
  }

  @ViewChild('addEditPatientObj') addEditPatientObj: AddEditPatientComponent;
  @ViewChild('addEditDoctorObj') addEditDoctorObj: AddEditDoctorComponent;
  @ViewChild('scheduleObj') scheduleObj: ScheduleComponent;
  @ViewChild('treeObj') treeObj: TreeViewComponent;
  @ViewChild('specialistObj') specialistObj: DialogComponent;
  @ViewChild('waitingObj') waitingObj: DialogComponent;
  @ViewChild('calendarToast') toastObj: ToastComponent;
  public position: Object = { X: 'Right', Y: 'Bottom' };
  public toastContent: string;
  public toastWidth = '580px';
  public calendarSettings: CalendarSettings;
  public isTreeItemDropped = false;
  public draggedItemId = '';
  public patientValue: number;
  public field: Object = { dataSource: [], id: 'Id', text: 'Name' };
  public dropFields: Object = { text: 'Name', value: 'Id' };
  public allowDragAndDrop = true;
  public instance: Internationalization = new Internationalization();
  public initialLoad = true;
  public currentDate: Date;
  public selectedDate: Date;
  public eventSettings: EventSettingsModel;
  public resourceDataSource: Object[];
  public specialistCategory: { [key: string]: Object }[];
  public firstDayOfWeek: Number = 1;
  public startHour: string;
  public endHour: string;
  public timeScale: TimeScaleModel = { enable: true, interval: 60 };
  public currentView: string;
  public doctorsData: { [key: string]: Object }[];
  public hospitalData: { [key: string]: Object }[];
  public patientsData: { [key: string]: Object }[];
  public activeDoctorData: Object[];
  public specialistData: { [key: string]: Object }[];
  public data: any = [];
  public eventData: Object[];
  public workDays: Array<number> = [0, 1, 2, 3, 4, 5, 6];
  public workHours: WorkHoursModel = { start: '08:00', end: '21:00' };
  public animationSettings: Object = { effect: 'None' };
  public waitingList: { [key: string]: Object }[];
  public activeWaitingItem: Object[] = [];
  public selectedWaitingItem: Object[] = [];
  public comboBox: ComboBox;

  public minValidation: (args: { [key: string]: string }) => boolean = (args: { [key: string]: string; }) => {
    return args['value'].length >= 5;
  }
  public nameValidation: (args: { [key: string]: string }) => boolean = (args: { [key: string]: string; }) => {
    return this.patientsData.filter((item: Object) => item['Name'] === args['value']).length > 0;
  }

  ngOnInit() {
    this.eventData = this.hospitalData = this.dataService.getHospitalData();
    this.calendarSettings = this.dataService.getCalendarSettings();
    this.eventSettings = {
      dataSource: this.eventData,
      query: new Query(),
      fields: {
        subject: {
          name: 'Name',
          validation: {
            required: [true, 'Enter valid Patient Name'],
            range: [this.nameValidation, 'Entered patient name is not present, please add new patient or select from list']
          }
        },
        startTime: { title: 'From', validation: { required: true } },
        endTime: { title: 'To', validation: { required: true } },
        description: {
          name: 'Symptoms',
          title: 'Symptom',
          validation: {
            required: [true, 'Please enter disease Symptoms'],
            minLength: [this.minValidation, 'Need atleast 5 letters to be entered']
          }
        }
      },
      resourceColorField: this.calendarSettings.bookingColor
    };
    this.dataService.updateActiveItem('calendar');
    this.patientsData = this.dataService.getPatientsData();
    this.specialistCategory = this.dataService.specialistData;
    this.activeDoctorData = [];
    this.specialistData = this.doctorsData = this.dataService.getDoctorsData();
    this.resourceDataSource = this.dataService.getDoctorsData();
    this.field['dataSource'] = this.waitingList = this.dataService.getWaitingList();
    this.activeWaitingItem = this.waitingList;
    this.startHour = <string>this.calendarSettings.calendar['start'];
    this.endHour = <string>this.calendarSettings.calendar['end'];
    this.timeScale.interval = this.calendarSettings.interval;
    this.currentView = this.calendarSettings.currentView;
    this.firstDayOfWeek = this.calendarSettings.firstDayOfWeek;
    this.selectedDate = this.dataService.selectedDate;
    this.currentDate = this.selectedDate;
    this.specialistObj.hide();
    if (Browser.isDevice) {
      this.toastWidth = '300px';
    }
  }

  onActionBegin(args: ActionEventArgs & ToolbarActionArgs): void {
    if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
      if (this.isTreeItemDropped) {
        const treeViewdata: { [key: string]: Object }[] = this.treeObj.fields.dataSource as { [key: string]: Object }[];
        this.refreshWaitingItems(parseInt(this.draggedItemId, 10));
        this.treeObj.fields.dataSource = treeViewdata.filter((item: { [key: string]: Object }) =>
          item.Id !== parseInt(this.draggedItemId, 10));
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
        elements.forEach((node: HTMLElement) => remove(node));
      }
      const data: { [key: string]: Object } = (args.requestType === 'eventCreate' ? args.data[0] : args.data) as { [key: string]: Object };
      if (this.patientValue) {
        data['PatientId'] = this.patientValue;
        data['Name'] = this.patientsData.filter((item: { [key: string]: Object }) => item.Id === this.patientValue)[0]['Name'];
      }
      let eventCollection: Object[] = this.scheduleObj.eventBase.filterEvents(data.StartTime as Date, data.EndTime as Date);
      const predicate: Predicate = new Predicate('Id', 'notequal', data.Id as number)
        .and(new Predicate('DepartmentId', 'equal', data.DepartmentId as number))
        .and(new Predicate('DoctorId', 'equal', data.DoctorId as number));
      eventCollection = new DataManager({ json: eventCollection }).executeLocal(new Query().where(predicate));
      if (eventCollection.length > 0) {
        args.cancel = true;
        this.toastContent = 'An appointment already exists on the same time range, so please reschedule on different time slots.';
        if (args.requestType !== 'eventChange') {
          this.waitingList.push(data);
          this.toastContent = 'An appointment already exists on the same time range, so it is added to the waiting list';
        }
        this.toastObj.show();
      }
      if (this.activeDoctorData.length > 0) {
        this.updateWaitingList(this.activeDoctorData[0]['DepartmentId']);
      } else {
        this.updateWaitingList();
      }
      if (args.requestType === 'eventCreate') {
        if (this.isTreeItemDropped && this.activeDoctorData.length > 0) {
          this.hospitalData.push(data);
        }
      }
      const activityData: { [key: string]: Object } = {
        Name: args.requestType === 'eventCreate' ? 'Added New Appointment' : 'Updated Appointment',
        Message: `${data.Name} for ${data.Symptoms}`,
        Time: '5 mins ago',
        Type: 'appointment',
        ActivityTime: new Date()
      };
      this.dataService.addActivityData(activityData);
      this.isTreeItemDropped = false;
    }
    if (args.requestType === 'toolbarItemRendering') {
      if (Browser.isDevice) {
        const doctorIcon: ItemModel = {
          align: 'Center',
          cssClass: 'app-doctor-icon',
          overflow: 'Show',
          prefixIcon: 'doctor-icon',
          showAlwaysInPopup: true
        };
        args.items.unshift(doctorIcon);
        const waitingListItem: ItemModel = {
          align: 'Right',
          cssClass: 'app-waiting-list',
          showAlwaysInPopup: true,
          text: 'Waiting list',
          click: this.onWaitingListSelect.bind(this)
        };
        args.items.push(waitingListItem);
        args.items.splice(5, 1);
      } else {
        const specialistItem: ItemModel = { align: 'Center', cssClass: 'app-doctors' };
        args.items.unshift(specialistItem);
        args.items.splice(4, 2);
      }
    }
  }

  onActionComplete(args: ActionEventArgs): void {
    if (args.requestType === 'toolBarItemRendered') {
      if (Browser.isDevice) {
        const doctorIconContainer: HTMLElement = <HTMLElement>(this.scheduleObj.element.querySelector('.app-doctor-icon'));
        const doctorIcon: HTMLElement = doctorIconContainer.querySelector('.doctor-icon');
        const doctorImage: HTMLElement = createElement('img', { className: 'active-doctor', attrs: { src: './assets/Icons/Doctors.svg' } });
        doctorIcon.appendChild(doctorImage);
        doctorIconContainer.style.display = 'block';
        doctorIconContainer.onclick = () => this.specialistObj.show();
      } else {
        const doctorsElement: HTMLElement = this.scheduleObj.element.querySelector('.app-doctors') as HTMLElement;
        const listObj: DropDownList = new DropDownList({
          cssClass: 'planner-dropdown',
          placeholder: 'Choose Specialist',
          dataSource: this.doctorsData,
          fields: { text: 'Name', value: 'Id' },
          popupHeight: 'auto',
          popupWidth: '195px',
          showClearButton: true,
          change: this.onDoctorSelect.bind(this),
          itemTemplate: '<div class="specialist-item"><img class="value" src="./assets/images/${Text}.png" alt="doctor"/>' +
            '<div class="doctor-details"><div class="name">Dr.${Name}</div><div class="designation">${Designation}</div></div></div>',
          footerTemplate: `<div class="add-doctor"><div class="e-icon-add e-icons"></div><div class="add-doctor-text">Add New Doctor</div>
            </div>`,
          width: '195px',
          open: this.onMultiSelectOpen.bind(this)
        });
        listObj.appendTo(doctorsElement);
      }
    }
    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      this.dataService.addHospitalData(this.hospitalData);
    }
  }

  onPopupOpen(args: PopupOpenEventArgs) {
    if (args.type === 'Editor') {
      this.scheduleObj.eventSettings.fields.subject = { name: 'Name', validation: { required: [true, 'Enter valid Patient Name'] } };
      if (!Browser.isDevice) {
        const selectors: Array<string> = ['.e-DepartmentId-container .e-DepartmentId', '.e-DoctorId-container .e-DoctorId'];
        selectors.forEach((selector: string) => {
          const dropdownObj: DropDownList = (args.element.querySelector(selector) as EJ2Instance).ej2_instances[0] as DropDownList;
          dropdownObj.popupWidth = '224px';
        });
      }
      // additional field customization
      if (!args.element.querySelector('.custom-field-row')) {
        const row: HTMLElement = createElement('div', { className: 'custom-field-row' });
        const formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-title-location-row'));
        const container: HTMLElement = createElement('div', { className: 'custom-field-container' });
        const comboBoxElement: HTMLInputElement = createElement('input', { attrs: { id: 'PatientName' } }) as HTMLInputElement;
        container.appendChild(comboBoxElement);
        row.appendChild(container);
        this.comboBox = new ComboBox({
          dataSource: this.patientsData,
          allowFiltering: true,
          fields: { text: 'Name', value: 'Id' },
          floatLabelType: 'Always',
          placeholder: 'PATIENT NAME',
          change: (e: any) => this.patientValue = e.value,
          select: () => {
            if (!isNullOrUndefined(document.querySelector('.custom-field-row .field-error'))) {
              (document.querySelector('.custom-field-row .field-error') as HTMLElement).style.display = 'none';
            }
          }
        });
        this.comboBox.appendTo(comboBoxElement);
        comboBoxElement.setAttribute('name', 'Name');
        const buttonEle: HTMLInputElement = createElement('button', { attrs: { name: 'PatientButton' } }) as HTMLInputElement;
        buttonEle.onclick = this.onAddPatient.bind(this);
        container.appendChild(buttonEle);
        const button: Button = new Button({ iconCss: 'e-icons e-add-icon', cssClass: 'e-small e-round', isPrimary: true });
        button.appendTo(buttonEle);
      }
      this.comboBox.value = args.data['PatientId'] || null;
    }
    if (args.type === 'QuickInfo') {
      if (args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells')) {
        this.scheduleObj.quickPopup.quickPopupHide(true);
        args.cancel = true;
      } else if (args.target.classList.contains('e-appointment')) {
        (<HTMLElement>args.element).style.boxShadow = `1px 2px 5px 0 ${(<HTMLElement>args.target).style.backgroundColor}`;
      }
    }
    if (args.type === 'EventContainer') {
      const eventElements: NodeListOf<HTMLElement> = args.element.querySelectorAll('.e-appointment');
      eventElements.forEach((element: HTMLElement) => {
        const colors: Array<string> = ['rgb(96, 242, 56)', 'rgb(254, 194, 0)'];
        if (colors.indexOf(element.style.backgroundColor) !== -1) {
          (element.querySelector('.e-subject') as HTMLElement).style.color = 'black';
        }
      });
    }
  }

  onEventRendered(args: any) {
    if (args.element.classList.contains('e-appointment')) {
      const data: { [key: string]: Object } = args.data as { [key: string]: Object };
      const eventStart = data.StartTime as Date;
      const eventEnd = data.EndTime as Date;
      let eventCollection = this.scheduleObj.blockProcessed;
      eventCollection = this.scheduleObj.eventBase.filterEvents(eventStart, eventEnd, eventCollection);
      if (eventCollection.length > 0) {
        args.cancel = true;
        return;
      }
      const colors: Array<string> = ['#60F238', '#fec200'];
      let eventColor: string;
      let result: { [key: string]: Object }[];
      if (this.eventSettings.resourceColorField === 'Doctors') {
        result = this.doctorsData.filter((item: any) => item.Id === args.data.DoctorId);
      } else {
        result = this.specialistCategory.filter((item: any) => item.DepartmentId === args.data.DepartmentId);
      }
      if (result && result.length > 0) {
        eventColor = <string>result[0]['Color'];
      } else {
        eventColor = 'white';
      }
      if (colors.indexOf(eventColor) !== -1) {
        args.element.style.color = 'black';
      }
    }

  }

  onDataBound() {
    if (this.initialLoad) {
      this.updateWaitingList();
      this.initialLoad = !this.initialLoad;
    }
  }

  onAddPatient() {
    this.addEditPatientObj.onAddPatient();
  }

  getEventDetails(data: Object) {
    return (this.instance.formatDate(new Date(data['StartTime']), { type: 'date', skeleton: 'long' }) +
      '(' + this.getString(new Date(data['StartTime']), 'hm') + '-' + this.getString(new Date(data['EndTime']), 'hm') + ')');
  }

  getPatientName(data: Object) {
    return this.patientsData.filter((item: { [key: string]: Object }) => item['Id'] === data['PatientId'])[0]['Name'].toString();
  }

  getDoctorName(data: Object) {
    return this.doctorsData.filter((item: { [key: string]: Object }) => item['Id'] === data['DoctorId'])[0]['Name'].toString();
  }

  getDepartmentName(id: number) {
    return (this.specialistCategory.filter(item => id === item.DepartmentId)[0]['Text'] as string).toUpperCase();
  }

  getTreatmentDetail(data: Object) {
    return data['Treatment'] || 'CHECKUP';
  }

  // Toolbar item actions
  onMultiSelectOpen(args: any) {
    (<HTMLElement>(args.popup.element.querySelector('.add-doctor'))).onclick = this.onAddClick.bind(this);
  }

  onDoctorSelect(args: any): void {
    if (args.value) {
      this.refreshDataSource(args.itemData.DepartmentId, args.itemData.Id);
      this.field['dataSource'] = this.activeWaitingItem;
      this.treeObj.fields.dataSource = this.activeWaitingItem as { [key: string]: Object }[];
    } else {
      this.setDefaultData();
    }
  }

  refreshDataSource(deptId: string, doctorId: string) {
    const filteredItems: Object[] = this.doctorsData.filter(item => parseInt(doctorId, 10) === item.Id);
    this.activeDoctorData = filteredItems;
    this.workDays = filteredItems[0]['AvailableDays'];
    this.workHours = { start: filteredItems[0]['StartHour'], end: filteredItems[0]['EndHour'] };
    this.scheduleObj.workHours = this.workHours;
    if (filteredItems.length > 0) {
      this.updateBreakHours(this.scheduleObj.selectedDate);
      this.eventData = this.generateEvents(this.activeDoctorData[0]);
    } else {
      this.eventData = this.hospitalData;
    }
    this.scheduleObj.resources[0].query = new Query().where('DepartmentId', 'equal', parseInt(deptId, 10));
    this.scheduleObj.resources[1].query = new Query().where('Id', 'equal', parseInt(doctorId, 10));
    this.scheduleObj.eventSettings.dataSource = this.eventData;
    this.updateWaitingList(parseInt(deptId, 10));
  }

  onAddClick() {
    this.addEditDoctorObj.onAddDoctor();
  }

  onItemDrag(event: any): void {
    if (this.scheduleObj.isAdaptive) {
      const classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
      if (classElement) {
        classElement.classList.remove('e-device-hover');
      }
      if (event.target.classList.contains('e-work-cells')) {
        addClass([event.target], 'e-device-hover');
      }
    }
    if (document.body.style.cursor === 'not-allowed') {
      document.body.style.cursor = '';
    }
    if (event.name === 'nodeDragging') {
      const tooltipElement: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.e-treeview');
      let status: boolean;
      tooltipElement.forEach((node: HTMLElement) => {
        node.style.display = 'block';
        status = document.querySelector('body').offsetWidth <= node.offsetLeft + node.offsetWidth;
      });
      const targetEle: Element = <Element>closest(event.target, '.droppable');
      if (!targetEle || status) {
        tooltipElement.forEach((node: HTMLElement) => node.style.display = 'none');
        event.cancel = true;
        return;
      }
      const dragElementIcon: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
      dragElementIcon.forEach((node: HTMLElement) => node.style.display = 'none');
    }
  }

  onTreeDragStop(event: DragAndDropEventArgs): void {
    const treeElement: Element = <Element>closest(event.target, '.e-treeview');
    const classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
    if (classElement) {
      classElement.classList.remove('e-device-hover');
    }
    const tooltipElement: HTMLElement = document.querySelector('.e-drag-item.e-treeview');
    if (tooltipElement) { tooltipElement.style.display = 'block'; }
    if (!treeElement) {
      if (tooltipElement) { tooltipElement.style.display = 'none'; }
      event.cancel = true;
      const scheduleElement: Element = closest(event.target, '.e-content-wrap');
      if (scheduleElement) {
        const treeviewData: { [key: string]: Object }[] = this.treeObj.fields.dataSource as { [key: string]: Object }[];
        if (event.target.classList.contains('e-work-cells')) {
          const filteredData: { [key: string]: Object }[] = treeviewData.filter((item: { [key: string]: Object }) =>
            item.Id === parseInt(event.draggedNodeData.id as string, 10));
          const cellData: CellClickEventArgs = this.scheduleObj.getCellDetails(event.target);
          let doctorId: number;
          if (this.activeDoctorData.length > 0) {
            doctorId = this.activeDoctorData[0]['Id'];
          } else {
            const doctor: Object[] = this.doctorsData.filter((item: { [key: string]: Object }) =>
              item.DepartmentId === filteredData[0].DepartmentId);
            doctorId = doctor && doctor.length > 0 ? doctor[0]['Id'] as number : this.doctorsData[0]['Id'] as number;
          }
          const milliSeconds: number = ((filteredData[0].EndTime as Date).getTime() - (filteredData[0].StartTime as Date).getTime());
          const eventData: { [key: string]: Object } = {
            Name: filteredData[0].Name,
            StartTime: cellData.startTime,
            EndTime: new Date(new Date(cellData.startTime).setMilliseconds(milliSeconds)),
            IsAllDay: cellData.isAllDay,
            Symptoms: filteredData[0].Disease || filteredData[0].Symptoms,
            PatientId: filteredData[0].PatientId,
            DepartmentId: filteredData[0].DepartmentId,
            DoctorId: doctorId
          };
          let eventCollection: Object[] = this.scheduleObj.eventBase.filterEvents(<Date>eventData['StartTime'], <Date>eventData['EndTime']);
          eventCollection = eventCollection.filter((item: Object) => item['DoctorId'] === eventData.DoctorId);
          if (eventCollection.length > 0) {
            event.cancel = true;
            this.toastContent = 'An appointment already exists on the same time range, so please reschedule on different time slots.';
            this.toastObj.show();
          } else {
            this.scheduleObj.openEditor(eventData, 'Add', true);
            this.isTreeItemDropped = true;
            this.draggedItemId = event.draggedNodeData.id as string;
          }
        }
      }
    }
  }

  getEventTime(data: any) {
    return (this.getString(new Date(data.StartTime), 'MMMd') + ',' + this.getString(new Date(data.StartTime), 'hm') +
      '-' + this.getString(new Date(data.EndTime), 'hm'));
  }

  getString(value: Date, type: string) {
    return this.instance.formatDate(new Date(value), { type: 'dateTime', skeleton: type });
  }

  createNewEvent(args: ClickEventArgs) {
    let data: CellClickEventArgs;
    const isSameTime: boolean =
      this.scheduleObj.activeCellsData.startTime.getTime() === this.scheduleObj.activeCellsData.endTime.getTime();
    if (this.scheduleObj.activeCellsData && !isSameTime) {
      data = this.scheduleObj.activeCellsData;
    } else {
      const interval: number = this.scheduleObj.activeViewOptions.timeScale.interval;
      const slotCount: number = this.scheduleObj.activeViewOptions.timeScale.slotCount;
      const msInterval: number = (interval * 60000) / slotCount;
      const startTime: Date = new Date(this.scheduleObj.selectedDate.getTime());
      startTime.setHours(new Date().getHours(), Math.round(startTime.getMinutes() / msInterval) * msInterval, 0);
      const endTime: Date = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + msInterval));
      data = { startTime: startTime, endTime: endTime, isAllDay: false };
    }
    this.scheduleObj.openEditor(extend(data, { cancel: false, event: args.event }), 'Add');
  }

  getDoctorImage(data: any) {
    return isNullOrUndefined(data.Text) ? './assets/Icons/Doctors.svg' : `./assets/images/${data.Text}.png`;
  }

  onSpecialistSelect(args: any) {
    const target: HTMLElement = closest(args.target, '.specialist-item') as HTMLElement;
    const deptId: string = target.getAttribute('data-deptid');
    const doctorId: string = target.getAttribute('data-doctorid');
    this.refreshDataSource(deptId, doctorId);
    const doctorImage: HTMLElement = this.scheduleObj.element.querySelector('.doctor-icon .active-doctor');
    doctorImage.setAttribute('src', './assets/images/' + (<{ [key: string]: Object }>this.activeDoctorData[0]).Text + '.png');
    this.specialistObj.hide();
  }

  onBackIconClick(args: any) {
    if (closest(args.currentTarget.parentElement, '.waiting-list-dialog')) {
      this.waitingObj.hide();
    } else {
      this.specialistObj.hide();
    }
  }

  onWaitingListSelect() {
    this.waitingObj.show();
  }

  onWaitingListClosed(args: any) {
    const checkboxElements: HTMLElement[] = args.element.querySelectorAll('.e-checkbox');
    checkboxElements.forEach(element => {
      const checkbox: CheckBox = (element as EJ2Instance).ej2_instances[0] as CheckBox;
      if (checkbox.checked) {
        checkbox.checked = false;
      }
    });
  }

  onItemChecked(args: ChangeEventArgs) {
    const waitItemId: string = closest(<HTMLElement>args.event.currentTarget, '.e-checkbox-wrapper')['id'];
    this.selectedWaitingItem.push(this.waitingList.filter((item: { [key: string]: Object }) => item.Id === parseInt(waitItemId, 10))[0]);
  }

  onItemDelete() {
    if (this.selectedWaitingItem.length > 0) {
      this.selectedWaitingItem.forEach((activeItem: { [key: string]: Object }) => this.refreshWaitingItems(activeItem['Id'] as number));
      this.selectedWaitingItem = [];
      this.waitingObj.hide();
    } else {
      this.toastContent = 'Please select the waiting item to delete';
      this.toastObj.show();
    }
  }

  onItemAdd() {
    if (this.selectedWaitingItem.length > 0) {
      this.selectedWaitingItem.forEach((activeItem: { [key: string]: Object }) => {
        const eventFilter: Object[] = this.eventData.filter((event: { [key: string]: Object }) => event.Id === activeItem.Id);
        if (eventFilter.length === 0) {
          const doctorData: Object[] = this.activeDoctorData.length > 0 ? this.activeDoctorData.filter((data: { [key: string]: Object }) =>
            data.DepartmentId === activeItem.DepartmentId) : [];
          const isActiveDepartment: boolean = doctorData.length > 0;
          if (isActiveDepartment) {
            activeItem['DoctorId'] = doctorData[0]['Id'];
          } else {
            const filteredData: Object[] = this.doctorsData.filter((data: { [key: string]: Object }) =>
              data.DepartmentId === activeItem.DepartmentId);
            activeItem['DoctorId'] = filteredData[0]['Id'];
          }
          this.eventData.push(activeItem);
          this.refreshWaitingItems(activeItem['Id'] as number);
          if (this.activeDoctorData.length > 0) {
            this.hospitalData.push(activeItem);
          }
          this.dataService.addHospitalData(this.hospitalData);
        }
      });
      this.selectedWaitingItem = [];
      this.waitingObj.hide();
      this.scheduleObj.eventSettings.dataSource = this.eventData;
      this.scheduleObj.refreshEvents();
    } else {
      this.toastContent = 'Please select the waiting item to add';
      this.toastObj.show();
    }
    if (this.activeDoctorData.length > 0) {
      this.updateWaitingList(this.activeDoctorData[0]['DepartmentId']);
    } else {
      this.updateWaitingList();
    }
  }

  getDateHeaderText: Function = (value: Date) => {
    return this.instance.formatDate(value, { skeleton: 'MMMEd' }).toUpperCase();
  }

  getBackGroundColor(data: any) {
    let color: string;
    let fontColor: string;
    if (this.eventSettings.resourceColorField === 'Doctors') {
      color = this.doctorsData.filter((item: { [key: string]: Object }) => item.Id === data.DoctorId)[0]['Color'] as string;
    } else {
      color = this.specialistCategory.filter((item: { [key: string]: Object }) =>
        item.DepartmentId === data.DepartmentId)[0]['Color'] as string;
    }
    const colors: Array<string> = ['#60F238', '#fec200'];
    if (colors.indexOf(color) !== -1) {
      fontColor = '#333333';
    } else {
      fontColor = '#FFFFFF';
    }
    return { 'background-color': color, color: fontColor };
  }

  onNavigation(args: NavigatingEventArgs) {
    this.currentDate = args.currentDate || this.selectedDate;
    if (this.activeDoctorData.length > 0) {
      this.updateBreakHours(this.currentDate);
      this.eventData = this.generateEvents(this.activeDoctorData[0]);
      this.scheduleObj.eventSettings.dataSource = this.eventData;
      this.updateWaitingList(this.activeDoctorData[0]['DepartmentId']);
    } else {
      this.updateWaitingList();
    }
  }

  refreshWaitingItems(id: number) {
    this.waitingList = this.waitingList.filter((item: any) => item.Id !== id);
    this.dataService.setWaitingList(this.waitingList);
    this.activeWaitingItem = this.waitingList;
  }

  updateWaitingList(deptId?: number) {
    let filteredData: Object[] = this.filterWaitingEvents();
    if (deptId) {
      filteredData = filteredData.filter((item: { [key: string]: Object }) => item['DepartmentId'] === deptId);
    }
    this.activeWaitingItem = filteredData;
    this.field['dataSource'] = this.activeWaitingItem;
    this.treeObj.fields.dataSource = this.activeWaitingItem as { [key: string]: Object }[];
    this.treeObj.refresh();
  }

  updateBreakHours(currentDate: Date) {
    const currentViewDates: Object[] = [];
    const firstDayOfWeek: Date = getWeekFirstDate(currentDate, this.firstDayOfWeek as number);
    let startDate: Date = firstDayOfWeek;
    const endDate: Date = addDays(new Date(startDate.getTime()), 7);
    do {
      currentViewDates.push(startDate);
      startDate = addDays(new Date(startDate.getTime()), 1);
    } while (startDate.getTime() !== endDate.getTime());
    currentViewDates.forEach((item: Date) => {
      this.activeDoctorData[0]['WorkDays'].forEach((dayItem: { [key: string]: Date }) => {
        if (dayItem.BreakStartHour.getDay() === item.getDay()) {
          dayItem.BreakStartHour = this.resetDateValue(dayItem.BreakStartHour, item);
          dayItem.BreakEndHour = this.resetDateValue(dayItem.BreakEndHour, item);
          dayItem.WorkStartHour = this.resetDateValue(dayItem.WorkStartHour, item);
          dayItem.WorkEndHour = this.resetDateValue(dayItem.WorkEndHour, item);
        }
      });
    });
  }

  resetDateValue(date: Date, item: Date) {
    return new Date(new Date(date).setFullYear(item.getFullYear(), item.getMonth(), item.getDate()));
  }

  generateEvents(activeData: Object): Object[] {
    const filteredEvents: Object[] = [];
    const datas: Object[] = this.hospitalData.filter((item: any) =>
      item['DoctorId'] === activeData['Id'] || (Array.isArray(item['DoctorId']) && item['DoctorId'].indexOf(activeData['Id']) !== -1));
    datas.forEach((element: Object) => filteredEvents.push(element));
    activeData['WorkDays'].forEach((element: { [key: string]: Object }) => {
      if (element.State !== 'RemoveBreak') {
        const newBreakEvent: { [key: string]: Object } = {
          Id: Math.max.apply(Math, filteredEvents.map((data: { [key: string]: Object }) => data.Id)) + 1,
          Name: 'Break Time',
          StartTime: element.BreakStartHour,
          EndTime: element.BreakEndHour,
          IsBlock: true,
          DoctorId: activeData['Id']
        };
        filteredEvents.push(newBreakEvent);
      }
      if (element.Enable) {
        const shiftValue: string = activeData['DutyTiming'];
        const obj: Object[] = [];
        if (shiftValue === 'Shift1') {
          const shiftTiming = {
            startTime: new Date(new Date(<Date>element.WorkStartHour).setHours(17)),
            endTime: new Date(new Date(<Date>element.WorkEndHour).setHours(21))
          };
          obj.push(shiftTiming);
        } else if (shiftValue === 'Shift2') {
          const shiftTiming1 = {
            startTime: new Date(new Date(<Date>element.WorkStartHour).setHours(8)),
            endTime: new Date(new Date(<Date>element.WorkEndHour).setHours(10))
          };
          const shiftTiming2 = {
            startTime: new Date(new Date(<Date>element.WorkStartHour).setHours(19)),
            endTime: new Date(new Date(<Date>element.WorkEndHour).setHours(21))
          };
          obj.push(shiftTiming1);
          obj.push(shiftTiming2);
        } else {
          const shiftTiming = {
            startTime: new Date(new Date(<Date>element.WorkStartHour).setHours(8)),
            endTime: new Date(new Date(<Date>element.WorkEndHour).setHours(12))
          };
          obj.push(shiftTiming);
        }
        obj.forEach(item => {
          const newBreakEvent: Object = {
            Id: Math.max.apply(Math, filteredEvents.map((data: { [key: string]: Object }) => data.Id)) + 1,
            Name: 'Off Work',
            StartTime: item['startTime'],
            EndTime: item['endTime'],
            IsBlock: true,
            DoctorId: activeData['Id']
          };
          filteredEvents.push(newBreakEvent);
        });
      }
    });
    return filteredEvents;
  }

  filterWaitingEvents(): Object[] {
    const firstDayOfWeek: Date = getWeekFirstDate(this.currentDate, this.firstDayOfWeek as number);
    return this.scheduleObj.eventBase.filterEvents(firstDayOfWeek, addDays(new Date(firstDayOfWeek.getTime()), 6), this.waitingList);
  }

  clearSelection() {
    this.setDefaultData();
    const doctorImage: HTMLElement = this.scheduleObj.element.querySelector('.doctor-icon .active-doctor');
    doctorImage.setAttribute('src', './assets/Icons/Doctors.svg');
    this.specialistObj.hide();
  }

  setDefaultData() {
    this.scheduleObj.resources[0].dataSource = this.specialistCategory;
    this.scheduleObj.resources[1].dataSource = this.resourceDataSource;
    this.scheduleObj.resources[0].query = new Query();
    this.scheduleObj.resources[1].query = new Query();
    this.eventData = this.hospitalData;
    this.scheduleObj.eventSettings.dataSource = this.eventData;
    this.scheduleObj.refreshEvents();
    this.updateWaitingList();
    this.startHour = <string>this.calendarSettings.calendar['start'];
    this.endHour = <string>this.calendarSettings.calendar['end'];
    this.workDays = [0, 1, 2, 3, 4, 5, 6];
    this.workHours = { start: '08:00', end: '21:00' };
    this.scheduleObj.workHours = this.workHours;
    this.activeDoctorData = [];
  }
}
