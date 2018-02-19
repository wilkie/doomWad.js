function initDoomWadPlayPal(context) {
  'use strict';

  var PlayPal = context.DoomWad.PlayPal = function(info, directory) {
    var self = this;

    const lump = directory.lumpHeaderFor("PLAYPAL");
    const stream = lump.stream;

    var palettes = [];

    if (info.engine() === "Hexen" && lump.header.size != 21504) {
      console.log("ERROR: PLAYPAL: lump size is not 28 * 768 (21504), it is " + lump.size + " (Hexen)");
    }
    else if (lump.header.size != 10752) {
      console.log("ERROR: PLAYPAL: lump size is not 14 * 768 (10752), it is " + lump.size);
    }

    // Seek to the palette lump
    stream.seek(lump.header.offset);

    // We only ever read the first palette
    var buffer = stream.read(256 * 3);

    self._palette = [];
    self._paletteRealized = [];
    for (var i = 0; i < 256; i++) {
      var palette = {
        red:   stream.read8u((i*3) + 0),
        green: stream.read8u((i*3) + 1),
        blue:  stream.read8u((i*3) + 2),
      };
      self._palette.push(palette);
      self._paletteRealized.push(((palette.red << 24) | (palette.green << 16) | (palette.blue << 8) << 8) >>> 0); 
    }

    return self;
  };

  PlayPal.prototype.fromId = function(index) {
    return this._palette[index];
  };

  PlayPal.prototype.asUInt32 = function(index) {
    return this._paletteRealized[index];
  };
};
