import "./App.css";
import React, { useState, useEffect } from "react";
import ReadwiseHighlight from "./ReadwiseHighlight";
import browserAPI from "./BrowserApi/CacheAccessor";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { ChevronUpIcon } from "@heroicons/react/solid";
import { Disclosure } from "@headlessui/react";
import { ButtonStates } from "./ImportButton";
import ImportBook from "./ImportBook";

const editIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-green-300"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const posts = [
  {
    href: "http://paulgraham.com/quo.html",
    category: { name: "Book" },
    description:
      "Import Paul Graham's favorite quotes into your Readwise account",
    author: {
      name: "Paul Graham",
      href: "http://paulgraham.com",
      imageUrl:
        "https://pbs.twimg.com/profile_images/1824002576/pg-railsconf_400x400.jpg",
    },
    source: "https://readwise-new-tab.s3.amazonaws.com/paul_graham_quotes.csv",
  },
  {
    href: "https://mailbrew.com/library/naval-ravikant/top-tweets",
    category: { name: "Book" },
    description:
      "Import Naval Ravikant's best tweets into your Readwise account",
    author: {
      name: "Naval Ravikant",
      href: "http://nav.al",
      imageUrl:
        "https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2.jpg",
    },
    source:
      "https://readwise-new-tab.s3.amazonaws.com/best_naval_ravikant_tweets.csv",
  },
];

function App() {
  const [quoteAndCover, setQuoteAndCover] = useState({
    quote: "",
    cover: "",
    id: "",
  });
  const [token, setToken] = useState("");
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [tokenIsStored, setTokenIsStored] = useState(false);
  const [editingToken, setTokenIsEditing] = useState(false);
  const [isTokenWrong, setIsTokenWrong] = useState(false);
  // store this in localStorage
  const [importButtonState, setImportButtonState] = useState<ButtonStates>(
    ButtonStates.BASE
  );
  const [highlightBookUrl, setHighlightBookUrl] = useState("");
  function getHighlight(token: string) {
    browserAPI.sendMessage(
      { type: "get_highlight", token: token },
      (quoteAndCover) => {
        if (quoteAndCover) {
          setQuoteAndCover(quoteAndCover);
        }
      }
    );
  }
  async function getToken() {
    await browserAPI.get("readwiseToken", (token) => {
      //todo: fix this to not call multiple setStates
      setTokenIsStored(Boolean(token));
      setShowTokenForm(true);
      if (token) {
        getHighlight(token);
        setToken(token);
      }
    });
  }

  useEffect(() => {
    const importButtonState = localStorage.getItem("importButtonState");
    if (importButtonState === ButtonStates.LOADED.toString()) {
      setImportButtonState(ButtonStates.LOADED);
    }
    const highlightBookUrl = localStorage.getItem("importBookUrl");

    if (highlightBookUrl) {
      setHighlightBookUrl(highlightBookUrl);
    }
    getToken();
  }, []);

  function storeToken(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetch("https://readwise.io/api/v2/auth", {
      method: "Get",
      mode: "cors",
      headers: {
        Authorization: `TOKEN ${token}`,
      },
    }).then((res) => {
      if (res.status === 204) {
        setIsTokenWrong(false);
        browserAPI.store("readwiseToken", token, () => {
          setTokenIsStored(true);
          setTokenIsEditing(false);
          browserAPI.sendMessage(
            { type: "get_highlight", token },
            (quoteAndCover) => {
              if (quoteAndCover) {
                setQuoteAndCover(quoteAndCover);
              }
            }
          );
        });
      } else {
        setIsTokenWrong(true);
      }
    });
  }

  return (
    <div className="test">
      {showTokenForm &&
        (tokenIsStored && !editingToken ? (
          <div className="m-3 flex space-x-2 items-center">
            <span className="text-white font-semibold"> Token stored </span>
            <button
              onClick={() => {
                setTokenIsEditing(!editingToken);
              }}
            >
              <span title="Change your token"> {editIcon}</span>
            </button>
          </div>
        ) : (
          <form
            className="max-w-lg m-2 outline-white p-2"
            onSubmit={storeToken}
          >
            <div>
              <label
                htmlFor="token"
                className="block text-base font-medium text-white"
              >
                Token
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  className={` ${
                    isTokenWrong ? "border-2 border-red-500" : ""
                  } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-1`}
                  id="token"
                  name="token"
                  onChange={(e) => setToken(e.target.value)}
                  value={token}
                />
                {isTokenWrong && (
                  <div className="flex space-x-1 items-center font-semibold text-sm text-red-500 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      The token is incorrect.
                      <br /> Make sure you copied it properly or{" "}
                      <a className="underline" href="mailto:hey@tedis.me">
                        contact support
                      </a>{" "}
                      for help.
                    </span>
                  </div>
                )}
                <div className="text-gray-300 mt-1">
                  Your Readwise Auth Token.{" "}
                  <a
                    className="underline"
                    href="https://readwise.io/access_token"
                    target="_blank"
                  >
                    Get it here
                  </a>{" "}
                  or click the extension icon.
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="bg-red-400 text-white font-semibold rounded p-2 mt-5"
            >
              Store token
            </button>
          </form>
        ))}
      <div className="mt-4 ml-2 w-56 xl:absolute">
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-medium text-left text-purple-900 bg-purple-100 rounded-lg hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                <span>Import a book!</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium  bg-red-200 text-red-800">
                  New
                </span>
                <ChevronUpIcon
                  className={`${
                    open ? "transform rotate-180" : ""
                  } w-5 h-5 text-purple-500`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                {posts.map((post) => (
                  <ImportBook post={post} token={token} />
                ))}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <ReadwiseHighlight
        quoteAndCover={quoteAndCover}
        getHighlight={() => {
          getHighlight(token);
        }}
      />
      <div className="absolute bottom-3 right-3 text-white">
        <span className="font-bold">Readwise New Tab</span>{" "}
        <span> brought to you by </span>
        <a
          className="underline text-white"
          href="https://tedis.me"
          target="_blank"
        >
          Tedis
        </a>
        <span role="img" aria-label="wave">
          {" "}
          👋
        </span>
      </div>
    </div>
  );
}

export default App;
