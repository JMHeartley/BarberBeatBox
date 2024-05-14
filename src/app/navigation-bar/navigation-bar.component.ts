import { Component, Input } from '@angular/core';
import { Song } from '../shared/song.model';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: []
})
export class NavigationBarComponent {
  @Input() playlist: Song[];

  prependFilePathPrefix(filePath: string | undefined): string {
    if (filePath === undefined) {
      return '';
    }

    return `assets/music/${filePath}`;
  }
}
