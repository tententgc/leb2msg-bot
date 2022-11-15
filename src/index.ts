import lineNotification from "./routers/line-notification";
import timeconvert from "./helpers/timeconvert";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

interface class_activity_pageType {
    [key: string]: {
        title: string | null;
        publish_date: string | null;
        due_date: string | null;
    }[];
}

dotenv.config();


(async () => {
    const browser = await puppeteer.launch();
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

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
        ).map((item) => item.attributes["data-url"].value);
    });

    const class_activity = class_section.map((item) => {
        return item.replace("/plan/syllabus/index", "/activity");
    });

    // eslint-disable-next-line prefer-const
    let class_activity_page: class_activity_pageType = {};

    for (let i = 0; i < class_activity.length; i++) {
        await page.goto(class_activity[i], {
            timeout: 20000,
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
                    return null;
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        class_activity_page[class_name] = assignment_all;
    }

    for (const [key, value] of Object.entries(class_activity_page)) {
        if (value !== null) {
            for (let i = 0; i < value.length; i++) {
                if (value[i] !== null) {
                    const { title, publish_date, due_date } = value[i];
                    if (title !== null && publish_date !== null && due_date !== null && timeconvert(due_date) >= 0) {
                        const message = `${key} - ${title} - ${publish_date} - ${due_date}`;
                        console.log(message);
                        lineNotification(message);
                    }
                }
            }
        }
    }

    await browser.close();
})();