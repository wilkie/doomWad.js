function initDoomWadSideDef(context) {
  /**
   * Constructor
   */
   
  var SideDef = context.DoomWad.SideDef = function(info, sideDefInfo) {
    var self = this;

    self._size = 30;
    self._data = sideDefInfo;

    return self;
  };

  SideDef.prototype.size = function() {
    return this._size;
  };

  SideDef.prototype.sector = function() {
    return this._data['sector'];
  };

  SideDef.prototype.textureUpper = function() {
    return this._data['textureUpper'];
  };

  SideDef.prototype.textureLower = function() {
    return this._data['textureLower'];
  };

  SideDef.prototype.textureMiddle = function() {
    return this._data['textureMiddle'];
  };

  SideDef.prototype.textureX = function() {
    return this._data['textureX'];
  };

  SideDef.prototype.textureY = function() {
    return this._data['textureY'];
  };
}