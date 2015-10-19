function initDoomWadDirectory(context) {
  /**
   * Constructor
   */

  var Directory = context.DoomWad.Directory = function(stream, header) {
    var self = this;

    // Get the number of lumps from the header.
    var lumpCount = header.numberOfLumps();

    // Go to the lump directory.
    stream.seek(header.directoryStart());

    self._size = 16 * lumpCount;
    self._directory = {};

    var last = {};

    var inFlats = false;
    var inSprites = false;
    var namespace = "global";

    // Start reading off each lump.
    for (var i = 0; i < lumpCount; i++) {
      // Read lump header
      var offset = stream.read32lu();
      var size   = stream.read32lu();
      var name   = stream.readAscii(8);

      // Check for namespace
      if (name === "F_START") {
        inFlats = true;
        namespace = "flat";
      }
      else if (name === "F_END") {
        inFlats = false;
        namespace = "global";
      }
      if (name === "S_START") {
        inSprites = true;
        namespace = "sprite";
      }
      else if (name === "S_END") {
        inSprites = false;
        namespace = "global";
      }

      var lumpHeader = {
        "size": size,
        "offset": offset,
        "name": name,
        "namespace": namespace
      };

      // Store lump header and link the last lumpHeader to this one.
      last["next"] = lumpHeader
      if (!(name in self._directory)) {
        self._directory[name] = [];
      }
      self._directory[name].push(lumpHeader);
      last = lumpHeader;
    }

    return self;
  };

  Directory.prototype.size = function() {
    return this._size;
  };

  Directory.prototype.lumpHeaderFor = function(name, namespace) {
    var list = this._directory[name];

    if (list === undefined) {
      return null;
    }

    if (namespace !== undefined) {
      for (var i = 0; i < this._directory[name].length; i++) {
        if (this._directory[name][i].namespace === namespace) {
          return this._directory[name][i];
        }
      }
    }

    return this._directory[name][0];
  };

  Directory.prototype.lumpExists = function(name) {
    return name in this._directory;
  };

  Directory.prototype.lumpHeaderAfter = function(afterLumpName, name) {
    var lumpStart = this.lumpHeaderFor(afterLumpName);
    var currentLump = lumpStart;
    var i = 0;
    while (currentLump && (currentLump['name'] != name)) {
      i += 1;
      if (i >= 25) {
        return null;
      }

      currentLump = currentLump['next'];
    }

    return currentLump;
  };
}