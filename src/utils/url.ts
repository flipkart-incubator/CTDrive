import { PAGE_ROUTES } from "@/constants/network";

export const getCTDriveRedirectUrl = ({
  parentId,
  fileId,
}: {
  parentId?: string;
  fileId: string;
}) => {
  if (parentId) {
    return `${PAGE_ROUTES.FOLDER}/${parentId}?fileId=${fileId}&parentId=${parentId}`;
  } else {
    return `${PAGE_ROUTES.HOME}?fileId=${fileId}`;
  }
};
