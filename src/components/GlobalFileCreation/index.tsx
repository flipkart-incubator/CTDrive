import React, { useState } from "react";
import { useUserStore } from "@/store";
import { Button, Modal, message } from "antd";
import FolderExplorerModal from "../FolderExplorerModal";
import AddFileModal from "../AddFileModal";
import { IFileMetaData } from "@/types/drive";
import { DIRECTORY_TYPE } from "@/constants/googledrive";
import { IGlobalFileCreation } from "@/types/components";

function GlobalFileCreation(props: IGlobalFileCreation) {
  const { playground } = props;
  const {
    userDetails: { isSignedIn },
  } = useUserStore();

  const [messageApi, toastContextHolder] = message.useMessage();

  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [selectedFolderData, setSelectedFolderData] = useState<IFileMetaData>();
  const [isFileCreationModalOpen, setIsFileCreationModalOpen] = useState(false);
  const [selectedFolderDriveType, setSelectedFolderDriveType] =
    useState<DIRECTORY_TYPE>();

  const handleModalToggle = () => {
    setFolderModalOpen((prev) => !prev);
  };

  const onFolderSelect = (
    folder?: IFileMetaData,
    driveType?: DIRECTORY_TYPE
  ) => {
    setSelectedFolderData(folder);
    handleModalToggle();
    setIsFileCreationModalOpen(true);
    setSelectedFolderDriveType(driveType);
  };

  const handleFileCreationSuccess = () => {
    setSelectedFolderData(undefined);
    setIsFileCreationModalOpen(false);
  };

  if (!isSignedIn) return null;

  return (
    <div>
      {toastContextHolder}
      {playground ? (
        <span className="cursor" onClick={handleModalToggle}>
          Create a <span style={{ color: "#0055cc" }}>new file or folder</span>
        </span>
      ) : (
        <Button size="small" onClick={handleModalToggle}>
          New
        </Button>
      )}
      <Modal
        open={isFolderModalOpen}
        onCancel={handleModalToggle}
        destroyOnClose
        title="Select any folder to create new file"
        footer={null}
        width={850}
      >
        <FolderExplorerModal onFolderSelect={onFolderSelect} />
      </Modal>
      <AddFileModal
        open={isFileCreationModalOpen}
        onCancel={() => {
          setSelectedFolderData(undefined);
          setIsFileCreationModalOpen(false);
        }}
        parentFolderId={selectedFolderData?.id}
        onSuccess={handleFileCreationSuccess}
        messageApi={messageApi}
        hideShareToggle={
          selectedFolderDriveType === DIRECTORY_TYPE.ORGANISATION
        }
        parentFolderData={selectedFolderData}
      />
    </div>
  );
}

export default GlobalFileCreation;
