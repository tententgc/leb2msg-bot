import lineNotification from "../routers/line-notification";

interface class_activity_pageType {
  [key: string]: {
    title: string | null;
    publish_date: string | null;
    due_date: string | null;
  }[];
}

export const onChange = (
  data: class_activity_pageType,
  prev: class_activity_pageType
) => {
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      if (prev[key]) {
        const isExist = prev[key].find(
          (prevItem) => prevItem.title === item.title
        );

        if (!isExist) {
          lineNotification(
            `Class: ${key} has New Assignment: ${item.title} | due date: ${item.due_date}`
          );
        }
      }
    });
  });
};
