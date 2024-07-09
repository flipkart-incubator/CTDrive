import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store";
import { Avatar, Button, Modal, Select } from "antd";
import { PERMISSIONS_ROLES } from "@/constants/googledrive";
import { IPermissionUser } from "@/types/drive";
import NewUserPermission from "./NewUserPermission";
import { MessageInstance } from "antd/es/message/interface";
import { getFileDetailsUsingId } from "@/utils/network/drive";
import { getCTDriveRedirectUrl } from "@/utils/url";

function ShareModal({
  open,
  onCancel,
  messageApi,
  fileName = "",
}: {
  open: boolean;
  onCancel: () => void;
  messageApi: MessageInstance;
  fileName?: string;
}) {
  const [showAddUserPermission, setShowAddUserPermission] =
    React.useState(false);
  const { driveData } = useUserStore();
  const {
    iframeNodeData: {
      id = "",
      name = fileName,
      webViewLink = "",
      permissions: statePermisions = [],
      parents = [],
    } = {},
  } = driveData || {};
  const [permissions, setPermissions] = useState<IPermissionUser[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFileDetailsUsingId(id);
        const updatedPermissions = data.result.permissions as IPermissionUser[];
        const sortedUpdatedPermissions = updatedPermissions.sort((a) =>
          a.role === "owner" ? -1 : 1
        );
        setPermissions(sortedUpdatedPermissions);
      } catch {
        const sortedUpdatedPermissions = statePermisions.sort((a) =>
          a.role === "owner" ? -1 : 1
        );
        setPermissions(sortedUpdatedPermissions);
      }
    };

    if (open && id) {
      fetchData();
    }
  }, [open, id]);

  const handlePermissionUpdate = async (
    updatedRole: string,
    userData: IPermissionUser
  ) => {
    try {
      await window.gapi.client.drive.permissions.update({
        fileId: id,
        permissionId: userData.id,
        role: updatedRole,
      });
      messageApi.success(
        `Successfully updated permission for ${userData.displayName}`
      );
    } catch (error) {
      messageApi.error(`Failed to update permission`);
    }
  };

  const handleModalClose = () => {
    setShowAddUserPermission(false);
    setPermissions([]);
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleModalClose}
      title={`Share "${name}"`}
      footer={null}
      destroyOnClose
    >
      {showAddUserPermission ? (
        <NewUserPermission
          onBack={() => setShowAddUserPermission(false)}
          messageApi={messageApi}
          onSuccess={handleModalClose}
        />
      ) : (
        <>
          <div>
            <Select
              mode="multiple"
              showSearch
              placeholder="Add people and groups"
              className="mb-2 w-full"
              defaultActiveFirstOption={false}
              suffixIcon={null}
              filterOption={false}
              onClick={() => {
                setShowAddUserPermission(true);
              }}
            />
          </div>
          <span className="text-base font-normal">People with access</span>
          <div className="flex flex-col gap-3 mt-2">
            {permissions.map((user) => (
              <div
                className="flex items-center gap-3 justify-between"
                key={user.displayName}
              >
                <div className="flex items-center gap-3">
                  {user.photoLink ? (
                    <img
                      src={user.photoLink}
                      alt={user.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <Avatar
                      style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}
                      size={"small"}
                    >
                      {user?.displayName?.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                  <span>{user.displayName}</span>
                </div>
                {user.role === PERMISSIONS_ROLES.OWNER ? (
                  <span className="text-slate-500">Owner</span>
                ) : (
                  <Select
                    defaultValue={user.role}
                    style={{ width: "120px" }}
                    disabled={user.role === PERMISSIONS_ROLES.OWNER}
                    options={[
                      {
                        label: "Editor",
                        value: PERMISSIONS_ROLES.EDITOR,
                      },
                      {
                        label: "Viewer",
                        value: PERMISSIONS_ROLES.VIEW,
                      },
                      {
                        label: "Commenter",
                        value: PERMISSIONS_ROLES.COMMENTOR,
                      },
                    ]}
                    onChange={(e) => {
                      handlePermissionUpdate(e, user);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <Button
            className="mt-3"
            onClick={() => {
              const redirectURL = getCTDriveRedirectUrl({
                parentId: parents[0],
                fileId: id,
              });
              const urlToCopy = window.location.origin + redirectURL;
              navigator.clipboard.writeText(urlToCopy).then(() => {
                messageApi.success("Link copied to clipboard");
              });
            }}
          >
            Copy Link
          </Button>
        </>
      )}
    </Modal>
  );
}

export default ShareModal;
