function initDoomWadTexture(context) {
  var renderFlat = function(stream, lumpHeader, texture, palette) {
    if (lumpHeader.size != 4096) {
      console.log("WARNING: FLAT '" + lumpHeader.name + "': lump size is not 4096, it is " + lumpHeader.size);
    }

    stream.seek(lumpHeader.offset);

    // Make FLAT lump data similar to PATCH lump data:
    texture._width  = 64;
    texture._height = 64;
    texture._left   = 0;
    texture._top    = 0;

    texture._rgbaBuffer = new Uint8Array(4 * texture._width * texture._height);

    // Decode
    //texture._rgbaBuffer.fill(255);

    for (var y = 0; y < texture._height; y++) {
      for (var x = 0; x < texture._width; x++) {
        var pixel = stream.read8u();

        // Look up pixel value in palette.
        var realPixel = palette.fromId(pixel);

        // Write to buffer
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 0] = realPixel.red;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 1] = realPixel.green;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 2] = realPixel.blue;
        texture._rgbaBuffer[(x + y * texture._width) * 4 + 3] = 255;

        // Using uints:
        // texture._rgbaBuffer[x + y * this.width] = palette.asUInt32(pixel);
      }
    }
  }

  var renderTexture = function(stream, header, texture, palette) {
    texture._width  = header.width;
    texture._height = header.height;
    texture._left   = 0;
    texture._top    = 0;

    texture._rgbaBuffer = new Uint8Array(4 * texture._width * texture._height);

    header.patches.forEach(function(patchInfo) {
      renderPatch(stream, patchInfo, patchInfo.patchObject, texture, palette);
    });
  };

  var renderPatch = function(stream, patchInfo, patch, texture, palette) {
    patch.eachColumn(function(spans, x) {
      spans.forEach(function(info) {
        const spanInfo = info[0];
        const data     = info[1];

        const textureX = x + patchInfo.originX;

        for (var y = spanInfo.yOffset; y < (spanInfo.yOffset + spanInfo.nPixels) && (y + patchInfo.originY) < texture._height; y++) {
          const textureY = y + patchInfo.originY;

          const realPixel = data[y - spanInfo.yOffset];

          // Write to buffer
          texture._rgbaBuffer[(textureX + textureY * texture._width) * 4 + 0] = realPixel.red;
          texture._rgbaBuffer[(textureX + textureY * texture._width) * 4 + 1] = realPixel.green;
          texture._rgbaBuffer[(textureX + textureY * texture._width) * 4 + 2] = realPixel.blue;
          texture._rgbaBuffer[(textureX + textureY * texture._width) * 4 + 3] = 255;
        }
      });
    });
  };

  /**
   * Constructor
   */
  var Texture = context.DoomWad.Texture = function(stream, header, palette) {
    var self = this;

    // Record the total size of the texture
    self._size = header['size'];

    // Record the name
    self._name = header['name'];

    // Record the namespace
    self._namespace = header['namespace'] || "global";

    // Decompress texture
    if ('patches' in header) {
      renderTexture(stream, header, self, palette);
    }
    else {
      renderFlat(stream, header, self, palette);
    }

    return self;
  };

  Texture.prototype.size = function() {
    return this._size;
  };

  Texture.prototype.width = function() {
    return this._width;
  };

  Texture.prototype.height = function() {
    return this._height;
  };

  Texture.prototype.rgbaBuffer = function() {
    return this._rgbaBuffer;
  };

  Texture.prototype.name = function() {
    return this._name;
  };

  Texture.prototype.namespace = function() {
    return this._namespace;
  };
}
