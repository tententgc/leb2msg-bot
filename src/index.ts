import puppeteer from "puppeteer-core";
import dotenv from "dotenv";

//@ts-ignore
import PCR from "puppeteer-chromium-resolver";
import { onChange } from "./helpers/checkOnChange";
import { makeCurrentClassActivity } from "./helpers/makeCurrentClassActivity";

interface class_activity_pageType {
  [key: string]: {
    title: string | null;
    publish_date: string | null;
    due_date: string | null;
  }[];
}

dotenv.config();

(async () => {
  const stats = await PCR();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: stats.executablePath,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(
    "https://login.leb2.org/login?app_id=1&redirect_uri=https%3A%2F%2Fapp.leb2.org%2Flogin"
  );

  await page.type("#username", process.env.USERNAME as string);
  await page.type("#password", process.env.PASSWORD as string);
  await page.click("button[type=submit]");
  await page.waitForNavigation();

  const class_section = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        'div[class="col-xs-12 col-md-6 col-lg-4 col-xl-3 whole-card "] > div'
      )
      //@ts-ignore
    ).map((item) => item.attributes["data-url"].value);
  });

  const class_activity = class_section.map((item) => {
    return item.replace("/plan/syllabus/index", "/activity");
  });

  var prev_class_activity_page: class_activity_pageType = { 'GEN 231-17': [] };

  console.log(new Date().toLocaleTimeString());

  // do first-time check
  var class_activity_page: class_activity_pageType =
    await makeCurrentClassActivity(page, class_activity);
  onChange(class_activity_page, prev_class_activity_page);
  prev_class_activity_page = class_activity_page;

  // fetch every 20 minutes
  setInterval(async () => {
    console.log(new Date().toLocaleTimeString());
    var class_activity_page: class_activity_pageType =
      await makeCurrentClassActivity(page, class_activity);

    onChange(class_activity_page, prev_class_activity_page);

    prev_class_activity_page = class_activity_page;
  }, 1000 * 60 * 20);
})();
