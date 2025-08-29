import { useEffect } from "react";

function TranslationProcess({ text, sourceLang, targetLang, setTranslatedText }) {
  useEffect(() => {
    if (!text.trim()) {
      setTranslatedText("");
      return;
    }

    const fetchTranslation = async () => {
      try {
        const response = await fetch("https://libre-railway-production.up.railway.app/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: text,
            source: sourceLang,
            target: targetLang,
            format: "text"
          })
        });

        const data = await response.json();
        console.log("Translation response:", data);

        if (data?.translatedText) {
          setTranslatedText(data.translatedText);
        } else {
          throw new Error("Invalid translation response");
        }
      } catch (error) {
        setTranslatedText("Translation failed.");
        console.error("Translation error:", error);
      }
    };

    fetchTranslation();
  }, [text, sourceLang, targetLang, setTranslatedText]);

  return null; // invisible component
}

export default TranslationProcess;
