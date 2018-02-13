function initDoomWadVertexes(context) {
  /**
   * Constructor
   */

  var Vertexes = context.DoomWad.Vertexes = function(stream, info, lumpHeader) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the VERTEXES lump
    stream.seek(lumpHeader["offset"]);

    // Read in all vertices
    self._vertices = [];
    for (var i = 0; i < self._size; i += 4) {
      var vertex = {};
      vertex['x'] = stream.read16ls();
      vertex['y'] = stream.read16ls();

      if (i == 0) {
        self._minX = vertex['x'];
        self._minY = vertex['y'];
        self._maxX = vertex['x'];
        self._maxY = vertex['y'];
      }

      if (vertex['x'] > self._maxX) {
        self._maxX = vertex['x'];
      }
      if (vertex['x'] < self._minX) {
        self._minX = vertex['x'];
      }
      if (vertex['y'] > self._maxY) {
        self._maxY = vertex['y'];
      }
      if (vertex['y'] < self._minY) {
        self._minY = vertex['y'];
      }
      self._vertices.push(vertex);
    }

    return self;
  };

  Vertexes.prototype.size = function() {
    return this._size;
  };

  Vertexes.prototype.fromId = function(index) {
    return this._vertices[index];
  };

  Vertexes.prototype.maxX = function() {
    return this._maxX;
  };

  Vertexes.prototype.maxY = function() {
    return this._maxY;
  };

  Vertexes.prototype.minX = function() {
    return this._minX;
  };

  Vertexes.prototype.minY = function() {
    return this._minY;
  };

  Vertexes.prototype.vertices = function() {
    return this._vertices;
  };
}
