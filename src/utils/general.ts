import { PAGE_ROUTES } from "@/constants/network";
import { NavigateFunction } from "react-router-dom";

export const getDeepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const navigateToOrgDirectory = (navigate: NavigateFunction) => {
  if (import.meta.env.VITE_ROOT_ORG_FOLDER_ID) navigate(PAGE_ROUTES.HOME);
};

export const debounce = <T extends (...args: any) => any>(
  func: T,
  timeout: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // @ts-ignore
      func(...args);
    }, timeout);
  };
};

export const throttle = <T extends (...args: any) => any>(
  func: T,
  timeout: number
) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    if (!timer) {
      // @ts-ignore
      func(...args);
      timer = setTimeout(() => {
        // @ts-ignore
        timer = null;
      }, timeout);
    }
  };
};
