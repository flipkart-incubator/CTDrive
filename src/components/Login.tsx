import { useUserStore } from "@/store";
import { Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

function Login() {
  const { checkUserDetails } = useUserStore();
  const handleUserLogin = () => {
    const googleAuth = window?.gapi.auth2.getAuthInstance();
    googleAuth
      ?.signIn({
        prompt: "select_account",
      })
      .then(() => {
        checkUserDetails();
      });
  };

  return (
    <Button onClick={handleUserLogin}>
      <GoogleOutlined /> Login with google
    </Button>
  );
}

export default Login;
