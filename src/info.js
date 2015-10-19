function initDoomWadInfo(context) {
  /**
   * Constructor
   */

  var Info = context.DoomWad.Info = function(size, header, directory) {
    var self = this;

    // Record the total size of the WAD in bytes
    self._size = size;

    // Detect the intended engine
    if (directory.lumpExists("MAP01")) {
      if (directory.lumpExists("TITLE") || directory.lumpExists("BEHAVIOR")) {
        self._engine = "Hexen";
      }
      else {
        self._engine = "DOOM2";
      }
    }
    else if (directory.lumpExists("E1M1")) {
      self._engine = "DOOM";
    }
    else {
      self._engine = "unknown";
    }

    return self;
  };

  Info.prototype.size = function() {
    return this._size;
  };

  Info.prototype.numberOfLumps = function() {
    return this._data.numberOfLumps;
  };

  Info.prototype.dictionaryStart = function() {
    return this._data.dictionaryStart;
  };

  Info.prototype.engine = function() {
    return this._engine;
  };
}