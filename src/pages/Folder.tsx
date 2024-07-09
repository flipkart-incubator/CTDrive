import Playground from "@/components/Playground";
import Sidenav from "@/components/Sidenav";
import { useParams } from "react-router-dom";

function Folder({ orgFolderId }: { orgFolderId?: string }) {
  const { folderId } = useParams();

  return (
    <div className="page-container">
      <Sidenav rootFolderId={orgFolderId || folderId} />
      <Playground />
    </div>
  );
}

export default Folder;
