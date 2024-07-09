import { MessageInstance } from "antd/es/message/interface";
import { IFileMetaData } from "../drive";

export interface IFileCreationModalProps {
  open: boolean;
  onCancel: () => void;
  parentFolderId?: string;
  onSuccess: () => void;
  messageApi: MessageInstance;
  hideShareToggle?: boolean;
  parentFolderData?: IFileMetaData;
  fileType?: string;
}

export interface ILoadMoreLoadingStateConfig {
  id: string;
  isLoading: boolean;
}

export interface IAddFileModalViaLink {
  open: boolean;
  onCancel: () => void;
  parentFolderId?: string;
  onSuccess: () => void;
  messageApi: MessageInstance;
  parentFolderData?: {
    key: string;
    driveType: string;
    fileData?: Partial<IFileMetaData>;
  };
}

export interface IGlobalFileCreation {
  playground?: boolean;
}
export interface IFilterByState {
  orderBy?: string;
}
