function initDoomWadLineDef(context) {
  /**
   * Constructor
   */
   
  var LineDef = context.DoomWad.LineDef = function(info, lineDefInfo) {
    var self = this;

    self._engine = info.engine();

    if (self._engine == "Hexen") {
      self._size = 16;
    }
    else {
      self._size = 14;
    }

    self._start  = lineDefInfo['start'];
    self._end    = lineDefInfo['end'];
    self._flags  = lineDefInfo['flags'];
    if (self._engine === "Hexen") {
      self._action    = lineDefInfo['action'];
      self._arguments = lineDefInfo['arguments'];
    }
    else {
      self._effect = lineDefInfo['effect'];
      self._tag    = lineDefInfo['tag'];
    }
    self._rightSideDef = lineDefInfo['rightSideDef'];
    self._leftSideDef  = lineDefInfo['leftSideDef'];
  };

  LineDef.prototype.magnitude = function() {
    return Math.sqrt(
      (this._start.x - this._end.x) * (this._start.x - this._end.x) +
      (this._start.y - this._end.y) * (this._start.y - this._end.y)
    );
  };

  LineDef.prototype.rightSideDef = function() {
    return this._rightSideDef;
  };

  LineDef.prototype.leftSideDef = function() {
    return this._leftSideDef;
  };

  LineDef.prototype.size = function() {
    return this._size;
  };

  LineDef.prototype.start = function() {
    return this._start;
  };

  LineDef.prototype.end = function() {
    return this._end;
  };

  LineDef.prototype.isImpassable = function() {
    return (this._flags & 0x1) > 0;
  };

  LineDef.prototype.isBlockingMonsters = function() {
    return (this._flags & 0x2) > 0;
  };

  LineDef.prototype.isDoubleSided = function() {
    return (this._flags & 0x4) > 0;
  };

  LineDef.prototype.isUpperUnpegged = function() {
    return (this._flags & 0x8) > 0;
  };

  LineDef.prototype.isLowerUnpegged = function() {
    return (this._flags & 0x10) > 0;
  };

  LineDef.prototype.isSecret = function() {
    return (this._flags & 0x10) > 0;
  };

  LineDef.prototype.isBlockingSound = function() {
    return (this._flags & 0x20) > 0;
  };

  LineDef.prototype.isHidden = function() {
    return (this._flags & 0x40) > 0;
  };

  LineDef.prototype.isShown = function() {
    return (this._flags & 0x80) > 0;
  };

  LineDef.prototype.isHexenSpecialRepeatable = function() {
    return (this._flags & 0x100) > 0;
  };

  LineDef.prototype.isHexenSpecialActivation = function() {
    return (this._flags & 0x200) > 0;
  };
}
