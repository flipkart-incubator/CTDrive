import React, { useState } from "react";
import { IAddFileModalViaLink } from "@/types/components";
import { Button, Input, Modal, Typography } from "antd";
import {
  extractFolderIdFromLink,
  getFileDetailsUsingId,
} from "@/utils/network/drive";
import { IFileMetaData } from "@/types/drive";

function AddFilesViaLinkModal(props: IAddFileModalViaLink) {
  const { messageApi, onCancel, onSuccess, open, parentFolderData } = props;
  const [fileLink, setFileLink] = useState("");

  const [fileData, setFileData] = useState<IFileMetaData>();

  const checkAndValidateFileLink = async () => {
    try {
      if (fileLink.includes("folder")) {
        const fileId = extractFolderIdFromLink(fileLink);
        const fileData = await getFileDetailsUsingId(fileId);
        setFileData(fileData.result);
      } else {
        const urlObject = new URL(fileLink);
        const fileId =
          urlObject.searchParams.get("fileId") ||
          urlObject.pathname.split("/")[3];
        const fileData = await getFileDetailsUsingId(fileId);
        setFileData(fileData.result);
      }
    } catch (err) {
      messageApi.error("Invalid file link. Please try again.");
    }
  };

  const handleFileMove = async () => {
    try {
      messageApi.open({
        type: "loading",
        content: "Action in progress..",
        duration: 0,
      });
      if (fileData) {
        const { id: newParentId } = parentFolderData?.fileData || {};
        const { parents: [currentParentId = ""] = [], id: fileId } = fileData;
        const response = await window.gapi.client.drive.files.update({
          fileId: fileId,
          addParents: newParentId,
          removeParents: currentParentId,
          fields: "id, parents",
        });
        messageApi.destroy();
        if (response.status === 200) {
          messageApi.open({
            type: "success",
            content:
              "File moved successfully" +
              ` to ${parentFolderData?.fileData?.name}`,
          });
        } else {
          messageApi.open({
            type: "error",
            content:
              "Unable to move, please check permission or contact folder owner.",
          });
        }
      }
    } catch (err) {
      console.log(err);
      messageApi.destroy();
      messageApi.open({
        type: "error",
        content:
          "Unable to move, please check permission or contact folder owner.",
      });
    } finally {
      onSuccess();
      handleReset();
    }
  };

  const handleReset = () => {
    setFileLink("");
    setFileData(undefined);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={() => {
          handleReset();
          onCancel();
        }}
        title={`Add file via link`}
        footer={null}
        destroyOnClose
      >
        <Input
          value={fileLink}
          onChange={(e) => setFileLink(e.target.value)}
          placeholder="Enter file link"
          title="File URL"
          suffix={<a onClick={checkAndValidateFileLink}>Verify</a>}
        />
        <span className="text-xs text-slate-600 pt-2">
          Paste the link of Gdrive or Ct-drive file/folder you want to move in{" "}
          <b>{parentFolderData?.fileData?.name}</b>{" "}
        </span>
        <div className="h-[35px]">
          {fileData && (
            <div className="flex items-center py-2 content-center">
              <Typography.Text className="text-gray-700">
                <b>File to add:</b>
                <img
                  src={fileData?.iconLink}
                  height={"12px"}
                  width={"12px"}
                  className="ml-2 mr-1"
                />
                {fileData?.name}{" "}
              </Typography.Text>
            </div>
          )}
        </div>
        <div className="flex align-end justify-end w-full">
          <Button
            disabled={!fileData?.id}
            size="middle"
            type="primary"
            className="mt-2 w-full"
            onClick={handleFileMove}
          >
            Add
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default AddFilesViaLinkModal;
