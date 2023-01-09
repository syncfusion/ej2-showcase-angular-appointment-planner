import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Tooltip, TooltipEventArgs } from '@syncfusion/ej2-angular-popups';
import { ListView } from '@syncfusion/ej2-lists';
@Component({
  selector: 'app-doctor-availability',
  templateUrl: './doctor-availability.component.html',
  styleUrls: ['./doctor-availability.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorAvailabilityComponent implements OnInit {
  @ViewChild('availabilityObj') availabilityObj!: ListView;

  public dataSource: Record<string, any>;
  public specializationData: Record<string, any>[];
  public tooltipObj!: Tooltip;

  constructor(private dataService: DataService) {
    this.dataSource = this.dataService.getDoctorsData();
    this.specializationData = this.dataService.specialistData;
  }

  public ngOnInit(): void {
    this.tooltipObj = new Tooltip({
      height: '30px',
      width: '76px',
      position: 'RightTop',
      offsetX: -10,
      showTipPointer: false,
      target: '.availability',
      beforeOpen: (args: TooltipEventArgs) => {
        args.element.querySelector('.e-tip-content')!.textContent =
          args.target.classList[1].charAt(0).toUpperCase() + args.target.classList[1].slice(1);
      }
    });
    if (this.availabilityObj) {
      this.tooltipObj.appendTo(this.availabilityObj.element);
    }
  }

  public getSpecializationText(text: string): string {
    return this.specializationData.filter((item: Record<string, any>) => item['Id'] === text)[0]['Text'].toUpperCase();
  }
}
