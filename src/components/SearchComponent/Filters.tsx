import { SEARCH_FILTER_OPTIONS } from "@/constants/general";
import { FilterOutlined } from "@ant-design/icons";
import { Button, Popover, Radio, RadioChangeEvent } from "antd";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { useEffect, useState } from "react";

function Filters({
  onCheckBoxChange,
  values,
}: {
  onCheckBoxChange: (value: CheckboxValueType[]) => void;
  values: CheckboxValueType[];
}) {
  const handleRadioChange = (e: RadioChangeEvent) => {
    onCheckBoxChange([e.target.value]);
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
      <Popover
        zIndex={1050}
        content={
          <div className="flex items-start">
            <Radio.Group
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
              onChange={handleRadioChange}
              value={values[0]}
            >
              <Radio
                value={SEARCH_FILTER_OPTIONS.INCLUDE_FILE}
                onClick={(e) => e.stopPropagation()}
              >
                Include File Text
              </Radio>
              <Radio
                value={SEARCH_FILTER_OPTIONS.INCLUDE_FOLDERS}
                onClick={(e) => e.stopPropagation()}
              >
                Include Folder
              </Radio>
            </Radio.Group>
            <Button
              className={`ml-auto`}
              type="link"
              size="small"
              onClick={() => {
                onCheckBoxChange([]);
              }}
            >
              Clear
            </Button>
          </div>
        }
        placement="bottom"
        trigger={"click"}
      >
        <Button
          className={`ml-2 ${windowWidth >= 1280 ? "" : "py-1"}${
            values.length ? "text-blue-600 border-blue-600" : ""
          }`}
        >
          {windowWidth >= 1280 ? "Filter" : ""} <FilterOutlined />
        </Button>
      </Popover>
    </>
  );
}

export default Filters;
