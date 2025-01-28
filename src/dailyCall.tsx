// dailyCall.ts
import DailyIframe from "@daily-co/daily-js";

let globalCallObject: any = null;

export const getOrCreateCallObject = () => {
  if (!globalCallObject) {
    globalCallObject = DailyIframe.createCallObject();
  }
  return globalCallObject;
};
