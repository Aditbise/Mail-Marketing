import './index.css';
import copying from './assets/copy.png';

function TranslateRight({ translatedText, outputLang, setOutputLang }) {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
  ];

  return (
    <>
    <div className="rdiv">
      <div className="selectandtypediv">
        <div className="innerdiv">
          <h1 className="translationhere">Translation Here:</h1>
        </div>
        <div>
          <select 
            className="selectlang" 
            value={outputLang}
            onChange={(e) => setOutputLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <div><img src={copying} className="imagecopy" alt="copy" /></div>
      </div>
      <div>
        <textarea
          placeholder="Translation Here"
          value={translatedText}
          readOnly
        />
      </div>
    </div>
    </>
  );
}

export default TranslateRight;
