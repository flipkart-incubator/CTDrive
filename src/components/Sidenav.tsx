import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "@/store";
import { Dropdown, Menu, Select, Tooltip, Tree, message } from "antd";
import { EventDataNode } from "antd/es/tree";
import {
  ArrowUpOutlined,
  CheckOutlined,
  LeftOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import AddFileModal from "./AddFileModal";
import {
  IDriveTreeNode,
  IFileMetaData,
  ISelectInfo,
  TreeDataType,
} from "@/types/drive";
import {
  deleteDriveFile,
  deleteDriveFilePermanent,
  getFileDetailsUsingId,
  getFilesUsingParentId,
  getMyDriveFiles,
  getRecentViewedFiles,
  getSharedDriveFiles,
  getStarredFiles,
  getTrashedFiles,
  renameDriveFile,
  restoreDriveFile,
  scrollTitleNodeIntoView,
  toogleFileAsStarred,
} from "@/utils/network/drive";
import { DIRECTORY_TYPE, GOOGLE_FILE_TYPES } from "@/constants/googledrive";
import TitleNode from "./TitleNode";
import {
  LOAD_MORE_KEY,
  LOAD_MORE_TITLE,
  MY_DRIVE_PATH,
} from "@/constants/network";
import {
  IFilterByState,
  ILoadMoreLoadingStateConfig,
} from "@/types/components";
import MoveFileModal from "./MoveFileModal";
import { getDeepCopy } from "@/utils/general";
import AddFilesViaLinkModal from "./AddFileModalViaLink";
import {
  FILTER_NAME,
  FILTER_QUERY,
  FOLDER_FILTER,
  ORDERBY,
} from "@/constants/general";

const DEFAULT_SIDENAV_WIDTH = 300;

interface ISideNavProps {
  rootFolderId?: string;
  showMyDrive?: boolean;
}

function Sidenav({ rootFolderId, showMyDrive }: ISideNavProps) {
  const {
    setIframeData,
    setIframePointerEvents,
    resetIframeData,
    driveData,
    fetchAndUpdateFavoriateData,
    selectedFilePath,
  } = useUserStore();
  const { iframeNodeData: { id: iframeFileId = "" } = {} } = driveData || {};
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  const fileId = urlParams.get("fileId");
  const currentUrl = window.location.href;
  const hasMyDrive = currentUrl.includes(MY_DRIVE_PATH);
  const selectedFileScrollRef = useRef(fileId ? false : true);
  const [initialScroll, setIntialScroll] = useState(true);
  const [filterObject, setFilterObject] = useState({
    orderBy: false,
    filterBy: FILTER_NAME.LAST_MODIFIED,
    folderFilter: FOLDER_FILTER.ON_TOP,
  });
  const [filterQueries, setFilterQueries] = useState<IFilterByState>({
    orderBy: "folder,modifiedTime desc",
  });
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
  const [trashed, setTrashed] = useState<IDriveTreeNode[]>([
    {
      title: DIRECTORY_TYPE.TRASHED,
      key: DIRECTORY_TYPE.TRASHED,
    },
  ]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDENAV_WIDTH);
  const [defaultExpandedKeys, setDefaultExpandedKeys] = useState<string[]>([]);
  const [driveExpandedKeys, setDriveExpandedKeys] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [ctDrive, setSpaceDrive] = useState<IDriveTreeNode[]>([]);
  const [messageApi, toastContextHolder] = message.useMessage();
  const [selectedItemId, setSelecteditemId] = useState({
    key: "",
    driveType: "",
    fileType: "",
  });

  const [addFileSelectedItemId, setAddFileSelecteditemId] = useState<{
    key: string;
    driveType: string;
    fileData?: Partial<IFileMetaData>;
  }>({
    key: "",
    driveType: "",
  });

  const [loadMoreKeyData, setLoadMoreKeyData] =
    useState<ILoadMoreLoadingStateConfig>();

  const [fileToMoveData, setFileToMoveData] = useState<{
    data: IDriveTreeNode;
    driveType: string;
  }>();

  const startResizing: React.MouseEventHandler<HTMLDivElement> =
    React.useCallback((__mouseDownEvent) => {
      setIsResizing(true);
      setIframePointerEvents(false);
    }, []);

  const stopResizing: React.MouseEventHandler<HTMLDivElement> =
    React.useCallback(() => {
      setIsResizing(false);
      setIframePointerEvents(true);
    }, []);

  const resize = React.useCallback<(mouseEvent: MouseEvent) => void>(
    (mouseMoveEvent) => {
      if (isResizing) {
        setSidebarWidth(
          mouseMoveEvent.clientX -
            (sidebarRef.current?.getBoundingClientRect().left || 0)
        );
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    // @ts-ignore
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      // @ts-ignore
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

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
    const data: any = await getMyDriveFiles(filterQueries);
    const allFiles = data.result.files;
    const rootFolderId = data.result?.files?.[0]?.parents[0];
    if (rootFolderId) {
      setDriveExpandedKeys((prev) => {
        const rootIndex = prev.findIndex(
          (item) => item === DIRECTORY_TYPE.ROOT
        );
        if (rootIndex > -1) {
          prev[rootIndex] = rootFolderId;
        }
        return prev;
      });
    }

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
        key: rootFolderId || DIRECTORY_TYPE.ROOT,
        children: modifiedData,
        metaData: {
          mimeType: GOOGLE_FILE_TYPES.FOLDER,
          capabilities: {
            canEdit: true,
          },
        },
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

  const getTrashedFilesData = async () => {
    const data = await getTrashedFiles();
    const allFiles = data.result.files;
    const loadMoreToken = data.result?.nextPageToken;
    const modifiedData = getItemsWithMetaData({
      data: allFiles,
      loadMoreToken,
      parentId: DIRECTORY_TYPE.TRASHED,
    });
    setTrashed([
      {
        ...trashed[0],
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

  const getMoreChildrenResponse = async (parentId: string, token?: string) => {
    switch (parentId) {
      case DIRECTORY_TYPE.ROOT: {
        return await getFilesUsingParentId("root", token, filterQueries);
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
        return await getFilesUsingParentId(parentId, token, filterQueries);
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
        case DIRECTORY_TYPE.TRASHED: {
          return await getTrashedFilesData();
        }
        default: {
          const modifiedData = await getDataUsingParentId(id);
          const fileIdsArray = modifiedData.map((item) => item?.metaData?.id);
          if (fileId && fileIdsArray.includes(fileId) && initialScroll) {
            selectedFileScrollRef.current = false;
            setIntialScroll(false);
          } else {
            while (
              fileId &&
              !fileIdsArray.includes(fileId) &&
              modifiedData.length > 0 &&
              initialScroll &&
              modifiedData[modifiedData.length - 1].title === LOAD_MORE_TITLE
            ) {
              const loadMoreToken = modifiedData[modifiedData.length - 1]
                .key as string;
              const loadMoreData = await getDataUsingParentId(
                id,
                loadMoreToken
              );
              modifiedData.pop();
              modifiedData.push(...loadMoreData);
              if (
                selectedFilePath?.[selectedFilePath?.length - 2].id === id &&
                modifiedData[modifiedData.length - 1].title !==
                  LOAD_MORE_TITLE &&
                initialScroll
              ) {
                selectedFileScrollRef.current = false;
                setIntialScroll(false);
              }
            }
          }
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
            const updatedData = updateTreeData(ctDrive, key, modifiedData);
            setSpaceDrive([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.RECENT) {
            const updatedData = updateTreeData(recentFiles, key, modifiedData);
            setRecentFiles([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.STARRED) {
            const updatedData = updateTreeData(starredFiles, key, modifiedData);
            setStarredFiles([...updatedData]);
          } else if (driveType === DIRECTORY_TYPE.TRASHED) {
            const updatedData = updateTreeData(trashed, key, modifiedData);
            setTrashed([...updatedData]);
          }
          if (!selectedFileScrollRef.current && initialScroll && fileId) {
            scrollTitleNodeIntoView(fileId);
          }
        }
      }
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
          ctDrive,
          parentId,
          modifiedData,
          true
        );
        setSpaceDrive([...updatedData]);
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
      } else if (driveType === DIRECTORY_TYPE.TRASHED) {
        const updatedData = updateTreeData(
          trashed,
          parentId,
          modifiedData,
          true
        );
        setTrashed([...updatedData]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadMoreKeyData(undefined);
    }
  };

  const onSelect =
    (driveType: string) => (_keys: React.Key[], e: ISelectInfo) => {
      const { metaData } = e?.node || {};
      const {
        webViewLink = "",
        mimeType = "",
        id: nodeId = "",
      } = metaData || {};
      const id = nodeId || DIRECTORY_TYPE.ROOT;
      if (driveType === DIRECTORY_TYPE.ROOT) {
        if (driveExpandedKeys.includes(id)) {
          setDriveExpandedKeys(driveExpandedKeys.filter((key) => key !== id));
        } else {
          setDriveExpandedKeys([...driveExpandedKeys, id]);
        }
      }
      if (driveType === DIRECTORY_TYPE.ORGANISATION) {
        if (defaultExpandedKeys.includes(id)) {
          setDefaultExpandedKeys(
            defaultExpandedKeys.filter((key) => key !== id)
          );
        } else {
          setDefaultExpandedKeys([...defaultExpandedKeys, id]);
        }
      }

      if (mimeType === LOAD_MORE_KEY) {
        const isLoadMoreLoading =
          loadMoreKeyData?.id === id && loadMoreKeyData?.isLoading;
        if (!isLoadMoreLoading) {
          handleLoadMoreTreeData(e.node, driveType);
        }
        return;
      }
      if (mimeType === "application/vnd.google-apps.folder") {
        return;
      }
      if (metaData && webViewLink) {
        const updatedLink = webViewLink.replace("view", "preview");
        setIframeData(
          {
            ...metaData,
            webViewLink: updatedLink,
          },
          { driveType }
        );
      }
    };

  useEffect(() => {
    if (rootFolderId) {
      getFileDetailsUsingId(rootFolderId)
        .then((response: any) => {
          const folderName = response?.result?.name;
          if (folderName) {
            setSpaceDrive([
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
          messageApi.open({
            type: "error",
            content: "Seems you don't have permission to space folder",
          });
        });
    }
  }, [rootFolderId]);

  const handleDataRefresh = async (key: string, driveType: string) => {
    try {
      const parentId = key === DIRECTORY_TYPE.ROOT ? "root" : key || "root";
      const modifiedData = await getDataUsingParentId(parentId);

      if (driveType === DIRECTORY_TYPE.SHARED) {
        setSharedWithMeFiles((existingData) => {
          const updatedData = updateTreeData(
            getDeepCopy(existingData),
            key,
            modifiedData
          );
          return updatedData;
        });
      } else if (driveType === DIRECTORY_TYPE.ROOT) {
        setFilesList((existingState) => {
          const updatedData = updateTreeData(
            getDeepCopy(existingState),
            key,
            modifiedData
          );
          return updatedData;
        });
      } else if (driveType === DIRECTORY_TYPE.ORGANISATION) {
        setSpaceDrive((existingState) => {
          const updatedData = updateTreeData(
            getDeepCopy(existingState),
            key,
            modifiedData
          );
          return updatedData;
        });
      } else if (driveType === DIRECTORY_TYPE.TRASHED) {
        getTrashedFilesData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleFileCreationSuccess = async () => {
    const { key = "", driveType = "", fileType = "" } = selectedItemId;
    messageApi.open({
      type: "success",
      content: "File created successfully",
    });
    setSelecteditemId({
      key: "",
      driveType: "",
      fileType: "",
    });
    await handleDataRefresh(key, driveType);
  };

  const handleFileDelete = async (node: IDriveTreeNode, driveType: string) => {
    try {
      if (node.metaData?.id) {
        await deleteDriveFile(node.metaData?.id);
        const parentId =
          node?.rootType || node?.metaData?.parents?.[0] || "root";
        await handleDataRefresh(parentId, driveType);
        await handleDataRefresh(parentId, DIRECTORY_TYPE.TRASHED);
        messageApi.info({
          content: "File moved to trash successfully",
        });
        if (iframeFileId === node.key) {
          resetIframeData();
        }
      }
    } catch (err) {
      messageApi.info({
        content: "Failed to move file to trash",
      });
    }
  };

  const handleFileDeletePermanent = async (
    node: IDriveTreeNode,
    driveType: string
  ) => {
    try {
      if (node.metaData?.id) {
        await deleteDriveFilePermanent(node.metaData?.id);
        const parentId =
          node?.rootType || node?.metaData?.parents?.[0] || "root";
        await handleDataRefresh(parentId, driveType);
        messageApi.info({
          content: "File deleted successfully",
        });
        if (iframeFileId === node.key) {
          resetIframeData();
        }
      }
    } catch (err) {
      messageApi.error({
        content: "Failed to delete file",
      });
    }
  };

  const handleFileRestore = async (node: IDriveTreeNode, driveType: string) => {
    try {
      if (node.metaData?.id) {
        await restoreDriveFile(node.metaData?.id);
        const parentId =
          node?.rootType ||
          node?.metaData?.parents?.[0] ||
          DIRECTORY_TYPE.TRASHED;
        await handleDataRefresh(parentId, driveType);
        messageApi.success({
          content: "File restored successfully",
        });
        if (iframeFileId === node.key) {
          resetIframeData();
        }
      }
    } catch (err) {
      messageApi.error({
        content: "Failed to restore file",
      });
    }
  };

  const handleFileRename = async (
    node: IDriveTreeNode,
    newName: string,
    driveType: string
  ) => {
    try {
      const {
        metaData: { id = "", parents = [] } = {},
        rootType,
        key,
      } = node || {};
      if (id) {
        await renameDriveFile(id, newName);
        const parentId = rootType || parents?.[0] || "root";
        await handleDataRefresh(parentId, driveType);
        messageApi.success({
          content: "File renamed successfully",
        });
        const metaData = node.metaData as IFileMetaData;
        if (iframeFileId === key) {
          setIframeData(
            {
              ...metaData,
              name: newName,
            },
            { driveType }
          );
        }
      }
    } catch (err) {
      messageApi.error({
        content: "Failed to rename file",
      });
    }
  };

  const onFilesMoved = async () => {
    const {
      data: { key = "", metaData: { parents = [] } = {} } = {},
      driveType = "",
    } = fileToMoveData || {};
    setFileToMoveData(undefined);
    await handleDataRefresh(parents[0] as string, driveType);
  };

  const starFolder = async (
    node: IDriveTreeNode,
    folderId: string,
    starred: boolean,
    driveType: string
  ) => {
    await toogleFileAsStarred(folderId, starred);

    fetchAndUpdateFavoriateData();

    messageApi.success({
      content: starred
        ? "Added to favourite successfully"
        : "Removed from favourite",
    });

    if (node?.metaData?.parents?.[0])
      await handleDataRefresh(node?.metaData?.parents[0], driveType);
  };

  const getCommonTreeProps = (driveType: DIRECTORY_TYPE) => {
    return {
      handleDataRefresh,
      messageApi,
      setSelecteditemId,
      sidebarWidth:
        sidebarWidth > DEFAULT_SIDENAV_WIDTH
          ? sidebarWidth
          : DEFAULT_SIDENAV_WIDTH,
      handleFileDelete,
      handleFileDeletePermanent,
      handleFileRestore,
      driveType,
      loadMoreKeyData,
      setFileToMoveData,
      handleFileRename,
      starFolder,
      setAddFileSelecteditemId,
    };
  };

  const hideShareToggle = useMemo(
    () =>
      !!rootFolderId?.length &&
      rootFolderId === import.meta.env?.VITE_ROOT_ORG_FOLDER_ID,
    [rootFolderId]
  );

  const handleApplyFilters = async () => {
    if (rootFolderId) {
      if (defaultExpandedKeys.length > 0) {
        defaultExpandedKeys.unshift(rootFolderId);
        for (const id of defaultExpandedKeys) {
          await handleDataRefresh(id, DIRECTORY_TYPE.ORGANISATION);
        }
      } else {
        await handleDataRefresh(rootFolderId, DIRECTORY_TYPE.ORGANISATION);
      }
    } else if (hasMyDrive) {
      if (driveExpandedKeys.length > 0) {
        for (const id of driveExpandedKeys) {
          await handleDataRefresh(id, DIRECTORY_TYPE.ROOT);
        }
      } else {
        await handleDataRefresh("root", DIRECTORY_TYPE.ROOT);
      }
    }
  };

  useEffect(() => {
    if (Object.keys(filterQueries).length) {
      handleApplyFilters();
    }
  }, [filterQueries]);

  /**
   *
   * @param orderBy - to sort the data in ascending or descending value
   * @param filterBy - to sort the data using specific values like name,modified time...
   * @param folderPriority - to sort the data as files,folders or mix up both files and folders
   */
  const handleFilterQueryChange = (
    orderBy: boolean,
    filterBy: string,
    folderPriority?: string
  ) => {
    const orderFilter = orderBy ? ORDERBY.ASC : ORDERBY.DESC;
    const folderFilter =
      folderPriority === FOLDER_FILTER.ON_TOP ? "folder," : "";
    const filterName = selectDescending(filterBy);
    setFilterQueries({ orderBy: folderFilter + filterName + orderFilter });
  };

  // @ts-ignore
  const onClick = (key) => {
    const { filterBy, folderFilter, orderBy } = filterObject;
    if (
      (key.key && key.key === FOLDER_FILTER.ON_TOP) ||
      key.key === FOLDER_FILTER.MIX_WITH_FILES
    ) {
      setFilterObject({ ...filterObject, folderFilter: key.key });
      handleFilterQueryChange(orderBy, filterBy, key.key);
    } else {
      setFilterObject({ ...filterObject, filterBy: key as FILTER_NAME });
      handleFilterQueryChange(orderBy, key, folderFilter);
    }
  };

  const selectDescending = (filterBy?: string) => {
    let filterQuery = "";
    switch (filterBy) {
      case FILTER_NAME.NAME:
        filterQuery = FILTER_QUERY.NAME;
        break;
      case FILTER_NAME.LAST_MODIFIED:
        filterQuery = FILTER_QUERY.LAST_MODIFIED;
        break;
      case FILTER_NAME.LAST_MODIFIED_BY_ME:
        filterQuery = FILTER_QUERY.LAST_MODIFIED_BY_ME;
        break;
      case FILTER_NAME.LAST_OPENED_BY_ME:
        filterQuery = FILTER_QUERY.LAST_OPENED_BY_ME;
        break;
      case FILTER_NAME.CREATED_TIME:
        filterQuery = FILTER_QUERY.CREATED_TIME;
        break;
    }
    return filterQuery;
  };
  useEffect(() => {
    if (selectedFileScrollRef.current) return;

    if (selectedFilePath?.length) {
      const defaultKeys: string[] = [];
      selectedFilePath.forEach((item) => {
        if (item.id) defaultKeys.push(item.id);
      });
      setDefaultExpandedKeys(defaultKeys);
      const driveExpandedKeys = [...defaultKeys];
      driveExpandedKeys[0] = DIRECTORY_TYPE.ROOT;
      setDriveExpandedKeys(driveExpandedKeys);
      selectedFileScrollRef.current = true;
    }
  }, [selectedFilePath]);

  const handleAddFilesViaLink = async () => {
    const { key, driveType = "" } = addFileSelectedItemId || {};
    setAddFileSelecteditemId({ key: "", driveType: "" });
    await handleDataRefresh(key, driveType);
  };
  const handleOrderChange = () => {
    const { filterBy, folderFilter } = filterObject;
    const updatedOrderBy = !filterObject.orderBy;
    handleFilterQueryChange(updatedOrderBy, filterBy, folderFilter);
    setFilterObject({
      ...filterObject,
      orderBy: updatedOrderBy,
    });
  };

  return (
    <>
      <div className="flex">
        <div
          className={`side-nav-container py-2 border-r ${
            expanded ? "px-3 pr-4" : "w-[10px]"
          } flex flex-col gap-1`}
          onMouseDown={(e) => e.preventDefault()}
          style={{
            width: sidebarWidth,
            transition: "all 0.6s ease",
          }}
          ref={sidebarRef}
          onMouseEnter={() => {
            if (!expanded) setSidebarWidth(300);
          }}
          onMouseLeave={() => {
            if (!expanded) setSidebarWidth(10);
          }}
        >
          <div className="flex items-center mb-1 p-1">
            <div className="flex items-center">
              <Select
                defaultValue={filterObject.filterBy}
                style={{ width: "180px" }}
                className="mr-2"
                options={[
                  {
                    label: FILTER_NAME.NAME,
                    value: FILTER_NAME.NAME,
                  },
                  {
                    label: FILTER_NAME.LAST_MODIFIED,
                    value: FILTER_NAME.LAST_MODIFIED,
                  },
                  {
                    label: FILTER_NAME.LAST_MODIFIED_BY_ME,
                    value: FILTER_NAME.LAST_MODIFIED_BY_ME,
                  },
                  {
                    label: FILTER_NAME.LAST_OPENED_BY_ME,
                    value: FILTER_NAME.LAST_OPENED_BY_ME,
                  },
                  {
                    label: FILTER_NAME.CREATED_TIME,
                    value: FILTER_NAME.CREATED_TIME,
                  },
                ]}
                onChange={onClick}
              />

              <span
                className="cursor-pointer"
                style={{
                  transform: `rotateX(${filterObject.orderBy ? 180 : 0}deg)`,
                  transition: "transform 0.3s ease-in-out",
                }}
                onClick={handleOrderChange}
              >
                <Tooltip
                  placement="topRight"
                  title={"Sort direction"}
                  showArrow={false}
                >
                  <ArrowUpOutlined className="text-ls mr-1" />
                </Tooltip>
              </span>

              <Dropdown
                placement="bottom"
                trigger={["click"]}
                overlay={
                  <Menu onClick={onClick} title="Show Folders">
                    <Menu.Item
                      key={FOLDER_FILTER.ON_TOP}
                      style={{
                        backgroundColor:
                          filterObject.folderFilter === FOLDER_FILTER.ON_TOP
                            ? "#e6f4ff"
                            : "",
                      }}
                    >
                      On Top
                      {filterObject.folderFilter === FOLDER_FILTER.ON_TOP && (
                        <CheckOutlined className="ml-1" />
                      )}
                    </Menu.Item>
                    <Menu.Item
                      key={FOLDER_FILTER.MIX_WITH_FILES}
                      style={{
                        backgroundColor:
                          filterObject.folderFilter ===
                          FOLDER_FILTER.MIX_WITH_FILES
                            ? "#e6f4ff"
                            : "",
                      }}
                    >
                      Mix with Files
                      {filterObject.folderFilter ===
                        FOLDER_FILTER.MIX_WITH_FILES && (
                        <CheckOutlined className="ml-1" />
                      )}
                    </Menu.Item>
                  </Menu>
                }
              >
                <Tooltip
                  title={"More Sort Options"}
                  showArrow={false}
                  placement="top"
                >
                  <span className="ml-2 cursor-pointer">
                    <MoreOutlined />
                  </span>
                </Tooltip>
              </Dropdown>
            </div>
          </div>

          {toastContextHolder}
          {!!ctDrive.length && (
            <Tree
              treeData={ctDrive}
              // @ts-ignore
              loadData={handleLoadData(DIRECTORY_TYPE.ORGANISATION)}
              // @ts-ignore
              onSelect={onSelect(DIRECTORY_TYPE.ORGANISATION)}
              // @ts-ignore
              onExpand={onSelect(DIRECTORY_TYPE.ORGANISATION)}
              expandAction={"click"}
              titleRender={(treeNode) => (
                <TitleNode
                  node={treeNode}
                  {...getCommonTreeProps(DIRECTORY_TYPE.ORGANISATION)}
                />
              )}
              expandedKeys={[rootFolderId || "", ...defaultExpandedKeys]}
              defaultSelectedKeys={[fileId || ""]}
            />
          )}
          {showMyDrive && (
            <>
              <Tree
                treeData={filesList}
                // @ts-ignore
                loadData={handleLoadData(DIRECTORY_TYPE.ROOT)}
                // @ts-ignore
                onSelect={onSelect(DIRECTORY_TYPE.ROOT)}
                // @ts-ignore
                onExpand={onSelect(DIRECTORY_TYPE.ROOT)}
                expandAction={"click"}
                rootClassName="w-full flex items-center"
                titleRender={(treeNode) => (
                  <TitleNode
                    node={treeNode}
                    {...getCommonTreeProps(DIRECTORY_TYPE.ROOT)}
                  />
                )}
                expandedKeys={driveExpandedKeys}
                defaultSelectedKeys={[fileId || ""]}
              />

              <Tree
                treeData={sharedWithMFilese}
                // @ts-ignore
                loadData={handleLoadData(DIRECTORY_TYPE.SHARED)}
                // @ts-ignore
                onSelect={onSelect(DIRECTORY_TYPE.SHARED)}
                expandAction={"click"}
                rootClassName="w-full flex items-center"
                titleRender={(treeNode) => (
                  <TitleNode
                    node={treeNode}
                    {...getCommonTreeProps(DIRECTORY_TYPE.SHARED)}
                  />
                )}
              />

              <Tree
                treeData={recentFiles}
                // @ts-ignore
                loadData={handleLoadData(DIRECTORY_TYPE.RECENT)}
                // @ts-ignore
                onSelect={onSelect(DIRECTORY_TYPE.RECENT)}
                expandAction={"click"}
                rootClassName="w-full flex items-center"
                titleRender={(treeNode) => (
                  <TitleNode
                    node={treeNode}
                    {...getCommonTreeProps(DIRECTORY_TYPE.RECENT)}
                  />
                )}
              />
              <Tree
                treeData={starredFiles}
                // @ts-ignore
                loadData={handleLoadData(DIRECTORY_TYPE.STARRED)}
                // @ts-ignore
                onSelect={onSelect(DIRECTORY_TYPE.STARRED)}
                expandAction={"click"}
                rootClassName="w-full flex items-center"
                titleRender={(treeNode) => (
                  <TitleNode
                    node={treeNode}
                    {...getCommonTreeProps(DIRECTORY_TYPE.STARRED)}
                  />
                )}
              />
              <Tree
                treeData={trashed}
                // @ts-ignore
                loadData={handleLoadData(DIRECTORY_TYPE.TRASHED)}
                // @ts-ignore
                onSelect={onSelect(DIRECTORY_TYPE.TRASHED)}
                expandAction={"click"}
                rootClassName="w-full flex items-center"
                titleRender={(treeNode) => (
                  <TitleNode
                    node={treeNode}
                    {...getCommonTreeProps(DIRECTORY_TYPE.TRASHED)}
                  />
                )}
              />
            </>
          )}
        </div>
        <div
          className="w-[2px] relative bg-slate-200 hover:bg-blue-300 cursor-col-resize"
          onMouseDown={startResizing}
        >
          <span
            className="absolute top-4 left-[-12px] h-6 w-6 rounded-[50%] border-gray-200 bg-white hover:bg-blue-600 hover:text-white flex items-center justify-center cursor-pointer"
            style={{
              borderStyle: "solid",
              transform: `rotateY(${expanded ? 0 : 180}deg)`,
              zIndex: 1,
            }}
            onClick={() =>
              setExpanded((prev) => {
                if (!prev) setSidebarWidth(300);
                else setSidebarWidth(10);
                return !prev;
              })
            }
          >
            <LeftOutlined className="text-xs" />
          </span>
        </div>
      </div>
      {!!selectedItemId.key && (
        <AddFileModal
          open={!!selectedItemId.key}
          onCancel={() => {
            setSelecteditemId({
              key: "",
              driveType: "",
              fileType: GOOGLE_FILE_TYPES.DOCUMENT,
            });
          }}
          parentFolderId={selectedItemId.key}
          onSuccess={handleFileCreationSuccess}
          messageApi={messageApi}
          hideShareToggle={hideShareToggle}
          fileType={selectedItemId.fileType}
        />
      )}
      <MoveFileModal
        fileToMoveData={fileToMoveData}
        onClose={onFilesMoved}
        messageApi={messageApi}
      />
      <AddFilesViaLinkModal
        open={!!addFileSelectedItemId.key}
        onCancel={() => {
          setAddFileSelecteditemId({
            key: "",
            driveType: "",
          });
        }}
        messageApi={messageApi}
        onSuccess={handleAddFilesViaLink}
        parentFolderData={addFileSelectedItemId}
      />
    </>
  );
}

export default Sidenav;
