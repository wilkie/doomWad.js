function initDoomWadTextures(context) {
  /**
   * Constructor
   */

  var Textures = context.DoomWad.Textures = function(stream, info, directory, palette) {
    var self = this;

    // Record the total size of all known textures in bytes
    self._size = 0;

    // Will contain Texture objects in a dictionary keyed by name.
    self._cache = {};
    self._cache['global'] = {}

    // Keep a reference to the directory.
    self._directory = directory;

    // Keep a reference to the stream.
    self._stream = stream;

    // Keep a reference of the palette.
    self._palette = palette;

    // Keep a reference to the general info.
    self._info = info;

    return self;
  };

  Textures.prototype.patchFromIndex = function(index) {
    this._loadPatches();

    var name = this._patchNames[index];

    return this.patchFromName(name);
  };

  Textures.prototype.patchFromName = function(name) {
    this._loadPatches();

    if (this._patches[name] === null) {
      const header = this._directory.lumpHeaderFor(name);
      if (header) {
        this._patches[name] = new context.DoomWad.Patch(this._stream, this._info, header, this._palette);
      }
      else {
        console.log("WARNING:", "PATCH LUMP", name, ": not found");
      }
    }

    return this._patches[name];
  };

  Textures.prototype._loadPatches = function() {
    var self = this;

    const lumpName = "PNAMES";

    if (self._patchesLoaded === undefined) {
      self._patchesLoaded = {};
    }

    if (self._patchesLoaded[lumpName]) {
      return;
    }

    self._patchesLoaded[lumpName] = true;

    self._patches = {};

    var patches = self._directory.lumpHeaderFor(lumpName);
    if (patches) {
      self._stream.push();
      self._stream.seek(patches.offset);

      const numPatches = self._stream.read32lu();

      self._patchNames = new Array(numPatches);

      for (var i = 0; i < numPatches; i++) {
        self._patchNames[i] = self._stream.readAscii(8);
        self._patches[self._patchNames[i]] = null;
      }

      self._stream.pop();
    }
  };

  Textures.prototype._loadTextureLump = function(lumpName) {
    var self = this;

    if (self._textures === undefined) {
      self._textures = {};
    }

    if (self._texturesLoaded === undefined) {
      self._texturesLoaded = {};
    }

    if (self._texturesLoaded[lumpName]) {
      return;
    }

    self._texturesLoaded[lumpName] = true;

    var textures = self._directory.lumpHeaderFor(lumpName);
    if (textures) {
      self._stream.push();
      self._stream.seek(textures.offset);

      var numTextures = self._stream.read32lu();

      var textureRecords = new Array(numTextures);

      for (var i = 0; i < numTextures; i++) {
        textureRecords[i] = self._stream.read32lu();
      }

      for (var i = 0; i < numTextures; i++) {
        self._stream.push();
        self._stream.seek(textureRecords[i] + textures.offset);

        textureRecords[i] = {
          name:   self._stream.readAscii(8),
          flags:  self._stream.read16lu(),   // ZDoom
          scalex: self._stream.read8u(),     // ZDoom
          scaley: self._stream.read8u(),     // ZDoom
          width:  self._stream.read16lu(),
          height: self._stream.read16lu(),
          coldir: self._stream.read32lu(),
          npatch: self._stream.read16lu(),
          patches: []
        };

        self._textures[textureRecords[i].name] = textureRecords[i];

        if (textureRecords[i].npatch > 1000) {
          self._stream.pop();
          self._stream.pop();
          return;
        }

        for (var j = 0; j < textureRecords[i].npatch; j++) {
          const patchInfo = {
            originX:  self._stream.read16lu(),
            originY:  self._stream.read16lu(),
            patch:    self._stream.read16lu()
          };

          if (self._info.engine != "Strife") {
            // Hop over 4 bytes for stepdir/colormap
            // Strife doesn't put them in the patch file
            self._stream.read32lu();
          }

          textureRecords[i].patches.push(patchInfo);
        }
        self._stream.pop();
      }

      self._stream.pop();
    }
  };

  Textures.prototype.size = function() {
    return this._size;
  };

  Textures.prototype.forNamespace = function(namespace) {
    var textures = this._cache[namespace];
    return Object.keys(textures).map(function(k) { return textures[k]});
  }

  Textures.prototype.fromName = function(name, namespace) {
    var self = this;

    if(name == "") {
      throw "";
    }

    if (namespace === undefined) {
      namespace = "global";
    }

    if (!(namespace in this._cache)) {
      this._cache[namespace] = {};
    }

    this._loadTextureLump("TEXTURE1");
    this._loadTextureLump("TEXTURE2");

    if (namespace == "global") {
      // Look for general texture
      if (name in this._textures) {
        if (!('textureObject' in this._textures[name])) {
          // Realize the patches within the texture
          this._textures[name].patches.forEach(function(patchInfo, i) {
            self._textures[name].patches[i].patchObject = self.patchFromIndex(patchInfo.patch);
          });
          this._textures[name].textureObject = new context.DoomWad.Texture(this._stream, this._textures[name], this._palette);
        }

        return this._textures[name].textureObject;
      }
    }
    else if (!(name in this._cache[namespace])) {
      var lumpHeader = this._directory.lumpHeaderFor(name, namespace);
      if (lumpHeader) {
        this._stream.push();
        var texture  = new context.DoomWad.Texture(this._stream, lumpHeader, this._palette);
        this._cache[namespace][name] = texture;

        if (!(name in this._cache["global"])) {
          this._cache["global"][name]  = texture;
        }

        this._stream.pop();
      }
      else {
        console.log("Warning:", "lump section", name, namespace, "not found");
      }
    }

    return this._cache[namespace][name];
  };
}
