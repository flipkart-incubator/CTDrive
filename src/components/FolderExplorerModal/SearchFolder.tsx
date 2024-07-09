import React from "react";
import { IFolderSelectionProps } from "./types";
import SearchFolder from "../MoveFileModal/SearchFolder";

function SearchFolderWrapper({ onFolderSelect }: IFolderSelectionProps) {
  return (
    <div>
      <SearchFolder handleOnFolderClick={onFolderSelect} searchMode="CREATE" />
    </div>
  );
}

export default SearchFolderWrapper;
