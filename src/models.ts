export enum Locale {
  "English (UK)" = "eu",
  "English (US)" = "na",
  Français = "fr",
  Deutsch = "de",
  日本語 = "jp",
}

export enum Physical {
  Japan = "_region_1",
  "North America" = "_region_2",
  Europe = "_region_3",
  Oceania = "_region_4",
}

export enum Logical {
  Chaos = "_dc_Chaos",
  Light = "_dc_Light",
  Materia = "_dc_Materia",
  Aether = "_dc_Aether",
  Crystal = "_dc_Crystal",
  Dynamis = "_dc_Dynamis",
  Primal = "_dc_Primal",
  Elemental = "_dc_Elemental",
  Gaia = "_dc_Gaia",
  Mana = "_dc_Mana",
  Meteor = "_dc_Meteor",
}

// Manually generated and mapped, use selector below to get on /character/ etc.
// div.ldst__window select.select-pulldown__open optgroup[label*="World"]
export type World =
  | "Adamantoise"
  | "Aegis"
  | "Alexander"
  | "Alpha"
  | "Anima"
  | "Asura"
  | "Atomos"
  | "Bahamut"
  | "Balmung"
  | "Behemoth"
  | "Belias"
  | "Bismarck"
  | "Brynhildr"
  | "Cactuar"
  | "Carbuncle"
  | "Cerberus"
  | "Chocobo"
  | "Coeurl"
  | "Cuchulainn"
  | "Diabolos"
  | "Durandal"
  | "Excalibur"
  | "Exodus"
  | "Faerie"
  | "Famfrit"
  | "Fenrir"
  | "Garuda"
  | "Gilgamesh"
  | "Goblin"
  | "Golem"
  | "Gungnir"
  | "Hades"
  | "Halicarnassus"
  | "Hyperion"
  | "Ifrit"
  | "Ixion"
  | "Jenova"
  | "Kraken"
  | "Kujata"
  | "Lamia"
  | "Leviathan"
  | "Lich"
  | "Louisoix"
  | "Maduin"
  | "Malboro"
  | "Mandragora"
  | "Marilith"
  | "Masamune"
  | "Mateus"
  | "Midgardsormr"
  | "Moogle"
  | "Odin"
  | "Omega"
  | "Pandaemonium"
  | "Phantom"
  | "Phoenix"
  | "Rafflesia"
  | "Ragnarok"
  | "Raiden"
  | "Ramuh"
  | "Ravana"
  | "Ridill"
  | "Sagittarius"
  | "Sargatanas"
  | "Sephirot"
  | "Seraph"
  | "Shinryu"
  | "Shiva"
  | "Siren"
  | "Sophia"
  | "Spriggan"
  | "Tiamat"
  | "Titan"
  | "Tonberry"
  | "Twintania"
  | "Typhon"
  | "Ultima"
  | "Ultros"
  | "Unicorn"
  | "Valefor"
  | "Yojimbo"
  | "Zalera"
  | "Zeromus"
  | "Zodiark"
  | "Zurvan";

export enum Class {
  Tank = "_class_TANK",
  Healer = "_class_HEALER",
  DPS = "_class_DPS",
  Crafter = "_class_CRAFTER",
  Gatherer = "_class_GATHERER",
}

export enum Job {
  Gladiator = 1, // 1.21
  Pugilist = 2,
  Marauder = 3,
  Lancer = 4,
  Archer = 5,
  Conjurer = 6,
  Thaumaturge = 7,
  Carpenter = 8,
  Blacksmith = 9,
  Armorer = 10,
  Goldsmith = 11,
  Leatherworker = 12,
  Weaver = 13,
  Alchemist = 14,
  Culinarian = 15,
  Miner = 16,
  Botanist = 17,
  Fisher = 18,
  Paladin = 19,
  Monk = 20,
  Warrior = 21,
  Dragoon = 22,
  Bard = 23,
  "White Mage" = 24,
  "Black Mage" = 25,
  Arcanist = 26, // 2.0
  Summoner = 27,
  Scholar = 28,
  Rogue = 29, // 2.4
  Ninja = 30,
  Machinist = 31, // 3.0
  "Dark Knight" = 32,
  Astrologian = 33,
  Samurai = 34, // 4.0
  "Red Mage" = 35,
  "Blue Mage" = 36, // 4.5
  Gunbreaker = 37, // 5.0
  Dancer = 38,
  Reaper = 39, // 6.0
  Sage = 40,
  Viper = 41, // 7.0
  Pictomancer = 42,
  Beastmaster = 43, // 7.56
}

export enum Race {
  Hyur = "race_1",
  Elezen = "race_2",
  Lalafell = "race_3",
  "Miqo'te" = "race_4",
  Roegadyn = "race_5",
  "Au Ra" = "race_6",
  Hrothgar = "race_7",
  Viera = "race_8",
}

export enum Tribe {
  Midlander = "tribe_1",
  Highlander = "tribe_2",
  Wildwood = "tribe_3",
  Duskwight = "tribe_4",
  Plainsfolk = "tribe_5",
  Dunesfolk = "tribe_6",
  "Seeker of the Sun" = "tribe_7",
  "Keeper of the Moon" = "tribe_8",
  "Sea Wolf" = "tribe_9",
  Hellsguard = "tribe_10",
  Raen = "tribe_11",
  Xaela = "tribe_12",
  Helions = "tribe_13",
  "The Lost" = "tribe_14",
  Rava = "tribe_15",
  Veena = "tribe_16",
}
