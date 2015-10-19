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

    return self;
  };

  Textures.prototype.size = function() {
    return this._size;
  };

  Textures.prototype.forNamespace = function(namespace) {
    var textures = this._cache[namespace];
    return Object.keys(textures).map(function(k) { return textures[k]});
  }

  Textures.prototype.fromName = function(name, namespace) {
    if (namespace === undefined) {
      namespace = "global";
    }

    if (!(namespace in this._cache)) {
      this._cache[namespace] = {};
    }

    if (!(name in this._cache[namespace])) {
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
    }

    return this._cache[namespace][name];
  };
}