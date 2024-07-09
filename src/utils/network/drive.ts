import {
  GAPI_GET_FILES_CONFIG,
  PAGE_ROUTES,
  TITLE_NODE_KEY_PREFIX,
} from "@/constants/network";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { SEARCH_FILTER_OPTIONS } from "@/constants/general";
import { GOOGLE_FILE_TYPES } from "@/constants/googledrive";
import { IFilterByState } from "@/types/components";

const gapi = window.gapi;

export const getMyDriveFiles = async (orderBy?: IFilterByState) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `'root' in parents and trashed = false`,
    ...orderBy,
  });
};

export const getSearchSuggestionsFiles = async (
  searchText: string,
  filterOptions: CheckboxValueType[] = []
) => {
  let filterQueries = "";
  const isFolderSearch = filterOptions.includes(
    SEARCH_FILTER_OPTIONS.INCLUDE_FOLDERS
  );
  const isFileTextSearch = filterOptions.includes(
    SEARCH_FILTER_OPTIONS.INCLUDE_FILE
  );

  if (isFileTextSearch) {
    filterQueries = `fullText contains '"${searchText}"'`;
  } else {
    filterQueries = `name contains '${searchText}'`;
  }
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `${filterQueries} and trashed = false ${
      isFolderSearch
        ? ""
        : "and mimeType != 'application/vnd.google-apps.folder'"
    }`,
    orderBy:
      isFolderSearch && !isFileTextSearch
        ? "folder,modifiedTime desc"
        : undefined,
    pageSize: 50,
    corpora: "allDrives",
  });
};

export const getSearchSuggestionsFolders = async (
  searchText: string,
  _filterOptions?: CheckboxValueType[]
) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `(name contains '${searchText}') and trashed = false and mimeType = 'application/vnd.google-apps.folder'`,
    orderBy: undefined,
    pageSize: 50,
    corpora: "allDrives",
  });
};

export const getSharedDriveFiles = async (pageToken?: string) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `sharedWithMe and trashed = false`,
    pageSize: 100,
    pageToken,
  });
};

export const getFileDetailsUsingId = async (folderId: string) => {
  return await gapi.client.drive.files.get({
    fileId: folderId,
    fields:
      "createdTime, fileExtension, folderColorRgb, hasThumbnail, thumbnailLink, iconLink, id, lastModifyingUser, shared, starred, mimeType, modifiedTime, name, parents, viewedByMeTime, sharedWithMeTime, contentHints, trashed, webContentLink, webViewLink, trashedTime, capabilities(canRename, canTrash, canAddChildren, canEdit, canCopy, canDownload, canShare), permissions, owners",
  });
};

export const getRecentViewedFiles = async (pageToken?: string) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    orderBy: "viewedByMeTime desc",
    pageSize: 50,
    pageToken,
  });
};

export const getStarredFiles = async (pageToken?: string) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `starred = true and trashed = false`,
    orderBy: "sharedWithMeTime",
    pageToken,
  });
};

export const getFilesUsingParentId = async (
  parentId: string,
  loadMoreToken?: string,
  orderBy?: IFilterByState
) => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `'${parentId}' in parents and trashed = false`,
    pageToken: loadMoreToken,
    ...orderBy,
  });
};

export const listStarredFolders = async () => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `starred = true`,
  });
};

export const deleteDriveFile = async (fileId: string) => {
  return await gapi.client.drive.files.update({
    fileId: fileId,
    supportsAllDrives: true,
    resource: {
      trashed: true,
    },
  });
};

export const deleteDriveFilePermanent = async (fileId: string) => {
  return await gapi.client.drive.files.delete({
    fileId: fileId,
  });
};

export const restoreDriveFile = async (fileId: string) => {
  return await gapi.client.drive.files.update({
    fileId: fileId,
    supportsAllDrives: true,
    resource: {
      trashed: false,
    },
  });
};

export const getTrashedFiles = async () => {
  return await gapi.client.drive.files.list({
    ...GAPI_GET_FILES_CONFIG,
    q: `trashed = true`,
  });
};

export const renameDriveFile = async (fileId: string, newName: string) => {
  return await gapi.client.drive.files.update({
    fileId: fileId,
    resource: {
      name: newName,
    },
  });
};

export interface IFilePath {
  id: string;
  name: string;
  mimeType?: GOOGLE_FILE_TYPES;
}

export async function getFilePath(fileId: string): Promise<IFilePath[]> {
  const path: { id: string; name: string; mimeType?: GOOGLE_FILE_TYPES }[] = [];

  while (fileId) {
    const response = await getFileDetailsUsingId(fileId);
    const file: {
      name: string;
      parents?: string[];
      id: string;
      mimeType?: GOOGLE_FILE_TYPES;
    } = response.result;

    path.push({
      id: file.id,
      name: file.name,
      mimeType: file?.mimeType,
    });
    fileId = file.parents?.[0] ?? "";
  }

  path.reverse();
  return path;
}

export const extractFolderIdFromLink = (folderLink: string) => {
  const Url = new URL(folderLink);
  const pathname = Url.pathname;
  const parts = pathname.split("/");
  return parts[parts.length - 1];
};

export function scrollTitleNodeIntoView(
  fileId: string,
  nodeType?: GOOGLE_FILE_TYPES
) {
  const elementId = `${TITLE_NODE_KEY_PREFIX}${fileId}`;
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
      element.style.backgroundColor = "#e6f4ff";
      element.style.borderRadius = "6px";
      setTimeout(() => {
        element.style.backgroundColor = "";
      }, 1800);
    } else if (nodeType === GOOGLE_FILE_TYPES.FOLDER) {
      window.open(PAGE_ROUTES.FOLDER + "/" + fileId);
    }
    console.log(element, fileId, nodeType);
  });
}

export const toogleFileAsStarred = async (
  fileId: string,
  isStared: boolean
) => {
  await gapi.client.drive.files.update({
    fileId,
    starred: isStared,
  });
};
