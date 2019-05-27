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
  @ViewChild('availabilityObj')
  public availabilityObj: ListView;
  public dataSource: Object;
  public specializationData: Object[];
  public tooltipObj: Tooltip;

  constructor(private dataService: DataService) {
    this.dataSource = this.dataService.getDoctorsData();
    this.specializationData = this.dataService.specialistData;
  }

  ngOnInit() {
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
    this.tooltipObj.appendTo(this.availabilityObj.element);
  }

  getSpecializationText(text: string) {
    return this.specializationData.filter((item: { [key: string]: Object }) => item.Id === text)[0]['Text'].toUpperCase();
  }
}
