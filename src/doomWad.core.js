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

      // Retrieve level
      if (self._directory.lumpExists("MAP26")) {
        self._level = new DoomWad.Level(self._stream, self._info, self._directory, self._textures, "MAP26");
      }

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
  }

  DoomWad.prototype.flats = function() {
    return this._textures.forNamespace("flat");
  }

  DoomWad.prototype.sectors = function() {
    return this._level.sectors();
  }

  DoomWad.prototype.lineDefs = function() {
    return this._level.lineDefs();
  }

  DoomWad.prototype.textureFromName = function(name, namespace) {
    return this._textures.fromName(name, namespace);
  }

  DoomWad.prototype.level = function() {
    return this._level;
  }

  // DEBUG CODE
  //
  // With compiler directives, you can wrap code in a conditional check to
  // ensure that it does not get included in the compiled binaries.  This is
  // useful for exposing certain properties and methods that are needed during
  // development and testing, but should be private in the compiled binaries.
  if (DEBUG) {
  }
}
