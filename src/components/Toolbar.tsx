import { useState } from "react";
import { Avatar, Menu, Popover, message } from "antd";
import Login from "@/components/Login";
import { useUserStore } from "@/store";
import Logout from "@/components/Logout";
import Logo from "@/assets/logo";
import TextImage from "@/assets/logoText.png";
import SearchComponent from "./SearchComponent";
import ShareModal from "./ShareModal";
import { PAGE_ROUTES } from "@/constants/network";
import SelectedFilesInfoSection from "./SelectedFilesInfoSection";
import { useNavigate } from "react-router-dom";
import { MenuInfo } from "rc-menu/lib/interface";
import { navigateToOrgDirectory } from "@/utils/general";
import { ORG_FOLDER_ID } from "@/constants/general";

function Toolbar() {
  const [showShare, setShowShare] = useState(false);
  const [messageApi, toastContextHolder] = message.useMessage();
  const {
    userDetails: { isSignedIn, userDetails },
    isLoading,
    rootFolderData,
    recentData: { recentFolders = [], recentFiles = [] } = {},
    setDefaultOpenedFileDetails,
    favouriteFolders,
  } = useUserStore();
  const { imageUrl, userName } = userDetails || {};

  const navigate = useNavigate();

  const getSelectedTab = () => {
    const orgDirectoryId = import.meta.env.VITE_ROOT_ORG_FOLDER_ID;
    if (
      (!orgDirectoryId &&
        location.pathname ===
          (import.meta.env.VITE_BASE_ROUTE_PREFIX || "/")) ||
      location.pathname === PAGE_ROUTES.MY_DRIVE
    ) {
      return ["home"];
    } else if (
      orgDirectoryId &&
      (location.pathname.includes("/folder/" + orgDirectoryId) ||
        location.pathname === (import.meta.env.VITE_BASE_ROUTE_PREFIX || "/"))
    ) {
      return ["org_docs"];
    }
    return [];
  };

  const recentlyViwedFiles = recentFiles.map(({ name, id, iconLink = "" }) => ({
    label: name,
    key: id,
    icon: iconLink ? (
      <img src={iconLink} height={"12px"} width={"12px"} />
    ) : null,
  }));

  const recentlyViewFolders = recentFolders.map((folder) => ({
    label: folder.name,
    key: `recent_${folder.id}`,
  }));

  const starredFolder = favouriteFolders?.map(
    ({ name, id, iconLink = "" }) => ({
      label: name,
      key: `favourite_${id}`,
      icon: iconLink ? (
        <img src={iconLink} height={"12px"} width={"12px"} />
      ) : null,
    })
  );

  const handleMenuOptionClick = (e: MenuInfo) => {
    if (e.key === "home") {
      navigate(PAGE_ROUTES.MY_DRIVE);
    } else if (e.key === "org_docs") {
      navigateToOrgDirectory(navigate);
    } else {
      const isFavourite = e.keyPath[1] === "favourite";
      const isFile = e.keyPath[1] === "recent";
      const isFolder = e.keyPath?.[1] === "folders";
      if (isFile) {
        setDefaultOpenedFileDetails({ fileId: e.key, appendQueryInUrl: true });
      } else if (isFolder) {
        e.key = e.key.replace("recent_", "");
        const pageUrl = PAGE_ROUTES.FOLDER + "/" + e.key;
        window.open(pageUrl, "_self");
      } else if (isFavourite) {
        e.key = e.key.replace("favourite_", "");
        const pageUrl = PAGE_ROUTES.FOLDER + "/" + e.key;
        window.open(pageUrl, "_self");
      }
    }
  };

  const getMenuOptions = () => {
    const menuOptions = [];
    if (ORG_FOLDER_ID) {
      menuOptions.push({
        label: "Org Docs",
        key: "org_docs",
      });
    }

    const commonMenuOptions = [
      {
        label: "My Docs",
        key: "home",
      },
      {
        label: "Recent",
        key: "recent",
        children: [
          {
            label: "Folders",
            key: "folders",
            children: recentlyViewFolders,
            disabled: !recentlyViewFolders.length,
          },
          ...recentlyViwedFiles,
        ],
        disabled: !recentFiles.length && !recentFolders.length,
      },
      {
        label: "Favourite",
        key: "favourite",
        children: starredFolder,
        disabled: !starredFolder?.length,
      },
    ];

    return [...menuOptions, ...commonMenuOptions];
  };

  return (
    <div className="flex w-full items-center h-full justify-between border-b-2 border-b-gray-300">
      <div className="text-lg font-medium text-gray-500 flex items-center h-full">
        <span
          className="flex items-center cursor-pointer"
          onClick={() => navigateToOrgDirectory(navigate)}
        >
          <Logo className="mr-2" />
          <img src={TextImage} height={"14px"} />
        </span>

        {isSignedIn && (
          <Menu
            className="!leading-[56px] ml-3"
            disabledOverflow
            items={getMenuOptions()}
            mode="horizontal"
            selectedKeys={getSelectedTab()}
            onClick={handleMenuOptionClick}
            prefixCls="toolbar-menu"
          />
        )}
      </div>
      <SelectedFilesInfoSection
        setShowShare={setShowShare}
        messageApi={messageApi}
      />
      {isLoading ? (
        <></>
      ) : (
        <>
          {isSignedIn ? (
            <div className="flex items-center">
              <SearchComponent />
              <Popover
                content={
                  <div className="flex flex-col">
                    <span className="ml-1 mb-2">{userName}</span>
                    <Logout />
                  </div>
                }
                className="cursor-pointer"
              >
                <div className="h-full w-10 flex justify-end items-center">
                  <Avatar src={imageUrl} size={"small"} />
                </div>
              </Popover>
            </div>
          ) : (
            <Login />
          )}
        </>
      )}
      {toastContextHolder}
      <ShareModal
        open={showShare}
        onCancel={() => setShowShare(false)}
        messageApi={messageApi}
      />
    </div>
  );
}

export default Toolbar;
