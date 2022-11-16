import { Page } from "puppeteer-core";

interface class_activity_pageType {
  [key: string]: {
    title: string | null;
    publish_date: string | null;
    due_date: string | null;
  }[];
}

export const makeCurrentClassActivity = async (
  page: Page,
  class_activity: string[]
) => {
  console.log("Checking for new assignment...");
  var class_activity_page: class_activity_pageType = {};

  /* Going to the first class activity page. */
  await page.goto(class_activity[0])
  for (let i = 0; i < class_activity.length; i++) {
    await page.goto(class_activity[i], {
      timeout: 40000,
      waitUntil: ["load", "domcontentloaded", "networkidle0", "networkidle2"],
    });

    const class_name = await page.evaluate(() => {
      return document
        .querySelector('ol[class="breadcrumb"] > li:nth-child(2) > a')
        ?.textContent?.replace(/\n/g, "")
        .trim();
    });

    const assignment_all = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("tr")).map((item, index) => {
        if (index === 0) {
          return {
            title: "",
            publish_date: "",
            due_date: "",
          };
        }
        return {
          title: item
            .querySelector(
              `${index === 1 ? "th" : "td:nth-child(1)"} > div > div > a > span`
            )
            ?.textContent?.replace(/\n/g, "")
            .trim(),
          publish_date: item
            .querySelector(
              `${index === 0 ? "td:nth-child(1)" : "td:nth-child(2)"} > span`
            )
            ?.textContent?.replace(/\n/g, "")
            .trim(),
          due_date: item
            .querySelector(
              `${index === 0 ? "td:nth-child(2)" : "td:nth-child(3)"}> span`
            )
            ?.textContent?.replace(/\n/g, "")
            .trim(),
        };
      });
    });

    //@ts-ignore
    class_activity_page[class_name] = assignment_all;
  }

  console.log(class_activity_page)
  return class_activity_page;
};
