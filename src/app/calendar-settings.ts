export class CalendarSettings {
    bookingColor: string;
    calendar: { [key: string]: Object } = {
        start: '', end: ''
    };
    currentView: string;
    interval: number;
    firstDayOfWeek: number;
}
