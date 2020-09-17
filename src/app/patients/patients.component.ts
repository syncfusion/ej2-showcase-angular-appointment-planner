import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { createElement, Internationalization, isNullOrUndefined } from '@syncfusion/ej2-base';
import { DataManager, Query, ReturnOption } from '@syncfusion/ej2-data';
import { Dialog, DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Button } from '@syncfusion/ej2-angular-buttons';
import { EditService, PageService, EditSettingsModel, GridComponent, DialogEditEventArgs } from '@syncfusion/ej2-angular-grids';
import { AddEditPatientComponent } from '../add-edit-patient/add-edit-patient.component';
import { DataService } from '../data.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
  providers: [EditService, PageService],
  encapsulation: ViewEncapsulation.None
})
export class PatientsComponent implements OnInit {
  @ViewChild('gridObj') gridObj: GridComponent;
  @ViewChild('addEditPatientObj') addEditPatientObj: AddEditPatientComponent;
  @ViewChild('deleteConfirmationDialogObj')
  public deleteConfirmationDialogObj: DialogComponent;
  public patientsData: { [key: string]: Object }[];
  public filteredPatients: { [key: string]: Object }[];
  public activePatientData: { [key: string]: Object; };
  public hospitalData: { [key: string]: Object }[];
  public doctorsData: { [key: string]: Object }[];
  public intl: Internationalization = new Internationalization();
  public editSettings: EditSettingsModel;
  public gridDialog: Dialog;
  public animationSettings: Object = { effect: 'None' };

  constructor(public dataService: DataService) {
    this.patientsData = this.filteredPatients = this.dataService.getPatientsData();
    this.hospitalData = this.dataService.getHospitalData();
    this.doctorsData = this.dataService.getDoctorsData();
    this.activePatientData = this.filteredPatients[0];
    this.editSettings = {
      allowEditing: true,
      allowAdding: true,
      allowDeleting: true,
      mode: 'Dialog'
    };
  }

  ngOnInit() {
    this.dataService.updateActiveItem('patients');
  }

  onPatientClick(args: MouseEvent) {
    const rowIndex: string = (args.currentTarget as HTMLElement).parentElement.getAttribute('index');
    setTimeout(() => {
      this.gridObj.selectRow(parseInt(rowIndex, 10));
      this.gridObj.startEdit();
    });
  }

  onDataEdit(args: DialogEditEventArgs) {
    if (args.requestType === 'beginEdit') {
      this.activePatientData = args.rowData as { [key: string]: Object; };
      this.dataService.setActivePatientData(this.activePatientData);
      this.gridDialog = <Dialog>args.dialog;
      this.gridDialog.header = 'Patient Details';
      const fields: Array<string> = ['Id', 'Name', 'Gender', 'DOB', 'BloodGroup', 'Mobile', 'Email', 'Symptoms'];
      fields.forEach(field => {
        let value: string;
        if (field === 'DOB' && !isNullOrUndefined(this.activePatientData[field])) {
          value = this.intl.formatDate(<Date>this.activePatientData[field], { skeleton: 'yMd' }).toString();
        } else {
          value = isNullOrUndefined(this.activePatientData[field]) ? '' : this.activePatientData[field].toString();
        }
        (<Dialog>args.dialog).element.querySelector('#' + field).innerHTML = value;
      });
      this.gridDialog.element.querySelector('.history-row').appendChild(this.getHistoryDetails());
      const editButtonElement: HTMLElement = createElement('button', {
        className: 'edit-patient',
        id: 'edit',
        innerHTML: 'Edit',
        attrs: { type: 'button', title: 'Edit' }
      });
      editButtonElement.onclick = this.onEditPatient.bind(this);
      const deleteButtonElement: HTMLElement = createElement('button', {
        className: 'delete-patient',
        id: 'delete',
        innerHTML: 'Delete',
        attrs: { type: 'button', title: 'Delete', content: 'DELETE' }
      });
      deleteButtonElement.onclick = this.onDeletePatient.bind(this);
      this.gridDialog.element.querySelector('.e-footer-content').appendChild(deleteButtonElement);
      this.gridDialog.element.querySelector('.e-footer-content').appendChild(editButtonElement);
      const editButton: Button = new Button({ isPrimary: true });
      editButton.appendTo('#edit');
      const deleteButton: Button = new Button();
      deleteButton.appendTo('#delete');
    }
  }

  onDeletePatient() {
    this.deleteConfirmationDialogObj.show();
  }

  onDeleteClick() {
    this.patientsData = this.patientsData.filter((item: { [key: string]: Object; }) => item.Id !== this.activePatientData.Id);
    this.filteredPatients = this.patientsData;
    this.dataService.setPatientsData(this.patientsData);
    this.gridObj.closeEdit();
    this.deleteConfirmationDialogObj.hide();
  }

  onDeleteCancelClick() {
    this.deleteConfirmationDialogObj.hide();
  }

  onAddPatient() {
    this.addEditPatientObj.onAddPatient();
  }

  onEditPatient() {
    this.gridObj.closeEdit();
    this.addEditPatientObj.showDetails();
  }

  getHistoryDetails() {
    const filteredData: Object[] = this.hospitalData.filter((item: { [key: string]: Object; }) =>
      item.PatientId === this.activePatientData.Id);
    const historyElement: HTMLElement = createElement('div', { id: 'history-wrapper' });
    if (filteredData.length > 0) {
      filteredData.map((item: { [key: string]: Object; }) => {
        const element: Element = createElement('div', { className: 'history-content' });
        // tslint:disable-next-line:max-line-length
        element.textContent = `${this.intl.formatDate(<Date>item.StartTime, { skeleton: 'MMMd' })} - ${this.intl.formatDate(<Date>item.StartTime, { skeleton: 'hm' })} - ${this.intl.formatDate(<Date>item.EndTime, { skeleton: 'hm' })} Appointment with Dr.${this.getDoctorName(<number>item.DoctorId)}`;
        historyElement.appendChild(element);
      });
    } else {
      const element: Element = createElement('div', { className: 'empty-container' });
      element.textContent = 'No Events!';
      historyElement.appendChild(element);
    }
    return historyElement;
  }

  getDoctorName(id: number) {
    const activeDoctor: Object[] = this.doctorsData.filter((item: { [key: string]: Object; }) => item.Id === id);
    return activeDoctor[0]['Name'];
  }

  patientSearch(args: MouseEvent) {
    const searchString: string = (args.target as HTMLInputElement).value;
    if (searchString !== '') {
      new DataManager(this.patientsData).executeQuery(new Query().
        search(searchString, ['Id', 'Name', 'Gender', 'BloodGroup', 'Mobile'], null, true, true)).then((e: ReturnOption) => {
          if ((e.result as any).length > 0) {
            this.filteredPatients = e.result as { [key: string]: Object; }[];
          } else {
            this.filteredPatients = [];
          }
        });
    } else {
      this.patientSearchCleared(args);
    }
  }

  patientSearchCleared(args: MouseEvent) {
    this.filteredPatients = this.patientsData;
    if ((args.target as HTMLElement).previousElementSibling) {
      ((args.target as HTMLElement).previousElementSibling as HTMLInputElement).value = '';
    }
  }

  gridRefresh() {
    this.patientsData = this.dataService.getPatientsData();
    this.filteredPatients = this.patientsData;
    this.gridObj.refresh();
  }
}
