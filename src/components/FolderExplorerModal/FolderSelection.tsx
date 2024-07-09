import React, { useEffect, useState } from "react";
import { IFolderSelectionProps } from "./types";
import { DIRECTORY_TYPE, GOOGLE_FILE_TYPES } from "@/constants/googledrive";
import {
  IDriveTreeNode,
  IFileMetaData,
  ISelectInfo,
  TreeDataType,
} from "@/types/drive";
import { Button, Tree } from "antd";
import {
  getMyDriveFiles,
  getSharedDriveFiles,
  getStarredFiles,
  getRecentViewedFiles,
  getFilesUsingParentId,
  getFileDetailsUsingId,
} from "@/utils/network/drive";
import { EventDataNode } from "antd/es/tree";
import { LOAD_MORE_KEY } from "@/constants/network";
import { ILoadMoreLoadingStateConfig } from "@/types/components";
import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store";
import { ENABLED_FOR_ORGANISATION } from "@/constants/general";
const DEFAULT_FOLDER_ICON_URL =
  "https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder";

function FolderSelection({ onFolderSelect }: IFolderSelectionProps) {
  const {
    rootFolderData: {
      id: orgFolderId,
      name: orgFolderName,
      iconLink: rootFolderIconLink,
    } = {},
  } = useUserStore();
  const [filesList, setFilesList] = React.useState<IDriveTreeNode[]>([
    {
      title: DIRECTORY_TYPE.ROOT,
      key: DIRECTORY_TYPE.ROOT,
      children: [],
    },
  ]);

  const [sharedWithMFilese, setSharedWithMeFiles] = useState<IDriveTreeNode[]>([
    {
      title: DIRECTORY_TYPE.SHARED,
      key: DIRECTORY_TYPE.SHARED,
    },
  ]);

  const [starredFiles, setStarredFiles] = useState<IDriveTreeNode[]>([
    {
      title: DIRECTORY_TYPE.STARRED,
      key: DIRECTORY_TYPE.STARRED,
    },
  ]);

  const [recentFiles, setRecentFiles] = useState<IDriveTreeNode[]>([
    {
      title: DIRECTORY_TYPE.RECENT,
      key: DIRECTORY_TYPE.RECENT,
    },
  ]);
  const [orgDrive, setOrgDrive] = useState<IDriveTreeNode[]>([
    {
      title: orgFolderName || "",
      key: orgFolderId || "",
      metaData: {
        iconLink: rootFolderIconLink,
      },
    },
  ]);

  const [loadMoreKeyData, setLoadMoreKeyData] =
    useState<ILoadMoreLoadingStateConfig>();

  useEffect(() => {
    const rootFolderId = import.meta.env.VITE_ROOT_ORG_FOLDER_ID;
    if (rootFolderId) {
      getFileDetailsUsingId(rootFolderId)
        .then((response: any) => {
          const folderName = response?.result?.name;
          if (folderName) {
            setOrgDrive([
              {
                title: folderName,
                key: rootFolderId,
                isLeaf: false,
                metaData: {
                  ...response.result,
                },
              },
            ]);
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  }, []);

  const getItemsWithMetaData = (config: {
    data: IFileMetaData[];
    rootType?: string;
    loadMoreToken?: string;
    parentId?: string;
  }) => {
    const { data, rootType, loadMoreToken, parentId } = config;
    const filesData: IDriveTreeNode[] = data.map((file) => {
      return {
        title: file.name,
        key: file.id,
        metaData: file,
        isLeaf: file.mimeType !== GOOGLE_FILE_TYPES.FOLDER,
        rootType,
      };
    });

    if (loadMoreToken) {
      const loadMoreParentId =
        parentId === "root" ? DIRECTORY_TYPE.ROOT : parentId;
      filesData.push({
        title: "Load More",
        key: loadMoreToken,
        isLeaf: true,
        rootType,
        metaData: {
          name: "Load More",
          id: loadMoreToken,
          mimeType: LOAD_MORE_KEY,
          parents: [loadMoreParentId || ""],
        },
      });
    }

    return filesData;
  };

  const getMyDriveData = async () => {
    const data: any = await getMyDriveFiles();
    const allFiles = data.result.files;
    const loadMoreToken = data.result?.nextPageToken;
    const modifiedData = getItemsWithMetaData({
      data: allFiles,
      rootType: DIRECTORY_TYPE.ROOT,
      loadMoreToken,
      parentId: DIRECTORY_TYPE.ROOT,
    });
    setFilesList([
      {
        title: DIRECTORY_TYPE.ROOT,
        key: DIRECTORY_TYPE.ROOT,
        children: modifiedData,
      },
    ]);
  };

  const getSharedDrive = async () => {
    const data = await getSharedDriveFiles();
    const allFiles = data.result.files;
    const loadMoreToken = data.result?.nextPageToken;
    const modifiedData = getItemsWithMetaData({
      data: allFiles,
      loadMoreToken,
      parentId: DIRECTORY_TYPE.SHARED,
    });
    setSharedWithMeFiles([
      {
        ...sharedWithMFilese[0],
        children: modifiedData,
      },
    ]);
  };

  const getStarredFilesData = async () => {
    const data = await getStarredFiles();
    const allFiles = data.result.files;
    const loadMoreToken = data.result?.nextPageToken;
    const modifiedData = getItemsWithMetaData({
      data: allFiles,
      loadMoreToken,
      parentId: DIRECTORY_TYPE.STARRED,
    });
    setStarredFiles([
      {
        ...starredFiles[0],
        children: modifiedData,
      },
    ]);
  };

  const getRecentViewedFilesData = async () => {
    const data = await getRecentViewedFiles();
    const allFiles = data.result.files;
    const loadMoreToken = data.result?.nextPageToken;
    const modifiedData = getItemsWithMetaData({
      data: allFiles,
      loadMoreToken,
      parentId: DIRECTORY_TYPE.RECENT,
    });
    setRecentFiles([
      {
        ...recentFiles[0],
        children: modifiedData,
      },
    ]);
  };

  const updateTreeData = (
    list: IDriveTreeNode[],
    key: React.Key,
    children: IDriveTreeNode[],
    apendDataToChildren?: boolean
  ): IDriveTreeNode[] => {
    return list.map((node) => {
      if (node.key === key) {
        if (apendDataToChildren) {
          const initialChildren = node.children || [];
          if (
            initialChildren[initialChildren.length - 1]?.metaData?.mimeType ===
            LOAD_MORE_KEY
          ) {
            initialChildren.pop();
          }
          const newChildren = initialChildren.concat(children);
          const updatedData = {
            ...node,
            children: [...newChildren],
          };
          return updatedData;
        }
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(
            node.children,
            key,
            children,
            apendDataToChildren
          ),
        };
      }
      return node;
    });
  };

  const handleLoadData =
    (driveType: string) => async (treeNode: EventDataNode<TreeDataType>) => {
      const { key, metaData: { id = "" } = {} } = treeNode || {};
      switch (key) {
        case DIRECTORY_TYPE.ROOT: {
          return await getMyDriveData();
        }
        case DIRECTORY_TYPE.SHARED: {
          return await getSharedDrive();
        }
        case DIRECTORY_TYPE.STARRED: {
          return await getStarredFilesData();
        }
        case DIRECTORY_TYPE.RECENT: {
          return await getRecentViewedFilesData();
        }
        default: {
          const modifiedData = await getDataUsingParentId(id);

          if (driveType === DIRECTORY_TYPE.SHARED) {
            const updatedData = updateTreeData(
              sharedWithMFilese,
              key,
              modifiedData
            );
            setSharedWithMeFiles([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.ROOT) {
            const updatedData = updateTreeData(filesList, key, modifiedData);
            setFilesList([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.ORGANISATION) {
            const updatedData = updateTreeData(orgDrive, key, modifiedData);
            setOrgDrive([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.RECENT) {
            const updatedData = updateTreeData(recentFiles, key, modifiedData);
            setRecentFiles([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.STARRED) {
            const updatedData = updateTreeData(starredFiles, key, modifiedData);
            setStarredFiles([...updatedData]);
          }
        }
      }
    };

  const getMoreChildrenResponse = async (parentId: string, token?: string) => {
    switch (parentId) {
      case DIRECTORY_TYPE.ROOT: {
        return await getFilesUsingParentId("root", token);
      }
      case DIRECTORY_TYPE.SHARED: {
        return await getSharedDriveFiles(token);
      }
      case DIRECTORY_TYPE.STARRED: {
        return await getStarredFiles(token);
      }
      case DIRECTORY_TYPE.RECENT: {
        return await getRecentViewedFiles(token);
      }
      default: {
        return await getFilesUsingParentId(parentId, token);
      }
    }
  };

  const getDataUsingParentId = async (
    parentId: string,
    loadMoreToken?: string
  ) => {
    const data = await getMoreChildrenResponse(parentId, loadMoreToken);
    const allFiles = data.result.files;
    const responseLoadMoreToken = data.result?.nextPageToken;
    return getItemsWithMetaData({
      data: allFiles,
      loadMoreToken: responseLoadMoreToken,
      parentId,
    });
  };

  const handleLoadMoreTreeData = async (
    treeNode: EventDataNode<TreeDataType>,
    driveType?: string
  ) => {
    const { key, metaData: { id = "", parents: [parentId = ""] = [] } = {} } =
      treeNode || {};
    setLoadMoreKeyData({
      id,
      isLoading: true,
    });
    try {
      const modifiedData = await getDataUsingParentId(parentId, id);

      if (driveType === DIRECTORY_TYPE.SHARED) {
        const updatedData = updateTreeData(
          sharedWithMFilese,
          parentId,
          modifiedData,
          true
        );
        setSharedWithMeFiles([...updatedData]);
      } else if (driveType === DIRECTORY_TYPE.ROOT) {
        const updatedData = updateTreeData(
          filesList,
          parentId,
          modifiedData,
          true
        );
        setFilesList([...updatedData]);
      } else if (driveType === DIRECTORY_TYPE.ORGANISATION) {
        const updatedData = updateTreeData(
          orgDrive,
          parentId,
          modifiedData,
          true
        );
        setOrgDrive([...updatedData]);
      } else if (driveType === DIRECTORY_TYPE.RECENT) {
        const updatedData = updateTreeData(
          recentFiles,
          parentId,
          modifiedData,
          true
        );
        setRecentFiles([...updatedData]);
      } else if (driveType === DIRECTORY_TYPE.STARRED) {
        const updatedData = updateTreeData(
          starredFiles,
          parentId,
          modifiedData,
          true
        );
        setStarredFiles([...updatedData]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadMoreKeyData(undefined);
    }
  };

  const onSelect =
    (_driveType: string) => (_keys: React.Key[], e: ISelectInfo) => {
      const { metaData } = e?.node || {};
      const { mimeType = "", id = "" } = metaData || {};
      if (mimeType === LOAD_MORE_KEY) {
        const isLoadMoreLoading =
          loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
        if (!isLoadMoreLoading) {
          handleLoadMoreTreeData(e.node, _driveType);
        }
      }
      return;
    };

  return (
    <div>
      {ENABLED_FOR_ORGANISATION && (
        <Tree
          treeData={orgDrive}
          // @ts-ignore
          loadData={handleLoadData(DIRECTORY_TYPE.ORGANISATION)}
          // @ts-ignore
          onSelect={onSelect(DIRECTORY_TYPE.ORGANISATION)}
          expandAction={"click"}
          titleRender={(treeNode) => {
            const {
              title,
              metaData: { mimeType, iconLink, id } = {},
              ...rest
            } = treeNode;
            const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
            const isLoadMoreLoading =
              loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
            return (
              <div className="flex items-start justify-between w-full">
                <span className="flex items-center gap-1">
                  {isLoadMoreButton ? (
                    <>
                      {isLoadMoreLoading ? (
                        <LoadingOutlined />
                      ) : (
                        <ReloadOutlined />
                      )}
                    </>
                  ) : (
                    <img
                      src={iconLink || DEFAULT_FOLDER_ICON_URL}
                      height={"12px"}
                      width={"12px"}
                    />
                  )}
                  {title}
                </span>
                {mimeType === "application/vnd.google-apps.folder" && (
                  <Button
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFolderSelect(
                        // @ts-ignore
                        treeNode?.metaData,
                        DIRECTORY_TYPE.ORGANISATION
                      );
                    }}
                    size="small"
                    disabled={!treeNode.metaData?.capabilities?.canEdit}
                  >
                    Select
                  </Button>
                )}
              </div>
            );
          }}
          height={500}
        />
      )}
      <Tree
        treeData={filesList}
        // @ts-ignore
        loadData={handleLoadData(DIRECTORY_TYPE.ROOT)}
        // @ts-ignore
        onSelect={onSelect(DIRECTORY_TYPE.ROOT)}
        expandAction={"click"}
        titleRender={(treeNode) => {
          const {
            title,
            metaData: { mimeType, iconLink, id } = {},
            key,
            ...rest
          } = treeNode;
          const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
          const isLoadMoreLoading =
            loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
          const isMyDrive = key === DIRECTORY_TYPE.ROOT;
          return (
            <div className="flex items-start justify-between w-full">
              <span className="flex items-center gap-1">
                {isLoadMoreButton ? (
                  <>
                    {isLoadMoreLoading ? (
                      <LoadingOutlined />
                    ) : (
                      <ReloadOutlined />
                    )}
                  </>
                ) : (
                  <img
                    src={iconLink || DEFAULT_FOLDER_ICON_URL}
                    height={"12px"}
                    width={"12px"}
                  />
                )}
                {title}
              </span>
              {(mimeType === "application/vnd.google-apps.folder" ||
                key === DIRECTORY_TYPE.ROOT) && (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    // @ts-ignore
                    onFolderSelect(
                      treeNode?.metaData ||
                        ({
                          name: title,
                          iconLink: DEFAULT_FOLDER_ICON_URL,
                          id: isMyDrive ? "root" : id,
                        } as any),
                      DIRECTORY_TYPE.ROOT
                    );
                  }}
                  size="small"
                  disabled={
                    !treeNode.metaData?.capabilities?.canEdit && !isMyDrive
                  }
                >
                  Select
                </Button>
              )}
            </div>
          );
        }}
        height={500}
      />
      <Tree
        treeData={sharedWithMFilese}
        // @ts-ignore
        loadData={handleLoadData(DIRECTORY_TYPE.SHARED)}
        // @ts-ignore
        onSelect={onSelect(DIRECTORY_TYPE.SHARED)}
        expandAction={"click"}
        titleRender={(treeNode) => {
          const {
            title,
            metaData: { mimeType, iconLink, id } = {},
            ...rest
          } = treeNode;
          const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
          const isLoadMoreLoading =
            loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
          return (
            <div className="flex items-start justify-between w-full">
              <span className="flex items-center gap-1">
                {isLoadMoreButton ? (
                  <>
                    {isLoadMoreLoading ? (
                      <LoadingOutlined />
                    ) : (
                      <ReloadOutlined />
                    )}
                  </>
                ) : (
                  <img
                    src={iconLink || DEFAULT_FOLDER_ICON_URL}
                    height={"12px"}
                    width={"12px"}
                  />
                )}
                {title}
              </span>
              {mimeType === "application/vnd.google-apps.folder" && (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    // @ts-ignore
                    onFolderSelect(treeNode?.metaData, DIRECTORY_TYPE.SHARED);
                  }}
                  size="small"
                  disabled={!treeNode.metaData?.capabilities?.canEdit}
                >
                  Select
                </Button>
              )}
            </div>
          );
        }}
        height={500}
      />
      <Tree
        treeData={recentFiles}
        // @ts-ignore
        loadData={handleLoadData(DIRECTORY_TYPE.RECENT)}
        // @ts-ignore
        onSelect={onSelect(DIRECTORY_TYPE.RECENT)}
        expandAction={"click"}
        titleRender={(treeNode) => {
          const {
            title,
            metaData: { mimeType, iconLink, id } = {},
            ...rest
          } = treeNode;
          const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
          const isLoadMoreLoading =
            loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
          return (
            <div className="flex items-start justify-between w-full">
              <span className="flex items-center gap-1">
                {isLoadMoreButton ? (
                  <>
                    {isLoadMoreLoading ? (
                      <LoadingOutlined />
                    ) : (
                      <ReloadOutlined />
                    )}
                  </>
                ) : (
                  <img
                    src={iconLink || DEFAULT_FOLDER_ICON_URL}
                    height={"12px"}
                    width={"12px"}
                  />
                )}
                {title}
              </span>
              {mimeType === "application/vnd.google-apps.folder" && (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    // @ts-ignore
                    onFolderSelect(treeNode?.metaData, DIRECTORY_TYPE.RECENT);
                  }}
                  size="small"
                  disabled={!treeNode.metaData?.capabilities?.canEdit}
                >
                  Select
                </Button>
              )}
            </div>
          );
        }}
        height={500}
      />
      <Tree
        treeData={starredFiles}
        // @ts-ignore
        loadData={handleLoadData(DIRECTORY_TYPE.STARRED)}
        // @ts-ignore
        onSelect={onSelect(DIRECTORY_TYPE.STARRED)}
        expandAction={"click"}
        titleRender={(treeNode) => {
          const {
            title,
            metaData: { mimeType, iconLink, id } = {},
            ...rest
          } = treeNode;
          const isLoadMoreButton = mimeType === LOAD_MORE_KEY;
          const isLoadMoreLoading =
            loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
          return (
            <div className="flex items-start justify-between w-full">
              <span className="flex items-center gap-1">
                {isLoadMoreButton ? (
                  <>
                    {isLoadMoreLoading ? (
                      <LoadingOutlined />
                    ) : (
                      <ReloadOutlined />
                    )}
                  </>
                ) : (
                  <img
                    src={iconLink || DEFAULT_FOLDER_ICON_URL}
                    height={"12px"}
                    width={"12px"}
                  />
                )}
                {title}
              </span>
              {mimeType === "application/vnd.google-apps.folder" && (
                <Button
                  type="link"
                  onClick={(e) => {
                    e.stopPropagation();
                    // @ts-ignore
                    onFolderSelect(treeNode?.metaData, DIRECTORY_TYPE.STARRED);
                  }}
                  size="small"
                  disabled={!treeNode.metaData?.capabilities?.canEdit}
                >
                  Select
                </Button>
              )}
            </div>
          );
        }}
        height={500}
      />
    </div>
  );
}

export default FolderSelection;
