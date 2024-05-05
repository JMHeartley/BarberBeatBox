import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Song } from '../app/shared/song.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: []
})
export class AppComponent implements OnInit {
  @ViewChild('audioPlayer', { static: true }) audioPlayer: ElementRef;

  title = 'BarberBeatBox';
  timeUTC: string;
  timeSinceStartInMilliseconds: number;
  nowPlaying: Song;
  playlist: Song[];
  nowPlayingAudioFilePath: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadSongs().subscribe(songs => {
      this.playlist = songs;
    });
  }

  loadSongs(): Observable<Song[]> {
    return this.http.get<{ songs: Song[]; }>('./assets/music/songs.json')
      .pipe(
        map(response => response.songs)
      );
  };

  calcuateTotalDurationInSeconds(playlist: Song[]) {
    let totalDurationInSeconds = 0;
    for (let index = 0; index < playlist.length; index++) {
      const songDuration = playlist[index].duration.split(":");
      const songDurationInSeconds = parseInt(songDuration[0]) * 60 + parseInt(songDuration[1]);
      totalDurationInSeconds += songDurationInSeconds;
    }
    return totalDurationInSeconds;
  }

  findSongPlayingAndPointInSong(songs: Song[], currentPlaceInPlaylistInSeconds: number): [Song, number] {
    let elapsedTime = 0;

    for (const song of songs) {

      let songDuration = song.duration.split(":");

      const songDurationInSeconds = parseInt(songDuration[0]) * 60 + parseInt(songDuration[1]);

      if (elapsedTime + songDurationInSeconds > currentPlaceInPlaylistInSeconds) {
        const currentPlaceInSong = currentPlaceInPlaylistInSeconds - elapsedTime;
        return [song, currentPlaceInSong];
      }

      elapsedTime += songDurationInSeconds;
    }

    return [null as any, 0]; // no song was found
  }

  playSong(song: Song, startTime: number) {
    this.nowPlaying = song;

    this.nowPlayingAudioFilePath = `./assets/music/${song.audioFilePath}`;
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.load();
    audio.currentTime = startTime;
    audio.play();
  }

  playLivestream() {
    const timeRightNow = new Date();
    this.timeUTC = timeRightNow.toISOString();
    const streamStart = new Date(2023, 10, 20, 19, 1, 9, 69);
    this.timeSinceStartInMilliseconds = Math.abs(timeRightNow.getTime() - streamStart.getTime());

    const totalDurationInSeconds = this.calcuateTotalDurationInSeconds(this.playlist);
    const timeSinceStartInSeconds = this.timeSinceStartInMilliseconds / 1000;
    let currentPlaceInPlaylistInSeconds = Math.floor(timeSinceStartInSeconds % totalDurationInSeconds);
    console.log("Current place in playlist in seconds", currentPlaceInPlaylistInSeconds);

    const currentSong = this.findSongPlayingAndPointInSong(this.playlist, currentPlaceInPlaylistInSeconds);

    console.log(`The song ${currentSong[0].title} should be playing at ${currentSong[1]} seconds`);

    this.playSong(currentSong[0], currentSong[1]);
  }


}
