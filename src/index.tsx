import { render, useState, useEffect, createElement, useRef } from './core';

function Header({ n }) {
  return <h1>{n}</h1>;
}

function Counter() {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    console.log(count, ref.current);
  }, [count]);

  return (
    <div>
      <input ref={input}></input>
      <Header n="header"></Header>
      <button ref={ref} onClick={() => setCount(count => count + 1)}>{count}</button>
      <button onClick={() => input.current.focus()}>focus</button>
      {count % 4 === 3 && (<div>test</div>)}
    </div>
  );
}

render(<Counter />, document.getElementById('root1'));
render(<Counter />, document.getElementById('root2'));
