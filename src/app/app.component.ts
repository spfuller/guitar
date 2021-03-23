import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  tuning = [4, 11, 7, 2, 9, 4];

  minNoOfFrets = 5;
  maxNoOfFrets = 24;

  noOfStrings = 6;
  noOfFrets = 12;

  selectedNote?: string = undefined;
  showAllNotes = true;

  selectedScale?: number = undefined;
  selectedRootNote?: number = undefined;
  selectedBox?: number = undefined;

  strings: FretboardString[] = [];

  scales: GuitarScale[] = [];

  @HostBinding('attr.style')
  get valueAsStyle(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`--number-of-strings: ${this.noOfStrings}; --string-top-position: calc(var(--fretboard-height) / var(--number-of-strings) / 2 - var(--half-string-height));`);
  }

  get selectedScaleBoxes(): ScaleBox[] {
    if (this.selectedScale === undefined) {
      return [];
    }
    return this.scales[this.selectedScale].boxes;
  }

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.initFretboard();
    this.initScales();
  }

  initScales(): void {
    this.scales.push(new GuitarScale({ name: 'Minor Pentatonic', notes: [0, 3, 5, 7, 10], boxes: [{ minFret: 0, maxFret: 3 }, { minFret: 2, maxFret: 5 }, { minFret: 4, maxFret: 8 }, { minFret: 7, maxFret: 10 }, { minFret: 9, maxFret: 12 }] }));
    this.scales.push(new GuitarScale({ name: 'Blues', notes: [0, 3, 5, 6, 7, 10], boxes: [{ minFret: 0, maxFret: 3 }, { minFret: 2, maxFret: 5 }, { minFret: 4, maxFret: 8 }, { minFret: 7, maxFret: 10 }, { minFret: 9, maxFret: 12 }] }));
    this.scales.push(new GuitarScale({ name: 'Major', notes: [0, 2, 4, 5, 7, 9, 11] }));
    this.scales.push(new GuitarScale({ name: 'Natural Minor (Aeolin Mode)', notes: [0, 2, 3, 5, 7, 8, 10] }));
    this.scales.push(new GuitarScale({ name: 'Major Pentatonic', notes: [0, 2, 4, 7, 9] }));
    this.scales.push(new GuitarScale({ name: 'Harmonic Minor', notes: [0, 2, 3, 5, 7, 8, 11] }));
  }

  initFretboard(): void {
    this.strings = new Array<FretboardString>(this.noOfStrings)
      .fill(new FretboardString(this.noOfFrets));
  }

  showAllNotesChanged(): void {
    if (this.showAllNotes) {
      this.selectedNote = undefined;
    }
  }

  getNoteName(stringIndex: number, fretIndex: number): string {
    return this.notes[(fretIndex + this.tuning[stringIndex]) % 12];
  }

  isRoot(stringIndex: number, fretIndex: number): boolean {
    if (this.selectedScale !== undefined && this.selectedRootNote !== undefined) {
      const note = (fretIndex + this.notes.length + this.tuning[stringIndex]) % 12;
      return this.notes[this.selectedRootNote] === this.notes[note];
    }
    return false;
  }

  isBox(fretIndex: number): boolean {
    if (this.selectedScale !== undefined && this.selectedRootNote !== undefined && this.selectedBox !== undefined) {
      const selectedBox = this.scales[this.selectedScale].boxes[this.selectedBox];
      return fretIndex >= selectedBox.minFret && fretIndex <= selectedBox.maxFret;
    }
    return false;
  }

  showFretNote(stringIndex: number, fretIndex: number): boolean {
    if (this.selectedScale !== undefined && this.selectedRootNote !== undefined) {
      const note = (fretIndex + this.notes.length + this.tuning[stringIndex] - this.selectedRootNote) % 12;
      return this.scales[this.selectedScale].notes.includes(note);
    }

    return this.showAllNotes
      || (
        this.selectedNote !== undefined
        && this.notes[(fretIndex + this.tuning[stringIndex]) % 12] === this.selectedNote
      );
  }

  setSelectedNote(note: string): void {
    if (this.selectedNote === note) {
      this.selectedNote = undefined;
      return;
    }

    this.showAllNotes = false;
    this.selectedNote = note;
  }
}

export class FretboardString {
  frets: Fret[] = [];

  constructor(noOfFrets: number) {
    this.frets = new Array<Fret>(noOfFrets + 1).fill(new Fret());
  }
}

export class Fret {
}

export class GuitarScale {
  name = '';
  notes: number[] = [];
  boxes: ScaleBox[] = [];

  constructor(init?: Partial<GuitarScale>) {
    if (init) {
      Object.assign(this, init);
    }
  }

}
export class ScaleBox {
  minFret = 0;
  maxFret = 0;
}
