/*! lib-doomWad - v0.1.0 - 2018-02-13 - wilkie */
;(function (global) {

/*jslint browser: true*/
/*global $*/

// Compiler directive for UglifyJS.  See doomWad.const.js for more info.
if (typeof DEBUG === 'undefined') {
  DEBUG = true;
}

// Library-Global Constants

// GLOBAL is a reference to the global Object.
var Fn = Function, GLOBAL = new Fn('return this')();

/**
 * Init wrapper for the core module.
 * @param {Object} The Object that the library gets attached to in
 * doomWad.init.js. If the library was not loaded with an AMD loader such as
 * require.js, this is the global Object.
 */
function initDoomWadCore (context) {
  'use strict';

  // Private-Module Constants

  // var CORE_CONSTANT = true;

  // Private-Module Methods

  /**
   * This is the constructor for the DoomWad Object.
   * Note that the constructor is also being
   * attached to the context that the library was loaded in.
   * @param {Object} opt_config Contains any properties that should be used to
   * configure this instance of the library.
   * @constructor
   */
  var DoomWad = context.DoomWad = function(filename, ready) {
    var self = this;

    // Read only (led by underscores)
    self._filename = filename;

    self._levels = {};

    self._stream = new DoomWad.Stream(filename, function() {
      // Read header
      self._header    = new DoomWad.Header(self._stream);

      // Read Lump Directory
      self._directory = new DoomWad.Directory(self._stream, self._header);

      // Record WAD Information
      self._info      = new DoomWad.Info(self._stream.size(), self._header, self._directory);

      // Pull in the palette
      self._palette   = new DoomWad.PlayPal(self._stream, self._info, self._directory);

      // Create a texture manager
      self._textures  = new DoomWad.Textures(self._stream, self._info, self._directory, self._palette);

      // Retrieve level list
      var level_list = ["E1M1", "E1M2", "E1M3", "E1M4", "E1M5", "E1M6", "E1M7",
                        "E1M8", "E1M9", "E2M1", "E2M2", "E2M3", "E2M4", "E2M5",
                        "E2M6", "E2M7", "E2M8", "E2M9", "E3M1", "E3M2", "E3M3",
                        "E3M4", "E3M5", "E3M6", "E3M7", "E3M8", "E3M9", "E4M1",
                        "E4M2", "E4M3", "E4M4", "E4M5", "E4M6", "E4M7", "E4M8",
                        "E4M9"];

      if (self._info.engine() == "DOOM2") {
        var level_list = ["MAP01", "MAP02", "MAP03", "MAP04", "MAP05", "MAP06",
                          "MAP07", "MAP08", "MAP09", "MAP10", "MAP11", "MAP12",
                          "MAP13", "MAP14", "MAP15", "MAP16", "MAP17", "MAP18",
                          "MAP19", "MAP20", "MAP21", "MAP22", "MAP23", "MAP24",
                          "MAP25", "MAP26", "MAP27", "MAP28", "MAP29", "MAP30",
                          "MAP31", "MAP32"];
      }

      self._levelNames = level_list.filter(function (name) {
        return self._directory.lumpExists(name);
      });

      ready();
    })

    return self;
  };

  // Library-Public Methods

  /**
   * Returns the filename of the opened WAD file.
   * @returns {string}
   */
  DoomWad.prototype.filename = function() {
    return this._filename;
  };

  DoomWad.prototype.header = function() {
    return this._header;
  };

  DoomWad.prototype.flats = function() {
    return this._textures.forNamespace("flat");
  };

  DoomWad.prototype.sectors = function() {
    return this._level.sectors();
  };

  DoomWad.prototype.lineDefs = function() {
    return this._level.lineDefs();
  };

  DoomWad.prototype.textureFromName = function(name, namespace) {
    return this._textures.fromName(name, namespace);
  };

  DoomWad.prototype.levelNames = function() {
    return this._levelNames.slice();
  };

  DoomWad.prototype.level = function(name) {
    if (!(name in this._levels)) {
      if (this._directory.lumpExists(name)) {
        this._levels[name] = new DoomWad.Level(this._stream,
                                               this._info,
                                               this._directory,
                                               this._textures,
                                               name);
      }
    }
    return this._levels[name];
  };

  // DEBUG CODE
  //
  // With compiler directives, you can wrap code in a conditional check to
  // ensure that it does not get included in the compiled binaries.  This is
  // useful for exposing certain properties and methods that are needed during
  // development and testing, but should be private in the compiled binaries.
  if (DEBUG) {
  }
}

function initDoomWadDirectory(context) {
  /**
   * Constructor
   */

  var Directory = context.DoomWad.Directory = function(stream, header) {
    var self = this;

    // Get the number of lumps from the header.
    var lumpCount = header.numberOfLumps();

    // Go to the lump directory.
    stream.seek(header.directoryStart());

    self._size = 16 * lumpCount;
    self._directory = {};

    var last = {};

    var inFlats = false;
    var inSprites = false;
    var namespace = "global";

    // Start reading off each lump.
    for (var i = 0; i < lumpCount; i++) {
      // Read lump header
      var offset = stream.read32lu();
      var size   = stream.read32lu();
      var name   = stream.readAscii(8);
      name = name.toUpperCase();

      // Check for namespace
      if (name === "F_START") {
        inFlats = true;
        namespace = "flat";
      }
      else if (name === "F_END") {
        inFlats = false;
        namespace = "global";
      }
      if (name === "S_START") {
        inSprites = true;
        namespace = "sprite";
      }
      else if (name === "S_END") {
        inSprites = false;
        namespace = "global";
      }

      var lumpHeader = {
        "size": size,
        "offset": offset,
        "name": name,
        "namespace": namespace
      };

      // Store lump header and link the last lumpHeader to this one.
      last["next"] = lumpHeader

      if (!(name in self._directory)) {
        self._directory[name] = [];
      }
      self._directory[name].push(lumpHeader);
      last = lumpHeader;
    }

    return self;
  };

  Directory.prototype.size = function() {
    return this._size;
  };

  Directory.prototype.lumpHeaderFor = function(name, namespace) {
    name = name.toUpperCase();

    var list = this._directory[name];

    if (list === undefined) {
      return null;
    }

    if (namespace !== undefined) {
      for (var i = 0; i < this._directory[name].length; i++) {
        if (this._directory[name][i].namespace === namespace) {
          return this._directory[name][i];
        }
      }
    }

    return this._directory[name][0];
  };

  Directory.prototype.lumpExists = function(name) {
    name = name.toUpperCase();
    return name in this._directory;
  };

  Directory.prototype.lumpHeaderAfter = function(afterLumpName, name) {
    name = name.toUpperCase();
    afterLumpName = afterLumpName.toUpperCase();

    var lumpStart = this.lumpHeaderFor(afterLumpName);
    var currentLump = lumpStart;
    var i = 0;
    while (currentLump && (currentLump['name'] != name)) {
      i += 1;
      if (i >= 25) {
        return null;
      }

      currentLump = currentLump['next'];
    }

    return currentLump;
  };
}

/*globals initDoomWadCore*/
/*globals initDoomWadStream*/
/*globals initDoomWadHeader*/
/*globals initDoomWadInfo*/
/*globals initDoomWadDirectory*/
/*globals initDoomWadLevel*/
/*globals initDoomWadThings*/
/*globals initDoomWadThing*/
/*globals initDoomWadThingsDoom*/
/*globals initDoomWadVertexes*/
/*globals initDoomWadLineDefs*/
/*globals initDoomWadLineDef*/
/*globals initDoomWadSideDefs*/
/*globals initDoomWadSideDef*/
/*globals initDoomWadTextures*/
/*globals initDoomWadTexture*/
/*globals initDoomWadSectors*/
/*globals initDoomWadSector*/
/*globals initDoomWadPlayPal*/

var initDoomWad = function (context) {
  initDoomWadCore(context);
  initDoomWadStream(context);
  initDoomWadHeader(context);
  initDoomWadInfo(context);
  initDoomWadDirectory(context);
  initDoomWadLevel(context);
  initDoomWadThings(context);
  initDoomWadThing(context);
  initDoomWadThingsDoom(context);
  initDoomWadVertexes(context);
  initDoomWadLineDefs(context);
  initDoomWadLineDef(context);
  initDoomWadSideDefs(context);
  initDoomWadSideDef(context);
  initDoomWadTextures(context);
  initDoomWadTexture(context);
  initDoomWadSectors(context);
  initDoomWadPatch(context);
  initDoomWadSector(context);
  initDoomWadPlayPal(context);

  return context.DoomWad;
};

if (typeof define === 'function' && define.amd) {
  // Expose DoomWad as an AMD module if it's loaded with RequireJS or
  // similar.
  define(function () {
    return initDoomWad({});
  });
} else {
  // Load DoomWad normally (creating a DoomWad global) if not using an AMD
  // loader.
  initDoomWad(this);
}

// Your library may have many modules.  How you organize the modules is up to
// you, but generally speaking it's best if each module addresses a specific
// concern.  No module should need to know about the implementation details of
// any other module.

// Note:  You must name this function something unique.  If you end up
// copy/pasting this file, the last function defined will clobber the previous
// one.
function initDoomWadModule (context) {
  'use strict';

  var DoomWad = context.DoomWad;

  // PRIVATE MODULE CONSTANTS
  var MODULE_CONSTANT = true;

  if (DEBUG) {
  }
}

function initDoomWadHeader(context) {
  /**
   * Constructor
   */

  var Header = context.DoomWad.Header = function(stream) {
    var self = this;

    stream.seek(0);

    self._size            = 12;
    self._magic           = stream.readAscii(4);
    self._numberOfLumps   = stream.read32lu();
    self._directoryStart = stream.read32lu();

    return self;
  };

  Header.prototype.isValid = function() {
    return this._magic === "IWAD" || this._magic === "PWAD";
  };

  Header.prototype.size = function() {
    return this._size;
  };

  Header.prototype.magic = function() {
    return this._magic;
  };

  Header.prototype.numberOfLumps = function() {
    return this._numberOfLumps;
  };

  Header.prototype.directoryStart = function() {
    return this._directoryStart;
  };
}

function initDoomWadInfo(context) {
  /**
   * Constructor
   */

  var Info = context.DoomWad.Info = function(size, header, directory) {
    var self = this;

    // Record the total size of the WAD in bytes
    self._size = size;

    // Detect the intended engine
    if (directory.lumpExists("MAP01")) {
      if (directory.lumpExists("TITLE") || directory.lumpExists("BEHAVIOR")) {
        self._engine = "Hexen";
      }
      else {
        self._engine = "DOOM2";
      }
    }
    else if (directory.lumpExists("E1M1")) {
      self._engine = "DOOM";
    }
    else {
      self._engine = "unknown";
    }

    return self;
  };

  Info.prototype.size = function() {
    return this._size;
  };

  Info.prototype.numberOfLumps = function() {
    return this._data.numberOfLumps;
  };

  Info.prototype.dictionaryStart = function() {
    return this._data.dictionaryStart;
  };

  Info.prototype.engine = function() {
    return this._engine;
  };
}

function initDoomWadLevel(context) {
  /**
   * Constructor
   */

  var Level = context.DoomWad.Level = function(stream, info, directory, textures, name) {
    var self = this;

    // Level lump header (eg MAP01)
    var levelLumpHeader = directory.lumpHeaderFor(name);

    // The level lump is empty. It just marks the first lump of the level.
    // The rest of the lumps should be read in linearly. So go through
    // each lump after this one.

    var nextLump = levelLumpHeader['next'];

    // Look for the THINGS lump which contain the interactive objects in the
    // level
    var thingsLump = directory.lumpHeaderAfter(name, "THINGS");
    if (thingsLump) {
      self._things = new DoomWad.Things(stream, info, thingsLump);
    }

    // Look for the VERTEXES lump which contains the vertex geometry of the
    // level
    var vertexesLump = directory.lumpHeaderAfter(name, "VERTEXES");
    if (vertexesLump) {
      self._vertexes = new DoomWad.Vertexes(stream, info, vertexesLump);
    }

    // Look for the SECTORS lump which contains the polygon information for the
    // level
    var sectorsLump = directory.lumpHeaderAfter(name, "SECTORS");
    if (sectorsLump) {
      self._sectors = new DoomWad.Sectors(stream, info, sectorsLump, textures);
    }

    // Look for the SIDEDEFS lump which contains information about texturing
    // walls of the map.
    var sideDefsLump = directory.lumpHeaderAfter(name, "SIDEDEFS");
    if (sideDefsLump) {
      self._sideDefs = new DoomWad.SideDefs(stream, info, sideDefsLump, self._sectors, textures);
    }

    // Look for the LINEDEFS lump which contains information about lines
    // between vertices in the level.
    var lineDefsLump = directory.lumpHeaderAfter(name, "LINEDEFS");
    if (lineDefsLump) {
      self._lineDefs = new DoomWad.LineDefs(stream, info, lineDefsLump, self._vertexes, self._sideDefs);
    }

    return self;
  };

  Level.prototype.boundingBox = function() {
    var minX = this._vertexes.minX();
    var maxX = this._vertexes.maxX();

    var minZ = this._sectors.minZ();
    var maxZ = this._sectors.maxZ();

    var width = maxX - minX;

    var minY = this._vertexes.minY();
    var maxY = this._vertexes.maxY();

    var height = maxY - minY;

    return {
           "x": minX,
           "y": minY,
       "width": width,
      "height": height,
       "floor": minZ,
     "ceiling": maxZ,
    };
  };

  Level.prototype.vertices = function () {
    return this._vertexes.vertices();
  };

  Level.prototype.lineDefs = function () {
    return this._lineDefs.lineDefs();
  };

  Level.prototype.sectors = function () {
    return this._sectors.sectors();
  };
}

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

function initDoomWadLineDefs(context) {
  /**
   * Constructor
   */

  var LineDefs = context.DoomWad.LineDefs = function(stream, info, lumpHeader, vertexes, sideDefs) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the LINEDEFS lump
    stream.seek(lumpHeader["offset"]);

    var isHexen = info.engine() == "Hexen";
    var lineDefSize = 14;
    if (isHexen) {
      lineDefSize = 16;
    }

    // Keeps track of all linedefs for a sector index
    self._sectorReference = {};

    // Read in all lineDefs
    self._lineDefs = [];
    for (var i = 0; i < self._size; i += lineDefSize) {
      var lineDef = {};
      lineDef['start']        = vertexes.fromId(stream.read16lu());
      lineDef['end']          = vertexes.fromId(stream.read16lu());
      lineDef['flags']        = stream.read16lu();
      if (isHexen) {
        lineDef['action']     = stream.read8u();
        lineDef['arguments']  = stream.read(5);
      }
      else {
        lineDef['effect']     = stream.read16lu();
        lineDef['tag']        = stream.read16lu();
      }
      lineDef['rightSideDef'] = sideDefs.fromId(stream.read16lu());
      lineDef['leftSideDef']  = sideDefs.fromId(stream.read16lu());
      lineDef['sectors'] = [];
      if (lineDef['rightSideDef']) {
        lineDef['sectors'].push(lineDef['rightSideDef'].sector());
      }
      if (lineDef['leftSideDef']) {
        var sector = lineDef['leftSideDef'].sector();
        if (!(sector in lineDef['sectors'])) {
          lineDef['sectors'].push(sector);
        }
      }

      var newLineDef = new context.DoomWad.LineDef(info, lineDef)
      self._lineDefs.push(newLineDef);

      lineDef['sectors'].forEach(function(sector) {
        if (!(sector.index() in self._sectorReference)) {
          self._sectorReference[sector.index()] = []
        }
        self._sectorReference[sector.index()].push(lineDef);

        sector.appendLineDef(newLineDef);
      });
    }

    return self;
  };

  LineDefs.prototype.size = function() {
    return this._size;
  };

  LineDefs.prototype.lineDefs = function() {
    return this._lineDefs.slice(0);
  };

  LineDefs.prototype.forSector = function(sectorIndex) {
    return this._sectorReference[sectorIndex] || [];
  };
}

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

function initDoomWadPlayPal(context) {
  'use strict';

  var PlayPal = context.DoomWad.PlayPal = function(stream, info, directory) {
    var self = this;

    var lumpHeader = directory.lumpHeaderFor("PLAYPAL");

    var palettes = [];

    if (info.engine() === "Hexen" && lumpHeader.size != 21504) {
      console.log("ERROR: PLAYPAL: lump size is not 28 * 768 (21504), it is " + lump.size + " (Hexen)");
    }
    else if (lumpHeader.size != 10752) {
      console.log("ERROR: PLAYPAL: lump size is not 14 * 768 (10752), it is " + lump.size);
    }

    // Seek to the palette lump
    stream.seek(lumpHeader.offset);

    // We only ever read the first palette
    var buffer = stream.read(256 * 3);

    self._palette = [];
    self._paletteRealized = [];
    for (var i = 0; i < 256; i++) {
      var palette = {
        red:   stream.read8u((i*3) + 0),
        green: stream.read8u((i*3) + 1),
        blue:  stream.read8u((i*3) + 2),
      };
      self._palette.push(palette);
      self._paletteRealized.push(((palette.red << 24) | (palette.green << 16) | (palette.blue << 8) << 8) >>> 0); 
    }

    return self;
  };

  PlayPal.prototype.fromId = function(index) {
    return this._palette[index];
  };

  PlayPal.prototype.asUInt32 = function(index) {
    return this._paletteRealized[index];
  };
};

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

  Sector.prototype.floor = function() {
    return this._floorHeight;
  };

  Sector.prototype.ceiling = function() {
    return this._ceilingHeight;
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

function initDoomWadSectors(context) {
  /**
   * Constructor
   */

  var Sectors = context.DoomWad.Sectors = function(stream, info, lumpHeader, textures) {
    var self = this;

    // Get the size of the lump
    self._size = lumpHeader["size"];

    // Go to the LINEDEFS lump
    stream.seek(lumpHeader["offset"]);

    var sectorSize = 26;

    // The tag lookup
    self._tags = {};

    // Read in all sectors
    self._sectors = [];
    for (var i = 0; i < self._size; i += sectorSize) {
      var sector = {};
      sector['floorHeight']    = stream.read16ls();
      sector['ceilingHeight']  = stream.read16ls();
      sector['textureFloor']   = textures.fromName(stream.readAscii(8), "flat");
      sector['textureCeiling'] = textures.fromName(stream.readAscii(8), "flat");
      sector['lightLevel']     = stream.read16ls();
      sector['special']        = stream.read16lu();
      sector['tag']            = stream.read16lu();
      sector['index']          = self._sectors.length;

      var newSector = new context.DoomWad.Sector(sector);

      // Add the sector to our tag lookup
      if (!(sector['tag'] in self._tags)) {
        self._tags[sector['tag']] = [];
      }
      self._tags[sector['tag']].push(newSector);

      // Add the sector to the sector pool
      self._sectors.push(newSector);
    }

    return self;
  };

  Sectors.prototype.size = function() {
    return this._size;
  };

  Sectors.prototype.fromId = function(index) {
    return this._sectors[index];
  };

  Sectors.prototype.forTag = function(tag) {
    return this._tags[tag].slice(0);
  };

  Sectors.prototype.sectors = function() {
    return this._sectors.slice(0);
  };

  Sectors.prototype.minZ = function() {
    var self = this;

    if (!self._minZ) {
      self._sectors.forEach(function(sector) {
        if (self._minZ === undefined || sector.floor() < self._minZ) {
          self._minZ = sector.floor();
        }
      });
    }

    return self._minZ;
  };

  Sectors.prototype.maxZ = function() {
    var self = this;

    if (!self._maxZ) {
      self._sectors.forEach(function(sector) {
        if (self._maxZ === undefined || sector.ceiling() > self._maxZ) {
          self._maxZ = sector.ceiling();
        }
      });
    }

    return self._maxZ;
  };
}

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
      sideDef['textureUpper']  = textures.fromName(stream.readAscii(8));
      sideDef['textureLower']  = textures.fromName(stream.readAscii(8));
      sideDef['textureMiddle'] = textures.fromName(stream.readAscii(8));
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


function initDoomWadStream(context) {
  /**
   * Constructor
   */

  var Stream = context.DoomWad.Stream = function(url, ready) {
    var self = this;

    self._loaded = false;
    self._data   = null;
    self._bytes  = null;
    self._ptr    = 0;
    this._stack  = [];

    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
      self._data = oReq.response; // Note: not oReq.responseText
      if (self._data) {
        self._bytes = new Uint8Array(self._data);
      }

      self._loaded = true;

      // Notify caller
      ready();
    };

    oReq.send(null);
  };

  /**
   * Returns the size, in bytes, of the loaded stream.
   * @returns {Number} The size of the stream in bytes.
   */
  Stream.prototype.size = function() {
    if (!this._loaded) {
      return null;
    }

    if (this._bytes === null) {
      return 0;
    }

    return this._bytes.length;
  };

  /**
   * Reads from the current position in the stream a byte array totally the
   * given number of bytes. Returns an empty array if the given number of
   * bytes exceeds the remaining bytes in the stream.
   * @returns {Array}
   */
  Stream.prototype.read = function(numBytes) {
    if (!this._loaded) {
      return null;
    }

    if (this._bytes === null) {
      return [];
    }

    var read = this._bytes.slice(this._ptr, this._ptr + numBytes);
    this._ptr += numBytes;
    return read;
  };

  /**
   * Reads from the current position in the stream a signed integer
   * assuming little endian format of the given size.
   * @param   {Number} The size of the data in bytes to read.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.readUnsigned = function(numBytes, reverse) {
    var bytes = this.read(numBytes);

    var value = 0;

    if (reverse) {
      bytes = bytes.reverse();
    }

    bytes.forEach(function(e) {
      value <<= 8;
      value = value | e;
    });

    return value >>> 0;
  };

  /**
   * Reads from the current position in the stream a signed integer
   * assuming little endian format of the given size.
   * @param   {Number} The size of the data in bytes to read.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.readlu = function(numBytes) {
    return this.readUnsigned(numBytes, true);
  };

  /**
   * Reads from the current position in the stream an unsigned integer
   * assuming big endian format of the given size.
   * @param   {Number} The size of the data in bytes to read.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.readbu = function(numBytes) {
    return this.readUnsigned(numBytes, false);
  };

  Stream.prototype.readSigned = function(numBytes, reverse) {
    var bytes = this.read(numBytes);

    var value = 0;
    var signed = false;

    if (reverse) {
      bytes = bytes.reverse();
    }

    signed = (bytes[0] & 0x80) > 0;
    if (signed) {
      value = -1;
    }

    bytes.forEach(function(e) {
      value <<= 8;
      value = value | e;
    });

    return value;
  };

  /**
   * Reads from the current position in the stream a signed integer
   * assuming little endian format of the given size.
   * @param   {Number} The size of the data in bytes to read.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.readls = function(numBytes) {
    return this.readSigned(numBytes, true);
  };

  /**
   * Reads from the current position in the stream a signed integer
   * assuming big endian format of the given size.
   * @param   {Number} The size of the data in bytes to read.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.readbs = function(numBytes) {
    return this.readSigned(numBytes, true);
  };

  /**
   * Reads from the current position in the stream a 32 bit unsigned integer
   * assuming little endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read32lu = function() {
    return this.readlu(4);
  };

  /**
   * Reads from the current position in the stream a 32 bit unsigned integer
   * assuming big endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read32bu = function() {
    return this.readbu(4);
  };

  /**
   * Reads from the current position in the stream a 16 bit unsigned integer
   * assuming little endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read16lu = function() {
    return this.readlu(2);
  };

  /**
   * Reads from the current position in the stream a 16 bit unsigned integer
   * assuming big endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read16bu = function() {
    return this.readbu(2);
  };

  /**
   * Reads from the current position in the stream an 8 bit unsigned integer.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read8u = function() {
    return this.readlu(1);
  };

  /**
   * Reads from the current position in the stream a 32 bit signed integer
   * assuming little endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read32ls = function() {
    return this.readls(4);
  };

  /**
   * Reads from the current position in the stream a 32 bit signed integer
   * assuming big endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read32bs = function() {
    return this.readbs(4);
  };

  /**
   * Reads from the current position in the stream a 16 bit signed integer
   * assuming little endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read16ls = function() {
    return this.readls(2);
  };

  /**
   * Reads from the current position in the stream a 16 bit signed integer
   * assuming big endian format.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read16bs = function() {
    return this.readbs(2);
  };

  /**
   * Reads from the current position in the stream an 8 bit signed integer.
   * @returns {Number} The requested integer data.
   */
  Stream.prototype.read8s = function() {
    return this.readls(1);
  };

  /**
   * Reads from the current position in the stream the given number of bytes
   * decoding them as an ASCII stream. Will terminate the string when it sees a
   * null (ASCII '\0') character.
   * @param   {Number} The number of characters to read in.
   * @returns {Number} The resulting string.
   */
  Stream.prototype.readAscii = function(numBytes) {
    var bytes = this.read(numBytes);
    var ret = "";
    if (bytes) {
      for (var i = 0; i < bytes.length; i++) {
        var e = bytes[i];
        if (e == 0) {
          break;
        }
        ret += String.fromCharCode(e);
      }
    }
    return ret;
  };

  /**
   * Moves the current position to the given position. If the position is
   * invalid, it will correct to fit the position within the stream. Returns
   * the new position.
   * @param   {Number} The requested position.
   * @returns {Number} The new, valid position.
   */
  Stream.prototype.seek = function(position) {
    if (!this._loaded) {
      return null;
    }

    if (this._bytes === null) {
      this._ptr = 0;
      return 0;
    }

    this._ptr = position;
    if (this._ptr < 0) {
      this._ptr = 0;
    }
    if (this._ptr > this._bytes.length) {
      this._ptr = this._bytes.length;
    }

    return this._ptr;
  };

  /**
   * Remembers the current position and will recall it when pop is called. This
   * is implemented as a stack such that subsequent calls to push() will not
   * lose the value already pushed. Successive calls to pop() will recall
   * the values recorded by push() in the reverse order they were stored.
   */
  Stream.prototype.push = function() {
    this._stack.push(this._ptr);
  };

  /**
   * Replaces the current position to the position stored upon the last call
   * to push(). See push() for more details.
   */
  Stream.prototype.pop = function() {
    this._ptr = this._stack.pop();
  };
}

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

    // Keep a reference to the general info.
    self._info = info;

    return self;
  };

  Textures.prototype.patchFromIndex = function(index) {
    this._loadPatches();

    var name = this._patchNames[index];

    return this.patchFromName(name);
  };

  Textures.prototype.patchFromName = function(name) {
    this._loadPatches();

    if (this._patches[name] === null) {
      const header = this._directory.lumpHeaderFor(name);
      if (header) {
        this._patches[name] = new context.DoomWad.Patch(this._stream, this._info, header, this._palette);
      }
      else {
        console.log("WARNING:", "PATCH LUMP", name, ": not found");
      }
    }

    return this._patches[name];
  };

  Textures.prototype._loadPatches = function() {
    var self = this;

    const lumpName = "PNAMES";

    if (self._patchesLoaded === undefined) {
      self._patchesLoaded = {};
    }

    if (self._patchesLoaded[lumpName]) {
      return;
    }

    self._patchesLoaded[lumpName] = true;

    self._patches = {};

    var patches = self._directory.lumpHeaderFor(lumpName);
    if (patches) {
      self._stream.push();
      self._stream.seek(patches.offset);

      const numPatches = self._stream.read32lu();

      self._patchNames = new Array(numPatches);

      for (var i = 0; i < numPatches; i++) {
        self._patchNames[i] = self._stream.readAscii(8);
        self._patches[self._patchNames[i]] = null;
      }

      self._stream.pop();
    }
  };

  Textures.prototype._loadTextureLump = function(lumpName) {
    var self = this;

    if (self._textures === undefined) {
      self._textures = {};
    }

    if (self._texturesLoaded === undefined) {
      self._texturesLoaded = {};
    }

    if (self._texturesLoaded[lumpName]) {
      return;
    }

    self._texturesLoaded[lumpName] = true;

    var textures = self._directory.lumpHeaderFor(lumpName);
    if (textures) {
      self._stream.push();
      self._stream.seek(textures.offset);

      var numTextures = self._stream.read32lu();

      var textureRecords = new Array(numTextures);

      for (var i = 0; i < numTextures; i++) {
        textureRecords[i] = self._stream.read32lu();
      }

      for (var i = 0; i < numTextures; i++) {
        self._stream.push();
        self._stream.seek(textureRecords[i] + textures.offset);

        textureRecords[i] = {
          name:   self._stream.readAscii(8),
          flags:  self._stream.read16lu(),   // ZDoom
          scalex: self._stream.read8u(),     // ZDoom
          scaley: self._stream.read8u(),     // ZDoom
          width:  self._stream.read16lu(),
          height: self._stream.read16lu(),
          coldir: self._stream.read32lu(),
          npatch: self._stream.read16lu(),
          patches: []
        };

        self._textures[textureRecords[i].name] = textureRecords[i];

        if (textureRecords[i].npatch > 1000) {
          self._stream.pop();
          self._stream.pop();
          return;
        }

        for (var j = 0; j < textureRecords[i].npatch; j++) {
          const patchInfo = {
            originX:  self._stream.read16lu(),
            originY:  self._stream.read16lu(),
            patch:    self._stream.read16lu()
          };

          if (self._info.engine != "Strife") {
            // Hop over 4 bytes for stepdir/colormap
            // Strife doesn't put them in the patch file
            self._stream.read32lu();
          }

          textureRecords[i].patches.push(patchInfo);
        }
        self._stream.pop();
      }

      self._stream.pop();
    }
  };

  Textures.prototype.size = function() {
    return this._size;
  };

  Textures.prototype.forNamespace = function(namespace) {
    var textures = this._cache[namespace];
    return Object.keys(textures).map(function(k) { return textures[k]});
  }

  Textures.prototype.fromName = function(name, namespace) {
    var self = this;

    if(name == "") {
      throw "";
    }

    if (namespace === undefined) {
      namespace = "global";
    }

    if (!(namespace in this._cache)) {
      this._cache[namespace] = {};
    }

    this._loadTextureLump("TEXTURE1");
    this._loadTextureLump("TEXTURE2");

    if (namespace == "global") {
      // Look for general texture
      if (name in this._textures) {
        if (!('textureObject' in this._textures[name])) {
          // Realize the patches within the texture
          this._textures[name].patches.forEach(function(patchInfo, i) {
            self._textures[name].patches[i].patchObject = self.patchFromIndex(patchInfo.patch);
          });
          this._textures[name].textureObject = new context.DoomWad.Texture(this._stream, this._textures[name], this._palette);
        }

        return this._textures[name].textureObject;
      }
    }
    else if (!(name in this._cache[namespace])) {
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
      else {
        console.log("Warning:", "lump section", name, namespace, "not found");
      }
    }

    return this._cache[namespace][name];
  };
}

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

function initDoomWadThingsDoom(context) {
  /**
   * This collection represents all of the possible Things in a DOOM or DOOM2
   * map. They are keyed by their internal Thing type.
   */
  context.DoomWad.Things.Doom = {
    1: {
      "name": "Player 1 Start",
      "sprite": "PLAY",
      "radius": 16
    },
    2: {
      "name": "Player 2 Start",
      "sprite": "PLAY",
      "radius": 16
    },
    3: {
      "name": "Player 3 Start",
      "sprite": "PLAY",
      "radius": 16
    },
    4: {
      "name": "Player 4 Start",
      "sprite": "PLAY",
      "radius": 16
    },
    11: {
      "name": "Deathmatch Start",
      "radius": 20
    },
    3004: {
      "name": "Former Human",
      "sprite": "POSS",
      "alertSound": ["DSPOSIT1", "DSPOSIT2", "DSPOSIT3"],
      "actionSound": "DSPOSACT",
      "painSound": "DSPOPAIN",
      "deathSound": ["DSPODTH1", "DSPODTH2", "DSPODTH3"],
      "gibSound": "DSSLOP",
      "rangedAttack": {
        "firingSound": "DSPISTOL",
        "type": "hitscan",
        "damageMin": 3,
        "damageMax": 15,
        "spriteMiss": "PUFF",
        "spriteHit": "BLUD"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 20,
      "reactionTime": 8,
      "speed": 8,
      "height": 56,
      "mass": 100,
      "painChance": 200,
      "painTime": 6,
      "width": 40
    },
    84: {
      "name": "Wolfenstein SS Officer",
      "sprite": "SSWV",
      "alertSound": "DSSSSIT",
      "actionSound": "DSPOSACT",
      "painSound": "DSPOPAIN",
      "deathSound": "DSSSDTH",
      "gibSound": "DSSLOP",
      "doom2": true,
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "hitscan",
        "damageMin": 3,
        "damageMax": 15,
        "shotsPerMinute": 168.0,
        "spriteMiss": "PUFF",
        "spriteHit": "BLUD"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 50,
      "height": 56,
      "speed": 8,
      "mass": 100,
      "painChance": 170,
      "reactionTime": 8,
      "painTime": 6,
      "width": 40
    },
    9: {
      "name": "Former Human Sergeant",
      "sprite": "SPOS",
      "alertSound": ["DSPOSIT1", "DSPOSIT2", "DSPOSIT3"],
      "actionSound": "DSPOSACT",
      "painSound": "DSPOPAIN",
      "deathSound": ["DSPODTH1", "DSPODTH2", "DSPODTH3"],
      "gibSound": "DSSLOP",
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "hitscan",
        "damageMin": 3,
        "damageMax": 15,
        "pelletsPerShot": 3,
        "spriteMiss": "PUFF",
        "spriteHit": "BLUD"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 30,
      "height": 56,
      "reactionTime": 8,
      "speed": 8,
      "mass": 100,
      "painChance": 170,
      "painTime": 6,
      "width": 40
    },
    65: {
      "name": "Former Human Commando",
      "sprite": "CPOS",
      "alertSound": ["DSPOSIT1", "DSPOSIT2", "DSPOSIT3"],
      "actionSound": "DSPOSACT",
      "painSound": "DSPOPAIN",
      "deathSound": ["DSPODTH1", "DSPODTH2", "DSPODTH3"],
      "gibSound": "DSSLOP",
      "doom2": true,
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "hitscan",
        "damageMin": 3,
        "damageMax": 15,
        "shotsPerMinute": 466.6,
        "spriteMiss": "PUFF",
        "spriteHit": "BLUD"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 70,
      "reactionTime": 8,
      "speed": 8,
      "height": 56,
      "mass": 100,
      "painChance": 170,
      "painTime": 6,
      "width": 40
    },
    3001: {
      "name": "Imp",
      "sprite": "TROO",
      "alertSound": ["DSBGSIT1", "DSBGSIT2"],
      "actionSound": "DSBGACT",
      "painSound": "DSPOPAIN",
      "deathSound": ["DSBGDTH1", "DSBGDTH1"],
      "gibSound": "DSSLOP",
      "meleeAttack": {
        "damageMin": 3,
        "damageMax": 24,
        "sound": "DSCLAW"
      },
      "rangedAttack": {
        "firingSound": "DSFIRSHT",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 3,
        "damageMax": 24,
        "width": 6,
        "height": 8,
        "sprite": "BAL1",
        "speed": 10
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 60,
      "reactionTime": 8,
      "speed": 8,
      "height": 56,
      "mass": 100,
      "painChance": 200,
      "painTime": 4,
      "width": 40
    },
    3002: {
      "name": "Demon",
      "sprite": "SARG",
      "alertSound": "DSSGHSIT",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSSGTDTH",
      "gibSound": "DSSLOP",
      "meleeAttack": {
        "damageMin": 4,
        "damageMax": 40,
        "sound": "DSSGTATK"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 150,
      "reactionTime": 8,
      "speed": 10,
      "height": 56,
      "mass": 400,
      "painChance": 180,
      "painTime": 4,
      "width": 60
    },
    58: {
      "name": "Spectre",
      "sprite": "SARG",
      "alertSound": "DSSGHSIT",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSSGTDTH",
      "gibSound": "DSSLOP",
      "partialInvisibility": true,
      "meleeAttack": {
        "damageMin": 4,
        "damageMax": 40,
        "sound": "DSSGTATK"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 150,
      "reactionTime": 8,
      "speed": 10,
      "height": 56,
      "mass": 400,
      "painChance": 180,
      "painTime": 4,
      "width": 60
    },
    3006: {
      "name": "Lost Soul",
      "sprite": "SKUL",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSFIRXPL",
      "meleeAttack": {
        "damageMin": 3,
        "damageMax": 24,
        "sound": "DSSKLATK"
      },
      "shootable": true,
      "collides": true,
      "hitPoints": 100,
      "noGravity": true,
      "floating": true,
      "reactionTime": 8,
      "speed": 8,
      "chargeSpeed": 20,
      "height": 56,
      "mass": 50,
      "painChance": 256,
      "painTime": 6,
      "width": 32
    },
    3005: {
      "name": "Cacodemon",
      "sprite": "HEAD",
      "alertSound": "DSCACSIT",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSCACDTH",
      "meleeAttack": {
        "damageMin": 10,
        "damageMax": 60
      },
      "rangedAttack": {
        "firingSound": "DSFIRSHT",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 5,
        "damageMax": 40,
        "width": 12,
        "height": 8,
        "sprite": "BAL2",
        "speed": 10
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 400,
      "noGravity": true,
      "floating": true,
      "reactionTime": 8,
      "speed": 8,
      "height": 56,
      "mass": 400,
      "painChance": 128,
      "painTime": 6,
      "width": 62
    },
    69: {
      "name": "Hell Knight",
      "sprite": "BOS2",
      "alertSound": "DSKNTSIT",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSKNTDTH",
      "doom2": true,
      "meleeAttack": {
        "damageMin": 10,
        "damageMax": 80,
        "sound": "DSCLAW"
      },
      "rangedAttack": {
        "firingSound": "DSFIRSHT",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 8,
        "damageMax": 64,
        "width": 6,
        "height": 8,
        "sprite": "BAL7",
        "speed": 15
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 500,
      "reactionTime": 8,
      "speed": 8,
      "height": 64,
      "mass": 1000,
      "painChance": 50,
      "painTime": 4,
      "width": 48
    },
    3003: {
      "name": "Baron of Hell",
      "sprite": "BOSS",
      "alertSound": "DSBRSSIT",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSBRSDTH",
      "meleeAttack": {
        "damageMin": 10,
        "damageMax": 80,
        "sound": "DSCLAW"
      },
      "rangedAttack": {
        "firingSound": "DSFIRSHT",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 8,
        "damageMax": 64,
        "width": 6,
        "height": 8,
        "sprite": "BAL7",
        "speed": 15
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 1000,
      "reactionTime": 8,
      "speed": 8,
      "height": 64,
      "mass": 1000,
      "painChance": 50,
      "painTime": 4,
      "width": 48
    },
    68: {
      "name": "Arachnotron",
      "sprite": "BSPI",
      "alertSound": "DSBSPSIT",
      "chaseSound": "DSBSPWLK",
      "actionSound": "DSBSPACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSBSPDTH",
      "rangedAttack": {
        "firingSound": "DSPLASMA",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 5,
        "damageMax": 40,
        "width": 13,
        "height": 8,
        "shotsPerMinute": 233.3,
        "sprite": "APLS",
        "spriteImpact": "APBX",
        "speed": 25
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 500,
      "reactionTime": 8,
      "speed": 12,
      "height": 64,
      "mass": 1000,
      "painChance": 128,
      "painTime": 6,
      "width": 128
    },
    71: {
      "name": "Pain Elemental",
      "sprite": "PAIN",
      "alertSound": "DSPESIT",
      "actionSound": "DSDMACT",
      "painSound": "DSPEPAIN",
      "deathSound": "DSPEDTH",
      "doom2": true,
      "shootable": true,
      "collides": true,
      "noGravity": true,
      "floating": true,
      "countsTowardKill": true,
      "hitPoints": 400,
      "reactionTime": 8,
      "speed": 8,
      "height": 56,
      "mass": 400,
      "painChance": 128,
      "painTime": 12,
      "width": 62
    },
    66: {
      "name": "Revenant",
      "sprite": "SKEL",
      "alertSound": "DSSKESIT",
      "actionSound": "DSSKEACT",
      "painSound": "DSPOPAIN",
      "deathSound": "DSSKEDTH",
      "doom2": true,
      "meleeAttack": {
        "damageMin": 6,
        "damageMax": 60,
        "sound": "DSSKESWG",
        "impactSound": "DSSKEPCH"
      },
      "rangedAttack": {
        "firingSound": "DSSKEATK",
        "impactSound": "DSBAREXP",
        "type": "projectile",
        "damageMin": 10,
        "damageMax": 80,
        "width": 11,
        "height": 8,
        "sprite": "FATB",
        "spriteTrail": "PUFF",
        "spriteImpact": "FBXP",
        "speed": 10
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 300,
      "reactionTime": 8,
      "speed": 10,
      "height": 56,
      "mass": 500,
      "painChance": 100,
      "painTime": 10,
      "width": 40
    },
    67: {
      "name": "Mancubus",
      "sprite": "FATT",
      "alertSound": "DSMANSIT",
      "actionSound": "DSPOSACT",
      "painSound": "DSMNPAIN",
      "deathSound": "DSMANDTH",
      "doom2": true,
      "rangedAttack": {
        "prepareSound": "DSMANATK",
        "firingSound": "DSFIRSHT",
        "impactSound": "DSFIRXPL",
        "type": "projectile",
        "damageMin": 8,
        "damageMax": 64,
        "pelletsPerShot": 6,
        "width": 6,
        "height": 8,
        "sprite": "MANF",
        "spriteImpact": "BEXP",
        "speed": 20
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 600,
      "reactionTime": 8,
      "speed": 8,
      "height": 64,
      "mass": 1000,
      "painChance": 80,
      "painTime": 6,
      "width": 96
    },
    64: {
      "name": "Arch-vile",
      "sprite": "VILE",
      "alertSound": "DSVILSIT",
      "actionSound": "DSVILACT",
      "painSound": "DSVIPAIN",
      "deathSound": "DSVILDTH",
      "doom2": true,
      "rangedAttack": {
        "prepareSound": "DSVILATK",
        "splashSound": "DSFLAME",
        "impactSound": "DSBAREXP",
        "type": "special",
        "damageMin": 20,
        "damageMax": 20,
        "splashMin": 0,
        "splashMax": 70,
        "sprite": "FIRE"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 700,
      "reactionTime": 8,
      "speed": 15,
      "height": 56,
      "mass": 500,
      "painChance": 10,
      "painTime": 10,
      "width": 40
    },
    7: {
      "name": "Spiderdemon",
      "sprite": "SPID",
      "alertSound": "DSSPISIT",
      "chaseSound": "DSMETAL",
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSSPIDTH",
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "hitscan",
        "damageMin": 3,
        "damageMax": 15,
        "shotsPerMinute": 466.7,
        "spriteMiss": "PUFF",
        "spriteHit": "BLUD"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 3000,
      "reactionTime": 8,
      "speed": 12,
      "height": 100,
      "mass": 1000,
      "painChance": 40,
      "painTime": 6,
      "width": 256
    },
    16: {
      "name": "Cyberdemon",
      "sprite": "CYBR",
      "alertSound": "DSCYBSIT",
      "chaseSound": ["DSMETAL", "DSHOOF"],
      "actionSound": "DSDMACT",
      "painSound": "DSDMPAIN",
      "deathSound": "DSCYBDTH",
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "projectile",
        "damageMin": 20,
        "damageMax": 160,
        "splashMin": 0,
        "splashMax": 128,
        "width": 11,
        "height": 8,
        "sprite": "MISL",
        "firingSound": "DSRLAUNC",
        "impactSound": "DSBAREXP"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 4000,
      "reactionTime": 8,
      "speed": 16,
      "height": 110,
      "mass": 1000,
      "painChance": 20,
      "painTime": 10,
      "width": 80
    },
    88: {
      "name": "Boss Brain",
      "sprite": "BBRN",
      "radius": 16,
      "alertSound": "DSBOSSIT",
      "deathSound": "DSBOSDTH",
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "projectile",
        "damageMin": 20,
        "damageMax": 160,
        "splashMin": 0,
        "splashMax": 128,
        "width": 11,
        "height": 8,
        "sprite": "MISL",
        "firingSound": "DSRLAUNC",
        "impactSound": "DSBAREXP"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 250
    },
    72: {
      "name": "Commander Keen",
      "sprite": "KEEN",
      "painSound": "DSKEENPN",
      "deathSound": "DSKEENDT",
      "doom2": true,
      "rangedAttack": {
        "firingSound": "DSSHOTGN",
        "type": "projectile",
        "damageMin": 20,
        "damageMax": 160,
        "splashMin": 0,
        "splashMax": 128,
        "width": 11,
        "height": 8,
        "sprite": "MISL",
        "firingSound": "DSRLAUNC",
        "impactSound": "DSBAREXP"
      },
      "shootable": true,
      "collides": true,
      "countsTowardKill": true,
      "hitPoints": 100,
      "reactionTime": 8,
      "speed": 0,
      "noGravity": true,
      "hanging": true,
      "height": 72,
      "mass": 10000000,
      "painChance": 256,
      "painTime": 6,
      "width": 32
    },
    14: {
      "name": "Teleport Landing",
      "radius": 20
    },
    89: {
      "name": "Boss Spawn Shooter",
      "doom2": true,
      "radius": 20
    },
    87: {
      "name": "Boss Spawn Spot",
      "doom2": true,
      "radius": 20
    },
    2001: {
      "name": "Shotgun",
      "sprite": "SHOT",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    82: {
      "name": "Double-barrel Shotgun",
      "sprite": "SGN2",
      "animation": "A",
      "doom2": true,
      "radius": 20,
      "pickup": true
    },
    2002: {
      "name": "Chaingun",
      "sprite": "MGUN",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2003: {
      "name": "Rocket Launcher",
      "sprite": "LAUN",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2004: {
      "name": "Plasma Gun",
      "sprite": "PLAS",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2005: {
      "name": "Chainsaw",
      "sprite": "CSAW",
      "animation": "A",
      "radius": 20,
      "pickup": true,
    },
    2006: {
      "name": "BFG9000",
      "sprite": "BFUG",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2007: {
      "name": "Ammo Clip",
      "sprite": "CLIP",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2008: {
      "name": "Shotgun Shells",
      "sprite": "SHEL",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2010: {
      "name": "Rocket",
      "sprite": "ROCK",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2047: {
      "name": "Cell Charge",
      "sprite": "CELL",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2048: {
      "name": "Box of Ammo",
      "sprite": "AMMO",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2049: {
      "name": "Box of Shells",
      "sprite": "SBOX",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2046: {
      "name": "Box of Rockets",
      "sprite": "BROK",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    17: {
      "name": "Cell Charge Pack",
      "sprite": "CELP",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    8: {
      "name": "Backpack",
      "sprite": "BPAK",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2011: {
      "name": "Stimpack",
      "sprite": "STIM",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2012: {
      "name": "Medikit",
      "sprite": "MEDI",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2014: {
      "name": "Health Potion",
      "sprite": "BON1",
      "animation": "ABCDCB",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2015: {
      "name": "Spirit Armor",
      "sprite": "BON2",
      "animation": "ABCDCB",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2018: {
      "name": "Security Armor",
      "sprite": "ARM1",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    2019: {
      "name": "Combat Armor",
      "sprite": "ARM2",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    83: {
      "name": "Megasphere",
      "doom2": true,
      "sprite": "MEGA",
      "animation": "ABCD",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2013: {
      "name": "Soul Sphere",
      "sprite": "SOUL",
      "animation": "ABCDCB",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2022: {
      "name": "Invulnerability",
      "sprite": "PINV",
      "animation": "ABCD",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2023: {
      "name": "Berserk Pack",
      "sprite": "PSTR",
      "animation": "A",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2024: {
      "name": "Invisibility",
      "sprite": "PINS",
      "animation": "ABCD",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2025: {
      "name": "Radiation Suit",
      "sprite": "SUIT",
      "animation": "A",
      "radius": 20,
      "pickup": true
    },
    2026: {
      "name": "Computer Map",
      "sprite": "PMAP",
      "animation": "ABCDCB",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    2045: {
      "name": "Light Intensifying Goggles",
      "sprite": "PVIS",
      "animation": "AB",
      "radius": 20,
      "countsTowardItem": true,
      "pickup": true
    },
    5: {
      "name": "Blue Keycard",
      "sprite": "BKEY",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    13: {
      "name": "Red Keycard",
      "sprite": "RKEY",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    6: {
      "name": "Yellow Keycard",
      "sprite": "YKEY",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    40: {
      "name": "Blue Skullkey",
      "sprite": "BSKU",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    38: {
      "name": "Red Skullkey",
      "sprite": "RSKU",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    39: {
      "name": "Yellow Skullkey",
      "sprite": "YSKU",
      "animation": "AB",
      "radius": 20,
      "pickup": true
    },
    2035: {
      "name": "Barrel",
      "sprite": "BAR1",
      "spriteDeath": "BEXP",
      "animation": "AB",
      "hitPoints": 20,
      "radius": 10,
      "height": 56,
      "mass": 100,
      "speed": 0,
      "collides": true,
      "shootable": true,
    },
    70: {
      "name": "Burning Barrel",
      "sprite": "FCAN",
      "animation": "ABC",
      "radius": 10,
      "height": 56,
      "collides": true
    },
    43: {
      "name": "Burnt Tree",
      "sprite": "TRE1",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    35: {
      "name": "Candelabra",
      "sprite": "CBRA",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    41: {
      "name": "Evil Eye",
      "sprite": "CEYE",
      "animation": "ABCB",
      "radius": 16,
      "collides": true
    },
    28: {
      "name": "Five Skull Shish Kebab",
      "sprite": "POL2",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    42: {
      "name": "Floating Skull",
      "sprite": "FSKU",
      "animation": "ABC",
      "radius": 16,
      "collides": true
    },
    2028: {
      "name": "Floor Lamp",
      "sprite": "COLU",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    53: {
      "name": "Hanging Leg",
      "sprite": "GOR5",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    52: {
      "name": "Hanging Pair of Legs",
      "sprite": "GOR4",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    78: {
      "name": "Hanging Torso, Brain Removed",
      "sprite": "HDB6",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    75: {
      "name": "Hanging Torso, Looking Down",
      "sprite": "HDB3",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    77: {
      "name": "Hanging Torso, Looking Up",
      "sprite": "HDB5",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    76: {
      "name": "Hanging Torso, Open Skull",
      "sprite": "HDB4",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    50: {
      "name": "Hanging Victim, Arms Out",
      "sprite": "GOR2",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    74: {
      "name": "Hanging Victim, Guts and Brain Removed",
      "sprite": "HDB2",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    73: {
      "name": "Hanging Victim, Guts Removed",
      "sprite": "HDB1",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    51: {
      "name": "Hanging Victim, One-Legged",
      "sprite": "GOR3",
      "animation": "A",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    49: {
      "name": "Hanging Victim, Twitching",
      "sprite": "GOR1",
      "animation": "ABCB",
      "radius": 16,
      "hanging": true,
      "collides": true
    },
    25: {
      "name": "Impaled Human",
      "sprite": "POL1",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    54: {
      "name": "Large Brown Tree",
      "sprite": "TRE2",
      "animation": "A",
      "radius": 32,
      "collides": true
    },
    29: {
      "name": "Pill of Skulls and Candles",
      "sprite": "POL3",
      "animation": "AB",
      "radius": 16,
      "collides": true
    },
    55: {
      "name": "Short Blue Firestick",
      "sprite": "SMBT",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    56: {
      "name": "Short Green Firestick",
      "sprite": "SMGT",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    31: {
      "name": "Short Green Pillar",
      "sprite": "COL2",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    36: {
      "name": "Short Green Pillar with Beating Heart",
      "sprite": "COL5",
      "animation": "AB",
      "radius": 16,
      "collides": true
    },
    57: {
      "name": "Short Red Firestick",
      "sprite": "SMRT",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    33: {
      "name": "Short Red Pillar",
      "sprite": "COL4",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    37: {
      "name": "Short Red Pillar with Skull",
      "sprite": "COL6",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    86: {
      "name": "Short Techno Floor Lamp",
      "sprite": "TLP2",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    27: {
      "name": "Skull on a Pole",
      "sprite": "POL4",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    47: {
      "name": "Stalagmite",
      "sprite": "SMIT",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    44: {
      "name": "Tall Blue Firestick",
      "sprite": "TBLU",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    45: {
      "name": "Tall Green Firestick",
      "sprite": "TGRN",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    30: {
      "name": "Tall Green Pillar",
      "sprite": "COL1",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    46: {
      "name": "Tall Red Firestick",
      "sprite": "TRED",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    32: {
      "name": "Tall Red Pillar",
      "sprite": "COL3",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    85: {
      "name": "Tall Techno Floor Lamp",
      "sprite": "TLMP",
      "animation": "ABCD",
      "radius": 16,
      "collides": true
    },
    48: {
      "name": "Tall Techno Pillar",
      "sprite": "ELEC",
      "animation": "A",
      "radius": 16,
      "collides": true
    },
    26: {
      "name": "Twitching Impaled Human",
      "sprite": "POL6",
      "animation": "AB",
      "radius": 16,
      "collides": true
    },
    10: {
      "name": "Bloody Mess",
      "sprite": "PLAY",
      "animation": "W",
      "radius": 16
    },
    12: {
      "name": "Bloody Mess",
      "sprite": "PLAY",
      "animation": "W",
      "radius": 16
    },
    34: {
      "name": "Candle",
      "sprite": "CAND",
      "animation": "A",
      "radius": 16
    },
    22: {
      "name": "Dead Cacodemon",
      "sprite": "HEAD",
      "animation": "L",
      "radius": 31
    },
    21: {
      "name": "Dead Demon",
      "sprite": "SARG",
      "animation": "N",
      "radius": 30
    },
    18: {
      "name": "Dead Former Human",
      "sprite": "POSS",
      "animation": "L",
      "radius": 20
    },
    19: {
      "name": "Dead Former Sergeant",
      "sprite": "SPOS",
      "animation": "L",
      "radius": 20
    },
    20: {
      "name": "Dead Imp",
      "sprite": "TROO",
      "animation": "M",
      "radius": 20
    },
    23: {
      "name": "Dead Lost Soul",
      "sprite": "SKUL",
      "animation": "K",
      "radius": 16
    },
    15: {
      "name": "Dead Marine",
      "sprite": "PLAY",
      "animation": "N",
      "radius": 16
    },
    62: {
      "name": "Hanging Leg",
      "sprite": "GOR5",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    60: {
      "name": "Hanging Pair of Legs",
      "sprite": "GOR4",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    59: {
      "name": "Hanging Victim, Arms Out",
      "sprite": "GOR2",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    61: {
      "name": "Hanging Victim, One-Legged",
      "sprite": "GOR3",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    63: {
      "name": "Hanging Victim, Twitching",
      "sprite": "GOR1",
      "animation": "ABCB",
      "hanging": true,
      "radius": 16
    },
    79: {
      "name": "Pool of Blood",
      "sprite": "POB1",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    80: {
      "name": "Pool of Blood",
      "sprite": "POB2",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    24: {
      "name": "Pool of Blood and Flesh",
      "sprite": "POL5",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
    81: {
      "name": "Pool of Brains",
      "sprite": "BRS1",
      "animation": "A",
      "hanging": true,
      "radius": 16
    },
  };
}

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

} (this));
