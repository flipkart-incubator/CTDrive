import { ORG_FOLDER_ID } from "@/constants/general";
import { UPLOAD_WARNING_MESSAGE } from "@/constants/googledrive";
import { useUserStore } from "@/store";
import { WarningFilled } from "@ant-design/icons";
import GlobalFileCreationModal from "./GlobalFileCreation";

function Playground() {
  const { driveData } = useUserStore();
  const { iframeNodeData, disableIframeClick } = driveData || {};

  const { webViewLink: iframeSrc } = iframeNodeData || {};

  return (
    <div
      style={{
        maxHeight: "100vh",
      }}
      className="w-full relative"
    >
      {iframeSrc ? (
        <>
          <iframe
            src={iframeSrc}
            className={`w-full h-full border-none ${
              disableIframeClick ? "pointer-events-none" : ""
            }`}
            allow="fullscreen"
            sandbox="allow-same-origin allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation"
          ></iframe>
        </>
      ) : (
        <>
          <div className="flex justify-center items-center w-full h-[calc(100vh-84px)]">
            <span className="flex justify-center items-center text-slate-500">
              Select a file from Sidebar /
              <span className="ml-1 cursor-pointer">
                <GlobalFileCreationModal playground={true} />
              </span>
            </span>
          </div>
          {ORG_FOLDER_ID && (
            <div className="text-slate-500 px-2 pt-1 w-full border-0 border-t border-solid border-slate-300">
              <span>
                <WarningFilled /> Note: {UPLOAD_WARNING_MESSAGE}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Playground;
