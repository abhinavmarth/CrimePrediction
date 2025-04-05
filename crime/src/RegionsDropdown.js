import React from "react";
import { FixedSizeList as List } from "react-window";

const RegionDropdown = ({ options, onChange }) => {
  const Row = ({ index, style }) => (
    <div
      style={{
        ...style,
        padding: "10px",
        cursor: "pointer",
        borderBottom: "1px solid #ddd",
        background: "#fff",
      }}
      onClick={() => onChange(options[index])}
    >
      {options[index].label}
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      <List
        height={200}
        itemCount={options.length}
        itemSize={40}
        width={"100%"} // Let it stretch to fit container
      >
        {Row}
      </List>
    </div>
  );
};

export default RegionDropdown;
