import { Injectable } from '@angular/core';

export interface suggestion {
  text: string,
  magicKey: string,
  isCollection: boolean
}

export interface suggestionResponse {
  suggestions: suggestion[]
}

export interface candidate {
  address: string,
  attributes: {},
  extent: { xmin: number, ymin: number, xmax: number, ymax: number },
  location: { x: number, y: number },
  score: number
}

export interface addressCandidate {
  candidates: candidate[],
  spatialReference: {
    wkid: number,
    latestWkid: number
  }
}

@Injectable({
  providedIn: 'root'
})

export class SuggestionsService {

  constructor() { }
}
