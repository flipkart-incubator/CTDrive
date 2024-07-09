import { Button } from "antd";

function Logout() {
  return (
    <Button
      onClick={async () => {
        const gauth = window?.gapi.auth2.getAuthInstance();
        await gauth.signOut();
        window.location.reload();
      }}
    >
      Logout
    </Button>
  );
}

export default Logout;
