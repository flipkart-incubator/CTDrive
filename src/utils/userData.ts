import {
  USER_RECENT_VIEWED_FOLDERS_KEY,
  USER_RECENT_VIEWED_FILES_KEY,
  DEFAULT_FILE_NAME,
} from "@/constants/googledrive";
import { getFileDetailsUsingId } from "./network/drive";
import { MessageInstance } from "antd/es/message/interface";

export const getUserRecentViewedFoldersData = () => {
  const recentViewData = localStorage.getItem(USER_RECENT_VIEWED_FOLDERS_KEY);
  const recentViewDataArray: { id: string; name: string }[] = recentViewData
    ? JSON.parse(recentViewData)
    : [];
  return recentViewDataArray;
};

export const getUserRecentViewedFilesData = () => {
  const recentViewData = localStorage.getItem(USER_RECENT_VIEWED_FILES_KEY);
  const recentViewDataArray: { id: string; name: string; iconLink: string }[] =
    recentViewData ? JSON.parse(recentViewData) : [];
  return recentViewDataArray;
};

export const updateUserRecentViewData = async (params: {
  folder: { id: string };
  file: { id: string; name: string; iconLink: string };
}) => {
  const {
    folder: { id: folderId },
    file: { id: fileId, name: fileName, iconLink },
  } = params;
  const recentViewFoldersArray = getUserRecentViewedFoldersData();
  const recentViewedFilesArray = getUserRecentViewedFilesData();
  const doesFolderExistInArray =
    !!folderId && recentViewFoldersArray.some((data) => data.id === folderId);

  const doesFileExistsInArray = recentViewedFilesArray.findIndex(
    (data) => data.id === fileId
  );

  // Push folder id to top of array and make sure array size is always 5
  if (folderId !== "root" && !doesFolderExistInArray && folderId) {
    const folderData = await getFileDetailsUsingId(folderId);
    const { id, name } = folderData?.result || {};
    if (id && name) {
      recentViewFoldersArray.unshift({ id, name });
    }
  }
  if (doesFileExistsInArray === -1) {
    recentViewedFilesArray.unshift({ id: fileId, name: fileName, iconLink });
  } else {
    recentViewedFilesArray[doesFileExistsInArray].name = fileName;
  }

  if (recentViewFoldersArray.length > 10) {
    recentViewFoldersArray.pop();
  }
  if (recentViewedFilesArray.length > 10) {
    recentViewedFilesArray.pop();
  }
  localStorage.setItem(
    USER_RECENT_VIEWED_FOLDERS_KEY,
    JSON.stringify(recentViewFoldersArray)
  );

  localStorage.setItem(
    USER_RECENT_VIEWED_FILES_KEY,
    JSON.stringify(recentViewedFilesArray)
  );
  return {
    recentFiles: recentViewedFilesArray,
    recentFolders: recentViewFoldersArray,
  };
};

export const handleGrantPermission = async (
  selectedUserFromDropdown: never[],
  userPermissionToGrant: string,
  id: string,
  onSuccess?: () => void,
  fileName?: string,
  messageApi?: MessageInstance
) => {
  try {
    selectedUserFromDropdown.forEach(async (d: any) => {
      const resourceObject = {
        role: userPermissionToGrant,
        type: "user",
        emailAddress: d,
      };

      await window.gapi.client.drive.permissions.create({
        fileId: id,
        resource: resourceObject,
      });
    });
    messageApi?.success(
      `Successfully shared ${fileName ? fileName : DEFAULT_FILE_NAME}`
    );
    onSuccess?.();
  } catch (error) {
    console.log(error);
  }
};
