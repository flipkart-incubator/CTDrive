import { useState } from "react";
import {
  message,
  Typography,
  Popover,
  Tooltip,
  Popconfirm,
  Input,
  Button,
} from "antd";
import {
  DIRECTORY_TYPE,
  FILE_IMAGE_URLS,
  GOOGLE_FILE_TYPES,
} from "@/constants/googledrive";
import { useUserStore } from "@/store";
import { IDriveTreeNode, IFileMetaData } from "@/types/drive";
import {
  CopyOutlined,
  EditOutlined,
  ReloadOutlined,
  MoreOutlined,
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  FolderOpenFilled,
  LoadingOutlined,
  FolderOpenOutlined,
  CaretRightOutlined,
  FileAddOutlined,
  CloseCircleOutlined,
  StarOutlined,
  StarFilled,
  GoogleCircleFilled,
  ScissorOutlined,
  RiseOutlined,
  UploadOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { MessageInstance } from "antd/es/message/interface";
import {
  LOAD_MORE_KEY,
  PAGE_ROUTES,
  TITLE_NODE_KEY_PREFIX,
} from "@/constants/network";
import { ILoadMoreLoadingStateConfig } from "@/types/components";

const DEFAULT_FOLDER_ICON_URL =
  "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder";

interface ITitleNodeProps {
  node: IDriveTreeNode;
  driveType: string;
  messageApi: MessageInstance;
  handleDataRefresh: (key: string, driveType: string) => void;
  setSelecteditemId: (data: {
    key: string;
    driveType: string;
    fileType: string;
    fileName?: string;
  }) => void;
  sidebarWidth: number;
  handleFileDelete: (node: IDriveTreeNode, driveType: string) => void;
  handleFileDeletePermanent: (node: IDriveTreeNode, driveType: string) => void;
  handleFileRestore: (node: IDriveTreeNode, driveType: string) => void;
  loadMoreKeyData?: ILoadMoreLoadingStateConfig;
  setFileToMoveData?: (data?: {
    data: IDriveTreeNode;
    driveType: string;
  }) => void;
  handleFileRename: (
    node: IDriveTreeNode,
    newName: string,
    driveType: string
  ) => void;
  starFolder: (
    node: IDriveTreeNode,
    folderId: string,
    starredValue: boolean,
    driveType: string
  ) => void;
  setAddFileSelecteditemId: (data: {
    key: string;
    driveType: string;
    fileData?: Partial<IFileMetaData>;
  }) => void;
}
const TitleNode = ({
  node,
  driveType,
  messageApi,
  setSelecteditemId,
  handleDataRefresh,
  sidebarWidth,
  handleFileDelete,
  handleFileDeletePermanent,
  handleFileRestore,
  loadMoreKeyData,
  setFileToMoveData,
  handleFileRename,
  starFolder,
  setAddFileSelecteditemId,
}: ITitleNodeProps) => {
  const [hovered, setHovered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [newName, setNewName] = useState(node.title);
  const [showTrashOptions, setShowTrashOptions] = useState(false);

  const {
    userDetails: { userDetails: { userEmail } = {} },
  } = useUserStore();

  const { metaData: { capabilities, starred, id = "" } = {}, key } = node;

  const {
    owners = [],
    name,
    modifiedTime,
    mimeType,
    parents,
  } = node?.metaData || {};

  const isOwner = !!owners?.find((owner) => owner.emailAddress === userEmail);

  const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
  const isLoadMoreLoading =
    loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;

  const canCreateFiles =
    capabilities?.canAddChildren ||
    capabilities?.canEdit ||
    key === DIRECTORY_TYPE.ROOT;

  const canMoveFile = capabilities?.canEdit && capabilities.canShare;

  const canRename = capabilities?.canRename;

  const renameDriveType =
    driveType === DIRECTORY_TYPE.ROOT ||
    driveType === DIRECTORY_TYPE.ORGANISATION;

  const isOnlyFolder = mimeType === GOOGLE_FILE_TYPES.FOLDER;

  const isStarred = starred;

  const isFolder =
    mimeType === GOOGLE_FILE_TYPES.FOLDER ||
    key === DIRECTORY_TYPE.ROOT ||
    key === DIRECTORY_TYPE.ORGANISATION;

  const canFileReload =
    mimeType === GOOGLE_FILE_TYPES.FOLDER ||
    [
      DIRECTORY_TYPE.ROOT,
      DIRECTORY_TYPE.SHARED,
      DIRECTORY_TYPE.ORGANISATION,
      DIRECTORY_TYPE.RECENT,
      DIRECTORY_TYPE.STARRED,
    ].includes(key as DIRECTORY_TYPE);

  const newOptions = (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      <span
        className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
        onClick={(_e) => {
          setSelecteditemId({
            key: node.key as string,
            driveType,
            fileType: GOOGLE_FILE_TYPES.FOLDER,
          });
        }}
      >
        <img
          src={FILE_IMAGE_URLS[GOOGLE_FILE_TYPES.FOLDER]}
          className="w-3 h-3 mr-1"
        />
        Create Folder
      </span>
      <span
        className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
        onClick={(_e) => {
          setSelecteditemId({
            key: node.key as string,
            driveType,
            fileType: GOOGLE_FILE_TYPES.DOCUMENT,
          });
        }}
      >
        <img
          src={FILE_IMAGE_URLS[GOOGLE_FILE_TYPES.DOCUMENT]}
          className="w-3 h-3 mr-1"
        />
        Create Document
      </span>
      <span
        className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
        onClick={(_e) => {
          setSelecteditemId({
            key: node.key as string,
            driveType,
            fileType: GOOGLE_FILE_TYPES.SHEET,
          });
        }}
      >
        <img
          src={FILE_IMAGE_URLS[GOOGLE_FILE_TYPES.SHEET]}
          className="w-3 h-3 mr-1"
        />
        Create SpreadSheet
      </span>

      <span
        className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
        onClick={(_e) => {
          setSelecteditemId({
            key: node.key as string,
            driveType,
            fileType: GOOGLE_FILE_TYPES.PRESENTATION,
          });
        }}
      >
        <img
          src={FILE_IMAGE_URLS[GOOGLE_FILE_TYPES.PRESENTATION]}
          className="w-3 h-3 mr-1"
        />
        Create Presentation
      </span>
    </div>
  );

  const trashOptionsNode = (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      {(canFileReload || key === DIRECTORY_TYPE.TRASHED) && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={async (e) => {
            e.stopPropagation();
            await handleDataRefresh(
              key === DIRECTORY_TYPE.TRASHED ? "root" : (node.key as string),
              DIRECTORY_TYPE.TRASHED
            );
            message.open({
              type: "success",
              content: "Data Refreshed",
            });
          }}
        >
          <ReloadOutlined className="mr-1" /> Reload
        </span>
      )}
      {(id || parents?.[0]) && import.meta.env.VITE_APP_NAME && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            const parentId = parents?.[0];
            let redirectURL = "";

            if (isFolder) {
              redirectURL = `${PAGE_ROUTES.FOLDER}/${id}`;
            } else {
              if (parentId) {
                redirectURL = `${PAGE_ROUTES.FOLDER}/${parentId}?fileId=${id}&parentId=${parentId}`;
              } else {
                redirectURL = `${PAGE_ROUTES.HOME}?fileId=${id}`;
              }
            }
            navigator.clipboard.writeText(window.location.origin + redirectURL);
            messageApi.open({
              type: "success",
              content: "Copied",
            });
          }}
        >
          <CopyOutlined className="mr-1" /> Copy {import.meta.env.VITE_APP_NAME}{" "}
          Link
        </span>
      )}
      {node?.metaData?.webViewLink && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            if (node?.metaData?.webViewLink) {
              navigator.clipboard.writeText(node.metaData.webViewLink);
              messageApi.open({
                type: "success",
                content: "Copied",
              });
            }
          }}
        >
          <GoogleCircleFilled className="mr-1" /> Copy Google Drive Link
        </span>
      )}
      {isOwner && DIRECTORY_TYPE.TRASHED && (
        <>
          <Popconfirm
            title="Restore"
            description={
              <>
                Are you sure you want to restore <b>{node.title}</b> ?
              </>
            }
            onConfirm={() => {
              handleFileRestore(node, driveType);
            }}
            icon={<FieldTimeOutlined style={{ color: "blue" }} />}
          >
            <Button
              type="text"
              icon={<FieldTimeOutlined style={{ fontSize: "16px" }} />}
              className="text-start px-2"
            >
              Restore
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Delete"
            description={
              <>
                Do you want to delete <b>{node.title}</b> permanently?
              </>
            }
            onConfirm={() => {
              handleFileDeletePermanent(node, driveType);
            }}
            icon={<DeleteOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              type="text"
              icon={<DeleteOutlined />}
              className="text-start px-2"
            >
              Delete permanently
            </Button>
          </Popconfirm>
        </>
      )}
    </div>
  );
  const optionsNode = (
    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
      {node?.metaData?.webViewLink && (
        <>
          {isFolder && (
            <>
              <span
                className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  const redirectUrl = `${window.location.origin}${PAGE_ROUTES.FOLDER}/${node.key}`;
                  window.open(redirectUrl);
                }}
              >
                <FolderOpenFilled className="mr-1" /> Open folder in new tab
              </span>
            </>
          )}
          {(id || parents?.[0]) && (
            <span
              className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                const parentId = parents?.[0];
                let redirectURL = "";

                if (isFolder) {
                  redirectURL = `${PAGE_ROUTES.FOLDER}/${id}`;
                } else {
                  if (parentId) {
                    redirectURL = `${PAGE_ROUTES.FOLDER}/${parentId}?fileId=${id}&parentId=${parentId}`;
                  } else {
                    redirectURL = `${PAGE_ROUTES.HOME}?fileId=${id}`;
                  }
                }
                navigator.clipboard.writeText(
                  window.location.origin + redirectURL
                );
                messageApi.open({
                  type: "success",
                  content: "Copied",
                });
              }}
            >
              <CopyOutlined className="mr-1" /> Copy CT Drive Link
            </span>
          )}
        </>
      )}
      {isFolder && canCreateFiles && (
        <>
          <span
            className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setAddFileSelecteditemId({
                key: node.key as string,
                driveType,
                fileData: node.metaData,
              });
            }}
          >
            <UploadOutlined className="mr-1" /> Upload files via link
          </span>
          <span
            className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              setSelecteditemId({
                key: node.key as string,
                driveType,
                fileType: GOOGLE_FILE_TYPES.DOCUMENT,
              });
            }}
          >
            <EditOutlined className="mr-1" /> Create File / Folder
          </span>
          <Popover
            placement="right"
            arrow={false}
            rootClassName="!pl-4"
            content={newOptions}
          >
            <span className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg w-[90%] flex justify-between pr-2">
              <span>
                <FileAddOutlined className="mr-1" /> New
              </span>
              <CaretRightOutlined className="ml-auto" />
            </span>
          </Popover>
        </>
      )}

      {canRename && renameDriveType && (
        <Popconfirm
          title="Rename"
          description={
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              suffix={
                <CloseCircleOutlined
                  onClick={() => {
                    setNewName("");
                  }}
                  style={{ color: "rgba(0, 0, 0, 0.25)", cursor: "pointer" }}
                />
              }
            />
          }
          onConfirm={() => {
            handleFileRename(node, newName, driveType);
          }}
          icon={<EditOutlined style={{ color: "#000" }} />}
        >
          <span className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg">
            <EditOutlined /> Rename
          </span>
        </Popconfirm>
      )}

      {canFileReload && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={async (e) => {
            e.stopPropagation();
            await handleDataRefresh(node.key as string, driveType);
            message.open({
              type: "success",
              content: "Data Refreshed",
            });
          }}
        >
          <ReloadOutlined className="mr-1" /> Reload
        </span>
      )}

      {canMoveFile && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={async (e) => {
            e.stopPropagation();
            setFileToMoveData?.({ data: node, driveType });
          }}
        >
          <FolderOpenOutlined className="mr-1" /> Move
        </span>
      )}

      {node?.metaData?.webViewLink && (
        <span
          className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            if (node?.metaData?.webViewLink) {
              navigator.clipboard.writeText(node.metaData.webViewLink);
              messageApi.open({
                type: "success",
                content: "Copied",
              });
            }
          }}
        >
          <GoogleCircleFilled className="mr-1" /> Copy Google Drive Link
        </span>
      )}
      {isOwner && (
        <Popconfirm
          title="Move to trash"
          description={
            <>
              Are you sure you want to move <b>{node.title}</b> to trash?
            </>
          }
          onConfirm={() => {
            handleFileDelete(node, driveType);
          }}
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
        >
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            className="text-start px-2"
          >
            Move to trash
          </Button>
        </Popconfirm>
      )}
    </div>
  );

  const titleNode = (
    <div
      className="flex h-full align-middle items-center w-full min-w-full justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={`${TITLE_NODE_KEY_PREFIX}${id}`}
    >
      <div className="flex items-center align-middle h-full w-full">
        {isLoadMoreButton ? (
          <>{isLoadMoreLoading ? <LoadingOutlined /> : <ReloadOutlined />}</>
        ) : (
          <img
            src={node?.metaData?.iconLink || DEFAULT_FOLDER_ICON_URL}
            height={"12px"}
            width={"12px"}
          />
        )}

        <Typography.Text
          style={{
            width: `${sidebarWidth * 0.6}px`,
          }}
          ellipsis
          className="ml-2 text-gray-700"
        >
          {node.title}
        </Typography.Text>
      </div>

      {hovered && !isLoadMoreButton && (
        <span className="flex items-center">
          {isFolder && canCreateFiles && (
            <Tooltip
              title={"Add file / Folder"}
              showArrow={false}
              placement="topRight"
            >
              <div
                className="cursor-pointer px-[2px] hover:bg-slate-200 rounded-md py-[0px] ml-[2px]  h-[20px] flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelecteditemId({
                    key: node.key as string,
                    driveType,
                    fileName: "",
                    fileType: GOOGLE_FILE_TYPES.DOCUMENT,
                  });
                }}
              >
                <PlusOutlined className="text-gray-600 text-xs" />
              </div>
            </Tooltip>
          )}
          <Tooltip
            title={"More Options"}
            showArrow={false}
            placement="topRight"
          >
            <div
              className="cursor-pointer px-[2px] hover:bg-slate-200 rounded-md py-[0px] h-[20px] flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (driveType === DIRECTORY_TYPE.TRASHED) {
                  setShowTrashOptions(true);
                } else {
                  setShowOptions(true);
                }
              }}
            >
              <MoreOutlined style={{ fontSize: "12px" }} />
            </div>
          </Tooltip>
        </span>
      )}
    </div>
  );

  const metaNode = (
    <div className="w-[280px] flex flex-col">
      <span className="text-base text-gray-700 font-medium flex justify-between">
        <span className="flex items-center">
          {name || node?.title || (key as string)}
          {driveType !== DIRECTORY_TYPE.TRASHED && (
            <>
              <span
                className="cursor-pointer hover:bg-slate-100 py-1 px-2 rounded-lg ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  starFolder(node, node.key as string, !isStarred, driveType);
                }}
              >
                {isStarred ? <StarFilled /> : <StarOutlined />}
              </span>
            </>
          )}
          {isLoadMoreButton && "(Click to load more files)"}
        </span>
        {!isLoadMoreButton && (
          <Popover
            content={
              driveType === DIRECTORY_TYPE.TRASHED
                ? trashOptionsNode
                : optionsNode
            }
          >
            <MoreOutlined
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Popover>
        )}
      </span>
      {owners?.map((owner) => (
        <div className="flex items-center mt-2 text-xs" key={owner.displayName}>
          <img
            src={owner?.photoLink}
            referrerPolicy="no-referrer"
            width={20}
            height={20}
            className="border-solid border-slate-200 rounded-[50%] border"
          />
          <span className="ml-1">
            <span className="text-gray-600">Owned by</span> {owner.displayName}
          </span>
        </div>
      ))}
      {modifiedTime && (
        <span className="text-xs text-gray-600 mt-2">
          Last modified: {new Date(modifiedTime).toLocaleString()}
        </span>
      )}

      <div className="flex pt-2 gap-2 items-center">
        {driveType != DIRECTORY_TYPE.TRASHED && (
          <>
            {isFolder && canCreateFiles && (
              <Tooltip title={"Add file / Folder"}>
                <span
                  className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelecteditemId({
                      key: node.key as string,
                      driveType,
                      fileType: GOOGLE_FILE_TYPES.DOCUMENT,
                    });
                  }}
                >
                  <PlusOutlined />
                </span>
              </Tooltip>
            )}
            {isFolder && (
              <>
                <Tooltip title={"Open folder in new tab"}>
                  <span
                    className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      const redirectUrl = `${window.location.origin}${PAGE_ROUTES.FOLDER}/${node.key}`;
                      window.open(redirectUrl);
                    }}
                  >
                    <RiseOutlined />
                  </span>
                </Tooltip>
                <Tooltip title={"Reload"}>
                  <span
                    className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleDataRefresh(node.key as string, driveType);
                      message.open({
                        type: "success",
                        content: "Data Refreshed",
                      });
                    }}
                  >
                    <ReloadOutlined />
                  </span>
                </Tooltip>
                <Tooltip title={"Add files via link / id"}>
                  <span
                    className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAddFileSelecteditemId({
                        key: node.key as string,
                        driveType,
                        fileData: node.metaData,
                      });
                    }}
                  >
                    <UploadOutlined />
                  </span>
                </Tooltip>
              </>
            )}
            {canMoveFile && (
              <Tooltip title={"Move"}>
                <span
                  className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
                  onClick={async (e) => {
                    e.stopPropagation();
                    setFileToMoveData?.({ data: node, driveType });
                  }}
                >
                  <ScissorOutlined />
                </span>
              </Tooltip>
            )}
          </>
        )}
        {(id || parents?.[0]) && (
          <Tooltip title={"Copy CT Drive link"}>
            <span
              className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                const parentId = parents?.[0];
                let redirectURL = "";

                if (isFolder) {
                  redirectURL = `${PAGE_ROUTES.FOLDER}/${id}`;
                } else {
                  if (parentId) {
                    redirectURL = `${PAGE_ROUTES.FOLDER}/${parentId}?fileId=${id}&parentId=${parentId}`;
                  } else {
                    redirectURL = `${PAGE_ROUTES.HOME}?fileId=${id}`;
                  }
                }
                navigator.clipboard.writeText(
                  window.location.origin + redirectURL
                );
                messageApi.open({
                  type: "success",
                  content: "Copied",
                });
              }}
            >
              <CopyOutlined />
            </span>
          </Tooltip>
        )}
        {node?.metaData?.webViewLink && (
          <Tooltip title={"Copy Google Drive link"}>
            <span
              className="cursor-pointer hover:bg-slate-200 rounded-md p-1 h-[20px] flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (node?.metaData?.webViewLink) {
                  navigator.clipboard.writeText(node.metaData.webViewLink);
                  messageApi.open({
                    type: "success",
                    content: "Copied",
                  });
                }
              }}
            >
              <GoogleCircleFilled />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );

  return (
    <Popover
      placement="right"
      arrow={false}
      destroyTooltipOnHide
      onOpenChange={(isVisible) => {
        if (!isVisible) {
          setShowOptions(false);
          setShowTrashOptions(false);
        }
      }}
      content={
        showOptions
          ? optionsNode
          : showTrashOptions
          ? trashOptionsNode
          : metaNode
      }
      rootClassName="!pl-2"
    >
      {titleNode}
    </Popover>
  );
};

export default TitleNode;
