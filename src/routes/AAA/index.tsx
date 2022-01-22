import React, { useState } from 'react';
import { Button } from 'antd';

const AAA: React.FC = (props) => {
  const [count, setCount] = useState(0);
  const { children } = props;
  const handleClick = () => {
    console.log(count);
  };
  return (
    <div>
      <Button
        onClick={() => {
          setCount((prev) => prev + 1);
          handleClick();
        }}
      >
        count1112223333
      </Button>
      {children}
    </div>
  );
};

export default AAA;
