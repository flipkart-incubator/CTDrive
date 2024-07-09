import { createBrowserRouter } from "react-router-dom";

import Folder from "@/pages/Folder";
import Home from "@/pages/Home";
import { PageLayout } from "@/components/PageLayout";

import { PAGE_ROUTES } from "@/constants/network";

const ORG_DIRECTORY_ID = import.meta.env.VITE_ROOT_ORG_FOLDER_ID;

const HOME_PAGE_COMPONENT = ORG_DIRECTORY_ID ? (
  <Folder orgFolderId={ORG_DIRECTORY_ID} />
) : (
  <Home />
);

export const router = createBrowserRouter([
  {
    path: PAGE_ROUTES.FOLDER + "/:folderId",
    element: (
      <PageLayout>
        <Folder />
      </PageLayout>
    ),
  },
  {
    path: PAGE_ROUTES.MY_DRIVE,
    element: (
      <PageLayout>
        <Home />
      </PageLayout>
    ),
  },
  {
    path: PAGE_ROUTES.HOME,
    element: <PageLayout>{HOME_PAGE_COMPONENT}</PageLayout>,
  },
  {
    path: "*",
    element: <PageLayout>{HOME_PAGE_COMPONENT}</PageLayout>,
  },
]);
