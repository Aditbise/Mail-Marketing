import './index.css';
import copying from './assets/copy.png';

function TranslateLeft({ inputText, setInputText, inputLang, setInputLang }) {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
  ];

  return (
    <div className="ldiv">
      <div className="selectandtypediv">
        <div className="innerdiv">
          <h1 className="typehere">Type Here:</h1>
        </div>
        <div>
          <select
            className="selectlang"
            value={inputLang}
            onChange={(e) => setInputLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <img src={copying} className="imagecopy" alt="copy" />
        </div>
      </div>
      <div>
        <textarea
          placeholder="Type Here"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>
    </div>
  );
}

export default TranslateLeft;
