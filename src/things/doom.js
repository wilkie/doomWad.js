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