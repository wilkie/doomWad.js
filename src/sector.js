function initDoomWadSector(context) {
  /**
   * Constructor
   */
   
  var Sector = context.DoomWad.Sector = function(sectorInfo) {
    var self = this;

    self._floorHeight    = sectorInfo['floorHeight'];
    self._ceilingHeight  = sectorInfo['ceilingHeight'];
    self._lightLevel     = sectorInfo['lightLevel'];
    self._special        = sectorInfo['special'];
    self._textureFloor   = sectorInfo['textureFloor'];
    self._textureCeiling = sectorInfo['textureCeiling'];
    self._tag            = sectorInfo['tag'];
    self._index          = sectorInfo['index'];
    self._lineDefs       = [];

    return self;
  };

  Sector.prototype.brightness = function() {
    return this._lightLevel;
  };

  Sector.prototype.floor = function() {
    return this._floorHeight;
  };

  Sector.prototype.ceiling = function() {
    return this._ceilingHeight;
  };

  Sector.prototype.neighborFloor = function() {
    var self = this;

    // Look at each linedef's sidedef and determine the most visible point
    var ret = self.floor();

    this._lineDefs.forEach(function(lineDef) {
      var sideDef = lineDef.rightSideDef();
      if (sideDef && sideDef.sector() === self) {
        sideDef = lineDef.leftSideDef();
      }

      if (sideDef) {
        ret = Math.min(ret, sideDef.sector().floor());
      }
    });

    return ret;
  };

  Sector.prototype.neighborCeiling = function() {
    var self = this;

    // Look at each linedef's sidedef and determine the most visible point
    var ret = self.ceiling();

    this._lineDefs.forEach(function(lineDef) {
      var sideDef = lineDef.rightSideDef();
      if (sideDef && sideDef.sector() === self) {
        sideDef = lineDef.leftSideDef();
      }

      if (sideDef) {
        ret = Math.max(ret, sideDef.sector().ceiling());
      }
    });

    return ret;
  };

  Sector.prototype.lineDefs = function() {
    return this._lineDefs;
  };

  Sector.prototype.size = function() {
    return this._size;
  };

  Sector.prototype.index = function() {
    return this._index;
  };

  Sector.prototype.appendLineDef = function(lineDef) {
    this._lineDefs.push(lineDef);
    return this;
  };

  Sector.prototype.renderToCanvas = function(canvas, x, y) {
    this._textureFloor.renderSectorToCanvas(this, canvas, x, y);
    return this;
  };

  Sector.prototype.textureFloor = function() {
    return this._textureFloor;
  };

  Sector.prototype.textureCeiling = function() {
    return this._textureCeiling;
  };

  Sector.prototype.boundingBox = function() {
    var self = this;
    this.vertices();
    if (this._minX === undefined) {
      this._vertices.forEach(function(vertex) {
        if (self._minX === undefined || vertex.x < self._minX) {
          self._minX = vertex.x;
        }
        if (self._minY === undefined || vertex.y < self._minY) {
          self._minY = vertex.y;
        }
        if (self._maxX === undefined || vertex.x > self._maxX) {
          self._maxX = vertex.x;
        }
        if (self._maxY === undefined || vertex.y > self._maxY) {
          self._maxY = vertex.y;
        }
      });
    }

    return {
           "x": this._minX,
           "y": this._minY,
       "width": this._maxX - this._minX,
      "height": this._maxY - this._minY
    };
  };

  // Returns the LineDef for the given pair of coordinates.
  Sector.prototype.lineDefAt = function(x1, y1, x2, y2) {
    for (var i = 0; i < this._lineDefs.length; i++) {
      var lineDef = this._lineDefs[i];

      var cx1 = lineDef.start().x;
      var cy1 = lineDef.start().y;
      var cx2 = lineDef.end().x;
      var cy2 = lineDef.end().y;

      if (cx1 == x1 && cy1 == y1 && cx2 == x2 && cy2 == y2) {
        return lineDef;
      }
      else if (cx1 == x2 && cy1 == y2 && cx2 == x1 && cy2 == y1) {
        return lineDef;
      }
    }

    return null;
  };

  // Helper method that takes a list of lineDefs and a coordinate (x,y)
  // and finds the lineDef that contains that vertex.
  var findLineDef = function(lineDefs, x, y) {
    for (var i = 0; i < lineDefs.length; i++) {
      var lineDef = lineDefs[i];

      var x1 = lineDef.start().x;
      var y1 = lineDef.start().y;
      var x2 = lineDef.end().x;
      var y2 = lineDef.end().y;

      if (x1 == x && y1 == y) {
        // Add this lineDef and currentVertex becomes lineDef.end
        return [i, true];
      }
      else if (x2 == x && y2 == y) {
        // Add this lineDef and currentVertex becomes lineDef.start
        return [i, false];
      }
    }
    return null;
  };

  // Helper method that takes a list of lineDefs and finds a closed
  // polygon. It will mutate the state of the passed in lineDefs to
  // remove any lineDefs used to create the returned polygon.
  // It will always remove at least one lineDef, so if no polygon is
  // found with that lineDef, it will be destroyed. This ensures that
  // the method and ones calling this method do not recurse forever.
  var findPolygon = function(lineDefs) {
    var vertices = [];

    // Choose a lineDef. Look for a linedef that is attached. repeat until we
    // see the second vertex of that first lineDef (and close the sector
    // geometry)
    var startLineDef = lineDefs[0];

    // Add the first vertex of this first line
    vertices.push(startLineDef.start())

    // Purge that first line
    lineDefs.splice(0, 1);

    // Look for the second vertex of this line
    var currentVertex = startLineDef.end();

    while(lineDefs.length > 0) {
      var foundLineDefTuple = findLineDef(lineDefs, currentVertex.x, currentVertex.y);
      if (foundLineDefTuple === null) {
        break;
      }
      var lineDefIndex     = foundLineDefTuple[0];
      var lineDefDirection = foundLineDefTuple[1];

      // Remove the line we found
      var lineDef = lineDefs.splice(lineDefIndex, 1)[0];

      // Add this vertex
      vertices.push(currentVertex);

      // Determine the next vertex to find
      if (lineDefDirection) {
        currentVertex = lineDef.end();
      }
      else {
        currentVertex = lineDef.start();
      }
    }

    return vertices;
  };

  // Helper method to determine when given 2 polygons whether the second is
  // within the first. Uses even-odd algorithm on just a single point of the
  // second polygon to make this determination. Generally assumes polygons are
  // contained wholely within the polygon. This is true for Doom sector
  // geometry.
  var isPolygonWithinPolygon = function(sectorA, sectorB) {
    // The chosen point
    var x = sectorB[0].x;
    var y = sectorB[0].y;

    // We will assume it isn't inside until proven wrong
    var truth = false;

    // We compare line segments. The first line segment we will use is
    // the last vertex and the first vertex. We will continue around the
    // polygon line segment by line segment.
    var j = sectorA.length - 1;

    // Essentially, we are considering a ray drawn through the chosen point
    // and checking for how many intersections we see through the polygon.
    // If there are 1, 3, etc intersections from the point to infinity, we
    // are within the polygon. An even number, and we are outside.
    for (var i = 0; i < sectorA.length; i++) {
      if (((sectorA[i].y > y) != (sectorA[j].y > y)) &&
          (x < (sectorA[j].x - sectorA[i].x) * (y - sectorA[i].y) / 
          (sectorA[j].y - sectorA[i].y) + sectorA[i].x)) {
        // Toggle the truth as we find an intersection
        truth = !truth;
      }
      j = i;
    }

    return truth;
  };

  // Helper method that returns true when the polygon is going clockwise
  // The method is found here:
  // http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order
  var detectPolygonDirection = function(polygon) {
    var j = polygon.length - 1;
    var accumulator = 0;
    for (var i = 0; i < polygon.length; i++) {
      accumulator += (polygon[i].x-polygon[j].x) * (polygon[i].y + polygon[i].y);
      j = i;
    }

    return accumulator < 0;
  };

  // Helper method that takes a list of vertices and ensures that they are
  // going clockwise (when clockwise is true) or counter-clockwise (otherwise)
  var ensurePolygonVertexOrder = function(polygon, clockwise) {
    if (detectPolygonDirection(polygon) !== clockwise) {
      return polygon.reverse();
    }
    return polygon;
  };

  // Helper method that takes a list of polygons and picks out a polygon that
  // is not within any other polygon. This method mutates the state of the
  // given list of polygons to remove the one chosen.
  var masterPolygon = function(polygons) {
    var index = 0;
    var polygon = polygons[index];
    var chosen = [index];
    // Find any larger polygons that this lies within
    // If we find one, we choose that polygon instead.
    for (var i = 0; i < polygons.length; i++) {
      if (i == index) {
        continue;
      }

      if (isPolygonWithinPolygon(polygons[i], polygon)) {
        // We now choose this better polygon (if we haven't before)
        if (!(i in chosen)) {
          polygon = polygons[i];
          index = i;

          chosen.push(i);

          // Start our search over (i++ will return the counter to 0)
          i = -1;
        }
      }
    }

    // Return and remove our chosen polygon from the list:
    return polygons.splice(index,1)[0];
  };

  // Helper method that takes a list of polygons and a master polygon and
  // returns a list of polygons that are inside (holes) this polygon.
  // This method mutates the state of the given list of polygons to remove
  // those chosen and returned.
  var polygonsWithin = function(polygons, polygon) {
    var ret = [];
    for (var i = 0; i < polygons.length; i++) {
      if (isPolygonWithinPolygon(polygon, polygons[i])) {
        ret.push(polygons.splice(0,1)[0]);
        i--;
      }
    }

    return ret;
  };

  Sector.prototype.polygons = function() {
    // We cache this, but if we don't have it, we have to figure out which
    // vertices surround this sector. We want to return them ordered.
    if (this._polygons === undefined) {
      var self = this;

      this._polygons = [];

      if (this._lineDefs.length == 0) {
        return this._polygons;
      }

      var lineDefs = this._lineDefs.slice();
      var polygons = [];
      while(lineDefs.length > 0) {
        var polygon = findPolygon(lineDefs);

        if (this._polygons.length > 0) {
          polygon = polygon.reverse();
        }

        polygons.push(polygon);
      }

      // Order the polygons
      var mainPolygons = [];
      while(polygons.length > 0) {
        var mainPolygon = masterPolygon(polygons);
        var subPolygons = polygonsWithin(polygons, mainPolygon);

        mainPolygon = ensurePolygonVertexOrder(mainPolygon, true);

        subPolygons = subPolygons.map(function(polygon) {
          return ensurePolygonVertexOrder(polygon, false);
        });

        self._polygons.push({
          "shape": mainPolygon,
          "holes": subPolygons
        });
      }
    }

    return this._polygons;
  };

  Sector.prototype.vertices = function() {
    // We cache this, but if we don't have it, we have to figure out which
    // vertices surround this sector. We want to return them ordered.
    if (this._vertices === undefined) {
      var self = this;
      self._vertices = [];

      var polygons = self.polygons();
      polygons.forEach(function(info) {
        var polygon = info.mainPolygon;
        self._vertices = self._vertices.concat(polygon);

        info.holes.forEach(function(vertices) {
          self._vertices = self._vertices.concat(vertices);
        });
      });
    }

    return this._vertices;
  };
}
