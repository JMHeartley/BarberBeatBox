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
  nowPlaying: Song;
  isPlaying: boolean = false;
  isMuted: boolean = false;
  volume: number = 0.5;
  playlist: Song[];
  nowPlayingAudioFilePath: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadSongs().subscribe(songs => {
      this.playlist = songs;
    });
  }

  loadSongs(): Observable<Song[]> {
    return this.http.get<{ songs: Song[]; }>('assets/music/songs.json')
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

    this.nowPlayingAudioFilePath = `assets/music/${song.audioFilePath}`;
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.load();
    this.isPlaying = true;
    audio.currentTime = startTime;
    audio.muted = this.isMuted;
    audio.volume = this.volume;
    audio.play();
  }

  playLivestream() {
    const timeRightNow = new Date();
    const streamStart = new Date(2023, 10, 20, 19, 1, 9, 69);
    const timeSinceStartInMilliseconds = Math.abs(timeRightNow.getTime() - streamStart.getTime());
    const timeSinceStartInSeconds = timeSinceStartInMilliseconds / 1000;

    const totalDurationInSeconds = this.calcuateTotalDurationInSeconds(this.playlist);
    let currentPlaceInPlaylistInSeconds = Math.floor(timeSinceStartInSeconds % totalDurationInSeconds);
    console.log("Current place in playlist in seconds", currentPlaceInPlaylistInSeconds);

    const currentSong = this.findSongPlayingAndPointInSong(this.playlist, currentPlaceInPlaylistInSeconds);

    console.log(`The song ${currentSong[0].title} should be playing at ${currentSong[1]} seconds`);

    this.playSong(currentSong[0], currentSong[1]);
  }

  togglePlay() {
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    this.isPlaying = !this.isPlaying;
  }

  playPreviousSong() {
    const currentSongIndex = this.playlist.findIndex(song => song.title === this.nowPlaying.title);
    const previousSongIndex = (currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
    const previousSong = this.playlist[previousSongIndex];
    this.playSong(previousSong, 0);
  }

  playNextSong() {
    const currentSongIndex = this.playlist.findIndex(song => song.title === this.nowPlaying.title);
    const nextSongIndex = (currentSongIndex + 1) % this.playlist.length;
    const nextSong = this.playlist[nextSongIndex];
    this.playSong(nextSong, 0);
  }

  toggleMute() {
    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.muted = !audio.muted;
    this.isMuted = audio.muted;
  }

  updateVolume() {
    const audio = this.audioPlayer.nativeElement as HTMLAudioElement;
    console.log("Volume", this.volume);
    audio.volume = this.volume;
  }
}
