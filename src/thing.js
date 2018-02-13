function initDoomWadThing(context) {
  /**
   * Constructor
   */

  var Thing = context.DoomWad.Thing = function(info, thingInfo) {
    var self = this;

    self._engine = info.engine();

    if (self._engine == "Hexen") {
      self._size = 20;
    }
    else {
      self._size = 10;
    }

    self._x     = thingInfo['x'];
    self._y     = thingInfo['y'];
    self._angle = thingInfo['angle'];
    self._flags = thingInfo['flags'];
    self._type  = thingInfo['type'];
  };

  Thing.prototype.size = function() {
    return this._size;
  };

  Thing.prototype.angle = function() {
    return this._angle;
  };

  Thing.prototype.x = function() {
    return this._x;
  };

  Thing.prototype.y = function() {
    return this._y;
  };

  Thing.prototype.flags = function() {
    return this._flags;
  };

  Thing.prototype.appearsOnEasy = function() {
    return (this._flags & 0x1) > 0;
  };

  Thing.prototype.appearsOnMedium = function() {
    return (this._flags & 0x2) > 0;
  };

  Thing.prototype.appearsOnHard = function() {
    return (this._flags & 0x4) > 0;
  };

  Thing.prototype.isDeafGuard = function() {
    return (this._flags & 0x8) > 0;
  };

  Thing.prototype.appearsInMultiplayer = function() {
    return (this._flags & 0x10) > 0;
  };

  Thing.prototype.isHexenDormant = function() {
    return (this._flags & 0x10) > 0;
  };

  Thing.prototype.appearsForHexenFighter = function() {
    return (this._flags & 0x20) > 0;
  };

  Thing.prototype.appearsForHexenCleric = function() {
    return (this._flags & 0x40) > 0;
  };

  Thing.prototype.appearsForHexenMage = function() {
    return (this._flags & 0x80) > 0;
  };

  Thing.prototype.appearsForHexenSinglePlayer = function() {
    return (this._flags & 0x100) > 0;
  };

  Thing.prototype.appearsForHexenCoOp = function() {
    return (this._flags & 0x200) > 0;
  };

  Thing.prototype.appearsForHexenDeathmatch = function() {
    return (this._flags & 0x400) > 0;
  };

  Thing.prototype._thingCollection = function() {
    if (this._engine === "DOOM" || this._engine === "DOOM2") {
      return context.DoomWad.Things.Doom;
    }

    return {};
  };

  Thing.prototype.info = function() {
    return this._thingCollection()[this._type];
  };

  Thing.prototype.name = function() {
    var info = this.info();
    if (info) {
      return this.info()['name'];
    }
    else {
      return "unknown";
    }
  };

  Thing.prototype.toString = function() {
    return "";
  };
}
