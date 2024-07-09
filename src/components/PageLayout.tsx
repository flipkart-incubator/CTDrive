import { Layout } from "antd";
import Toolbar from "./Toolbar";
import { LoadingOutlined } from "@ant-design/icons";
import { PropsWithChildren } from "react";
import { useUserStore } from "@/store";

const { Header, Content } = Layout;
export const PageLayout = (props: PropsWithChildren) => {
  const { children } = props;
  const { userDetails, isLoading } = useUserStore();

  return (
    <Layout className="page bg-white">
      <Header
        className="bg-white border-b-gray-200 border-b-2 h-[56px] px-5"
        style={{
          borderBottomStyle: "solid",
        }}
      >
        <Toolbar />
      </Header>
      <Content className="bg-white">
        {isLoading ? (
          <div className="h-full w-full flex flex-col align-middle items-center justify-center">
            <div>
              <LoadingOutlined className="text-6xl" />
            </div>
          </div>
        ) : userDetails?.isSignedIn ? (
          children
        ) : (
          <div className="h-screen flex flex-col align-middle w-full justify-center items-center text-xl">
            Please Sign in
            {import.meta.env.VITE_README_FILE_URL && (
              <div className="text-sm mt-1 text-gray-600">
                Facing trouble with login? Try enable third party cookies in
                browser settings{" "}
                <a
                  href={import.meta.env.VITE_README_FILE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  More Info
                </a>
              </div>
            )}
          </div>
        )}
      </Content>
    </Layout>
  );
};
