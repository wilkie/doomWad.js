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
