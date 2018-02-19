function initDoomWadLevel(context) {
  /**
   * Constructor
   */

  var Level = context.DoomWad.Level = function(info, directory, textures, name) {
    var self = this;

    // Level lump header (eg MAP01)
    const levelLump = directory.lumpHeaderFor(name); 
    const header = levelLump.header;
    const stream = levelLump.stream;

    // The level lump is empty. It just marks the first lump of the level.
    // The rest of the lumps should be read in linearly. So go through
    // each lump after this one.

    var nextLump = header;

    // Look for the THINGS lump which contain the interactive objects in the
    // level
    var thingsLump = directory.lumpHeaderAfter(header, "THINGS");
    if (thingsLump) {
      self._things = new DoomWad.Things(stream, info, thingsLump);
    }

    // Look for the VERTEXES lump which contains the vertex geometry of the
    // level
    var vertexesLump = directory.lumpHeaderAfter(header, "VERTEXES");
    if (vertexesLump) {
      self._vertexes = new DoomWad.Vertexes(stream, info, vertexesLump);
    }

    // Look for the SECTORS lump which contains the polygon information for the
    // level
    var sectorsLump = directory.lumpHeaderAfter(header, "SECTORS");
    if (sectorsLump) {
      self._sectors = new DoomWad.Sectors(stream, info, sectorsLump, textures);
    }

    // Look for the SIDEDEFS lump which contains information about texturing
    // walls of the map.
    var sideDefsLump = directory.lumpHeaderAfter(header, "SIDEDEFS");
    if (sideDefsLump) {
      self._sideDefs = new DoomWad.SideDefs(stream, info, sideDefsLump, self._sectors, textures);
    }

    // Look for the LINEDEFS lump which contains information about lines
    // between vertices in the level.
    var lineDefsLump = directory.lumpHeaderAfter(header, "LINEDEFS");
    if (lineDefsLump) {
      self._lineDefs = new DoomWad.LineDefs(stream, info, lineDefsLump, self._vertexes, self._sideDefs);
    }

    return self;
  };

  Level.prototype.boundingBox = function() {
    var minX = this._vertexes.minX();
    var maxX = this._vertexes.maxX();

    var minZ = this._sectors.minZ();
    var maxZ = this._sectors.maxZ();

    var width = maxX - minX;

    var minY = this._vertexes.minY();
    var maxY = this._vertexes.maxY();

    var height = maxY - minY;

    return {
           "x": minX,
           "y": minY,
       "width": width,
      "height": height,
       "floor": minZ,
     "ceiling": maxZ,
    };
  };

  Level.prototype.vertices = function () {
    return this._vertexes.vertices();
  };

  Level.prototype.lineDefs = function () {
    return this._lineDefs.lineDefs();
  };

  Level.prototype.sectors = function () {
    return this._sectors.sectors();
  };
}
