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
  public patientsData: Record<string, any>[];
  public filteredPatients: Record<string, any>[];
  public activePatientData: Record<string, any>;
  public hospitalData: Record<string, any>[];
  public doctorsData: Record<string, any>[];
  public intl: Internationalization = new Internationalization();
  public editSettings: EditSettingsModel;
  public gridDialog: Dialog;
  public animationSettings: Record<string, any> = { effect: 'None' };

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

  public ngOnInit(): void {
    this.dataService.updateActiveItem('patients');
  }

  public onPatientClick(args: MouseEvent): void {
    const rowIndex: string = (args.currentTarget as HTMLElement).parentElement.getAttribute('index');
    setTimeout(() => {
      this.gridObj.selectRow(parseInt(rowIndex, 10));
      this.gridObj.startEdit();
    });
  }

  public onDataEdit(args: DialogEditEventArgs): void {
    if (args.requestType === 'beginEdit') {
      this.activePatientData = args.rowData as Record<string, any>;
      this.dataService.setActivePatientData(this.activePatientData);
      this.gridDialog = args.dialog as Dialog;
      this.gridDialog.header = 'Patient Details';
      const fields: Array<string> = ['Id', 'Name', 'Gender', 'DOB', 'BloodGroup', 'Mobile', 'Email', 'Symptoms'];
      fields.forEach(field => {
        let value: string;
        if (field === 'DOB' && !isNullOrUndefined(this.activePatientData[field])) {
          value = this.intl.formatDate(this.activePatientData[field] as Date, { skeleton: 'yMd' }).toString();
        } else {
          value = isNullOrUndefined(this.activePatientData[field]) ? '' : this.activePatientData[field].toString();
        }
        (args.dialog as Dialog).element.querySelector('#' + field).innerHTML = value;
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

  public onDeletePatient(): void {
    this.deleteConfirmationDialogObj.show();
  }

  public onDeleteClick(): void {
    this.patientsData = this.patientsData.filter((item: Record<string, any>) => item.Id !== this.activePatientData.Id);
    this.filteredPatients = this.patientsData;
    this.dataService.setPatientsData(this.patientsData);
    this.gridObj.closeEdit();
    this.deleteConfirmationDialogObj.hide();
  }

  public onDeleteCancelClick(): void {
    this.deleteConfirmationDialogObj.hide();
  }

  public onAddPatient(): void {
    this.addEditPatientObj.onAddPatient();
  }

  public onEditPatient(): void {
    this.gridObj.closeEdit();
    this.addEditPatientObj.showDetails();
  }

  public getHistoryDetails(): HTMLElement {
    const filteredData: Record<string, any>[] = this.hospitalData.filter((item: Record<string, any>) =>
      item.PatientId === this.activePatientData.Id);
    const historyElement: HTMLElement = createElement('div', { id: 'history-wrapper' });
    if (filteredData.length > 0) {
      filteredData.map((item: Record<string, any>) => {
        const element: Element = createElement('div', { className: 'history-content' });
        // eslint-disable-next-line max-len
        element.textContent = `${this.intl.formatDate(item.StartTime, { skeleton: 'MMMd' })} - ${this.intl.formatDate(item.StartTime, { skeleton: 'hm' })} - ${this.intl.formatDate(item.EndTime, { skeleton: 'hm' })} Appointment with Dr.${this.getDoctorName(item.DoctorId)}`;
        historyElement.appendChild(element);
      });
    } else {
      const element: Element = createElement('div', { className: 'empty-container' });
      element.textContent = 'No Events!';
      historyElement.appendChild(element);
    }
    return historyElement;
  }

  public getDoctorName(id: number): string {
    const activeDoctor: Record<string, any>[] = this.doctorsData.filter((item: Record<string, any>) => item.Id === id);
    return activeDoctor[0].Name;
  }

  public patientSearch(args: KeyboardEvent): void {
    const searchString: string = (args.target as HTMLInputElement).value;
    if (searchString !== '') {
      new DataManager(this.patientsData).executeQuery(new Query().
        search(searchString, ['Id', 'Name', 'Gender', 'BloodGroup', 'Mobile'], null, true, true)).then((e: ReturnOption) => {
          if ((e.result as any).length > 0) {
            this.filteredPatients = e.result as Record<string, any>[];
          } else {
            this.filteredPatients = [];
          }
        });
    } else {
      this.patientSearchCleared(args as any);
    }
  }

  public patientSearchCleared(args: MouseEvent): void {
    this.filteredPatients = this.patientsData;
    if ((args.target as HTMLElement).previousElementSibling) {
      ((args.target as HTMLElement).previousElementSibling as HTMLInputElement).value = '';
    }
  }

  public gridRefresh(): void {
    this.patientsData = this.dataService.getPatientsData();
    this.filteredPatients = this.patientsData;
    this.gridObj.refresh();
  }
}
