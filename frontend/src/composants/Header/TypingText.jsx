import React, { useState, useEffect } from "react";

// Effet machine à écrire qui boucle sur une liste de textes
export default function TypingText({ words = [], typingSpeed = 100, deletingSpeed = 50, pauseTime = 1500 }) {
    const [wordIndex, setWordIndex] = useState(0);
    const [text, setText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex];
        let timeout;

        if (!isDeleting && text === currentWord) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && text === "") {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % words.length);
        } else {
            timeout = setTimeout(() => {
                setText((prev) =>
                    isDeleting
                        ? currentWord.slice(0, prev.length - 1)
                        : currentWord.slice(0, prev.length + 1)
                );
            }, isDeleting ? deletingSpeed : typingSpeed);
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

    return <span className="typing-text">{text}</span>;
}
