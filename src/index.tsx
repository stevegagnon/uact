import { render, useState, useEffect, createElement, useRef } from './core';

function Header({ n }) {
  return <h1>{n}</h1>;
}

function Counter() {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    // console.log(count);
    console.log(count, ref.current);
  }, [count]);

  return (
    <div>
      <Header n="header"></Header>
      <button ref={ref} onClick={() => setCount(count => count + 1)}>{count}</button>
      {count % 4 === 3 && (<div>test</div>)}
    </div>
  );
}

render(<Counter />, document.getElementById('root1'));
render(<Counter />, document.getElementById('root2'));
