import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  title = 'BarberBeatBox';
  timeUTC: string;
  timeSinceStartInMilliseconds: number;
  ngOnInit() {
    const timeRightNow = new Date();
    this.timeUTC = timeRightNow.toISOString();

    const streamStart = new Date(2023, 10, 20, 19, 1, 9, 69);
    this.timeSinceStartInMilliseconds = Math.abs(timeRightNow.getTime() - streamStart.getTime());
  }
}
