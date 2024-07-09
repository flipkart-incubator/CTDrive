import React, { useState } from "react";
import SuggestionDropdown, {
  SEARCH_MODE,
} from "../SearchComponent/SuggestionDropdown";
import { Input } from "antd";
import { IFileMetaData } from "@/types/drive";

const SearchFolder = ({
  handleOnFolderClick,
  searchMode = "MOVE",
}: {
  handleOnFolderClick: (file?: IFileMetaData) => void;
  searchMode?: SEARCH_MODE;
}) => {
  const [searchText, setSearchText] = useState("");

  return (
    <div className="w-full flex flex-col h-full">
      <Input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Enter name"
      />

      <SuggestionDropdown
        searchMode={searchMode}
        searchText={searchText}
        onClose={handleOnFolderClick}
      />
    </div>
  );
};

export default SearchFolder;
