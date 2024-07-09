import React, { useEffect, useState } from "react";
import { PERMISSIONS_ROLES } from "@/constants/googledrive";
import { useUserStore } from "@/store";
import { ArrowLeftOutlined } from "@ant-design/icons";
import useDebounce from "@cleartrip/ct-design-use-debounce";
import { Avatar, Button, Select } from "antd";
import { handleGrantPermission } from "@/utils/userData";
import { IContactResponse, INewUserPermissionProps } from "./type";

function NewUserPermission({
  onBack,
  messageApi,
  onSuccess,
  newFile,
  setUserList,
  setPermission,
}: INewUserPermissionProps) {
  const [searchText, setSearchText] = useState("");
  const [searchedData, setSearchedData] = useState<IContactResponse[]>([]);
  const [selectedUserFromDropdown, setSelectedUserFromDropdown] = useState([]);
  const [userPermissionToGrant, setUserPermissionToGrant] = useState(
    PERMISSIONS_ROLES.VIEW
  );
  const debounceText = useDebounce(searchText, 500);

  const { driveData } = useUserStore();
  const { iframeNodeData: { id = "", name = "", permissions = [] } = {} } =
    driveData || {};

  const searchContacts = async (query: string) => {
    try {
      const contactResponse =
        window.gapi.client?.people?.people?.searchDirectoryPeople({
          query: query,
          readMask: "emailAddresses,names,photos",
          sources: [
            "DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE",
            "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT",
          ],
        });
      const otherContactsResponse =
        window?.gapi?.client?.people.otherContacts.search({
          query: query,
          pageSize: 50,
          readMask: "emailAddresses,metadata,names",
        });
      const allResponse = await Promise.all([
        contactResponse,
        otherContactsResponse,
      ]);
      const contacts: IContactResponse[] = (
        allResponse[0]?.result?.people || []
      ).map((current: any) => {
        return {
          name: current?.names[0].displayName,
          email: current?.emailAddresses[0].value,
          photo: current?.photos?.[0]?.url || "",
        };
      }, []);
      const otherContactResponse: IContactResponse[] = [];
      (allResponse[1]?.result?.results || []).forEach((contact: any) => {
        const { person: { emailAddresses = [], names = [] } = {} } =
          contact || {};
        const userExistsInContact = contacts.find(
          (d: IContactResponse) => d.email === emailAddresses[0]?.value
        );
        if (!userExistsInContact) {
          otherContactResponse.push({
            name: names[0]?.displayName || "",
            email: emailAddresses[0]?.value || "",
            photo: "",
          });
        }
      });
      setSearchedData([...otherContactResponse, ...contacts] || []);
    } catch (err) {
      setSearchedData([]);
    }
  };

  useEffect(() => {
    if (debounceText) {
      searchContacts(debounceText);
    } else {
      setSearchedData([]);
    }
  }, [debounceText]);

  const handleUserPermissionGrant = () => {
    if (!newFile) {
      handleGrantPermission(
        selectedUserFromDropdown,
        userPermissionToGrant,
        id,
        onSuccess,
        name,
        messageApi
      );
    } else {
      if (setUserList && setPermission) {
        setUserList(selectedUserFromDropdown);
        setPermission(userPermissionToGrant);
        onBack();
      }
    }
  };

  return (
    <div>
      <div>
        <ArrowLeftOutlined className="mb-2" onClick={onBack} />
      </div>
      <Select
        value={selectedUserFromDropdown}
        mode="multiple"
        showSearch
        placeholder="Add people and groups"
        className="mb-2 w-full"
        defaultActiveFirstOption={false}
        suffixIcon={null}
        filterOption={false}
        onSearch={(e) => {
          setSearchText(e);
        }}
        notFoundContent={null}
        options={searchedData.map(({ name, email, photo }) => ({
          value: email,
          label: (
            <div className="flex items-center gap-2">
              {photo ? (
                <img src={photo} className="w-5 h-5 rounded-full" />
              ) : (
                <Avatar
                  style={{ backgroundColor: "#fde3cf", color: "#f56a00" }}
                  size={"small"}
                >
                  {(name || email)?.charAt(0).toUpperCase()}
                </Avatar>
              )}{" "}
              {`${name} - ${email}`}
            </div>
          ),
        }))}
        onChange={(e) => {
          setSelectedUserFromDropdown(e);
          setSearchedData([]);
        }}
        autoFocus
      />
      {selectedUserFromDropdown.length > 0 && (
        <div className="flex items-center gap-2 justify-end">
          <Select
            defaultValue={userPermissionToGrant}
            style={{ width: "120px" }}
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
            onChange={setUserPermissionToGrant}
          />
          <Button onClick={handleUserPermissionGrant}>Grant Permission</Button>
        </div>
      )}
    </div>
  );
}

export default NewUserPermission;
