import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ConfigProvider, message } from "antd";

import { useUserStore } from "./store";
import { router } from "./utils/routes";
import "./App.css";
import { ORG_FOLDER_ID } from "./constants/general";

const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/directory.readonly",
  "https://www.googleapis.com/auth/contacts.readonly",
];
const SCOPES = DRIVE_SCOPES.join(" ");

function App() {
  const {
    checkUserDetails,
    userDetails,
    resetData,
    setRootFolderData,
    setDefaultOpenedFileDetails,
  } = useUserStore();

  const [messageApi, toastContextHolder] = message.useMessage();

  const initGoogleClient = async () => {
    try {
      await window.gapi.client.init({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          "https://people.googleapis.com/discovery/v1/apis/people/v1/rest",
        ],
        plugin_name: import.meta.env.VITE_APP_NAME,
      });
      checkUserDetails();
    } catch (err) {
      console.log(err);
      resetData();
    }
  };
  useEffect(() => {
    if (window.gapi) window.gapi.load("client:auth2", initGoogleClient);
  }, [window?.gapi]);

  useEffect(() => {
    if (userDetails.isSignedIn) {
      ORG_FOLDER_ID && setRootFolderData(ORG_FOLDER_ID, messageApi);
      const query = window.location.search;
      // get fileId from query
      const urlParams = new URLSearchParams(query);
      const fileId = urlParams.get("fileId");
      const parentId = urlParams.get("parentId");
      if (fileId) {
        setDefaultOpenedFileDetails({ fileId, parentId });
      }
    }
  }, [userDetails.isSignedIn]);

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#0055CC",
          },
        }}
      >
        {toastContextHolder}
        <RouterProvider router={router} />
      </ConfigProvider>
    </>
  );
}

export default App;
