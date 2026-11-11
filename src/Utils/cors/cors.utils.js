import { WHITE_LIST } from "../../../config/config.service.js";
import { badRequestException } from "../response/error.response.js";

export function corsOptions() {
  const whiteList = WHITE_LIST.split(",");

  const corsOptions = {
    origin: function (origin, callback) {
      if (whiteList.includes(origin)) {
        callback(null, true);
      } else if (!origin) {
        callback(null, true);
      } else {
        callback(badRequestException("Not Allowed By Cors!"));
      }
    },

    methods: ["GET,POST", "PATCH"],
  };

  return corsOptions;
}
