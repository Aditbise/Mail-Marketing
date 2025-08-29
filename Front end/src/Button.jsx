// import React, { useState } from "react";
// function Button(){
//     const Click=()=>console.log("Ouch");
//     const Click1= (name) =>console.log(`${name} stop clicking me`);
//     const [name,setName]=useState("Guest");
//     const [count,setCount]=useState(0);
    
    
    
//     const updateName=()=>{      setName("Polo Bear");    }
//     const updateName1=()=>{        setName("");    }    
//     const updateCount=()=>{        setCount(count+1);    }
//     const updateCountd=()=>{        setCount(count-1);    }
    
    
//     const [msg,setMsg]=useState("");
//     const updateMessage=()=>{
//         setMsg(`Hello ${name} you clicked ${count} times`);
//     }
//     return(
//         <div>
//             <p>Name : {name}</p>
//             <input type="text"  placeholder="Enter name" onChange={(e)=>setName(e.target.value)} />
//             <button onClick={updateName}>Click to display name</button><br></br><br></br>
//             <button onClick={updateName1}>Click to cover name</button>
//             <p>Count : {count}</p>

//             <button onClick={() => updateMessage()}>Click Me</button>
//             <p>{msg}</p>

//             <button onClick={updateCount}>Click Me to incremant</button>
//             <button onClick={updateCountd}>Click Me to decremant</button><br></br><br></br>
//         </div>
//     );
// }
// export default Button;
import { useState } from 'react';

function Form() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [msg, setMsg] = useState('');

  const handleClick = () => {
    setMsg(`Hello ${name}, you are ${age} years old.`);
  };

  return (
    <div >
      <input
        type="text"
        placeholder="Enter name"
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <input
        type="number"
        placeholder="Enter age"
        onChange={(e) => setAge(e.target.value)}
      />
      <br /><br />
      <button onClick={handleClick}>Show</button>
      <p>{msg}</p>
    </div>
  );
}

export default Form;
