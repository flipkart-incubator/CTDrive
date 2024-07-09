import { PERMISSIONS_ROLES } from "@/constants/googledrive";
import { MessageInstance } from "antd/es/message/interface";

export interface INewUserPermissionProps {
  onBack: () => void;
  messageApi: MessageInstance;
  onSuccess: () => void;
  newFile?: boolean;
  setUserList?: (data: never[]) => void;
  setPermission?: (data: PERMISSIONS_ROLES) => void;
}

export interface IContactResponse {
  name: string;
  email: string;
  photo: string;
}
