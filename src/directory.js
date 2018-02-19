function initDoomWadDirectory(context) {
  /**
   * Constructor
   */

  var Directory = context.DoomWad.Directory = function(streams, headers) {
    var self = this;

    self._size = 0;

    self._directories = streams.map(function(stream, i) {
      const header = headers[i];

      // Get the number of lumps from the header.
      const lumpCount = header.numberOfLumps();

      // Go to the lump directory.
      stream.seek(header.directoryStart());

      ret = {
        stream:     stream,
        size:       16 * lumpCount,
        directory:  {},
        namespaces: {}
      };

      self._size += ret.size;

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
        name = name.toUpperCase();

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

        if (!(name in ret.directory)) {
          ret.directory[name] = [];
        }
        ret.directory[name].push(lumpHeader);

        if (namespace != "global") {
          if (!(namespace in ret.namespaces)) {
            ret.namespaces[namespace] = [];
          }
          ret.namespaces[namespace].push(lumpHeader);
        }
        last = lumpHeader;
      }

      return ret;
    }).reverse();

    return self;
  };

  Directory.prototype.size = function() {
    return this._size;
  };

  Directory.prototype.lumpsFor = function(namespace) {
    return this._directories[0].namespaces[namespace] || [];
  };

  Directory.prototype.lumpHeaderFor = function(name, namespace) {
    name = name.toUpperCase();

    for (var i = 0; i < this._directories.length; i++) {
      const wad = this._directories[i];

      var list = wad.directory[name];

      if (list) {
        if (namespace !== undefined) {
          for (var i = 0; i < wad.directory[name].length; i++) {
            if (wad.directory[name][i].namespace === namespace) {
              return {
                stream: wad.stream,
                header: wad.directory[name][i]
              }
            }
          }
          return null;
        }

        return {
          stream: wad.stream,
          header: wad.directory[name][0]
        }
      }
    };

    return null;
  };

  Directory.prototype.lumpExists = function(name, excludePWAD) {
    name = name.toUpperCase();

    for (var i = 0; i < (excludePWAD ? 0 : this._directories.length); i++) {
      const wad = this._directories[i];

      if (name in wad.directory) {
        return true;
      }
    }

    return false;
  };

  Directory.prototype.lumpHeaderAfter = function(afterLump, name) {
    name = name.toUpperCase();

    var lumpStart = afterLump;
    var currentLump = lumpStart;
    var i = 0;
    while (currentLump && (currentLump.name != name)) {
      i += 1;
      if (i >= 25) {
        return null;
      }

      currentLump = currentLump.next;
    }

    return currentLump;
  };
}
