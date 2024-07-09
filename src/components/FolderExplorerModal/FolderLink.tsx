import { IFolderSelectionProps } from "./types";
import SearchFolderLink from "../MoveFileModal/FolderLink";

function SearchFolderLinkWrapper({ onFolderSelect }: IFolderSelectionProps) {
  return (
    <div>
      <SearchFolderLink onFolderSelect={onFolderSelect} searchMode="CREATE" />
    </div>
  );
}

export default SearchFolderLinkWrapper;
