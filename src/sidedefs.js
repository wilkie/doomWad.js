function initDoomWadSideDefs(context) {
  /**
   * Constructor
   */

  var SideDefs = context.DoomWad.SideDefs = function(stream, info, lumpHeader, sectors, textures) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the LINEDEFS lump
    stream.seek(lumpHeader["offset"]);

    var sideDefSize = 30;

    // Read in all lineDefs
    self._sideDefs = [];
    for (var i = 0; i < self._size; i += sideDefSize) {
      var sideDef = {};
      sideDef['textureX']      = stream.read16ls();
      sideDef['textureY']      = stream.read16ls();
      sideDef['textureUpper']  = textures.fromName(stream.readAscii(8), "patch");
      sideDef['textureLower']  = textures.fromName(stream.readAscii(8), "patch");
      sideDef['textureMiddle'] = textures.fromName(stream.readAscii(8), "patch");
      sideDef['sector']        = sectors.fromId(stream.read16lu());
      self._sideDefs.push(new context.DoomWad.SideDef(info, sideDef));
    }

    return self;
  };

  SideDefs.prototype.size = function() {
    return this._size;
  };

  SideDefs.prototype.fromId = function(index) {
    return this._sideDefs[index];
  };
}