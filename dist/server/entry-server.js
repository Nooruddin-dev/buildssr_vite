import { jsxs, jsx } from "react/jsx-runtime";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.mjs";
import { Link, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch, Provider } from "react-redux";
import { createSlice, combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage$1 from "redux-persist/lib/storage/index.js";
import createWebStorage from "redux-persist/lib/storage/createWebStorage.js";
function PageWrapper({ children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("header", { style: { display: "flex", gap: "1rem", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx(Link, { to: "/", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/about", children: "About" }),
      /* @__PURE__ */ jsx(Link, { to: "/general-data/overview", children: "SectorPage" })
    ] }),
    children
  ] });
}
const persistedSlice = createSlice({
  name: "persisted",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    }
  }
});
const { increment, decrement } = persistedSlice.actions;
const persistedReducer = persistedSlice.reducer;
function Home({ serverData }) {
  const count = useSelector((state) => state.persisted.value);
  const dispatch = useDispatch();
  return /* @__PURE__ */ jsxs(PageWrapper, { children: [
    /* @__PURE__ */ jsx("h1", { children: "Welcome to the Home Pages" }),
    serverData && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: "Server Data:" }),
      /* @__PURE__ */ jsxs("h2", { children: [
        "Count: ",
        count
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => dispatch(increment()), children: "add" }),
      /* @__PURE__ */ jsx("button", { onClick: () => dispatch(decrement()), children: "minus" }),
      /* @__PURE__ */ jsx("pre", { children: JSON.stringify(serverData, null, 2) })
    ] })
  ] });
}
Home.fetchData = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = await response.json();
  return data;
};
function About() {
  return /* @__PURE__ */ jsx(PageWrapper, { children: "About" });
}
function generateHead(data) {
  return `
      <title>${data.title}</title>
      <meta name="description" content="${data.description}" />
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.description}" />
      <meta property="og:image" content="${data.image}" />
      <meta property="og:url" content="${data.url}" />
    `;
}
function SectorPage({ serverData }) {
  return /* @__PURE__ */ jsxs(PageWrapper, { children: [
    /* @__PURE__ */ jsx("h1", { children: "Sector Page" }),
    serverData && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { children: "Server Data:" }),
      /* @__PURE__ */ jsx("pre", { children: JSON.stringify(serverData, null, 2) })
    ] })
  ] });
}
SectorPage.getMetaInfo = async () => {
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: "Argaam Macro - General Data - Macroeconmic Data",
        description: "This is the home page of general data macroecononmic data",
        image: "https://example.com/og-image.jpg",
        url: "https://example.com"
      });
    }, 2e3);
  });
  const res = await promise;
  const headData = generateHead(res);
  return headData;
};
function App({ serverData }) {
  return /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Home, { serverData }) }),
    /* @__PURE__ */ jsx(Route, { path: "/about", element: /* @__PURE__ */ jsx(About, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/:sector/:subSector", element: /* @__PURE__ */ jsx(SectorPage, { serverData }) })
  ] });
}
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    }
  };
};
const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();
const defaultSlice = createSlice({
  name: "default",
  initialState: { data: null },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    }
  }
});
const { setData } = defaultSlice.actions;
const defaultReducer = defaultSlice.reducer;
const persistConfig = {
  key: "root",
  storage: typeof window !== "undefined" ? storage$1 : storage,
  whitelist: ["persisted"]
  // only persisted will be persisted
};
const rootReducer = combineReducers({
  persisted: persistedReducer,
  default: defaultReducer
});
const persistedRootReducer = persistReducer(persistConfig, rootReducer);
const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});
persistStore(store);
async function render(url) {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/");
  const serverdatalist = await response.json();
  store.dispatch(setData(serverdatalist));
  let serverData = null;
  let head = null;
  if (url === "") {
    serverData = await Home.fetchData();
  }
  if (url === "general-data/overview") {
    head = await SectorPage.getMetaInfo();
  }
  const preloadedState = store.getState();
  const html = ReactDOMServer.renderToString(
    /* @__PURE__ */ jsx(Provider, { store, children: /* @__PURE__ */ jsx(StaticRouter, { location: url, children: /* @__PURE__ */ jsx(App, { serverData }) }) })
  );
  return { html, serverData, head, preloadedState };
}
export {
  render
};
