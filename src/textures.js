function initDoomWadTextures(context) {
  /**
   * Constructor
   */

  var Textures = context.DoomWad.Textures = function(info, directory, palette) {
    var self = this;

    // Record the total size of all known textures in bytes
    self._size = 0;

    // Will contain Texture objects in a dictionary keyed by name.
    self._cache = {};
    self._cache['global'] = {}

    // Keep a reference to the directory.
    self._directory = directory;

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
      const lump = this._directory.lumpHeaderFor(name);
      const header = lump.header;
      const stream = lump.stream;

      if (header) {
        this._patches[name] = new context.DoomWad.Patch(stream, this._info, header, this._palette);
      }
      else {
        console.log("WARNING:", "PATCH LUMP", name, ": not found");
      }
    }

    return this._patches[name];
  };

  Textures.prototype._loadSprite = function(name) {
    var self = this;

    if (self._spritesLoaded === undefined) {
      self._spritesLoaded = {};
    }

    if (!self._spritesLoaded[name]) {
      var lump = self._directory.lumpHeaderFor(name, "sprite");
      const patch  = lump.header;
      const stream = lump.stream;

      patch.originX = 0;
      patch.originY = 0;
      patch.patch   = name;
      if (patch) {
        self._spritesLoaded[name] = patch;
        self._spritesLoaded[name].stream = stream;
        self._spritesLoaded[name].patchObject = new context.DoomWad.Patch(stream, self._info, patch, self._palette);
      }
    }

    return self._spritesLoaded[name];
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
      const stream = patches.stream;
      const header = patches.header;

      stream.push();
      stream.seek(header.offset);

      const numPatches = stream.read32lu();

      self._patchNames = new Array(numPatches);

      for (var i = 0; i < numPatches; i++) {
        self._patchNames[i] = stream.readAscii(8);
        self._patches[self._patchNames[i]] = null;
      }

      stream.pop();
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
      const stream = textures.stream;
      const header = textures.header;

      stream.push();
      stream.seek(header.offset);

      var numTextures = stream.read32lu();

      var textureRecords = new Array(numTextures);

      for (var i = 0; i < numTextures; i++) {
        textureRecords[i] = stream.read32lu();
      }

      for (var i = 0; i < numTextures; i++) {
        stream.push();
        stream.seek(textureRecords[i] + header.offset);

        textureRecords[i] = {
          name:   stream.readAscii(8),
          flags:  stream.read16lu(),   // ZDoom
          scalex: stream.read8u(),     // ZDoom
          scaley: stream.read8u(),     // ZDoom
          width:  stream.read16lu(),
          height: stream.read16lu(),
          coldir: stream.read32lu(),
          npatch: stream.read16lu(),
          patches: [],
          stream: stream
        };

        self._textures[textureRecords[i].name.toUpperCase()] = textureRecords[i];

        if (textureRecords[i].npatch > 1000) {
          stream.pop();
          stream.pop();
          return;
        }

        for (var j = 0; j < textureRecords[i].npatch; j++) {
          const patchInfo = {
            originX:  stream.read16ls(),
            originY:  stream.read16ls(),
            patch:    stream.read16lu()
          };

          if (self._info.engine != "Strife") {
            // Hop over 4 bytes for stepdir/colormap
            // Strife doesn't put them in the patch file
            stream.read32lu();
          }

          textureRecords[i].patches.push(patchInfo);
        }
        stream.pop();
      }

      stream.pop();
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
      return null;
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
      name = name.toUpperCase();

      // Look for general texture
      if (name in this._textures) {
        if (!('textureObject' in this._textures[name])) {
          // Realize the patches within the texture
          this._textures[name].patches.forEach(function(patchInfo, i) {
            self._textures[name].patches[i].patchObject = self.patchFromIndex(patchInfo.patch);
          });

          this._textures[name].textureObject = new context.DoomWad.Texture(this._textures[name].stream, this._textures[name], this._palette);
        }

        return this._textures[name].textureObject;
      }
      else if (name != "-") {
        console.log("WARNING: cannot find texture", name);
      }
    }
    else if (!(name in this._cache[namespace])) {
      if (namespace == "flat") {
        var lump = this._directory.lumpHeaderFor(name, namespace);
        if (lump) {
          const stream = lump.stream;
          const lumpHeader = lump.header;

          stream.push();
          var texture  = new context.DoomWad.Texture(stream, lumpHeader, this._palette);
          this._cache[namespace][name] = texture;

          if (!(name in this._cache["global"])) {
            this._cache["global"][name] = texture;
          }

          stream.pop();
        }
        else {
          console.log("Warning:", "lump section", name, namespace, "not found");
        }
      }
      else {
        // It is a simple, single patch
        this._cache[namespace][name] = new context.DoomWad.Texture(this._loadSprite(name).stream, {
          'patches': [this._loadSprite(name)],
          'size': 0,
          'name': name,
          'width': this._loadSprite(name).patchObject.width(),
          'height': this._loadSprite(name).patchObject.height(),
          'namespace': namespace
        }, this._palette);
      }
    }

    return this._cache[namespace][name];
  };
}
