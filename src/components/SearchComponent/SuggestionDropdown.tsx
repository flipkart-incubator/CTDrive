import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import useDebounce from "@cleartrip/ct-design-use-debounce";
import { IFileMetaData } from "@/types/drive";
import {
  Button,
  Divider,
  Popconfirm,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import { useUserStore } from "@/store";
import {
  IFilePath,
  getFilePath,
  getSearchSuggestionsFiles,
  getSearchSuggestionsFolders,
} from "@/utils/network/drive";
import { PAGE_ROUTES } from "@/constants/network";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { debounce } from "@/utils/general";
import { GOOGLE_FILE_TYPES } from "@/constants/googledrive";

export type SEARCH_MODE = "VIEW" | "MOVE" | "CREATE";

function SuggestionDropdown({
  searchText = "",
  onClose,
  searchMode = "VIEW",
  filterOptions,
  folderData = [],
}: {
  searchText?: string;
  onClose: (file?: IFileMetaData) => void;
  searchMode?: SEARCH_MODE;
  filterOptions?: CheckboxValueType[];
  folderData?: IFileMetaData[];
}) {
  const debounceText = useDebounce(searchText, 300);
  const [searchedFileData, setSearchedFileData] = useState<IFileMetaData[]>([]);
  const [searchedFolderData, setSearchedFolderData] =
    useState<IFileMetaData[]>(folderData);
  const [hoveredFile, setHoveredFile] = useState<IFileMetaData>();
  const [selectedItem, setSelectedItem] = useState("");
  const [hoveredFilePath, setHoveredFilePath] = useState<IFilePath[]>([]);
  const [isFilePathLoading, setIsFilePathLoading] = useState(true);

  useEffect(() => {
    debounceText && handleFilesSearch();
  }, [debounceText]);

  const handleFilesSearch = async () => {
    if (searchMode === "VIEW") {
      const fileData = await getSearchSuggestionsFiles(
        debounceText,
        filterOptions
      );
      setSearchedFileData(fileData?.result?.files || []);
    } else {
      const folderData = await getSearchSuggestionsFolders(
        debounceText,
        filterOptions
      );
      setSearchedFolderData(folderData?.result?.files || []);
    }
    setHoveredFile(undefined);
    setHoveredFilePath([]);
    setIsFilePathLoading(true);
  };

  const getFolderData = () => {
    const folders: IFileMetaData[] = [];
    searchedFolderData?.forEach((file) => {
      if (searchMode === "MOVE" || searchMode === "CREATE") {
        if (file.capabilities.canEdit) {
          folders.push(file);
        }
      } else {
        folders.push(file);
      }
    });
    return folders;
  };

  const searchedFolder = getFolderData();

  const { setIframeData } = useUserStore();

  const initFilePath = useCallback((file?: IFileMetaData) => {
    if (file?.id) {
      getFilePath(file.id).then((filePath) => {
        setHoveredFilePath(filePath || []);
        setIsFilePathLoading(false);
      });
    } else {
      setHoveredFilePath([]);
      setIsFilePathLoading(false);
    }
  }, []);

  const debouncedPathUpdation = useMemo(
    () => debounce(initFilePath, 400),
    [initFilePath]
  );

  const onOptionHover = (file: IFileMetaData) => {
    setHoveredFile(file);
    setIsFilePathLoading(true);
    debouncedPathUpdation(file);
  };

  const getOptionNode = (file: IFileMetaData, searchMode: SEARCH_MODE) => {
    if (searchMode === "VIEW") {
      return (
        <div
          className={`flex items-center align-middle justify-between p-1 px-2 hover:bg-slate-200 rounded-lg cursor-pointer ${
            file.id === hoveredFile?.id ? "bg-slate-200" : ""
          }`}
          onClick={() => {
            window.open(PAGE_ROUTES.FOLDER + "/" + file.id);
            onClose(file);
          }}
          onMouseEnter={() => onOptionHover(file)}
          onMouseLeave={() => setHoveredFile(undefined)}
          key={file.id}
        >
          <span>
            {file?.iconLink && (
              <img src={file.iconLink} height={"12px"} width={"12px"} />
            )}
            <Typography.Text
              style={{
                width: "240px",
              }}
              ellipsis
              className="ml-2 text-gray-700"
            >
              {file.name}
            </Typography.Text>
          </span>
          <span className="ml-2 text-xs text-slate-600">
            {file.shared ? "Shared" : "Private"}
          </span>
        </div>
      );
    } else if (searchMode === "CREATE") {
      return (
        <div
          className={`flex items-center align-middle justify-between p-1 px-2 hover:bg-slate-200 rounded-lg cursor-pointer ${
            file.id === hoveredFile?.id ? "bg-slate-200" : ""
          }`}
          onMouseEnter={() => onOptionHover(file)}
          key={file.id}
        >
          <span>
            {file?.iconLink && (
              <img src={file.iconLink} height={"12px"} width={"12px"} />
            )}
            <Typography.Text
              style={{
                width: "240px",
              }}
              ellipsis
              className="ml-2 text-gray-700"
            >
              {file.name}
            </Typography.Text>
          </span>
          <Button
            size="small"
            type="link"
            onClick={(e) => {
              e.stopPropagation();
              onClose(file);
            }}
          >
            Select
          </Button>
        </div>
      );
    }

    return (
      <Popconfirm
        title={
          <>
            Are you sure to move file to <b>{file.name}</b>
          </>
        }
        onConfirm={() => {
          onClose(file);
        }}
        okText="Yes"
        cancelText="No"
      >
        <div
          className={`flex items-center align-middle justify-between p-1 px-2 hover:bg-slate-200 rounded-lg cursor-pointer ${
            file.id === hoveredFile?.id ? "bg-slate-200" : ""
          }`}
          onMouseEnter={() => onOptionHover(file)}
          key={file.id}
        >
          <span>
            {file?.iconLink && (
              <img src={file.iconLink} height={"12px"} width={"12px"} />
            )}
            <Typography.Text
              style={{
                width: "240px",
              }}
              ellipsis
              className="ml-2 text-gray-700"
            >
              {file.name}
            </Typography.Text>
          </span>
          <span className="ml-2 text-xs text-slate-600">
            {file.shared ? "Shared" : "Private"}
          </span>
        </div>
      </Popconfirm>
    );
  };

  return (
    <div className="w-[750px] flex pt-3" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col w-[60%] p-1 pr-2 max-h-[500px] overflow-auto">
        {!!searchedFileData.length && selectedItem !== "folder" && (
          <>
            {searchedFileData.map((file) => (
              <div
                key={file.id}
                className={`flex items-center align-middle justify-between p-1 px-2 hover:bg-slate-200 rounded-lg cursor-pointer ${
                  file.id === hoveredFile?.id ? "bg-slate-200" : ""
                }`}
                onClick={() => {
                  const { mimeType } = file;
                  if (searchMode === "VIEW") {
                    const updatedLink = file.webViewLink.replace(
                      "view",
                      "preview"
                    );

                    if (mimeType === GOOGLE_FILE_TYPES.FOLDER) {
                      window.open(PAGE_ROUTES.FOLDER + "/" + file.id);
                    } else {
                      setIframeData(
                        {
                          ...file,
                          webViewLink: updatedLink,
                        },
                        {
                          reloadPage: true,
                        }
                      );
                    }
                  }
                  onClose();
                }}
                onMouseEnter={() => onOptionHover(file)}
              >
                <span>
                  {file?.iconLink && (
                    <img src={file.iconLink} height={"12px"} width={"12px"} />
                  )}
                  <Typography.Text
                    style={{
                      width: "240px",
                    }}
                    ellipsis
                    className="ml-2 text-gray-700"
                  >
                    {file.name}
                  </Typography.Text>
                </span>
                <span className="ml-2 text-xs text-slate-600">
                  {file.shared ? "Shared" : "Private"}
                </span>
              </div>
            ))}
          </>
        )}
        {!!searchedFolder.length &&
          (selectedItem === "folder" ||
            searchMode === "MOVE" ||
            searchMode === "CREATE") && (
            <>{searchedFolder.map((file) => getOptionNode(file, searchMode))}</>
          )}
      </div>
      <div
        className={`w-[40%] p-2 ${
          hoveredFile ? "border-l-slate-200" : "border-l-transparent"
        }`}
        style={{ borderLeftStyle: "solid" }}
      >
        {hoveredFile && (
          <>
            <div className="flex">
              {hoveredFile.hasThumbnail ? (
                <img
                  src={hoveredFile.thumbnailLink}
                  referrerPolicy="no-referrer"
                  width={100}
                  height={150}
                  className="border-solid border-slate-200 rounded-sm"
                />
              ) : (
                <div className="w-[100px] h-[150px] bg-slate-100" />
              )}
              <div className="px-2">
                <div className="font-medium">{hoveredFile.name}</div>
              </div>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700">Created:</span>
              <span className="text-xs text-slate-600">
                {new Date(hoveredFile.createdTime).toUTCString()}
              </span>
            </div>
            <Divider />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700">Last modified:</span>
              <span className="text-xs text-slate-600">
                {new Date(hoveredFile.modifiedTime).toUTCString()}
              </span>
            </div>
            {hoveredFile?.lastModifyingUser?.displayName && (
              <span className="text-xs text-slate-600 ml-auto table">
                By: {hoveredFile.lastModifyingUser.displayName}
              </span>
            )}
            {hoveredFile?.viewedByMeTime && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">Last viewed:</span>
                  <span className="text-xs text-slate-600">
                    {new Date(hoveredFile.viewedByMeTime).toUTCString()}
                  </span>
                </div>
              </>
            )}
            <Divider />
            {!!hoveredFile?.owners?.length && (
              <>
                <div className="flex items-center">
                  <span className="mr-4 text-xs text-slate-700">Owner:</span>
                  {hoveredFile.owners.map((owner) => {
                    return (
                      <Fragment key={`${owner.displayName}-ownerstooltip`}>
                        <Tooltip title={owner.displayName}>
                          <img
                            src={owner.photoLink}
                            referrerPolicy="no-referrer"
                            width={24}
                            height={24}
                            className="rounded-[50%]"
                          />
                        </Tooltip>
                      </Fragment>
                    );
                  })}
                </div>
              </>
            )}
            {isFilePathLoading ? (
              <>
                <Skeleton.Input
                  active
                  size="small"
                  className="mt-2"
                  style={{ width: "300px", height: "20px" }}
                />
              </>
            ) : (
              <>
                {hoveredFilePath.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-700 mr-2">
                      File Path:
                    </span>
                    {hoveredFilePath.map((file) => file.name).join(" > ")}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SuggestionDropdown;
