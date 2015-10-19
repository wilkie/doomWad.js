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