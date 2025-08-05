import TranslateLeft from './TranslateLeft.jsx'; 
import TranslateRight from './TranslateRight.jsx';
import TranslationProcess from './TranslationProcess.jsx';
import { useState } from 'react';
function App() {
  const [inputText, setInputText] = useState("");
  const [inputLang, setInputLang] = useState("en");
  const [outputLang, setOutputLang] = useState("hi");
  const [translatedText, setTranslatedText] = useState("");
  return(
    <>
      <div>
        <div className='div1'>
          <TranslateLeft 
            inputText={inputText} 
            setInputText={setInputText}
            inputLang={inputLang}
            setInputLang={setInputLang}
          />
          <TranslationProcess 
            text={inputText}
            sourceLang={inputLang}
            targetLang={outputLang}
            setTranslatedText={setTranslatedText}
          />
          <TranslateRight 
            translatedText={translatedText}
            outputLang={outputLang}
            setOutputLang={setOutputLang}
          />
        </div>
      </div>
      </>
  );
}