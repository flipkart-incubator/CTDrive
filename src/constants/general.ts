export const DEFAULT_PAGE_TITLE = import.meta.env.VITE_APP_NAME;

export const ORG_FOLDER_ID = import.meta.env.VITE_ROOT_ORG_FOLDER_ID;

export const ENABLED_FOR_ORGANISATION = !!ORG_FOLDER_ID;

export const enum SEARCH_FILTER_OPTIONS {
  INCLUDE_FILE = "include_file",
  INCLUDE_FOLDERS = "include_folders",
}

export const DEFAULT_FOLDER_ICON_URL =
  "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder";

export enum FILTER_NAME {
  NAME = "Name",
  LAST_MODIFIED = "Last modified",
  LAST_MODIFIED_BY_ME = "Last modified by me",
  LAST_OPENED_BY_ME = "Last opened by me",
  CREATED_TIME = "Created time",
}

export enum FILTER_QUERY {
  NAME = "name",
  LAST_MODIFIED = "modifiedTime",
  LAST_MODIFIED_BY_ME = "modifiedByMeTime",
  LAST_OPENED_BY_ME = "viewedByMeTime",
  CREATED_TIME = "createdTime",
}

export enum FOLDER_FILTER {
  ON_TOP = "On Top",
  MIX_WITH_FILES = "Mix with files",
}

export enum ORDERBY {
  ASC = "",
  DESC = " desc",
}
