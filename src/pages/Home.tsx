import Playground from "../components/Playground";
import Sidenav from "../components/Sidenav";

function Home() {
  return (
    <div className="page-container">
      <Sidenav showMyDrive />
      <Playground />
    </div>
  );
}

export default Home;
