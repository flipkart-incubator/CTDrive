import { useEffect, useState } from "react";
import { Button, Input, Modal, Radio, Switch, Tooltip, Typography } from "antd";
import { useUserStore } from "@/store";
import {
  NEW_FILE_EXTENSIONS_SELECT_OPTIONS,
  DEFAULT_FILE_NAME,
  FILPKART_ORG_PERMISION,
  GOOGLE_FILE_TYPES,
  DIRECTORY_TYPE,
  UPLOAD_WARNING_MESSAGE,
  FILE_IMAGE_URLS,
  PERMISSIONS_ROLES,
} from "@/constants/googledrive";
import { IFileMetaData } from "@/types/drive";
import { IFileCreationModalProps } from "@/types/components";
import { InfoCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { configNames } from "@/constants/network";
import { IFilePath, getFilePath } from "@/utils/network/drive";
import {
  DEFAULT_FOLDER_ICON_URL,
  ENABLED_FOR_ORGANISATION,
  ORG_FOLDER_ID,
} from "@/constants/general";
import NewUserPermission from "./ShareModal/NewUserPermission";
import { handleGrantPermission } from "@/utils/userData";

function AddFileModal({
  open,
  onCancel,
  parentFolderId,
  onSuccess,
  messageApi,
  hideShareToggle = false,
  parentFolderData,
  fileType = GOOGLE_FILE_TYPES.DOCUMENT,
}: IFileCreationModalProps) {
  const [shareWithOrg, setShareWithOrg] = useState(hideShareToggle);
  const [fileName, setFileName] = useState("");
  // TODO: Implement Share for new file
  const [openShare, setOpenShare] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState(fileType);
  const [loading, setLoading] = useState<boolean>(false);
  const { setIframeData } = useUserStore();
  const [parentFolderPath, setParentFolderPath] = useState<IFilePath[]>([]);
  const [userList, setUserList] = useState([]);
  const [userPermissionToGrant, setUserPermissionToGrant] = useState(
    PERMISSIONS_ROLES.VIEW
  );

  const handleOnCancel = (callback?: () => void) => () => {
    setShareWithOrg(hideShareToggle);
    setSelectedFileType(fileType);
    setFileName("");
    setLoading(false);
    callback?.();
  };
  const gapi = window?.gapi;

  useEffect(() => {
    if (parentFolderId) {
      (async () => {
        const pathData = await getFilePath(parentFolderId);
        setParentFolderPath(pathData || []);
      })();
    }
    return () => {
      setParentFolderPath([]);
    };
  }, [parentFolderId]);

  const handleFileCreation = () => {
    if (!fileName) {
      messageApi.warning("Please enter file name");
      return;
    }
    setLoading(true);
    try {
      const parentId =
        parentFolderId === DIRECTORY_TYPE.ROOT
          ? "root"
          : parentFolderId || "root";

      const userPermission = shareWithOrg ? FILPKART_ORG_PERMISION : {};

      window.gapi.client.drive.files
        .create({
          resource: {
            name: fileName || DEFAULT_FILE_NAME,
            mimeType: selectedFileType,
            parents: [parentId],
          },
          fields: configNames,
        })
        .execute(function (
          resp: { id: string; webViewLink: string; mimeType: string },
          _raw_resp: any
        ) {
          const webViewLink = resp?.webViewLink;
          if (webViewLink) {
            const updatedLink = webViewLink.replace("view", "preview");
            if (resp?.mimeType !== "application/vnd.google-apps.folder")
              setIframeData({
                ...resp,
                webViewLink: updatedLink,
              } as IFileMetaData);
          }
          if (shareWithOrg) {
            gapi.client.drive.permissions
              .create({
                fileId: resp.id,
                resource: userPermission,
              })
              .then(() => {
                handleOnCancel(onSuccess)();
              });
          } else {
            handleOnCancel(onSuccess)();
          }
          if (userList.length > 0) {
            handleGrantPermission(
              userList,
              userPermissionToGrant,
              resp.id,
              undefined,
              fileName,
              messageApi
            );
          }
        });
    } catch (err) {
      console.log(err);
    }
  };

  const parentName =
    parentFolderData?.name ||
    parentFolderPath?.[parentFolderPath?.length - 1]?.name;

  return (
    <Modal
      open={open}
      onCancel={handleOnCancel(onCancel)}
      destroyOnClose
      title={
        <>
          <div className="flex items-center justify-between pr-6">
            <span>Create File / Folder</span>{" "}
            {parentName && (
              <Tooltip
                title={
                  <>{parentFolderPath.map((file) => file.name).join(" > ")}</>
                }
              >
                <span className="flex items-center text-xs gap-1">
                  <img
                    height={16}
                    width={16}
                    src={DEFAULT_FOLDER_ICON_URL}
                    alt="Folder location"
                  />
                  {parentName}
                  <InfoCircleOutlined />
                </span>
              </Tooltip>
            )}
          </div>
        </>
      }
      footer={() => {
        return (
          <div className="flex justify-end">
            <Button
              key={"back"}
              type="default"
              onClick={handleOnCancel(onCancel)}
            >
              Cancel
            </Button>
            <Button
              key={"submit"}
              className="ml-2"
              type="primary"
              onClick={handleFileCreation}
              loading={loading}
            >
              Create
            </Button>
          </div>
        );
      }}
    >
      <Typography>File Name</Typography>
      <Input
        placeholder="Enter file name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <Typography className="mt-3 mb-1">File Type</Typography>
      <Radio.Group
        defaultValue={selectedFileType}
        buttonStyle="solid"
        value={selectedFileType}
      >
        {NEW_FILE_EXTENSIONS_SELECT_OPTIONS.map((option) => (
          <Radio.Button
            key={option.value}
            value={option.value}
            onClick={() => setSelectedFileType(option.value)}
          >
            <div className="flex items-center gap-1">
              {FILE_IMAGE_URLS?.[option.value] ? (
                <img src={FILE_IMAGE_URLS[option.value]} className="w-3 h-3" />
              ) : null}
              {option.label}
            </div>
          </Radio.Button>
        ))}
      </Radio.Group>

      {ENABLED_FOR_ORGANISATION && (
        <>
          <Typography className="mt-3">Share with organisation</Typography>
          <Switch
            id="shareWithOrganisation"
            className="bg-gray-300"
            checked={hideShareToggle || shareWithOrg}
            onChange={(res) => {
              setShareWithOrg(res);
            }}
            disabled={hideShareToggle}
          />
        </>
      )}
      <div className="mt-3">
        <Button
          onClick={() => {
            setOpenShare(true);
          }}
        >
          Share with People
        </Button>
        <Modal
          open={openShare}
          onCancel={() => {
            setOpenShare(false);
          }}
          title={`Share "${fileName}"`}
          footer={null}
          destroyOnClose
        >
          <NewUserPermission
            newFile={true}
            onBack={() => {
              setOpenShare(false);
            }}
            messageApi={messageApi}
            onSuccess={() => {
              setOpenShare(false);
            }}
            setUserList={setUserList}
            setPermission={setUserPermissionToGrant}
          />
        </Modal>
      </div>

      {ORG_FOLDER_ID && (
        <div className="text-slate-600 text-[12px] mt-2">
          <WarningOutlined /> Note: {UPLOAD_WARNING_MESSAGE}
        </div>
      )}
    </Modal>
  );
}

export default AddFileModal;
