import "jasmine_boot"

import SongParser from "st/song_parser"
import {SongNoteList, SongNote} from "st/song_note_list"

describe("song parser", function() {
  it("parses single note song", function() {
    expect(new SongParser().parse("a5")).toEqual([
      ["note", "A5"]
    ])
  })

  it("parses single note song with some whitespace", function() {
    expect(new SongParser().parse(`
      a5
    `)).toEqual([
      ["note", "A5"]
    ])
  })

  it("parses notes with timing information", function() {
    expect(new SongParser().parse(`
      g4 a5.1 b2 f3.1.2
    `)).toEqual([
      ["note", "G4"],
      ["note", "A5", { duration: 1 }],
      ["note", "B2"],
      ["note", "F3", { duration: 1, start: 2 }]
    ])
  })

  it("parses rests and notes", function() {
    expect(new SongParser().parse("g4.1 r2 a4.3 r b2")).toEqual([
      ["note", "G4", {duration: 1}],
      ["rest", {duration: 2}],
      ["note", "A4", {duration: 3}],
      ["rest"],
      ["note", "B2"],
    ])
  })

  it("parses key signature", function() {
    expect(new SongParser().parse("ks-4 g5 ks2 d6")).toEqual([
      ["keySignature", -4],
      ["note", "G5"],
      ["keySignature", 2],
      ["note", "D6"],
    ])
  })

  it("parses time adjustments", function() {
    expect(new SongParser().parse("ht ht dt dt m1 m2 ht")).toEqual([
      ["halfTime"],
      ["halfTime"],
      ["doubleTime"],
      ["doubleTime"],
      ["measure", 1],
      ["measure", 2],
      ["halfTime"],
    ])
  })
})

describe("load song", function() {
  it("loads empty song", function() {
    let song = SongParser.load("ks0")
    expect(song).toEqual([])
  })

  it("loads some notes", function() {
    let song = SongParser.load(`
      ks1
      b6 a6 g6 a6
      b6 b6 b6.2
      a6 a6 a6.2
    `)

    expect(song).toEqual([
      new SongNote("B6", 0, 1),
      new SongNote("A6", 1, 1),
      new SongNote("G6", 2, 1),
      new SongNote("A6", 3, 1),

      new SongNote("B6", 4, 1),
      new SongNote("B6", 5, 1),
      new SongNote("B6", 6, 2),

      new SongNote("A6", 8, 1),
      new SongNote("A6", 9, 1),
      new SongNote("A6", 10, 2),
    ])
  })

  it("loads some notes with rests", function() {
    let song = SongParser.load(`
      r1 g5 r2 a5 r3 r1.1 f6
    `)

    expect(song).toEqual([
      new SongNote("G5", 1, 1),
      new SongNote("A5", 4, 1),
      new SongNote("F6", 8, 1),
    ])
  })

  it("loads notes with timing", function() {
    let song = SongParser.load(`
      dt
      m0 c5 c5 c5
      m0 g5 a5 g5
      ht
      m1 c6
    `)

    expect(song).toEqual([
      // first measure
      new SongNote("C5", 0, 0.5),
      new SongNote("C5", 0.5, 0.5),
      new SongNote("C5", 1.0, 0.5),

      new SongNote("G5", 0, 0.5),
      new SongNote("A5", 0.5, 0.5),
      new SongNote("G5", 1.0, 0.5),

      // second measure
      new SongNote("C6", 4, 1),
    ])
  })

  it("sets position and time correctly when using half and double time", function() {
    let song = SongParser.load(`
      ht
      a5.2
      dt
      b5.2
      dt
      c5.2
      c5
      dt
      g5

      m2
      a5
    `)

    expect(song).toEqual([
      new SongNote("A5", 0, 4),
      new SongNote("B5", 4, 2),
      new SongNote("C5", 6, 1),
      new SongNote("C5", 7, 0.5),
      new SongNote("G5", 7.5, 0.25),
      new SongNote("A5", 8, 0.25),
    ])
  })


})
