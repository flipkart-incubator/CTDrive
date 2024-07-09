import { DIRECTORY_TYPE } from "@/constants/googledrive";
import { IDriveTreeNode, IFileMetaData } from "@/types/drive";

export const enum FOLDER_MENU_OPTIONS {
  BROWSE_FOLDER = "Browse Folder",
  SEARCH_FOLDER = "Search Folder",
  FOLDER_LINK = "Via Folder Link",
}

export interface IFolderModalProps extends IFolderSelectionProps {}

export interface IFolderSelectionProps {
  onFolderSelect: (
    folderData?: IFileMetaData,
    driveType?: DIRECTORY_TYPE
  ) => void;
}
