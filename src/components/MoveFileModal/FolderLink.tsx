import React, { useState } from "react";
import { Input, Button, message } from "antd";
import {
  extractFolderIdFromLink,
  getFileDetailsUsingId,
} from "@/utils/network/drive";
import SuggestionDropdown, {
  SEARCH_MODE,
} from "../SearchComponent/SuggestionDropdown";
import { IFileMetaData } from "@/types/drive";

export interface FolderDetails {
  id: string;
  name: string;
}

const SearchFolderLink = ({
  onFolderSelect,
  searchMode = "MOVE",
}: {
  onFolderSelect: (file?: IFileMetaData) => void;
  searchMode?: SEARCH_MODE;
}) => {
  const [folderLink, setFolderLink] = useState("");
  const [folderDetails, setFolderDetails] = useState<IFileMetaData>();
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const fetchedFolderDetails = await getFileDetailsUsingId(
        extractFolderIdFromLink(folderLink)
      );
      setFolderDetails(fetchedFolderDetails.result);
    } catch (error) {
      message.error("Failed to fetch folder details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        placeholder="Enter folder link"
        value={folderLink}
        onChange={(e) => setFolderLink(e.target.value)}
      />
      <Button
        type="primary"
        className="mt-3"
        loading={loading}
        onClick={handleSearch}
      >
        Search
      </Button>
      {!loading && folderDetails && (
        <SuggestionDropdown
          searchMode={searchMode}
          onClose={onFolderSelect}
          folderData={[folderDetails]}
        />
      )}
    </div>
  );
};

export default SearchFolderLink;
