function initDoomWadPatch(context) {
  /**
   * Constructor
   */

  var Patch = context.DoomWad.Patch = function(stream, info, lumpHeader, palette) {
    var self = this;

    // Record the total size of all known textures in bytes
    self._size = 0;

    // Keep a reference to the lump
    self._lumpHeader = lumpHeader;

    // Keep a reference to the stream.
    self._stream = stream;

    // Keep a reference of the palette.
    self._palette = palette;

    // Keep a reference to the general info.
    self._info = info;

    self._stream.push();
    self._stream.seek(self._lumpHeader.offset);

    self._width  = self._stream.read16lu();
    self._height = self._stream.read16lu();
    self._x      = self._stream.read16ls();
    self._y      = self._stream.read16ls();

    self._columnOffsets = new Array(self._width);

    for (var i = 0; i < self._width; i++) {
      self._columnOffsets[i] = self._stream.read32lu();
    }

    self._stream.pop();

    return self;
  };

  Patch.prototype.x = function() {
    return this._x;
  };

  Patch.prototype.y = function() {
    return this._y;
  };

  Patch.prototype.width = function() {
    return this._width;
  };

  Patch.prototype.height = function() {
    return this._height;
  };

  Patch.prototype.eachColumn = function(callback) {
    var self = this;

    if (!self._columns) {
      self._columns = new Array(self._width);
      self._columnOffsets.forEach(function(columnOffset, x) {
        self._stream.push();
        self._stream.seek(self._lumpHeader.offset + columnOffset);

        var parsing = 0;
        var spans = [];

        while (parsing < 255) {
          parsing ++;

          const spanInfo = {
            yOffset: self._stream.read8u(),
            nPixels: self._stream.read8u(),
            unused:  self._stream.read8u()
          };

          // This is the final span
          if (spanInfo.yOffset >= 255) {
            parsing = 255;
            continue;
          }

          var pixels = new Array(spanInfo.nPixels);
          for (var i = 0; i < pixels.length; i++) {
            pixels[i] = self._palette.fromId(self._stream.read8u());
          };

          // There is a dummy byte apparently
          self._stream.read8u()

          spans.push([spanInfo, pixels]);
        }

        self._stream.pop();

        self._columns[x] = spans;
      });
    }

    return self._columns.forEach(callback);
  }
};
