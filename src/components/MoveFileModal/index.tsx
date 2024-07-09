import React, { useState } from "react";
import { Modal } from "antd";

import FolderExplorerModal from "../FolderExplorerModal";

import { IDriveTreeNode, IFileMetaData } from "@/types/drive";
import { MessageInstance } from "antd/es/message/interface";

interface IMoveFilesModalProps {
  fileToMoveData?: {
    data: IDriveTreeNode;
    driveType: string;
  };
  onClose: () => void;
  messageApi: MessageInstance;
}

const MoveFileModal = (props: IMoveFilesModalProps) => {
  const { fileToMoveData: { data } = {}, onClose, messageApi } = props;
  const [selectedFolderData, setSelectedFolderData] = useState<IFileMetaData>();
  const [showMoveFileConfirmation, setShowMoveFileConfirmation] =
    useState(false);

  const {
    id: fileId,
    parents: [currentParentId = ""] = [],
    name,
  } = data?.metaData || {};

  const handleMoveFile = async () => {
    const { id: newParentId, name } = selectedFolderData || {};
    // Move file to new parent
    messageApi.open({
      type: "loading",
      content: "Action in progress..",
      duration: 0,
    });
    try {
      if (newParentId)
        await window.gapi.client.drive.files.update({
          fileId,
          addParents: newParentId,
          removeParents: currentParentId,
          fields: "id, parents",
        });
      messageApi.destroy();
      messageApi.open({
        type: "success",
        content: "File moved successfully",
      });
    } catch (err) {
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content:
          "Unable to move, please check permission or contact folder owner.",
      });
    } finally {
      // Refresh data
      onClose();
      setSelectedFolderData(undefined);
      setShowMoveFileConfirmation(false);
    }
  };

  const handleFolderSelection = (folder?: IFileMetaData) => {
    setSelectedFolderData(folder);
    setShowMoveFileConfirmation(true);
  };

  return (
    <>
      <Modal
        open={!!data?.metaData}
        onCancel={props.onClose}
        destroyOnClose
        title={`Move "${name}"`}
        footer={null}
        width={850}
      >
        <FolderExplorerModal onFolderSelect={handleFolderSelection} />
      </Modal>
      <Modal
        open={showMoveFileConfirmation}
        onCancel={() => {
          setSelectedFolderData(undefined);
          setShowMoveFileConfirmation(false);
        }}
        onOk={handleMoveFile}
        title={`Move "${name}"`}
        centered
        destroyOnClose
      >
        Are you sure move file to <strong>{selectedFolderData?.name}</strong>?
      </Modal>
    </>
  );
};

export default MoveFileModal;
