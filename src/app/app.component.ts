import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Song } from '../app/shared/song.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

declare function visualizerChangeSong(songFilePath: string, startTime: number): void;
declare function visualizerTogglePlay(isPlaying: boolean): void;
declare function visualizerSeek(seekTime: number): void;
declare function visualizerSetVolume(volume: number): void;

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
  isLive: boolean = true;
  isMuted: boolean = false;
  volume: number = 0.25;
  currentTime: number;
  remainingTime: number;
  songProgressPercentage: number;
  playlist: Song[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadSongs().subscribe(songs => {
      this.playlist = songs;
    });

    visualizerSetVolume(this.volume);
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

    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    audio.load();

    audio.currentTime = startTime;
    audio.muted = this.isMuted;

    audio.volume = this.volume;
    visualizerSetVolume(this.volume);

    this.isPlaying = true;
    audio.play();
    visualizerChangeSong(this.prependFilePathPrefix(song.audioFilePath), startTime);
  }

  playLivestream() {
    this.isLive = true;

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
    this.isLive = false;

    const audio: HTMLAudioElement = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    visualizerTogglePlay(this.isPlaying);
    this.isPlaying = !this.isPlaying;
  }

  goToPreviousSong() {
    this.isLive = false;

    const currentSongIndex = this.playlist.findIndex(song => song.title === this.nowPlaying.title);
    const previousSongIndex = (currentSongIndex - 1 + this.playlist.length) % this.playlist.length;
    const previousSong = this.playlist[previousSongIndex];
    this.playSong(previousSong, 0);
  }

  goToNextSong() {
    this.isLive = false;
    this.playNextSong();
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
    visualizerSetVolume(this.volume);
  }

  updateTime(event: any) {
    this.currentTime = event.target.currentTime;
    this.remainingTime = this.currentTime - event.target.duration;
    this.songProgressPercentage = (this.currentTime / event.target.duration) * 100;
  }

  formatTime(time: number): string {
    if (isNaN(time)) {
      return '00:00';
    }

    const absTime: number = Math.abs(time);
    const minutes: number = Math.floor(absTime / 60);
    const seconds: number = Math.floor(absTime % 60);
    const formattedTime: string = `${time < 0 ? '-' : ''}${this.padZero(minutes)}:${this.padZero(seconds)}`;
    return formattedTime;
  }

  private padZero(value: number): string {
    return value < 10 ? '0' + value : '' + value;
  }

  seek(event: MouseEvent) {
    this.isLive = false;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const seekTime = (offsetX / rect.width) * this.audioPlayer.nativeElement.duration;

    this.audioPlayer.nativeElement.currentTime = seekTime;
    visualizerSeek(seekTime);
  }

  prependFilePathPrefix(filePath: string): string {
    return `assets/music/${filePath}`;
  }
}
