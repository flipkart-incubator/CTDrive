import { useEffect, useState } from "react";
import { useUserStore } from "@/store";
import {
  CopyOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import { Popover, Tag, Tooltip } from "antd";
import { PAGE_ROUTES } from "@/constants/network";
import GlobalFileCreationModal from "./GlobalFileCreation";
import MoveFileModal from "./MoveFileModal";
import {
  getFileDetailsUsingId,
  scrollTitleNodeIntoView,
  toogleFileAsStarred,
} from "@/utils/network/drive";

import ShareIcon from "../assets/icons/share";
import MoveIcon from "../assets/icons/move";
import { getCTDriveRedirectUrl } from "@/utils/url";

const SelectedFilesInfoSection = ({
  setShowShare,
  messageApi,
}: {
  setShowShare: (value: boolean) => void;
  messageApi: any;
}) => {
  const [showMoveFileModal, setShowFileModal] = useState(false);
  const {
    driveData: { iframeNodeData, iframeNodeDriveType } = {},
    setCurrentFilePath,
    selectedFilePath = [],
    fetchAndUpdateFavoriateData,
  } = useUserStore();
  const isStarred = iframeNodeData?.starred;
  const [starred, setStarred] = useState(!!isStarred);

  const { webViewLink, id, parents } = iframeNodeData || {};
  const canShare = iframeNodeData?.capabilities?.canShare;

  useEffect(() => {
    (async () => {
      if (id) {
        setCurrentFilePath(id);
      }
    })();
  }, [id]);

  const handleStarFolder = async (folderId: string, starred: boolean) => {
    await toogleFileAsStarred(folderId, starred);

    fetchAndUpdateFavoriateData();
    const data = id ? await getFileDetailsUsingId(id) : "";
    setStarred(data?.result?.starred);
    messageApi.success({
      content: starred
        ? "Added to favourite successfully"
        : "Removed from favourite",
    });
  };

  const handleOpenInNewTab =
    (operationType: "copy" | "navigate" = "navigate") =>
    () => {
      if (!id) return;
      const parentId = parents?.[0];
      const redirectURL = getCTDriveRedirectUrl({ parentId, fileId: id });

      if (operationType === "navigate") {
        window.open(redirectURL, "_blank");
      } else {
        const urlToCopy = window.location.origin + redirectURL;
        navigator.clipboard.writeText(urlToCopy);
        messageApi.open({
          content: "URL Copied!",
          type: "success",
        });
      }
    };

  const getFileToMoveData = () => {
    if (showMoveFileModal) {
      return {
        driveType: iframeNodeDriveType || "",
        data: {
          metaData: iframeNodeData,
          title: iframeNodeData?.name || "",
          key: iframeNodeData?.id || "",
        },
      };
    }
    return undefined;
  };

  const handleMoveModalClose = () => {
    setShowFileModal(false);
    id && setCurrentFilePath(id);
  };

  return (
    <>
      <div className="flex items-center justify- flex-1 gap-5">
        <GlobalFileCreationModal />
        <div className="flex items-center gap-2 min-w-[342px]">
          {webViewLink && (
            <div className="flex items-center gap-2">
              <div className="flex-1 max-w-[200px] cursor-pointer">
                {selectedFilePath.length > 0 && (
                  <Popover
                    prefixCls="file-path"
                    title={
                      <div>
                        {selectedFilePath.map((file, index) => (
                          <span key={file.id}>
                            <Tag className="mr-2">
                              <span
                                className="hover:text-blue-400 cursor-pointer"
                                onClick={() => {
                                  scrollTitleNodeIntoView(
                                    file.id,
                                    file.mimeType
                                  );
                                }}
                              >
                                {file.name}
                              </span>
                            </Tag>
                            <span className="mr-2">
                              {index < selectedFilePath.length - 1 && ">"}
                            </span>
                          </span>
                        ))}
                      </div>
                    }
                    placement="top"
                    className="w-full max-w-full"
                    trigger={"hover"}
                  >
                    <div className="flex items-center bg-slate-100 p-2 pr-2 rounded-lg text-xs">
                      <div className="max-w-[100%] text-ellipsis overflow-hidden whitespace-nowrap mr-[2px]">
                        {selectedFilePath.map((file) => file.name).join(" > ")}
                      </div>
                      <InfoCircleOutlined className="ml-auto" />
                    </div>
                  </Popover>
                )}
              </div>
              <div
                className="cursor-pointer hover:bg-slate-100 rounded-lg text-xs p-2 hover:text-black text-black"
                onClick={handleOpenInNewTab("navigate")}
              >
                <Tooltip title="Open in New Tab">
                  <RiseOutlined
                    style={{
                      fontSize: "16px",
                    }}
                  />
                </Tooltip>
              </div>

              <div
                className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg text-xs"
                onClick={handleOpenInNewTab("copy")}
              >
                <Tooltip title="Copy URL">
                  <CopyOutlined
                    style={{
                      fontSize: "16px",
                    }}
                  />
                </Tooltip>
              </div>
              <div
                className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg text-xs"
                onClick={() => {
                  if (canShare) setShowShare(true);
                }}
              >
                <Tooltip
                  title={!canShare ? "You don't have access to share" : "Share"}
                >
                  <ShareIcon fill={!canShare ? "#d9d9d9" : ""} />
                </Tooltip>
              </div>

              <div
                className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg text-xs"
                onClick={() => setShowFileModal(true)}
              >
                <Tooltip title="Move">
                  <MoveIcon />
                </Tooltip>
              </div>
              {id && (
                <div
                  className="cursor-pointer hover:bg-slate-100 p-2 rounded-lg text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarFolder(id, !starred);
                  }}
                >
                  <Tooltip title="Favourite">
                    {starred === true ? (
                      <StarFilled style={{ fontSize: "16px" }} />
                    ) : (
                      <StarOutlined style={{ fontSize: "16px" }} />
                    )}
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <MoveFileModal
        fileToMoveData={getFileToMoveData()}
        onClose={handleMoveModalClose}
        messageApi={messageApi}
      />
    </>
  );
};

export default SelectedFilesInfoSection;
