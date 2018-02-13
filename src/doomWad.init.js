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
