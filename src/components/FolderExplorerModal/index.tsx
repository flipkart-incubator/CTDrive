import { Menu, Modal } from "antd";
import { useState } from "react";
import FolderSelection from "./FolderSelection";
import { FOLDER_MENU_OPTIONS, IFolderModalProps } from "./types";
import SearchFolder from "./SearchFolder";
import { IFileMetaData } from "@/types/drive";
import FolderLink from "./FolderLink";

const folderMenuOptions = [
  {
    label: FOLDER_MENU_OPTIONS.BROWSE_FOLDER,
    key: FOLDER_MENU_OPTIONS.BROWSE_FOLDER,
  },
  {
    label: FOLDER_MENU_OPTIONS.SEARCH_FOLDER,
    key: FOLDER_MENU_OPTIONS.SEARCH_FOLDER,
  },
  {
    label: FOLDER_MENU_OPTIONS.FOLDER_LINK,
    key: FOLDER_MENU_OPTIONS.FOLDER_LINK,
  },
];

const getSelectedFolderTypeChild = (
  selectionType: FOLDER_MENU_OPTIONS,
  onFolderSelect: (folderId?: IFileMetaData) => void
) => {
  switch (selectionType) {
    case FOLDER_MENU_OPTIONS.BROWSE_FOLDER:
      return <FolderSelection onFolderSelect={onFolderSelect} />;
    case FOLDER_MENU_OPTIONS.SEARCH_FOLDER:
      return <SearchFolder onFolderSelect={onFolderSelect} />;
    case FOLDER_MENU_OPTIONS.FOLDER_LINK:
      return <FolderLink onFolderSelect={onFolderSelect} />;
    default:
      return null;
  }
};

const FolderExplorerModal = ({ onFolderSelect }: IFolderModalProps) => {
  const [selectedFolderMenuKey, setFolderMenuKey] =
    useState<FOLDER_MENU_OPTIONS>(FOLDER_MENU_OPTIONS.BROWSE_FOLDER);

  return (
    <>
      <Menu
        mode="horizontal"
        items={folderMenuOptions}
        selectedKeys={[selectedFolderMenuKey]}
        onClick={({ key }) => setFolderMenuKey(key as FOLDER_MENU_OPTIONS)}
      />
      <div className="pt-4">
        {getSelectedFolderTypeChild(selectedFolderMenuKey, onFolderSelect)}
      </div>
    </>
  );
};

export default FolderExplorerModal;
