export const enum GOOGLE_FILE_TYPES {
  FOLDER = "application/vnd.google-apps.folder",
  DOCUMENT = "application/vnd.google-apps.document",
  PRESENTATION = "application/vnd.google-apps.presentation",
  SHEET = "application/vnd.google-apps.spreadsheet",
}

export const NEW_FILE_EXTENSIONS_SELECT_OPTIONS = [
  {
    label: "Document",
    value: GOOGLE_FILE_TYPES.DOCUMENT,
  },
  {
    label: "Spreadsheet",
    value: GOOGLE_FILE_TYPES.SHEET,
  },
  {
    label: "Presentation",
    value: GOOGLE_FILE_TYPES.PRESENTATION,
  },
  {
    label: "Folder",
    value: GOOGLE_FILE_TYPES.FOLDER,
  },
];

export const DEFAULT_FILE_NAME = "Untitled";

export const FILPKART_ORG_PERMISION = {
  type: "domain",
  role: "reader",
  domain: "flipkart.com",
};

export enum DIRECTORY_TYPE {
  ROOT = "My Drive",
  SHARED = "Shared with me",
  STARRED = "Starred",
  RECENT = "Recent",
  ORGANISATION = "space",
  TRASHED = "Trashed",
}

export enum PERMISSIONS_ROLES {
  OWNER = "owner",
  ORGANISER = "organizer",
  FILE_ORGANISER = "fileOrganizer",
  EDITOR = "writer",
  COMMENTOR = "commenter",
  VIEW = "reader",
}

export const PERMISSION_MAP = {
  [PERMISSIONS_ROLES.OWNER]: "Owner",
  [PERMISSIONS_ROLES.ORGANISER]: "Organiser",
  [PERMISSIONS_ROLES.FILE_ORGANISER]: "File Organiser",
  [PERMISSIONS_ROLES.EDITOR]: "Editor",
  [PERMISSIONS_ROLES.COMMENTOR]: "Commentor",
  [PERMISSIONS_ROLES.VIEW]: "Viewer",
};

export const UPLOAD_WARNING_MESSAGE =
  "All the files uploaded using this app in org folder will be public. Please ensure that you don't upload any confidential information in public folder.";

export const USER_RECENT_VIEWED_FOLDERS_KEY = "RECENTLY_VIEWED_DATA";
export const USER_RECENT_VIEWED_FILES_KEY = "RECENT_VIEWED_FILES";

export const FILE_IMAGE_URLS = {
  [GOOGLE_FILE_TYPES.SHEET]:
    "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet",
  [GOOGLE_FILE_TYPES.FOLDER]:
    "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder",
  [GOOGLE_FILE_TYPES.PRESENTATION]:
    "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation",
  [GOOGLE_FILE_TYPES.DOCUMENT]:
    "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document",
};
