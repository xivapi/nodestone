const { JSDOM } = require("jsdom");
const axios = require("axios");

const getAchievements = async (lodestoneid, page) => {
  const { data } = await axios.get("https://na.finalfantasyxiv.com/lodestone/character/" + lodestoneid + "/achievement");
  const dom = new JSDOM(data);
  const { document } = dom.window;

  // Regex
  let achIdRE = new RegExp("/lodestone/character/\\d*/achievement/detail/(?<ID>\\d*)/"),
    achTimeRE = new RegExp(".*ldst_strftime\\((?<Timestamp>\\d*)", "");

  // Raw Selectors
  const achList = document.querySelector(".ldst__achievement > ul:nth-child(3)").textContent;
  const achListNext = document.querySelector("ul.btn__pager:nth-child(2) > li:nth-child(4) > a:nth-child(1)").textContent;
  const achEntry = document.querySelector(".entry").textContent;
  const achLink = document.querySelector(".entry__achievement").getAttribute("href");
  const achTime = document.querySelector(".entry__activity__time > script").textContent;

  // Data Clean Up
  const achId = achLink.match(achIdRE);
  const achTimeSanitized = achTime.match(achTimeRE);

  const achTimeFin = achTimeSanitized.groups.Timestamp
  const achIdFin = achId.groups.ID

  // Finalize Schema
  const charaAchievements = [
    {
      id: achIdFin,
    //   name: achEntry,
      link: achLink,
      time: achTimeFin,
    },
  ];
  return charaAchievements;
};

module.exports = getAchievements;
