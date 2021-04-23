import { Component, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { AddEditDoctorComponent } from '../add-edit-doctor/add-edit-doctor.component';
import { DataService } from '../data.service';
import { Tooltip, TooltipEventArgs } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'app-doctors',
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorsComponent implements OnInit {
  @ViewChild('addEditDoctorObj') addEditDoctorObj: AddEditDoctorComponent;
  @ViewChild('specializationObj') specializationObj: DropDownListComponent;
  @ViewChild('specialistItemObj') specialistItemObj: any;

  public doctorsData: Record<string, any>[];
  public activeDoctorData: Record<string, any>;
  public filteredDoctors: Record<string, any>[];
  public specializationData: Record<string, any>[];
  public fields: Record<string, any> = { text: 'Text', value: 'Id' };
  public selectedDepartmentId: string;
  public tooltipObj: Tooltip;

  constructor(public dataService: DataService, private router: Router) {
    this.doctorsData = this.filteredDoctors = this.dataService.getDoctorsData();
    this.activeDoctorData = this.doctorsData[0];
    this.specializationData = this.dataService.specialistData;
  }

  public ngOnInit(): void {
    this.dataService.updateActiveItem('doctors');
    this.tooltipObj = new Tooltip({
      height: '30px',
      width: '76px',
      position: 'RightTop',
      offsetX: -10,
      showTipPointer: false,
      target: '.availability',
      beforeOpen: (args: TooltipEventArgs) => {
        args.element.querySelector('.e-tip-content').textContent =
          args.target.classList[1].charAt(0).toUpperCase() + args.target.classList[1].slice(1);
      }
    });
    if (this.specialistItemObj) {
      this.tooltipObj.appendTo(this.specialistItemObj.nativeElement);
    }
  }

  public getColor(args: Record<string, string>): string {
    return args.Color;
  }

  public onSpecializationChange(args?: Record<string, any>): void {
    let filteredData: Record<string, any>[];
    if (args && args.value) {
      this.selectedDepartmentId = args ? args.itemData.DepartmentId : this.selectedDepartmentId;
      filteredData = this.doctorsData.filter((item: any) => item.DepartmentId === this.selectedDepartmentId);
    } else {
      this.selectedDepartmentId = null;
      filteredData = this.doctorsData;
    }
    this.filteredDoctors = filteredData;
  }

  public onSpecialistClick(args: Record<string, any>): void {
    this.tooltipObj.close();
    const specialistId: string = args.currentTarget.querySelector('.specialist-item').id.split('_')[1];
    const filteredData: Record<string, any>[] = this.doctorsData.filter((item: any) => item.Id === parseInt(specialistId as string, 10));
    this.dataService.setActiveDoctorData(filteredData[0]);
    this.router.navigateByUrl('/doctor-details/' + specialistId);
  }

  public onAddDoctor(): void {
    this.addEditDoctorObj.onAddDoctor();
  }

  public updateDoctors(): void {
    this.doctorsData = this.dataService.getDoctorsData();
    if (this.selectedDepartmentId) {
      this.filteredDoctors = this.doctorsData.filter((item: any) => item.DepartmentId === this.selectedDepartmentId);
    }
  }

  public getEducation(text: string): string {
    return text.toUpperCase();
  }
}
