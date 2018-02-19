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
      ready.call(self);
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
