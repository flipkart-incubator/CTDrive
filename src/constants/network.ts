export const GOOGLE_API_DOMAIN =
  "https://www.googleapis.com/discovery/v1/apis/drive/v3";

export const GOOGLE_API_ROUTES = {
  GET_ALL_FILES: GOOGLE_API_DOMAIN + "/files",
};

export const configNames =
  "createdTime, fileExtension, folderColorRgb, hasThumbnail, thumbnailLink, iconLink, id, lastModifyingUser, shared, starred, mimeType, modifiedTime, name, parents, viewedByMeTime, sharedWithMeTime, contentHints, trashed, webContentLink, webViewLink, trashedTime, capabilities(canRename, canTrash, canAddChildren, canEdit, canCopy, canDownload, canShare), permissions, owners";
const fields = `nextPageToken, files(${configNames})`;

export const GAPI_GET_FILES_CONFIG = {
  fields: fields,
  supportsAllDrives: true,
  includeItemsFromAllDrives: true,
  pageSize: 100,
  orderBy: "folder,modifiedTime desc",
};

export const MY_DRIVE_PATH = "my-drive";
export const FOLDER_PATH = "folder";

export const PAGE_ROUTES: Record<string, string> = {
  HOME: import.meta.env.VITE_BASE_ROUTE_PREFIX || "/",
  get MY_DRIVE() {
    return this.HOME.endsWith("/")
      ? `/${MY_DRIVE_PATH}`
      : this.HOME + `/${MY_DRIVE_PATH}`;
  },
  get FOLDER() {
    return this.HOME.endsWith("/")
      ? `/${FOLDER_PATH}`
      : this.HOME + `/${FOLDER_PATH}`;
  },
};

export const LOAD_MORE_KEY = "LOAD_MORE";

export const LOAD_MORE_TITLE = "Load More";

export const TITLE_NODE_KEY_PREFIX = "titlenode_";
