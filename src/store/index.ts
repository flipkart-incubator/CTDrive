import { create } from "zustand";
import { gapi } from "gapi-script";
import { UserState } from "@/types/store";
import {
  getFileDetailsUsingId,
  getFilePath,
  listStarredFolders,
} from "@/utils/network/drive";
import {
  getUserRecentViewedFilesData,
  getUserRecentViewedFoldersData,
  updateUserRecentViewData,
} from "@/utils/userData";
import { DEFAULT_PAGE_TITLE } from "@/constants/general";

export const useUserStore = create<UserState>((set) => ({
  userDetails: {
    isSignedIn: false,
  },
  isLoading: true,
  driveData: {
    iframeSrc: "",
    disableIframeClick: false,
  },
  recentData: {
    recentFiles: [],
    recentFolders: [],
  },
  favouriteFolders: [],
  checkUserDetails: async () => {
    const instance = gapi.auth2?.getAuthInstance?.();
    const isUserSignedIn = await gapi.auth2
      ?.getAuthInstance?.()
      ?.isSignedIn?.get();
    if (isUserSignedIn) {
      const userDetails = await instance.currentUser.get().getBasicProfile();
      const recentFolders = getUserRecentViewedFoldersData();
      const recentFiles = getUserRecentViewedFilesData();
      const userId = userDetails.getId();
      const userName = userDetails.getName();
      const fullName = userDetails.getGivenName();
      const imageUrl = userDetails.getImageUrl();
      const userEmail = userDetails.getEmail();
      const starredResponse = await listStarredFolders();
      const userData = {
        userId,
        userName,
        fullName,
        imageUrl,
        userEmail,
      };
      set({
        userDetails: {
          isSignedIn: true,
          userDetails: userData,
        },
        isLoading: false,
        recentData: {
          recentFolders,
          recentFiles,
        },
        favouriteFolders: starredResponse?.result?.files || [],
      });
    } else {
      set({
        userDetails: { isSignedIn: isUserSignedIn, userDetails: undefined },
        isLoading: false,
      });
    }
  },
  setIframeData: async (fileNode, { driveType, reloadPage } = {}) => {
    const { id, parents, name, iconLink } = fileNode || {};
    const parentId = parents?.[0] || "root";

    const query = `?fileId=${id}&parentId=${parentId}`;

    if (reloadPage) {
      window.location.href = "/" + query;
    }
    // TODO: Seperate out logic and avoid API call.
    const { recentFiles, recentFolders } = await updateUserRecentViewData({
      folder: { id: parentId },
      file: { id, name, iconLink },
    });
    window.history.replaceState(window?.history?.state || {}, "", query);
    event?.preventDefault?.();
    window.document.title = name;
    set({
      driveData: {
        iframeNodeData: fileNode,
        iframeNodeDriveType: driveType,
      },
      recentData: {
        recentFolders,
        recentFiles,
      },
    });
  },
  resetIframeData: () => {
    set({
      driveData: {
        iframeNodeData: undefined,
      },
    });
    window.document.title = DEFAULT_PAGE_TITLE;
  },
  resetData: () => {
    set({
      userDetails: { isSignedIn: false, userDetails: undefined },
      isLoading: false,
    });
  },
  setRootFolderData: async (folderId, messageApi) => {
    try {
      const data = await getFileDetailsUsingId(folderId);
      const folderData = data?.result;
      set({
        rootFolderData: folderData,
      });
    } catch (er) {
      messageApi?.open({
        type: "error",
        content: "Seems you don't have permission to org folder",
      });
    }
  },
  setIframePointerEvents: (disableIframeClick: boolean) => {
    set((state) => ({
      driveData: {
        ...state.driveData,
        disableIframeClick: !disableIframeClick,
      },
    }));
  },
  setDefaultOpenedFileDetails: async ({ fileId, appendQueryInUrl }) => {
    const data = await getFileDetailsUsingId(fileId);
    const fileData = data?.result;
    if (fileData) {
      const { name, id, parents, iconLink } = fileData || {};
      window.document.title = name;
      const parentId = parents?.[0];

      const { recentFiles, recentFolders } = await updateUserRecentViewData({
        folder: { id: parentId },
        file: { id, name, iconLink },
      });

      if (appendQueryInUrl) {
        const query = parentId
          ? `?fileId=${id}&parentId=${parentId}`
          : `?fileId=${id}`;
        window.history.replaceState(window?.history?.state || {}, "", query);
      }
      set({
        driveData: {
          iframeNodeData: {
            ...fileData,
            webViewLink: fileData?.webViewLink?.replace("view", "preview"),
          },
        },
        recentData: {
          recentFolders,
          recentFiles,
        },
      });
    }
  },
  setCurrentFilePath: async (id) => {
    try {
      const data = await getFilePath(id);
      set({
        selectedFilePath: data,
      });
    } catch (err) {
      set({
        selectedFilePath: [],
      });
    }
  },
  fetchAndUpdateFavoriateData: async () => {
    const data = await listStarredFolders();
    set({
      favouriteFolders: data?.result?.files || [],
    });
  },
}));
