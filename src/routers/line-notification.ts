import request from "request";
import dotenv from "dotenv";

dotenv.config();

const lineNotifyOption = (message: string) => {
  return {
    method: "POST",
    uri: "https://notify-api.line.me/api/notify",
    headers: {
      Authorization: `Bearer ${process.env.LINE_TOKEN}`,
    },
    form: {
      message: JSON.stringify(message),
    },
  };
};

export default function lineNotification(data: string) {
  request(lineNotifyOption(data), function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}
