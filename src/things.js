function initDoomWadThings(context) {
  /**
   * Constructor
   */

  var Things = context.DoomWad.Things = function(stream, info, lumpHeader) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the THINGS lump
    stream.seek(lumpHeader["offset"]);

    var isHexen = info.engine() == "Hexen";
    var thingSize = 10;
    if (isHexen) {
      thingSize = 20;
    }

    self._things = [];

    // Read in the thing table
    for (var i = 0; i < self._size; i += thingSize) {
      var thingInfo = {};
      if (isHexen) {
        thingInfo['id'] = stream.read16lu();
      }
      thingInfo['x'] = stream.read16lu();
      thingInfo['y'] = stream.read16lu();
      if (isHexen) {
        thingInfo['height'] = stream.read16lu();
      }
      thingInfo['angle'] = stream.read16lu();
      thingInfo['type']  = stream.read16lu();
      thingInfo['flags'] = stream.read16lu();
      if (isHexen) {
        thingInfo['specialType']      = stream.read8u();
        thingInfo['specialArguments'] = stream.read(5);
      }

      var thing = new DoomWad.Thing(info, thingInfo);

      self._things.push(thing);
    }

    return self;
  };

  Things.prototype.size = function() {
    return this._size;
  };
}
