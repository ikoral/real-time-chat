import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

const ANIMALS = [
  "Lion",
  "Tiger",
  "Elephant",
  "Giraffe",
  "Zebra",
  "Kangaroo",
  "Panda",
  "Bear",
  "Wolf",
  "Fox",
];

const STORAGE_KEY = "chat_username";

const generateUserName = () => {
  const word = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${word}-${nanoid(5)}`;
};

export const useUsername = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const main = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserName(stored);
        return;
      } else {
        const newUserName = generateUserName();
        setUserName(newUserName);
        localStorage.setItem(STORAGE_KEY, newUserName);
      }
    };

    main();
  }, []);

  return { userName };
};
