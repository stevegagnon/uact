import { render, useState, createElement } from './core';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count => count + 1)}>{count}</button>
  );
}

render(<Counter />, document.getElementById('root'));
