import SearchIcon from "@/assets/SearchIcon";
import { Input, Popover } from "antd";
import { useEffect, useState } from "react";
import SuggestionDropdown from "./SuggestionDropdown";
import { OutsideClickHandler } from "@cleartrip/ct-design-outside-click-handler";
import Filters from "./Filters";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { CloseOutlined } from "@ant-design/icons";

function SearchComponent() {
  const [focus, setFocus] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterOptions, setFilterOptions] = useState<CheckboxValueType[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const handleCLose = () => {
    setFocus(false);
  };
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <OutsideClickHandler onOutsideClick={handleCLose}>
        <Popover
          content={
            <SuggestionDropdown
              searchText={searchText}
              onClose={handleCLose}
              filterOptions={filterOptions}
            />
          }
          arrow={false}
          open={!!searchText.length && focus}
          overlayInnerStyle={{ paddingBottom: "0px" }}
        >
          <Input
            placeholder="Search"
            prefix={<SearchIcon height={16} width={16} />}
            onFocus={() => setFocus(true)}
            style={{
              width:
                windowWidth >= 1380 ? 300 : windowWidth >= 1280 ? 200 : 100,
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            suffix={
              searchText.length && (
                <span
                  className="cursor-pointer"
                  onClick={() => setSearchText("")}
                >
                  <CloseOutlined />
                </span>
              )
            }
          />
        </Popover>
        <Filters onCheckBoxChange={setFilterOptions} values={filterOptions} />
      </OutsideClickHandler>
    </>
  );
}

export default SearchComponent;
