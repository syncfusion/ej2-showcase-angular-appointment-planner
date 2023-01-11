export class CalendarSettings {
    bookingColor: string;
    calendar: Record<string, any> = { start: '', end: '' };
    currentView: string;
    interval: number;
    firstDayOfWeek: number;
}
