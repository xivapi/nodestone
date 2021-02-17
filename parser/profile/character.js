const { JSDOM } = require("jsdom");
const axios = require("axios");

const profile = require("../../lodestone-css-selectors/profile/character.json");
const attributes = require("../../lodestone-css-selectors/profile/attributes.json")

const getCharacter = async (lodestoneid) => {
  const { data } = await axios.get("https://na.finalfantasyxiv.com/lodestone/character/" + lodestoneid);
  const dom = new JSDOM(data);
  const { document } = dom.window;
  //CHARA INFO
  const charaName = document.querySelector(profile.NAME.selector).textContent;
  const charaTitleCheck = document.querySelector(profile.TITLE.selector);
  if (charaTitleCheck == null) {
    charaTitle = null;
  } else {
    charaTitle = document.querySelector(profile.TITLE.selector).textContent;
  }
  const charaServer = document.querySelector(profile.SERVER.selector).textContent;
  const charaNameday = document.querySelector(profile.NAMEDAY.selector).textContent;
  const charaAvatar = document.querySelector(profile.AVATAR.selector).src;
  const charaPortrait = document.querySelector(profile.PORTRAIT.selector).src;
  // RCG will need to be cleaned up but just getting it sorted for now
  const charaRCG = document.querySelector(profile.RACE_CLAN_GENDER.selector).textContent;
  const charaTown = document.querySelector(profile.TOWN.NAME.selector).textContent;
  const charaTownIcon = document.querySelector(profile.TOWN.ICON.selector).src;
  const charaDeity = document.querySelector(profile.GUARDIAN_DEITY.NAME.selector).textContent;
  const charaDeityIcon = document.querySelector(profile.GUARDIAN_DEITY.ICON.selector).src;
  // TEAM INFO
  const charaGCcheck = document.querySelector(profile.GRAND_COMPANY.selector);
  let charaGC = null,
    charaGCIcon = null;
  if (charaGCcheck == null) {
    console.log("No GrandCompany Team found.");
    charaGC = null;
    charaGCIcon = null;
  } else {
    charaGC = document.querySelector(profile.GRAND_COMPANY.selector).textContent;
    charaGCIcon = document.querySelector("div.character__profile__data > div:nth-child(1) > div > div:nth-child(4) > img").src;
  }
  // Check if char is in an fc and assign appropriate values
  const charaFCCheck = document.querySelector(profile.FREE_COMPANY.NAME.selector);
  let charaFC = null,
    charaFCIcon = null;
  if (charaFCCheck == null) {
    console.log("No FreeCompany Team found.");
    charaFC = null;
    charaFCIconOne = null;
    charaFCIconTwo = null;
    charaFCIconThree = null;
    charaFCIcon = null;
  } else {
    charaFC = document.querySelector(profile.FREE_COMPANY.NAME.selector).textContent;
    charaFCIconOne = document.querySelector(profile.FREE_COMPANY.ICON_LAYERS.BOTTOM.selector).src;
    charaFCIconTwo = document.querySelector(profile.FREE_COMPANY.ICON_LAYERS.MIDDLE.selector).src;
    charaFCIconThree = document.querySelector(profile.FREE_COMPANY.ICON_LAYERS.TOP.selector).src;
    charaFCIcon = [charaFCIconOne, charaFCIconTwo, charaFCIconThree];
  }
  // Check if char has a pvp team and assign appropriate values
  const charaPVPCheck = document.querySelector(profile.PVP_TEAM.NAME.selector);
  let charaPVP = null,
    charaPVPIconOne = null,
    charaPVPIconTwo = null,
    charaPVPIconThree = null,
    charaPVPIcon = null;
  if (charaPVPCheck == null) {
    console.log("No PVP Team found.");
    charaPVP = null;
    charaPVPIcon = null;
  } else {
    charaPVP = document.querySelector(profile.PVP_TEAM.NAME.selector).textContent;
    charaPVPIconOne = document.querySelector(profile.PVP_TEAM.ICON_LAYERS.BOTTOM.selector).src;
    charaPVPIconTwo = document.querySelector(profile.PVP_TEAM.ICON_LAYERS.MIDDLE.selector).src;
    charaPVPIconThree = document.querySelector(profile.PVP_TEAM.ICON_LAYERS.TOP.selector).src;
    charaPVPIcon = [charaPVPIconOne, charaPVPIconTwo, charaPVPIconThree];
  }
  // CLASSJOB
  const charaClassjobIcon = document.querySelector(profile.ACTIVE_CLASSJOB.selector).src;
  // Classjob name doesn't work the way I thought it did. Will need to calculate what the job is from the mainhand weapon.
  const charaClassjob = document.querySelector(".character__class_icon > img:nth-child(1)").alt;
  const charaClassjobLevel = document.querySelector(profile.ACTIVE_CLASSJOB_LEVEL.selector).textContent;
  const charaLevel = charaClassjobLevel.replace(/[^\d]/g, "");
  // Attributes
  const charaAttrStr = document.querySelector(attributes.STRENGTH.selector).textContent;
  const charaAttrDex = document.querySelector(attributes.DEXTERITY.selector).textContent;
  const charaAttrVit = document.querySelector(attributes.VITALITY.selector).textContent;
  const charaAttrInt = document.querySelector(attributes.INTELLIGENCE.selector).textContent;
  const charaAttrMnd = document.querySelector(attributes.MIND.selector).textContent;
  // Offensive Properties
  const charaCHR = document.querySelector(attributes.CRITICAL_HIT_RATE.selector).textContent;
  const charaDet = document.querySelector(attributes.DETERMINATION.selector).textContent;
  const charaDHR = document.querySelector(attributes.DIRECT_HIT_RATE.selector).textContent;
  // Defensive Properties
  const charaDef = document.querySelector(attributes.DEFENSE.selector).textContent;
  const charaMDef = document.querySelector(attributes.MAGIC_DEFENSE.selector).textContent;
  // Physical Properties
  const charaATK = document.querySelector(attributes.ATTACK_POWER.selector).textContent;
  const charaSKS = document.querySelector(attributes.SKILL_SPEED.selector).textContent;
  // Mental Properties
  const charaATKMPot = document.querySelector(attributes.ATTACK_MAGIC_POTENCY.selector).textContent;
  const charaHealPot = document.querySelector(attributes.HEALING_MAGIC_POTENCY.selector).textContent;
  const charaSPS = document.querySelector(attributes.SPELL_SPEED.selector).textContent;
  // Role
  const charaTen = document.querySelector(attributes.TENACITY.selector).textContent;
  const charaPie = document.querySelector(attributes.PIETY.selector).textContent;
  // Bio
  const charaBio = document.querySelector(profile.BIO.selector).textContent;

  const charaJSON = [
    {
      lodestone: "https://na.finalfantasyxiv.com/lodestone/character/" + lodestoneid,
      name: charaName,
      title: charaTitle,
      server: charaServer,
      nameday: charaNameday,
      avatar: charaAvatar,
      portrait: charaPortrait,
      raceclassgender: charaRCG,
      bio: charaBio,
      town: {
        name: charaTown,
        icon: charaTownIcon,
      },
      deity: {
        name: charaDeity,
        icon: charaDeityIcon,
      },
      grandcompany: {
        name: charaGC,
        icon: charaGCIcon,
      },
      freecompany: {
        name: charaFC,
        icon: charaFCIcon,
      },
      pvpteam: {
        name: charaPVP,
        icon: charaPVPIcon,
      },
      activeclassjob: {
        name: charaClassjob,
        icon: charaClassjobIcon,
        level: charaLevel,
      },
      attributes: {
        strength: charaAttrStr,
        dexterity: charaAttrDex,
        vitality: charaAttrVit,
        intelligence: charaAttrInt,
        mind: charaAttrMnd,
      },
      offensive: {
        criticalhitrate: charaCHR,
        determination: charaDet,
        directhitrate: charaDHR,
      },
      defensive: {
        defense: charaDef,
        magicdefense: charaMDef,
      },
      physical: {
        attackpower: charaATK,
        skillspeed: charaSKS,
      },
      mental: {
        attackmagicpotency: charaATKMPot,
        healmagicpotency: charaHealPot,
        spellspeed: charaSPS,
      },
      role: {
        tenacity: charaTen,
        piety: charaPie,
      },
    },
  ];
  return charaJSON;
};

module.exports = getCharacter;
