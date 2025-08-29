import { useState } from "react";
function Practice(props){
     return(
        <div className="div1">
            <p>Name:{props.name}</p>
            <p>age={props.age}</p>
            <p>Is Student?={props.isStudent ? "Yes" : "No"}</p>
        </div>
     );
}
export default Practice; 