import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Song } from '../shared/song.model';

declare function hideModal(modalId: string): void;

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: []
})
export class NavigationBarComponent {
  @Input() playlist: Song[];
  @Output() songClicked: EventEmitter<Song> = new EventEmitter<Song>();

  prependFilePathPrefix(filePath: string | undefined): string {
    if (filePath === undefined) {
      return '';
    }

    return `assets/music/${filePath}`;
  }

  onSongClicked(song: Song) {
    hideModal('playlistModal');

    this.songClicked.emit(song);
  }
}
