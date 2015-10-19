function initDoomWadSectors(context) {
  /**
   * Constructor
   */

  var Sectors = context.DoomWad.Sectors = function(stream, info, lumpHeader, textures) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the LINEDEFS lump
    stream.seek(lumpHeader["offset"]);

    var sectorSize = 26;

    // The tag lookup
    self._tags = {};

    // Read in all sectors
    self._sectors = [];
    for (var i = 0; i < self._size; i += sectorSize) {
      var sector = {};
      sector['floorHeight']    = stream.read16ls();
      sector['ceilingHeight']  = stream.read16ls();
      sector['textureFloor']   = textures.fromName(stream.readAscii(8), "flat");
      sector['textureCeiling'] = textures.fromName(stream.readAscii(8), "flat");
      sector['lightLevel']     = stream.read16ls();
      sector['special']        = stream.read16lu();
      sector['tag']            = stream.read16lu();
      sector['index']          = self._sectors.length;

      var newSector = new context.DoomWad.Sector(sector);

      // Add the sector to our tag lookup
      if (!(sector['tag'] in self._tags)) {
        self._tags[sector['tag']] = [];
      }
      self._tags[sector['tag']].push(newSector);

      // Add the sector to the sector pool
      self._sectors.push(newSector);
    }

    return self;
  };

  Sectors.prototype.size = function() {
    return this._size;
  };

  Sectors.prototype.fromId = function(index) {
    return this._sectors[index];
  }

  Sectors.prototype.forTag = function(tag) {
    return this._tags[tag].slice(0);
  }

  Sectors.prototype.sectors = function() {
    return this._sectors.slice(0);
  }
}