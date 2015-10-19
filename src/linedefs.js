function initDoomWadLineDefs(context) {
  /**
   * Constructor
   */

  var LineDefs = context.DoomWad.LineDefs = function(stream, info, lumpHeader, vertexes, sideDefs) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the LINEDEFS lump
    stream.seek(lumpHeader["offset"]);

    var isHexen = info.engine() == "Hexen";
    var lineDefSize = 14;
    if (isHexen) {
      lineDefSize = 16;
    }

    // Keeps track of all linedefs for a sector index
    self._sectorReference = {};

    // Read in all lineDefs
    self._lineDefs = [];
    for (var i = 0; i < self._size; i += lineDefSize) {
      var lineDef = {};
      lineDef['start']        = vertexes.fromId(stream.read16lu());
      lineDef['end']          = vertexes.fromId(stream.read16lu());
      lineDef['flags']        = stream.read16lu();
      if (isHexen) {
        lineDef['action']     = stream.read8u();
        lineDef['arguments']  = stream.read(5);
      }
      else {
        lineDef['effect']     = stream.read16lu();
        lineDef['tag']        = stream.read16lu();
      }
      lineDef['rightSideDef'] = sideDefs.fromId(stream.read16lu());
      lineDef['leftSideDef']  = sideDefs.fromId(stream.read16lu());
      lineDef['sectors'] = [];
      if (lineDef['rightSideDef']) {
        lineDef['sectors'].push(lineDef['rightSideDef'].sector());
      }
      if (lineDef['leftSideDef']) {
        var sector = lineDef['leftSideDef'].sector();
        if (!(sector in lineDef['sectors'])) {
          lineDef['sectors'].push(sector);
        }
      }

      var newLineDef = new context.DoomWad.LineDef(info, lineDef)
      self._lineDefs.push(newLineDef);

      lineDef['sectors'].forEach(function(sector) {
        if (!(sector.index() in self._sectorReference)) {
          self._sectorReference[sector.index()] = []
        }
        self._sectorReference[sector.index()].push(lineDef);

        sector.appendLineDef(newLineDef);
      });
    }

    return self;
  };

  LineDefs.prototype.size = function() {
    return this._size;
  };

  LineDefs.prototype.lineDefs = function() {
    return this._lineDefs.slice(0);
  };

  LineDefs.prototype.forSector = function(sectorIndex) {
    return this._sectorReference[sectorIndex] || [];
  };
}