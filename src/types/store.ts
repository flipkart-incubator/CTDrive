import { MessageInstance } from "antd/es/message/interface";
import { IFileMetaData } from "./drive";
import { IFilePath } from "@/utils/network/drive";

export interface UserState {
  userDetails: {
    isSignedIn: boolean;
    userDetails?: {
      userId: string;
      userName: string;
      fullName: string;
      imageUrl: string;
      userEmail: string;
    };
  };
  selectedFilePath?: IFilePath[];
  checkUserDetails: () => void;
  isLoading: boolean;
  driveData?: {
    iframeNodeData?: IFileMetaData;
    iframeNodeDriveType?: string;
    disableIframeClick?: boolean;
  };
  recentData?: {
    recentFolders?: { id: string; name: string }[];
    recentFiles?: { id: string; name: string; iconLink: string }[];
  };
  favouriteFolders?: IFileMetaData[];
  setIframeData: (
    iframeNode: IFileMetaData,
    config?: { driveType?: string; reloadPage?: boolean }
  ) => void;
  resetData: () => void;
  rootFolderData?: IFileMetaData;
  setRootFolderData: (fileId: string, messageApi?: MessageInstance) => void;
  setIframePointerEvents: (enable: boolean) => void;
  setDefaultOpenedFileDetails: (params: {
    fileId: string;
    parentId?: string | null;
    messageApi?: MessageInstance;
    appendQueryInUrl?: boolean;
  }) => void;
  resetIframeData: () => void;
  setRecentViewedData?: () => void;
  setCurrentFilePath: (id: string) => void;
  fetchAndUpdateFavoriateData: () => void;
}
