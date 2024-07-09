import { DataNode, EventDataNode } from "antd/es/tree";

export interface IFileMetaData {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  shared: boolean;
  hasThumbnail: boolean;
  folderColorRgb: boolean;
  starred: boolean;
  trashed: boolean;
  createdTime: string;
  modifiedTime: string;
  sharedWithMeTime: string;
  capabilities: {
    canEdit?: boolean;
    canCopy?: boolean;
    canAddChildren?: boolean;
    canDownload?: boolean;
    canRename?: boolean;
    canTrash?: boolean;
    canShare?: boolean;
  };
  lastModifyingUser: IDriveUser;
  thumbnailLink: string;
  viewedByMeTime?: string;
  owners?: IDriveUser[];
  permissions?: IPermissionUser[];
  parents?: string[];
}

export interface IDriveUser {
  displayName: string;
  kind: string;
  me: boolean;
  permissionId: string;
  emailAddress: string;
  photoLink: string;
}

export interface IDriveTreeNode extends DataNode {
  children?: IDriveTreeNode[];
  metaData?: Partial<IFileMetaData>;
  title: string;
  rootType?: string;
  loadMoreToken?: string;
}

export interface ISelectInfo {
  event: "select";
  selected: boolean;
  node: EventDataNode<TreeDataType>;
  selectedNodes: { metaData?: IFileMetaData }[];
  nativeEvent: MouseEvent;
}

export type TreeDataType = {
  metaData?: IFileMetaData;
  children?: IDriveTreeNode[];
};

export interface IPermissionUser {
  deleted: boolean;
  displayName: string;
  emailAddress?: string;
  kind: string;
  pendingOwner: boolean;
  photoLink: string;
  id: string;
  role: string;
  type: string;
  domain?: string;
}
