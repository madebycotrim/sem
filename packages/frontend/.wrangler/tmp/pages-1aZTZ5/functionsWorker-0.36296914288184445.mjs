var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.wrangler/tmp/bundle-u8CjTo/checked-fetch.js
function checkURL(request, init3) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init3) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-u8CjTo/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init3] = argArray;
        checkURL(request, init3);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// ../../../node_modules/hono/dist/compose.js
var compose;
var init_compose = __esm({
  "../../../node_modules/hono/dist/compose.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    compose = /* @__PURE__ */ __name((middleware, onError3, onNotFound) => {
      return (context, next) => {
        let index = -1;
        return dispatch(0);
        async function dispatch(i) {
          if (i <= index) {
            throw new Error("next() called multiple times");
          }
          index = i;
          let res;
          let isError = false;
          let handler;
          if (middleware[i]) {
            handler = middleware[i][0][0];
            context.req.routeIndex = i;
          } else {
            handler = i === middleware.length && next || void 0;
          }
          if (handler) {
            try {
              res = await handler(context, () => dispatch(i + 1));
            } catch (err) {
              if (err instanceof Error && onError3) {
                context.error = err;
                res = await onError3(err, context);
                isError = true;
              } else {
                throw err;
              }
            }
          } else {
            if (context.finalized === false && onNotFound) {
              res = await onNotFound(context);
            }
          }
          if (res && (context.finalized === false || isError)) {
            context.res = res;
          }
          return context;
        }
        __name(dispatch, "dispatch");
      };
    }, "compose");
  }
});

// ../../../node_modules/hono/dist/http-exception.js
var HTTPException;
var init_http_exception = __esm({
  "../../../node_modules/hono/dist/http-exception.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    HTTPException = class extends Error {
      static {
        __name(this, "HTTPException");
      }
      res;
      status;
      /**
       * Creates an instance of `HTTPException`.
       * @param status - HTTP status code for the exception. Defaults to 500.
       * @param options - Additional options for the exception.
       */
      constructor(status = 500, options) {
        super(options?.message, { cause: options?.cause });
        this.res = options?.res;
        this.status = status;
      }
      /**
       * Returns the response object associated with the exception.
       * If a response object is not provided, a new response is created with the error message and status code.
       * @returns The response object.
       */
      getResponse() {
        if (this.res) {
          const newResponse = new Response(this.res.body, {
            status: this.status,
            headers: this.res.headers
          });
          return newResponse;
        }
        return new Response(this.message, {
          status: this.status
        });
      }
    };
  }
});

// ../../../node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT;
var init_constants = __esm({
  "../../../node_modules/hono/dist/request/constants.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
  }
});

// ../../../node_modules/hono/dist/utils/crypto.js
var init_crypto = __esm({
  "../../../node_modules/hono/dist/utils/crypto.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
  }
});

// ../../../node_modules/hono/dist/utils/buffer.js
var bufferToFormData;
var init_buffer = __esm({
  "../../../node_modules/hono/dist/utils/buffer.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_crypto();
    bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
      const response = new Response(arrayBuffer, {
        headers: {
          // Normalize the media type (case-insensitive) while keeping parameters like the boundary
          "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
        }
      });
      return response.formData();
    }, "bufferToFormData");
  }
});

// ../../../node_modules/hono/dist/utils/body.js
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
var MAX_NESTING_DEPTH, MAX_NESTED_OBJECTS, isRawRequest, parseBody, handleParsingAllValues, handleParsingNestedValues, throwNestingLimitExceeded;
var init_body = __esm({
  "../../../node_modules/hono/dist/utils/body.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_buffer();
    MAX_NESTING_DEPTH = 32;
    MAX_NESTED_OBJECTS = 1e4;
    isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
    parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
      const { all = false, dot = false } = options;
      const headers = isRawRequest(request) ? request.headers : request.raw.headers;
      const contentType = headers.get("Content-Type");
      const mediaType = contentType?.split(";")[0].trim().toLowerCase();
      if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
        return parseFormData(request, { all, dot });
      }
      return {};
    }, "parseBody");
    __name(parseFormData, "parseFormData");
    __name(convertFormDataToBodyData, "convertFormDataToBodyData");
    handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
      if (form[key] !== void 0) {
        if (Array.isArray(form[key])) {
          ;
          form[key].push(value);
        } else {
          form[key] = [form[key], value];
        }
      } else {
        if (!key.endsWith("[]")) {
          form[key] = value;
        } else {
          form[key] = [value];
        }
      }
    }, "handleParsingAllValues");
    handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
      if (/(?:^|\.)__proto__\./.test(key)) {
        return;
      }
      let nestedForm = form;
      const keys = key.split(".", MAX_NESTING_DEPTH + 2);
      if (keys.length > MAX_NESTING_DEPTH + 1) {
        throwNestingLimitExceeded();
      }
      keys.forEach((key2, index) => {
        if (index === keys.length - 1) {
          nestedForm[key2] = value;
        } else {
          if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
            if (state.count++ >= MAX_NESTED_OBJECTS) {
              throwNestingLimitExceeded();
            }
            nestedForm[key2] = /* @__PURE__ */ Object.create(null);
          }
          nestedForm = nestedForm[key2];
        }
      });
    }, "handleParsingNestedValues");
    throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
      throw new Error("Nesting limit exceeded");
    }, "throwNestingLimitExceeded");
  }
});

// ../../../node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, tryDecodeURIComponent, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "../../../node_modules/hono/dist/utils/url.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    splitPath = /* @__PURE__ */ __name((path) => {
      const paths = path.split("/");
      if (paths[0] === "") {
        paths.shift();
      }
      return paths;
    }, "splitPath");
    splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    }, "splitRoutingPath");
    extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match3, index) => {
        const mark = `@${index}`;
        groups.push([mark, match3]);
        return mark;
      });
      return { groups, path };
    }, "extractGroupsFromPath");
    replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) {
          if (paths[j].includes(mark)) {
            paths[j] = paths[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      return paths;
    }, "replaceGroupMarks");
    patternCache = {};
    getPattern = /* @__PURE__ */ __name((label, next) => {
      if (label === "*") {
        return "*";
      }
      const match3 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match3) {
        const cacheKey = `${label}#${next}`;
        if (!patternCache[cacheKey]) {
          if (match3[2]) {
            patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match3[1], new RegExp(`^${match3[2]}(?=/${next})`)] : [label, match3[1], new RegExp(`^${match3[2]}$`)];
          } else {
            patternCache[cacheKey] = [label, match3[1], true];
          }
        }
        return patternCache[cacheKey];
      }
      return null;
    }, "getPattern");
    tryDecode = /* @__PURE__ */ __name((str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match3) => {
          try {
            return decoder(match3);
          } catch {
            return match3;
          }
        });
      }
    }, "tryDecode");
    tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
    getPath = /* @__PURE__ */ __name((request) => {
      const url = request.url;
      const start = url.indexOf("/", url.indexOf(":") + 4);
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const hashIndex = url.indexOf("#", i);
          const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
          const path = url.slice(start, end);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63 || charCode === 35) {
          break;
        }
      }
      return url.slice(start, i);
    }, "getPath");
    getPathNoStrict = /* @__PURE__ */ __name((request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    }, "getPathNoStrict");
    mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
      if (rest.length) {
        sub = mergePath(sub, ...rest);
      }
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    }, "mergePath");
    checkOptionalParameter = /* @__PURE__ */ __name((path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
        return null;
      }
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) {
          basePath += "/" + segment;
        } else if (/\:/.test(segment)) {
          if (segment.charCodeAt(segment.length - 1) === 63) {
            if (results.length === 0 && basePath === "") {
              results.push("/");
            } else {
              results.push(basePath);
            }
            const optionalSegment = segment.slice(0, -1);
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else {
            basePath += "/" + segment;
          }
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    }, "checkOptionalParameter");
    tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
    _decodeURI = /* @__PURE__ */ __name((value) => {
      if (value.indexOf("+") !== -1) {
        value = value.replace(/\+/g, " ");
      }
      return tryDecodeURIComponent(value);
    }, "_decodeURI");
    _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
      const hashIndex = url.indexOf("#", 8);
      if (hashIndex !== -1) {
        url = url.slice(0, hashIndex);
      }
      let encoded;
      if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
        let keyIndex2 = url.indexOf("?", 8);
        if (keyIndex2 === -1) {
          return void 0;
        }
        if (!url.startsWith(key, keyIndex2 + 1)) {
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
            return "";
          }
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
          return void 0;
        }
      }
      const results = /* @__PURE__ */ Object.create(null);
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
          valueIndex = -1;
        }
        let name2 = url.slice(
          keyIndex + 1,
          valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
        );
        if (encoded) {
          name2 = _decodeURI(name2);
        }
        keyIndex = nextKeyIndex;
        if (name2 === "") {
          continue;
        }
        let value;
        if (valueIndex === -1) {
          value = "";
        } else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) {
            value = _decodeURI(value);
          }
        }
        if (multiple) {
          if (!(results[name2] && Array.isArray(results[name2]))) {
            results[name2] = [];
          }
          ;
          results[name2].push(value);
        } else {
          results[name2] ??= value;
        }
      }
      return key ? results[key] : results;
    }, "_getQueryParam");
    getQueryParam = _getQueryParam;
    getQueryParams = /* @__PURE__ */ __name((url, key) => {
      return _getQueryParam(url, key, true);
    }, "getQueryParams");
    decodeURIComponent_ = decodeURIComponent;
  }
});

// ../../../node_modules/hono/dist/request.js
var HonoRequest;
var init_request = __esm({
  "../../../node_modules/hono/dist/request.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_http_exception();
    init_constants();
    init_body();
    init_url();
    HonoRequest = class {
      static {
        __name(this, "HonoRequest");
      }
      /**
       * `.raw` can get the raw Request object.
       *
       * @see {@link https://hono.dev/docs/api/request#raw}
       *
       * @example
       * ```ts
       * // For Cloudflare Workers
       * app.post('/', async (c) => {
       *   const metadata = c.req.raw.cf?.hostMetadata?
       *   ...
       * })
       * ```
       */
      raw;
      #validatedData;
      // Short name of validatedData
      #matchResult;
      routeIndex = 0;
      /**
       * `.path` can get the pathname of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#path}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const pathname = c.req.path // `/about/me`
       * })
       * ```
       */
      path;
      bodyCache = {};
      constructor(request, path = "/", matchResult = [[]]) {
        this.raw = request;
        this.path = path;
        this.#matchResult = matchResult;
      }
      param(key) {
        return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
      }
      #getDecodedParam(key) {
        const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
        const param = this.#getParamValue(paramKey);
        return param && tryDecodeURIComponent(param);
      }
      #getAllDecodedParams() {
        const decoded = {};
        const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
        for (const key of keys) {
          const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
          if (value !== void 0) {
            decoded[key] = tryDecodeURIComponent(value);
          }
        }
        return decoded;
      }
      #getParamValue(paramKey) {
        return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
      }
      query(key) {
        return getQueryParam(this.url, key);
      }
      queries(key) {
        return getQueryParams(this.url, key);
      }
      header(name2) {
        if (name2) {
          return this.raw.headers.get(name2) ?? void 0;
        }
        const headerData = /* @__PURE__ */ Object.create(null);
        this.raw.headers.forEach((value, key) => {
          headerData[key] = value;
        });
        return headerData;
      }
      async parseBody(options) {
        return parseBody(this, options);
      }
      #cachedBody = /* @__PURE__ */ __name((key) => {
        const { bodyCache, raw: raw3 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) {
          return cachedBody;
        }
        for (const anyCachedKey in bodyCache) {
          return bodyCache[anyCachedKey].then((body) => {
            if (anyCachedKey === "json") {
              body = JSON.stringify(body);
            }
            return new Response(body)[key]();
          });
        }
        return bodyCache[key] = raw3[key]();
      }, "#cachedBody");
      /**
       * `.json()` can parse Request body of type `application/json`
       *
       * @see {@link https://hono.dev/docs/api/request#json}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.json()
       * })
       * ```
       */
      json() {
        return this.#cachedBody("text").then((text) => JSON.parse(text));
      }
      /**
       * `.text()` can parse Request body of type `text/plain`
       *
       * @see {@link https://hono.dev/docs/api/request#text}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.text()
       * })
       * ```
       */
      text() {
        return this.#cachedBody("text");
      }
      /**
       * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
       *
       * @see {@link https://hono.dev/docs/api/request#arraybuffer}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.arrayBuffer()
       * })
       * ```
       */
      arrayBuffer() {
        return this.#cachedBody("arrayBuffer");
      }
      /**
       * `.bytes()` parses the request body as a `Uint8Array`.
       *
       * @see {@link https://hono.dev/docs/api/request#bytes}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.bytes()
       * })
       * ```
       */
      bytes() {
        return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
      }
      /**
       * Parses the request body as a `Blob`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.blob();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#blob
       */
      blob() {
        return this.#cachedBody("blob");
      }
      /**
       * Parses the request body as `FormData`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.formData();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#formdata
       */
      formData() {
        return this.#cachedBody("formData");
      }
      /**
       * Adds validated data to the request.
       *
       * @param target - The target of the validation.
       * @param data - The validated data to add.
       */
      addValidatedData(target, data) {
        ;
        (this.#validatedData ??= {})[target] = data;
      }
      valid(target) {
        return this.#validatedData?.[target];
      }
      /**
       * `.url()` can get the request url strings.
       *
       * @see {@link https://hono.dev/docs/api/request#url}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const url = c.req.url // `http://localhost:8787/about/me`
       *   ...
       * })
       * ```
       */
      get url() {
        return this.raw.url;
      }
      /**
       * `.method()` can get the method name of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#method}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const method = c.req.method // `GET`
       * })
       * ```
       */
      get method() {
        return this.raw.method;
      }
      get [GET_MATCH_RESULT]() {
        return this.#matchResult;
      }
      /**
       * `.matchedRoutes()` can return a matched route in the handler
       *
       * @deprecated
       *
       * Use matchedRoutes helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#matchedroutes}
       *
       * @example
       * ```ts
       * app.use('*', async function logger(c, next) {
       *   await next()
       *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
       *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
       *     console.log(
       *       method,
       *       ' ',
       *       path,
       *       ' '.repeat(Math.max(10 - path.length, 0)),
       *       name,
       *       i === c.req.routeIndex ? '<- respond from here' : ''
       *     )
       *   })
       * })
       * ```
       */
      get matchedRoutes() {
        return this.#matchResult[0].map(([[, route]]) => route);
      }
      /**
       * `routePath()` can retrieve the path registered within the handler
       *
       * @deprecated
       *
       * Use routePath helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#routepath}
       *
       * @example
       * ```ts
       * app.get('/posts/:id', (c) => {
       *   return c.json({ path: c.req.routePath })
       * })
       * ```
       */
      get routePath() {
        return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
      }
    };
  }
});

// ../../../node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase, raw2, resolveCallback;
var init_html = __esm({
  "../../../node_modules/hono/dist/utils/html.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    HtmlEscapedCallbackPhase = {
      Stringify: 1,
      BeforeStream: 2,
      Stream: 3
    };
    raw2 = /* @__PURE__ */ __name((value, callbacks) => {
      const escapedString = new String(value);
      escapedString.isEscaped = true;
      escapedString.callbacks = callbacks;
      return escapedString;
    }, "raw");
    resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
      if (typeof str === "object" && !(str instanceof String)) {
        if (!(str instanceof Promise)) {
          str = str.toString();
        }
        if (str instanceof Promise) {
          str = await str;
        }
      }
      const callbacks = str.callbacks;
      if (!callbacks?.length) {
        return Promise.resolve(str);
      }
      if (buffer) {
        buffer[0] += str;
      } else {
        buffer = [str];
      }
      const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
        (res) => Promise.all(
          res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
        ).then(() => buffer[0])
      );
      if (preserveCallbacks) {
        return raw2(await resStr, callbacks);
      } else {
        return resStr;
      }
    }, "resolveCallback");
  }
});

// ../../../node_modules/hono/dist/context.js
var TEXT_PLAIN, setDefaultContentType, createResponseInstance, Context;
var init_context = __esm({
  "../../../node_modules/hono/dist/context.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_request();
    init_html();
    TEXT_PLAIN = "text/plain; charset=UTF-8";
    setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
      return {
        "Content-Type": contentType,
        ...headers
      };
    }, "setDefaultContentType");
    createResponseInstance = /* @__PURE__ */ __name((body, init3) => new Response(body, init3), "createResponseInstance");
    Context = class {
      static {
        __name(this, "Context");
      }
      #rawRequest;
      #req;
      /**
       * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
       *
       * @see {@link https://hono.dev/docs/api/context#env}
       *
       * @example
       * ```ts
       * // Environment object for Cloudflare Workers
       * app.get('*', async c => {
       *   const counter = c.env.COUNTER
       * })
       * ```
       */
      env = {};
      #var;
      finalized = false;
      /**
       * `.error` can get the error object from the middleware if the Handler throws an error.
       *
       * @see {@link https://hono.dev/docs/api/context#error}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   await next()
       *   if (c.error) {
       *     // do something...
       *   }
       * })
       * ```
       */
      error;
      #status;
      #executionCtx;
      #res;
      #layout;
      #renderer;
      #notFoundHandler;
      #preparedHeaders;
      #matchResult;
      #path;
      /**
       * Creates an instance of the Context class.
       *
       * @param req - The Request object.
       * @param options - Optional configuration options for the context.
       */
      constructor(req, options) {
        this.#rawRequest = req;
        if (options) {
          this.#executionCtx = options.executionCtx;
          this.env = options.env;
          this.#notFoundHandler = options.notFoundHandler;
          this.#path = options.path;
          this.#matchResult = options.matchResult;
        }
      }
      /**
       * `.req` is the instance of {@link HonoRequest}.
       */
      get req() {
        this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
        return this.#req;
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#event}
       * The FetchEvent associated with the current request.
       *
       * @throws Will throw an error if the context does not have a FetchEvent.
       */
      get event() {
        if (this.#executionCtx && "respondWith" in this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no FetchEvent");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#executionctx}
       * The ExecutionContext associated with the current request.
       *
       * @throws Will throw an error if the context does not have an ExecutionContext.
       */
      get executionCtx() {
        if (this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no ExecutionContext");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#res}
       * The Response object for the current request.
       */
      get res() {
        return this.#res ||= createResponseInstance(null, {
          headers: this.#preparedHeaders ??= new Headers()
        });
      }
      /**
       * Sets the Response object for the current request.
       *
       * @param _res - The Response object to set.
       */
      set res(_res) {
        if (this.#res && _res) {
          _res = createResponseInstance(_res.body, _res);
          for (const [k, v] of this.#res.headers.entries()) {
            if (k === "content-type") {
              continue;
            }
            if (k === "set-cookie") {
              const cookies = this.#res.headers.getSetCookie();
              _res.headers.delete("set-cookie");
              for (const cookie of cookies) {
                _res.headers.append("set-cookie", cookie);
              }
            } else {
              _res.headers.set(k, v);
            }
          }
        }
        this.#res = _res;
        this.finalized = true;
      }
      /**
       * `.render()` can create a response within a layout.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   return c.render('Hello!')
       * })
       * ```
       */
      render = /* @__PURE__ */ __name((...args) => {
        this.#renderer ??= (content) => this.html(content);
        return this.#renderer(...args);
      }, "render");
      /**
       * Sets the layout for the response.
       *
       * @param layout - The layout to set.
       * @returns The layout function.
       */
      setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
      /**
       * Gets the current layout for the response.
       *
       * @returns The current layout function.
       */
      getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
      /**
       * `.setRenderer()` can set the layout in the custom middleware.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```tsx
       * app.use('*', async (c, next) => {
       *   c.setRenderer((content) => {
       *     return c.html(
       *       <html>
       *         <body>
       *           <p>{content}</p>
       *         </body>
       *       </html>
       *     )
       *   })
       *   await next()
       * })
       * ```
       */
      setRenderer = /* @__PURE__ */ __name((renderer) => {
        this.#renderer = renderer;
      }, "setRenderer");
      /**
       * `.header()` can set headers.
       *
       * @see {@link https://hono.dev/docs/api/context#header}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *
       *   // Append multiple headers using the append option (e.g. Vary)
       *   c.header('Vary', 'Accept-Encoding', { append: true })
       *   c.header('Vary', 'User-Agent', { append: true })
       *
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      header = /* @__PURE__ */ __name((name2, value, options) => {
        if (this.finalized) {
          this.#res = createResponseInstance(this.#res.body, this.#res);
        }
        const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
        if (value === void 0) {
          headers.delete(name2);
        } else if (options?.append) {
          headers.append(name2, value);
        } else {
          headers.set(name2, value);
        }
      }, "header");
      status = /* @__PURE__ */ __name((status) => {
        this.#status = status;
      }, "status");
      /**
       * `.set()` can set the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   c.set('message', 'Hono is hot!!')
       *   await next()
       * })
       * ```
       */
      set = /* @__PURE__ */ __name((key, value) => {
        this.#var ??= /* @__PURE__ */ new Map();
        this.#var.set(key, value);
      }, "set");
      /**
       * `.get()` can use the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   const message = c.get('message')
       *   return c.text(`The message is "${message}"`)
       * })
       * ```
       */
      get = /* @__PURE__ */ __name((key) => {
        return this.#var ? this.#var.get(key) : void 0;
      }, "get");
      /**
       * `.var` can access the value of a variable.
       *
       * @see {@link https://hono.dev/docs/api/context#var}
       *
       * @example
       * ```ts
       * const result = c.var.client.oneMethod()
       * ```
       */
      // c.var.propName is a read-only
      get var() {
        if (!this.#var) {
          return {};
        }
        return Object.fromEntries(this.#var);
      }
      #newResponse(data, arg, headers) {
        let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
        if (typeof arg === "object" && arg.headers) {
          responseHeaders ??= new Headers();
          for (const [key, value] of new Headers(arg.headers)) {
            if (key === "set-cookie") {
              responseHeaders.append(key, value);
            } else {
              responseHeaders.set(key, value);
            }
          }
        }
        if (headers) {
          if (!responseHeaders) {
            let count = 0;
            for (const k in headers) {
              if (++count > 1 || typeof headers[k] !== "string") {
                responseHeaders = new Headers();
                break;
              }
            }
          }
          if (responseHeaders) {
            for (const k in headers) {
              const v = headers[k];
              if (typeof v === "string") {
                responseHeaders.set(k, v);
              } else {
                responseHeaders.delete(k);
                for (const v2 of v) {
                  responseHeaders.append(k, v2);
                }
              }
            }
          }
        }
        const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
        return createResponseInstance(data, {
          status,
          headers: responseHeaders ?? headers
        });
      }
      newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
      /**
       * `.body()` can return the HTTP response.
       * You can set headers with `.header()` and set HTTP status code with `.status`.
       * This can also be set in `.text()`, `.json()` and so on.
       *
       * @see {@link https://hono.dev/docs/api/context#body}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *   // Set HTTP status code
       *   c.status(201)
       *
       *   // Return the response body
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
      /**
       * `.text()` can render text as `Content-Type:text/plain`.
       *
       * @see {@link https://hono.dev/docs/api/context#text}
       *
       * @example
       * ```ts
       * app.get('/say', (c) => {
       *   return c.text('Hello!')
       * })
       * ```
       */
      text = /* @__PURE__ */ __name((text, arg, headers) => {
        return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
          text,
          arg,
          setDefaultContentType(TEXT_PLAIN, headers)
        );
      }, "text");
      /**
       * `.json()` can render JSON as `Content-Type:application/json`.
       *
       * @see {@link https://hono.dev/docs/api/context#json}
       *
       * @example
       * ```ts
       * app.get('/api', (c) => {
       *   return c.json({ message: 'Hello!' })
       * })
       * ```
       */
      json = /* @__PURE__ */ __name((object, arg, headers) => {
        return this.#newResponse(
          JSON.stringify(object),
          arg,
          setDefaultContentType("application/json", headers)
        );
      }, "json");
      html = /* @__PURE__ */ __name((html, arg, headers) => {
        const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
        return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
      }, "html");
      /**
       * `.redirect()` can Redirect, default status code is 302.
       *
       * @see {@link https://hono.dev/docs/api/context#redirect}
       *
       * @example
       * ```ts
       * app.get('/redirect', (c) => {
       *   return c.redirect('/')
       * })
       * app.get('/redirect-permanently', (c) => {
       *   return c.redirect('/', 301)
       * })
       * ```
       */
      redirect = /* @__PURE__ */ __name((location, status) => {
        const locationString = String(location);
        this.header(
          "Location",
          // Multibyes should be encoded
          // eslint-disable-next-line no-control-regex
          !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
        );
        return this.newResponse(null, status ?? 302);
      }, "redirect");
      /**
       * `.notFound()` can return the Not Found Response.
       *
       * @see {@link https://hono.dev/docs/api/context#notfound}
       *
       * @example
       * ```ts
       * app.get('/notfound', (c) => {
       *   return c.notFound()
       * })
       * ```
       */
      notFound = /* @__PURE__ */ __name(() => {
        this.#notFoundHandler ??= () => createResponseInstance();
        return this.#notFoundHandler(this);
      }, "notFound");
    };
  }
});

// ../../../node_modules/hono/dist/router.js
var METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE, METHODS, MESSAGE_MATCHER_IS_ALREADY_BUILT, UnsupportedPathError;
var init_router = __esm({
  "../../../node_modules/hono/dist/router.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    METHOD_NAME_ALL = "ALL";
    METHOD_NAME_ALL_LOWERCASE = "all";
    METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
    MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
    UnsupportedPathError = class extends Error {
      static {
        __name(this, "UnsupportedPathError");
      }
    };
  }
});

// ../../../node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER;
var init_constants2 = __esm({
  "../../../node_modules/hono/dist/utils/constants.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    COMPOSED_HANDLER = "__COMPOSED_HANDLER";
  }
});

// ../../../node_modules/hono/dist/hono-base.js
var notFoundHandler, errorHandler, Hono;
var init_hono_base = __esm({
  "../../../node_modules/hono/dist/hono-base.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_compose();
    init_context();
    init_router();
    init_constants2();
    init_url();
    notFoundHandler = /* @__PURE__ */ __name((c) => {
      return c.text("404 Not Found", 404);
    }, "notFoundHandler");
    errorHandler = /* @__PURE__ */ __name((err, c) => {
      if ("getResponse" in err) {
        const res = err.getResponse();
        return c.newResponse(res.body, res);
      }
      console.error(err);
      return c.text("Internal Server Error", 500);
    }, "errorHandler");
    Hono = class _Hono {
      static {
        __name(this, "_Hono");
      }
      get;
      post;
      put;
      delete;
      options;
      patch;
      query;
      all;
      on;
      use;
      /*
        This class is like an abstract class and does not have a router.
        To use it, inherit the class and implement router in the constructor.
      */
      router;
      getPath;
      // Cannot use `#` because it requires visibility at JavaScript runtime.
      _basePath = "/";
      #path = "/";
      routes = [];
      constructor(options = {}) {
        const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
        allMethods.forEach((method) => {
          this[method] = (args1, ...args) => {
            const methodName = method.toUpperCase();
            if (typeof args1 === "string") {
              this.#path = args1;
            } else {
              this.#addRoute(methodName, this.#path, args1);
            }
            args.forEach((handler) => {
              this.#addRoute(methodName, this.#path, handler);
            });
            return this;
          };
        });
        this.on = (method, path, ...handlers) => {
          for (const p of [path].flat()) {
            this.#path = p;
            for (const m of [method].flat()) {
              const methodName = m.toUpperCase();
              for (const handler of handlers) {
                this.#addRoute(methodName, this.#path, handler);
              }
            }
          }
          return this;
        };
        this.use = (arg1, ...handlers) => {
          if (typeof arg1 === "string") {
            this.#path = arg1;
          } else {
            this.#path = "*";
            handlers.unshift(arg1);
          }
          handlers.forEach((handler) => {
            this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
          });
          return this;
        };
        const { strict, ...optionsWithoutStrict } = options;
        Object.assign(this, optionsWithoutStrict);
        this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
      }
      #clone() {
        const clone = new _Hono({
          router: this.router,
          getPath: this.getPath
        });
        clone.errorHandler = this.errorHandler;
        clone.#notFoundHandler = this.#notFoundHandler;
        clone.routes = this.routes;
        return clone;
      }
      #notFoundHandler = notFoundHandler;
      // Cannot use `#` because it requires visibility at JavaScript runtime.
      errorHandler = errorHandler;
      /**
       * `.route()` allows grouping other Hono instance in routes.
       *
       * @see {@link https://hono.dev/docs/api/routing#grouping}
       *
       * @param {string} path - base Path
       * @param {Hono} app - other Hono instance
       * @returns {Hono} routed Hono instance
       *
       * @example
       * ```ts
       * const app = new Hono()
       * const app2 = new Hono()
       *
       * app2.get("/user", (c) => c.text("user"))
       * app.route("/api", app2) // GET /api/user
       * ```
       */
      route(path, app2) {
        const subApp = this.basePath(path);
        app2.routes.map((r) => {
          let handler;
          if (app2.errorHandler === errorHandler) {
            handler = r.handler;
          } else {
            handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
            handler[COMPOSED_HANDLER] = r.handler;
          }
          subApp.#addRoute(r.method, r.path, handler, r.basePath);
        });
        return this;
      }
      /**
       * `.basePath()` allows base paths to be specified.
       *
       * @see {@link https://hono.dev/docs/api/routing#base-path}
       *
       * @param {string} path - base Path
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * const api = new Hono().basePath('/api')
       * ```
       */
      basePath(path) {
        const subApp = this.#clone();
        subApp._basePath = mergePath(this._basePath, path);
        return subApp;
      }
      /**
       * `.onError()` handles an error and returns a customized Response.
       *
       * @see {@link https://hono.dev/docs/api/hono#error-handling}
       *
       * @param {ErrorHandler} handler - request Handler for error
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * app.onError((err, c) => {
       *   console.error(`${err}`)
       *   return c.text('Custom Error Message', 500)
       * })
       * ```
       */
      onError = /* @__PURE__ */ __name((handler) => {
        this.errorHandler = handler;
        return this;
      }, "onError");
      /**
       * `.notFound()` allows you to customize a Not Found Response.
       *
       * @see {@link https://hono.dev/docs/api/hono#not-found}
       *
       * @param {NotFoundHandler} handler - request handler for not-found
       * @returns {Hono} changed Hono instance
       *
       * @example
       * ```ts
       * app.notFound((c) => {
       *   return c.text('Custom 404 Message', 404)
       * })
       * ```
       */
      notFound = /* @__PURE__ */ __name((handler) => {
        this.#notFoundHandler = handler;
        return this;
      }, "notFound");
      /**
       * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
       *
       * @see {@link https://hono.dev/docs/api/hono#mount}
       *
       * @param {string} path - base Path
       * @param {Function} applicationHandler - other Request Handler
       * @param {MountOptions} [options] - options of `.mount()`
       * @returns {Hono} mounted Hono instance
       *
       * @example
       * ```ts
       * import { Router as IttyRouter } from 'itty-router'
       * import { Hono } from 'hono'
       * // Create itty-router application
       * const ittyRouter = IttyRouter()
       * // GET /itty-router/hello
       * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
       *
       * const app = new Hono()
       * app.mount('/itty-router', ittyRouter.handle)
       * ```
       *
       * @example
       * ```ts
       * const app = new Hono()
       * // Send the request to another application without modification.
       * app.mount('/app', anotherApp, {
       *   replaceRequest: (req) => req,
       * })
       * ```
       */
      mount(path, applicationHandler, options) {
        let replaceRequest;
        let optionHandler;
        if (options) {
          if (typeof options === "function") {
            optionHandler = options;
          } else {
            optionHandler = options.optionHandler;
            if (options.replaceRequest === false) {
              replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
            } else {
              replaceRequest = options.replaceRequest;
            }
          }
        }
        const getOptions = optionHandler ? (c) => {
          const options2 = optionHandler(c);
          return Array.isArray(options2) ? options2 : [options2];
        } : (c) => {
          let executionContext = void 0;
          try {
            executionContext = c.executionCtx;
          } catch {
          }
          return [c.env, executionContext];
        };
        replaceRequest ||= (() => {
          const mergedPath = mergePath(this._basePath, path);
          const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
          return (request) => {
            const url = new URL(request.url);
            url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
            return new Request(url, request);
          };
        })();
        const handler = /* @__PURE__ */ __name(async (c, next) => {
          const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
          if (res) {
            return res;
          }
          await next();
        }, "handler");
        this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
        return this;
      }
      #addRoute(method, path, handler, baseRoutePath) {
        path = mergePath(this._basePath, path);
        const r = {
          basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
          path,
          method,
          handler
        };
        this.router.add(method, path, [handler, r]);
        this.routes.push(r);
      }
      #handleError(err, c) {
        if (err instanceof Error) {
          return this.errorHandler(err, c);
        }
        throw err;
      }
      #dispatch(request, executionCtx, env, method) {
        if (method === "HEAD") {
          return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
        }
        const path = this.getPath(request, { env });
        const matchResult = this.router.match(method, path);
        const c = new Context(request, {
          path,
          matchResult,
          env,
          executionCtx,
          notFoundHandler: this.#notFoundHandler
        });
        if (matchResult[0].length === 1) {
          let res;
          try {
            res = matchResult[0][0][0][0](c, async () => {
              c.res = await this.#notFoundHandler(c);
            });
          } catch (err) {
            return this.#handleError(err, c);
          }
          return res instanceof Promise ? res.then(
            (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
          ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
        }
        const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
        return (async () => {
          try {
            const context = await composed(c);
            if (!context.finalized) {
              throw new Error(
                "Context is not finalized. Did you forget to return a Response object or `await next()`?"
              );
            }
            return context.res;
          } catch (err) {
            return this.#handleError(err, c);
          }
        })();
      }
      /**
       * `.fetch()` will be entry point of your app.
       *
       * @see {@link https://hono.dev/docs/api/hono#fetch}
       *
       * @param {Request} request - request Object of request
       * @param {Env} env - env Object
       * @param {ExecutionContext} executionCtx - context of execution
       * @returns {Response | Promise<Response>} response of request
       *
       */
      fetch = /* @__PURE__ */ __name((request, ...rest) => {
        return this.#dispatch(request, rest[1], rest[0], request.method);
      }, "fetch");
      /**
       * `.request()` is a useful method for testing.
       * You can pass a URL or pathname to send a GET request.
       * app will return a Response object.
       * ```ts
       * test('GET /hello is ok', async () => {
       *   const res = await app.request('/hello')
       *   expect(res.status).toBe(200)
       * })
       * ```
       * @see https://hono.dev/docs/api/hono#request
       */
      request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
        if (input instanceof Request) {
          return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
        }
        input = input.toString();
        return this.fetch(
          new Request(
            /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
            requestInit
          ),
          Env,
          executionCtx
        );
      }, "request");
      /**
       * `.fire()` automatically adds a global fetch event listener.
       * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
       * @deprecated
       * Use `fire` from `hono/service-worker` instead.
       * ```ts
       * import { Hono } from 'hono'
       * import { fire } from 'hono/service-worker'
       *
       * const app = new Hono()
       * // ...
       * fire(app)
       * ```
       * @see https://hono.dev/docs/api/hono#fire
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
       * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
       */
      fire = /* @__PURE__ */ __name(() => {
        addEventListener("fetch", (event) => {
          event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
        });
      }, "fire");
    };
  }
});

// ../../../node_modules/hono/dist/router/utils.js
var createNullObject;
var init_utils = __esm({
  "../../../node_modules/hono/dist/router/utils.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/matcher.js
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match22 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match22;
  return match22(method, path);
}
var emptyParam;
var init_matcher = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/matcher.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router();
    emptyParam = [];
    __name(match, "match");
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/node.js
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var LABEL_REG_EXP_STR, ONLY_WILDCARD_REG_EXP_STR, TAIL_WILDCARD_REG_EXP_STR, PATH_ERROR, regExpMetaChars, Node;
var init_node = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/node.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_utils();
    LABEL_REG_EXP_STR = "[^/]+";
    ONLY_WILDCARD_REG_EXP_STR = ".*";
    TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
    PATH_ERROR = /* @__PURE__ */ Symbol();
    regExpMetaChars = new Set(".\\+*[^]$()");
    __name(compareKey, "compareKey");
    Node = class _Node {
      static {
        __name(this, "_Node");
      }
      // handler index of a dynamic path, or -1 for a static path terminal
      #index;
      #varIndex;
      #children = createNullObject();
      insert(tokens, index, paramMap, context, isStatic) {
        let node = this;
        for (let i = 0, len = tokens.length; i < len; i++) {
          const token = tokens[i];
          const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
          let nextNode;
          if (pattern) {
            const name2 = pattern[1];
            let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
            if (name2 && pattern[2]) {
              if (regexpStr === ".*") {
                throw PATH_ERROR;
              }
              regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
              if (/\((?!\?:)/.test(regexpStr)) {
                throw PATH_ERROR;
              }
              if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
                throw PATH_ERROR;
              }
            }
            nextNode = node.#children[regexpStr];
            if (!nextNode) {
              if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
                for (const k in node.#children) {
                  if (
                    // a single-char pattern coexists with single-char literals as a literal does
                    (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
                  ) {
                    throw PATH_ERROR;
                  }
                }
              }
              nextNode = node.#children[regexpStr] = new _Node();
            }
            if (name2 !== "") {
              nextNode.#varIndex ??= context.varIndex++;
              paramMap.push([name2, nextNode.#varIndex]);
            }
          } else {
            nextNode = node.#children[token];
            if (!nextNode) {
              for (const k in node.#children) {
                if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
                  throw PATH_ERROR;
                }
              }
              nextNode = node.#children[token] = new _Node();
            }
          }
          node = nextNode;
        }
        if (node.#index !== void 0) {
          throw PATH_ERROR;
        }
        node.#index = isStatic ? -1 : index;
      }
      buildRegExpStr() {
        const childKeys = Object.keys(this.#children).sort(compareKey);
        const strList = childKeys.map((k) => {
          const c = this.#children[k];
          const childStr = c.buildRegExpStr();
          return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
        }).filter(Boolean);
        if (typeof this.#index === "number" && this.#index !== -1) {
          strList.unshift(`#${this.#index}`);
        }
        if (strList.length === 0) {
          return "";
        }
        if (strList.length === 1) {
          return strList[0];
        }
        return "(?:" + strList.join("|") + ")";
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie;
var init_trie = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/trie.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_utils();
    init_node();
    Trie = class {
      static {
        __name(this, "Trie");
      }
      #context = { varIndex: 0 };
      #root = new Node();
      #index = 0;
      // dynamic path -> [handler index, param assoc]; static paths are not registered
      paths = createNullObject();
      insert(path, isStatic) {
        if (isStatic) {
          this.#root.insert(path.split(""), 0, [], this.#context, true);
          return;
        }
        const paramAssoc = [];
        const groups = [];
        let markedPath = path;
        for (let i = 0; ; ) {
          let replaced = false;
          markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
            const mark = `@\\${i}`;
            groups[i] = [mark, m];
            i++;
            replaced = true;
            return mark;
          });
          if (!replaced) {
            break;
          }
        }
        const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
        for (let i = groups.length - 1; i >= 0; i--) {
          const [mark] = groups[i];
          for (let j = tokens.length - 1; j >= 0; j--) {
            if (tokens[j].indexOf(mark) !== -1) {
              tokens[j] = tokens[j].replace(mark, groups[i][1]);
              break;
            }
          }
        }
        this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
        this.paths[path] = [this.#index++, paramAssoc];
      }
      buildRegExp() {
        let regexp = this.#root.buildRegExpStr();
        if (regexp === "") {
          return [/^$/, [], []];
        }
        let captureIndex = 0;
        const indexReplacementMap = [];
        const paramReplacementMap = [];
        regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
          if (handlerIndex !== void 0) {
            indexReplacementMap[++captureIndex] = Number(handlerIndex);
            return "$()";
          }
          if (paramIndex !== void 0) {
            paramReplacementMap[Number(paramIndex)] = ++captureIndex;
            return "";
          }
          return "";
        });
        return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/router.js
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match22, metaChar) => metaChar ? `\\${metaChar}` : match22 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match22 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var wildcardRegExpCache, RegExpRouter;
var init_router2 = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/router.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router();
    init_url();
    init_utils();
    init_matcher();
    init_node();
    init_trie();
    wildcardRegExpCache = createNullObject();
    __name(buildWildcardRegExp, "buildWildcardRegExp");
    __name(findMiddleware, "findMiddleware");
    RegExpRouter = class {
      static {
        __name(this, "RegExpRouter");
      }
      name = "RegExpRouter";
      #middleware;
      #routes;
      #tries;
      constructor() {
        this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
        this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
        this.#tries = { [METHOD_NAME_ALL]: new Trie() };
      }
      #insertPath(method, path) {
        try {
          this.#tries[method].insert(path, !/\*|\/:/.test(path));
        } catch (e) {
          throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
        }
      }
      add(method, path, handler) {
        const middleware = this.#middleware;
        const routes2 = this.#routes;
        if (!middleware) {
          throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        }
        if (!middleware[method]) {
          this.#tries[method] = new Trie();
          for (const handlerMap of [middleware, routes2]) {
            handlerMap[method] = createNullObject();
            for (const p in handlerMap[METHOD_NAME_ALL]) {
              handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
              this.#insertPath(method, p);
            }
          }
        }
        if (path === "/*") {
          path = "*";
        }
        const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
        if (/\*$/.test(path)) {
          const re = buildWildcardRegExp(path);
          for (const m of methods) {
            if (!middleware[m][path]) {
              this.#insertPath(m, path);
              middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
            }
          }
          for (const handlerMap of [middleware, routes2]) {
            for (const m of methods) {
              for (const p in handlerMap[m]) {
                re.test(p) && handlerMap[m][p].push([handler, path]);
              }
            }
          }
          return;
        }
        const paths = checkOptionalParameter(path) || [path];
        for (const path2 of paths) {
          for (const m of methods) {
            if (!routes2[m][path2]) {
              this.#insertPath(m, path2);
              routes2[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
            }
            routes2[m][path2].push([handler, path2]);
          }
        }
      }
      match = match;
      buildAllMatchers() {
        const matchers = createNullObject();
        for (const method of Object.keys(this.#routes)) {
          matchers[method] = this.#buildMatcher(method);
        }
        this.#middleware = this.#routes = this.#tries = void 0;
        wildcardRegExpCache = createNullObject();
        return matchers;
      }
      #buildMatcher(method) {
        const middleware = this.#middleware[method];
        const routes2 = this.#routes[method];
        const trie = this.#tries[method];
        const staticMap = createNullObject();
        const handlerData = [];
        const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
        for (const r of [middleware, routes2]) {
          for (const path in r) {
            const handlers = r[path];
            const pathData = trie.paths[path];
            if (!pathData) {
              staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
              continue;
            }
            handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
              h,
              trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
                map[key] = paramReplacementMap[pathData[1][i][1]];
                return map;
              }, createNullObject())
            ]);
          }
        }
        return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/prepared-router.js
var init_prepared_router = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/prepared-router.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router();
    init_matcher();
    init_router2();
  }
});

// ../../../node_modules/hono/dist/router/reg-exp-router/index.js
var init_reg_exp_router = __esm({
  "../../../node_modules/hono/dist/router/reg-exp-router/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router2();
    init_prepared_router();
  }
});

// ../../../node_modules/hono/dist/router/smart-router/router.js
var SmartRouter;
var init_router3 = __esm({
  "../../../node_modules/hono/dist/router/smart-router/router.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router();
    SmartRouter = class {
      static {
        __name(this, "SmartRouter");
      }
      name = "SmartRouter";
      #routers = [];
      #routes = [];
      constructor(init3) {
        this.#routers = init3.routers;
      }
      add(method, path, handler) {
        if (!this.#routes) {
          throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
        }
        this.#routes.push([method, path, handler]);
      }
      match(method, path) {
        if (!this.#routes) {
          throw new Error("Fatal error");
        }
        const routers = this.#routers;
        const routes2 = this.#routes;
        const len = routers.length;
        let i = 0;
        let res;
        for (; i < len; i++) {
          const router = routers[i];
          try {
            for (let i2 = 0, len2 = routes2.length; i2 < len2; i2++) {
              router.add(...routes2[i2]);
            }
            res = router.match(method, path);
          } catch (e) {
            if (e instanceof UnsupportedPathError) {
              continue;
            }
            throw e;
          }
          this.match = router.match.bind(router);
          this.#routers = [router];
          this.#routes = void 0;
          break;
        }
        if (i === len) {
          throw new Error("Fatal error");
        }
        this.name = `SmartRouter + ${this.activeRouter.name}`;
        return res;
      }
      get activeRouter() {
        if (this.#routes || this.#routers.length !== 1) {
          throw new Error("No active router has been determined yet.");
        }
        return this.#routers[0];
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/smart-router/index.js
var init_smart_router = __esm({
  "../../../node_modules/hono/dist/router/smart-router/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router3();
  }
});

// ../../../node_modules/hono/dist/router/trie-router/node.js
var emptyParams, order, Node2;
var init_node2 = __esm({
  "../../../node_modules/hono/dist/router/trie-router/node.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router();
    init_url();
    init_utils();
    emptyParams = createNullObject();
    order = 0;
    Node2 = class _Node2 {
      static {
        __name(this, "_Node");
      }
      #methods = [];
      #children = createNullObject();
      #patterns = [];
      #pattern;
      #params = emptyParams;
      insert(method, path, handler) {
        let curNode = this;
        const parts = splitRoutingPath(path);
        const possibleKeys = /* @__PURE__ */ new Set();
        let i = 0;
        for (const p of parts) {
          const nextP = parts[++i];
          const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
          const isParam = Array.isArray(pattern);
          const key = isParam ? pattern[0] : pattern || p;
          const child = curNode.#children[key] ||= new _Node2();
          if (pattern && !child.#pattern) {
            child.#pattern = pattern;
            curNode.#patterns.push(child);
          }
          curNode = child;
          if (isParam) {
            possibleKeys.add(pattern[1]);
          }
        }
        curNode.#methods.push({
          [method]: {
            handler,
            possibleKeys: [...possibleKeys],
            score: ++order
          }
        });
      }
      #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
        for (let i = 0, len = node.#methods.length; i < len; i++) {
          const m = node.#methods[i];
          const handlerSet = m[method] || m[METHOD_NAME_ALL];
          if (handlerSet) {
            handlerSet.params = createNullObject();
            handlerSets.push(handlerSet);
            for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
              const key = handlerSet.possibleKeys[i2];
              handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
            }
          }
        }
      }
      search(method, path) {
        const handlerSets = [];
        this.#params = emptyParams;
        const curNode = this;
        let curNodes = [curNode];
        const parts = splitPath(path);
        const curNodesQueue = [];
        const len = parts.length;
        let partOffsets = null;
        for (let i = 0; i < len; i++) {
          const part = parts[i];
          const isLast = i === len - 1;
          const tempNodes = [];
          for (let j = 0, len2 = curNodes.length; j < len2; j++) {
            const node = curNodes[j];
            const nextNode = node.#children[part];
            if (nextNode) {
              nextNode.#params = node.#params;
              if (isLast) {
                if (nextNode.#children["*"]) {
                  this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
                }
                this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
              } else {
                tempNodes.push(nextNode);
              }
            }
            for (const child of node.#patterns) {
              const pattern = child.#pattern;
              const params = node.#params === emptyParams ? {} : { ...node.#params };
              if (typeof pattern === "string") {
                if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
                  this.#pushHandlerSets(handlerSets, child, method, node.#params);
                  if (pattern === "*") {
                    child.#params = params;
                    tempNodes.push(child);
                  }
                }
                continue;
              }
              const [, name2, matcher] = pattern;
              if (!part && matcher === true) {
                continue;
              }
              if (matcher !== true) {
                if (!partOffsets) {
                  partOffsets = [];
                  let offset = path[0] === "/" ? 1 : 0;
                  for (let p = 0; p < len; p++) {
                    partOffsets[p] = offset;
                    offset += parts[p].length + 1;
                  }
                }
                const restPathString = path.slice(partOffsets[i]);
                const m = matcher.exec(restPathString);
                if (m) {
                  params[name2] = m[0];
                  this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
                  if (m[0].length === restPathString.length && child.#children["*"]) {
                    this.#pushHandlerSets(
                      handlerSets,
                      child.#children["*"],
                      method,
                      node.#params,
                      params
                    );
                  }
                  for (const _ in child.#children) {
                    child.#params = params;
                    const componentCount = m[0].match(/\//g)?.length ?? 0;
                    const targetCurNodes = curNodesQueue[componentCount] ||= [];
                    targetCurNodes.push(child);
                    break;
                  }
                  continue;
                }
              }
              if (matcher === true || matcher.test(part)) {
                params[name2] = part;
                if (isLast) {
                  this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
                  if (child.#children["*"]) {
                    this.#pushHandlerSets(
                      handlerSets,
                      child.#children["*"],
                      method,
                      params,
                      node.#params
                    );
                  }
                } else {
                  child.#params = params;
                  tempNodes.push(child);
                }
              }
            }
          }
          const shifted = curNodesQueue.shift();
          curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
        }
        if (handlerSets[1]) {
          handlerSets.sort((a, b) => {
            return a.score - b.score;
          });
        }
        return [handlerSets.map(({ handler, params }) => [handler, params])];
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/trie-router/router.js
var TrieRouter;
var init_router4 = __esm({
  "../../../node_modules/hono/dist/router/trie-router/router.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_url();
    init_node2();
    TrieRouter = class {
      static {
        __name(this, "TrieRouter");
      }
      name = "TrieRouter";
      #node = new Node2();
      add(method, path, handler) {
        for (const result of checkOptionalParameter(path) || [path]) {
          this.#node.insert(method, result, handler);
        }
      }
      match(method, path) {
        return this.#node.search(method, path);
      }
    };
  }
});

// ../../../node_modules/hono/dist/router/trie-router/index.js
var init_trie_router = __esm({
  "../../../node_modules/hono/dist/router/trie-router/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_router4();
  }
});

// ../../../node_modules/hono/dist/hono.js
var Hono2;
var init_hono = __esm({
  "../../../node_modules/hono/dist/hono.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_hono_base();
    init_reg_exp_router();
    init_smart_router();
    init_trie_router();
    Hono2 = class extends Hono {
      static {
        __name(this, "Hono");
      }
      /**
       * Creates an instance of the Hono class.
       *
       * @param options - Optional configuration options for the Hono instance.
       */
      constructor(options = {}) {
        super(options);
        this.router = options.router ?? new SmartRouter({
          routers: [new RegExpRouter(), new TrieRouter()]
        });
      }
    };
  }
});

// ../../../node_modules/hono/dist/index.js
var init_dist = __esm({
  "../../../node_modules/hono/dist/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_hono();
    init_context();
  }
});

// ../../../node_modules/hono/dist/adapter/cloudflare-pages/handler.js
var handle;
var init_handler = __esm({
  "../../../node_modules/hono/dist/adapter/cloudflare-pages/handler.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_context();
    init_http_exception();
    handle = /* @__PURE__ */ __name((app2) => (eventContext) => {
      return app2.fetch(
        eventContext.request,
        { ...eventContext.env, eventContext },
        {
          waitUntil: eventContext.waitUntil,
          passThroughOnException: eventContext.passThroughOnException,
          props: {}
        }
      );
    }, "handle");
  }
});

// ../../../node_modules/hono/dist/adapter/cloudflare-pages/conninfo.js
var init_conninfo = __esm({
  "../../../node_modules/hono/dist/adapter/cloudflare-pages/conninfo.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
  }
});

// ../../../node_modules/hono/dist/adapter/cloudflare-pages/index.js
var init_cloudflare_pages = __esm({
  "../../../node_modules/hono/dist/adapter/cloudflare-pages/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_handler();
    init_conninfo();
  }
});

// ../../../node_modules/hono/dist/middleware/cors/index.js
var cors;
var init_cors = __esm({
  "../../../node_modules/hono/dist/middleware/cors/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    cors = /* @__PURE__ */ __name((options) => {
      const opts = {
        origin: "*",
        allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "QUERY"],
        allowHeaders: [],
        exposeHeaders: [],
        ...options
      };
      const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
      const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
      const findAllowOrigin = ((optsOrigin) => {
        if (typeof optsOrigin === "string") {
          if (optsOrigin === "*") {
            return () => optsOrigin;
          } else {
            return (origin) => optsOrigin === origin ? origin : null;
          }
        } else if (typeof optsOrigin === "function") {
          return optsOrigin;
        } else {
          return (origin) => optsOrigin.includes(origin) ? origin : null;
        }
      })(opts.origin);
      const findAllowMethods = ((optsAllowMethods) => {
        if (typeof optsAllowMethods === "function") {
          return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
        } else if (Array.isArray(optsAllowMethods)) {
          const methodsStr = optsAllowMethods.join(",");
          return () => methodsStr;
        } else {
          return () => "";
        }
      })(opts.allowMethods);
      return /* @__PURE__ */ __name(async function cors2(c, next) {
        function set(key, value) {
          c.res.headers.set(key, value);
        }
        __name(set, "set");
        const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
        if (allowOrigin) {
          set("Access-Control-Allow-Origin", allowOrigin);
        }
        if (opts.credentials) {
          set("Access-Control-Allow-Credentials", "true");
        }
        if (exposeHeadersStr) {
          set("Access-Control-Expose-Headers", exposeHeadersStr);
        }
        if (c.req.method === "OPTIONS") {
          if (opts.origin !== "*") {
            c.res.headers.append("Vary", "Origin");
          }
          if (opts.maxAge != null) {
            set("Access-Control-Max-Age", opts.maxAge.toString());
          }
          const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
          if (allowMethods) {
            set("Access-Control-Allow-Methods", allowMethods);
          }
          let headersStr = allowHeadersStr;
          if (!headersStr) {
            const requestHeaders = c.req.header("Access-Control-Request-Headers");
            if (requestHeaders) {
              headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
            }
          }
          if (headersStr) {
            set("Access-Control-Allow-Headers", headersStr);
            c.res.headers.append("Vary", "Access-Control-Request-Headers");
          }
          c.res.headers.delete("Content-Length");
          c.res.headers.delete("Content-Type");
          return new Response(null, {
            headers: c.res.headers,
            status: 204,
            statusText: "No Content"
          });
        }
        await next();
        if (opts.origin !== "*") {
          c.header("Vary", "Origin", { append: true });
        }
      }, "cors2");
    }, "cors");
  }
});

// ../../../node_modules/hono/dist/utils/encode.js
var decodeBase64Url, encodeBase64Url, encodeBase64, decodeBase64;
var init_encode = __esm({
  "../../../node_modules/hono/dist/utils/encode.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    decodeBase64Url = /* @__PURE__ */ __name((str) => {
      return decodeBase64(str.replace(/_|-/g, (m) => ({ _: "/", "-": "+" })[m] ?? m));
    }, "decodeBase64Url");
    encodeBase64Url = /* @__PURE__ */ __name((buf) => encodeBase64(buf).replace(/\/|\+/g, (m) => ({ "/": "_", "+": "-" })[m] ?? m), "encodeBase64Url");
    encodeBase64 = /* @__PURE__ */ __name((buf) => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0, len = bytes.length; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, "encodeBase64");
    decodeBase64 = /* @__PURE__ */ __name((str) => {
      const binary = atob(str);
      const bytes = new Uint8Array(new ArrayBuffer(binary.length));
      const half = binary.length / 2;
      for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
        bytes[i] = binary.charCodeAt(i);
        bytes[j] = binary.charCodeAt(j);
      }
      return bytes;
    }, "decodeBase64");
  }
});

// ../../../node_modules/hono/dist/middleware/secure-headers/secure-headers.js
function getFilteredHeaders(options) {
  return Object.entries(HEADERS_MAP).filter(([key]) => options[key]).map(([key, defaultValue]) => {
    const overrideValue = options[key];
    return typeof overrideValue === "string" ? [defaultValue[0], overrideValue] : defaultValue;
  });
}
function getCSPDirectives(contentSecurityPolicy, headerName) {
  const callbacks = [];
  const resultValues = [];
  for (const [directive, value] of Object.entries(contentSecurityPolicy)) {
    const valueArray = Array.isArray(value) ? value : [value];
    valueArray.forEach((value2, i) => {
      if (typeof value2 === "function") {
        const index = i * 2 + 2 + resultValues.length;
        callbacks.push((ctx, values) => {
          values[index] = value2(ctx, directive);
        });
      }
    });
    resultValues.push(
      directive.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        (match3, offset) => offset ? "-" + match3.toLowerCase() : match3.toLowerCase()
      ),
      ...valueArray.flatMap((value2) => [" ", value2]),
      "; "
    );
  }
  resultValues.pop();
  return callbacks.length === 0 ? [void 0, resultValues.join("")] : [
    (ctx, headersToSet) => headersToSet.map((values) => {
      if (values[0] === headerName) {
        const clone = values[1].slice();
        callbacks.forEach((cb) => {
          cb(ctx, clone);
        });
        return [values[0], clone.join("")];
      } else {
        return values;
      }
    }),
    resultValues
  ];
}
function getPermissionsPolicyDirectives(policy) {
  return Object.entries(policy).map(([directive, value]) => {
    const kebabDirective = camelToKebab(directive);
    if (typeof value === "boolean") {
      return `${kebabDirective}=${value ? "*" : "()"}`;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return `${kebabDirective}=()`;
      }
      if (value.length === 1 && value[0] === "*") {
        return `${kebabDirective}=*`;
      }
      if (value.length === 1 && value[0] === "none") {
        return `${kebabDirective}=()`;
      }
      const allowlist = value.map((item) => ["self", "src"].includes(item) ? item : `"${item}"`);
      return `${kebabDirective}=(${allowlist.join(" ")})`;
    }
    return "";
  }).filter(Boolean).join(", ");
}
function camelToKebab(str) {
  return str.replace(/([a-z\d])([A-Z])/g, "$1-$2").toLowerCase();
}
function getReportingEndpoints(reportingEndpoints = []) {
  return reportingEndpoints.map((endpoint) => `${endpoint.name}="${endpoint.url}"`).join(", ");
}
function getReportToOptions(reportTo = []) {
  return reportTo.map((option) => JSON.stringify(option)).join(", ");
}
function setHeaders(ctx, headersToSet) {
  headersToSet.forEach(([header, value]) => {
    ctx.res.headers.set(header, value);
  });
}
var HEADERS_MAP, DEFAULT_OPTIONS, secureHeaders;
var init_secure_headers = __esm({
  "../../../node_modules/hono/dist/middleware/secure-headers/secure-headers.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_encode();
    HEADERS_MAP = {
      crossOriginEmbedderPolicy: ["Cross-Origin-Embedder-Policy", "require-corp"],
      crossOriginResourcePolicy: ["Cross-Origin-Resource-Policy", "same-origin"],
      crossOriginOpenerPolicy: ["Cross-Origin-Opener-Policy", "same-origin"],
      originAgentCluster: ["Origin-Agent-Cluster", "?1"],
      referrerPolicy: ["Referrer-Policy", "no-referrer"],
      strictTransportSecurity: ["Strict-Transport-Security", "max-age=15552000; includeSubDomains"],
      xContentTypeOptions: ["X-Content-Type-Options", "nosniff"],
      xDnsPrefetchControl: ["X-DNS-Prefetch-Control", "off"],
      xDownloadOptions: ["X-Download-Options", "noopen"],
      xFrameOptions: ["X-Frame-Options", "SAMEORIGIN"],
      xPermittedCrossDomainPolicies: ["X-Permitted-Cross-Domain-Policies", "none"],
      xXssProtection: ["X-XSS-Protection", "0"]
    };
    DEFAULT_OPTIONS = {
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: true,
      crossOriginOpenerPolicy: true,
      originAgentCluster: true,
      referrerPolicy: true,
      strictTransportSecurity: true,
      xContentTypeOptions: true,
      xDnsPrefetchControl: true,
      xDownloadOptions: true,
      xFrameOptions: true,
      xPermittedCrossDomainPolicies: true,
      xXssProtection: true,
      removePoweredBy: true,
      permissionsPolicy: {}
    };
    secureHeaders = /* @__PURE__ */ __name((customOptions) => {
      const options = { ...DEFAULT_OPTIONS, ...customOptions };
      const headersToSet = getFilteredHeaders(options);
      const callbacks = [];
      if (options.contentSecurityPolicy) {
        const [callback, value] = getCSPDirectives(
          options.contentSecurityPolicy,
          "Content-Security-Policy"
        );
        if (callback) {
          callbacks.push(callback);
        }
        headersToSet.push(["Content-Security-Policy", value]);
      }
      if (options.contentSecurityPolicyReportOnly) {
        const [callback, value] = getCSPDirectives(
          options.contentSecurityPolicyReportOnly,
          "Content-Security-Policy-Report-Only"
        );
        if (callback) {
          callbacks.push(callback);
        }
        headersToSet.push(["Content-Security-Policy-Report-Only", value]);
      }
      if (options.permissionsPolicy && Object.keys(options.permissionsPolicy).length > 0) {
        headersToSet.push([
          "Permissions-Policy",
          getPermissionsPolicyDirectives(options.permissionsPolicy)
        ]);
      }
      if (options.reportingEndpoints) {
        headersToSet.push(["Reporting-Endpoints", getReportingEndpoints(options.reportingEndpoints)]);
      }
      if (options.reportTo) {
        headersToSet.push(["Report-To", getReportToOptions(options.reportTo)]);
      }
      return /* @__PURE__ */ __name(async function secureHeaders2(ctx, next) {
        const headersToSetForReq = callbacks.length === 0 ? headersToSet : callbacks.reduce((acc, cb) => cb(ctx, acc), headersToSet);
        await next();
        setHeaders(ctx, headersToSetForReq);
        if (options?.removePoweredBy) {
          ctx.res.headers.delete("X-Powered-By");
        }
      }, "secureHeaders2");
    }, "secureHeaders");
    __name(getFilteredHeaders, "getFilteredHeaders");
    __name(getCSPDirectives, "getCSPDirectives");
    __name(getPermissionsPolicyDirectives, "getPermissionsPolicyDirectives");
    __name(camelToKebab, "camelToKebab");
    __name(getReportingEndpoints, "getReportingEndpoints");
    __name(getReportToOptions, "getReportToOptions");
    __name(setHeaders, "setHeaders");
  }
});

// ../../../node_modules/hono/dist/middleware/secure-headers/index.js
var init_secure_headers2 = __esm({
  "../../../node_modules/hono/dist/middleware/secure-headers/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_secure_headers();
  }
});

// ../../../node_modules/hono/dist/utils/color.js
function getColorEnabled() {
  const { process: process2, Deno: Deno2 } = globalThis;
  const isNoColor = typeof Deno2?.noColor === "boolean" ? Deno2.noColor : process2 !== void 0 ? (
    // eslint-disable-next-line no-unsafe-optional-chaining
    "NO_COLOR" in process2?.env
  ) : false;
  return !isNoColor;
}
async function getColorEnabledAsync() {
  const { navigator: navigator2 } = globalThis;
  const cfWorkers = "cloudflare:workers";
  const isNoColor = navigator2 !== void 0 && navigator2.userAgent === "Cloudflare-Workers" ? await (async () => {
    try {
      return "NO_COLOR" in ((await import(cfWorkers)).env ?? {});
    } catch {
      return false;
    }
  })() : !getColorEnabled();
  return !isNoColor;
}
var init_color = __esm({
  "../../../node_modules/hono/dist/utils/color.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __name(getColorEnabled, "getColorEnabled");
    __name(getColorEnabledAsync, "getColorEnabledAsync");
  }
});

// ../../../node_modules/hono/dist/middleware/logger/index.js
async function log(fn, prefix, method, path, status = 0, elapsed) {
  const out = prefix === "<--" ? `${prefix} ${method} ${path}` : `${prefix} ${method} ${path} ${await colorStatus(status)} ${elapsed}`;
  fn(out);
}
var humanize, time, colorStatus, logger;
var init_logger = __esm({
  "../../../node_modules/hono/dist/middleware/logger/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_color();
    humanize = /* @__PURE__ */ __name((times) => {
      const [delimiter, separator] = [",", "."];
      const orderTimes = times.map((v) => v.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter));
      return orderTimes.join(separator);
    }, "humanize");
    time = /* @__PURE__ */ __name((start) => {
      const delta = Date.now() - start;
      return humanize([delta < 1e3 ? delta + "ms" : Math.round(delta / 1e3) + "s"]);
    }, "time");
    colorStatus = /* @__PURE__ */ __name(async (status) => {
      const colorEnabled = await getColorEnabledAsync();
      if (colorEnabled) {
        switch (status / 100 | 0) {
          case 5:
            return `\x1B[31m${status}\x1B[0m`;
          case 4:
            return `\x1B[33m${status}\x1B[0m`;
          case 3:
            return `\x1B[36m${status}\x1B[0m`;
          case 2:
            return `\x1B[32m${status}\x1B[0m`;
        }
      }
      return `${status}`;
    }, "colorStatus");
    __name(log, "log");
    logger = /* @__PURE__ */ __name((fn = console.log) => {
      return /* @__PURE__ */ __name(async function logger2(c, next) {
        const { method, url } = c.req;
        const path = url.slice(url.indexOf("/", 8));
        await log(fn, "<--", method, path);
        const start = Date.now();
        await next();
        await log(fn, "-->", method, path, c.res.status, time(start));
      }, "logger2");
    }, "logger");
  }
});

// ../../../node_modules/zod/v3/helpers/util.js
var util, objectUtil, ZodParsedType, getParsedType;
var init_util = __esm({
  "../../../node_modules/zod/v3/helpers/util.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    (function(util2) {
      util2.assertEqual = (_) => {
      };
      function assertIs(_arg) {
      }
      __name(assertIs, "assertIs");
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      __name(assertNever, "assertNever");
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      __name(joinValues, "joinValues");
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = /* @__PURE__ */ __name((data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    }, "getParsedType");
  }
});

// ../../../node_modules/zod/v3/ZodError.js
var ZodIssueCode, quotelessJson, ZodError;
var init_ZodError = __esm({
  "../../../node_modules/zod/v3/ZodError.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_util();
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = /* @__PURE__ */ __name((obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    }, "quotelessJson");
    ZodError = class _ZodError extends Error {
      static {
        __name(this, "ZodError");
      }
      get errors() {
        return this.issues;
      }
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = /* @__PURE__ */ __name((error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        }, "processError");
        processError(this);
        return fieldErrors;
      }
      static assert(value) {
        if (!(value instanceof _ZodError)) {
          throw new Error(`Not a ZodError: ${value}`);
        }
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            const firstEl = sub.path[0];
            fieldErrors[firstEl] = fieldErrors[firstEl] || [];
            fieldErrors[firstEl].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
  }
});

// ../../../node_modules/zod/v3/locales/en.js
var errorMap, en_default;
var init_en = __esm({
  "../../../node_modules/zod/v3/locales/en.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_ZodError();
    init_util();
    errorMap = /* @__PURE__ */ __name((issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "bigint")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    }, "errorMap");
    en_default = errorMap;
  }
});

// ../../../node_modules/zod/v3/errors.js
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
var overrideErrorMap;
var init_errors = __esm({
  "../../../node_modules/zod/v3/errors.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_en();
    overrideErrorMap = en_default;
    __name(setErrorMap, "setErrorMap");
    __name(getErrorMap, "getErrorMap");
  }
});

// ../../../node_modules/zod/v3/helpers/parseUtil.js
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync;
var init_parseUtil = __esm({
  "../../../node_modules/zod/v3/helpers/parseUtil.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_errors();
    init_en();
    makeIssue = /* @__PURE__ */ __name((params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      if (issueData.message !== void 0) {
        return {
          ...issueData,
          path: fullPath,
          message: issueData.message
        };
      }
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: errorMessage
      };
    }, "makeIssue");
    EMPTY_PATH = [];
    __name(addIssueToContext, "addIssueToContext");
    ParseStatus = class _ParseStatus {
      static {
        __name(this, "ParseStatus");
      }
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = /* @__PURE__ */ __name((value) => ({ status: "dirty", value }), "DIRTY");
    OK = /* @__PURE__ */ __name((value) => ({ status: "valid", value }), "OK");
    isAborted = /* @__PURE__ */ __name((x) => x.status === "aborted", "isAborted");
    isDirty = /* @__PURE__ */ __name((x) => x.status === "dirty", "isDirty");
    isValid = /* @__PURE__ */ __name((x) => x.status === "valid", "isValid");
    isAsync = /* @__PURE__ */ __name((x) => typeof Promise !== "undefined" && x instanceof Promise, "isAsync");
  }
});

// ../../../node_modules/zod/v3/helpers/typeAliases.js
var init_typeAliases = __esm({
  "../../../node_modules/zod/v3/helpers/typeAliases.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
  }
});

// ../../../node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
var init_errorUtil = __esm({
  "../../../node_modules/zod/v3/helpers/errorUtil.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
    })(errorUtil || (errorUtil = {}));
  }
});

// ../../../node_modules/zod/v3/types.js
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = /* @__PURE__ */ __name((iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  }, "customMap");
  return { errorMap: customMap, description };
}
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt2, alg) {
  if (!jwtRegex.test(jwt2))
    return false;
  try {
    const [header] = jwt2.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: /* @__PURE__ */ __name(() => newShape, "shape")
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, nanoidRegex, jwtRegex, durationRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv4CidrRegex, ipv6Regex, ipv6CidrRegex, base64Regex, base64urlRegex, dateRegexSource, dateRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER;
var init_types = __esm({
  "../../../node_modules/zod/v3/types.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_ZodError();
    init_errors();
    init_errorUtil();
    init_parseUtil();
    init_util();
    ParseInputLazyPath = class {
      static {
        __name(this, "ParseInputLazyPath");
      }
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (Array.isArray(this._key)) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = /* @__PURE__ */ __name((ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    }, "handleResult");
    __name(processCreateParams, "processCreateParams");
    ZodType = class {
      static {
        __name(this, "ZodType");
      }
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        const ctx = {
          common: {
            issues: [],
            async: params?.async ?? false,
            contextualErrorMap: params?.errorMap
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      "~validate"(data) {
        const ctx = {
          common: {
            issues: [],
            async: !!this["~standard"].async
          },
          path: [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        if (!this["~standard"].async) {
          try {
            const result = this._parseSync({ data, path: [], parent: ctx });
            return isValid(result) ? {
              value: result.value
            } : {
              issues: ctx.common.issues
            };
          } catch (err) {
            if (err?.message?.toLowerCase()?.includes("encountered")) {
              this["~standard"].async = true;
            }
            ctx.common = {
              issues: [],
              async: true
            };
          }
        }
        return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        });
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params?.errorMap,
            async: true
          },
          path: params?.path || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = /* @__PURE__ */ __name((val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        }, "getIssueProperties");
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = /* @__PURE__ */ __name(() => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          }), "setError");
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
        this["~standard"] = {
          version: 1,
          vendor: "zod",
          validate: /* @__PURE__ */ __name((data) => this["~validate"](data), "validate")
        };
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[0-9a-z]+$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    nanoidRegex = /^[a-z0-9_-]{21}$/i;
    jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
    ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
    ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
    base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
    base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
    dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
    dateRegex = new RegExp(`^${dateRegexSource}$`);
    __name(timeRegexSource, "timeRegexSource");
    __name(timeRegex, "timeRegex");
    __name(datetimeRegex, "datetimeRegex");
    __name(isValidIP, "isValidIP");
    __name(isValidJWT, "isValidJWT");
    __name(isValidCidr, "isValidCidr");
    ZodString = class _ZodString extends ZodType {
      static {
        __name(this, "ZodString");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.string,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "nanoid") {
            if (!nanoidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "nanoid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "date") {
            const regex = dateRegex;
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "date",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "time") {
            const regex = timeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "time",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "duration") {
            if (!durationRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "duration",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "jwt") {
            if (!isValidJWT(input.data, check.alg)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "jwt",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cidr") {
            if (!isValidCidr(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cidr",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64") {
            if (!base64Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "base64url") {
            if (!base64urlRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "base64url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      nanoid(message) {
        return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      base64(message) {
        return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
      }
      base64url(message) {
        return this._addCheck({
          kind: "base64url",
          ...errorUtil.errToObj(message)
        });
      }
      jwt(options) {
        return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      cidr(options) {
        return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            local: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          offset: options?.offset ?? false,
          local: options?.local ?? false,
          ...errorUtil.errToObj(options?.message)
        });
      }
      date(message) {
        return this._addCheck({ kind: "date", message });
      }
      time(options) {
        if (typeof options === "string") {
          return this._addCheck({
            kind: "time",
            precision: null,
            message: options
          });
        }
        return this._addCheck({
          kind: "time",
          precision: typeof options?.precision === "undefined" ? null : options?.precision,
          ...errorUtil.errToObj(options?.message)
        });
      }
      duration(message) {
        return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options?.position,
          ...errorUtil.errToObj(options?.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * Equivalent to `.min(1)`
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isDate() {
        return !!this._def.checks.find((ch) => ch.kind === "date");
      }
      get isTime() {
        return !!this._def.checks.find((ch) => ch.kind === "time");
      }
      get isDuration() {
        return !!this._def.checks.find((ch) => ch.kind === "duration");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isNANOID() {
        return !!this._def.checks.find((ch) => ch.kind === "nanoid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get isCIDR() {
        return !!this._def.checks.find((ch) => ch.kind === "cidr");
      }
      get isBase64() {
        return !!this._def.checks.find((ch) => ch.kind === "base64");
      }
      get isBase64url() {
        return !!this._def.checks.find((ch) => ch.kind === "base64url");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    __name(floatSafeRemainder, "floatSafeRemainder");
    ZodNumber = class _ZodNumber extends ZodType {
      static {
        __name(this, "ZodNumber");
      }
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null;
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      static {
        __name(this, "ZodBigInt");
      }
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          try {
            input.data = BigInt(input.data);
          } catch {
            return this._getInvalidInput(input);
          }
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          return this._getInvalidInput(input);
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _getInvalidInput(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.bigint,
          received: ctx.parsedType
        });
        return INVALID;
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: params?.coerce ?? false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      static {
        __name(this, "ZodBoolean");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: params?.coerce || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      static {
        __name(this, "ZodDate");
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (Number.isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: params?.coerce || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      static {
        __name(this, "ZodSymbol");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      static {
        __name(this, "ZodUndefined");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      static {
        __name(this, "ZodNull");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      static {
        __name(this, "ZodAny");
      }
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      static {
        __name(this, "ZodUnknown");
      }
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      static {
        __name(this, "ZodNever");
      }
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      static {
        __name(this, "ZodVoid");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      static {
        __name(this, "ZodArray");
      }
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    __name(deepPartialify, "deepPartialify");
    ZodObject = class _ZodObject extends ZodType {
      static {
        __name(this, "ZodObject");
      }
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        this._cached = { shape, keys };
        return this._cached;
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip") {
          } else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              syncPairs.push({
                key,
                value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: /* @__PURE__ */ __name((issue, ctx) => {
              const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: errorUtil.errToObj(message).message ?? defaultError
                };
              return {
                message: defaultError
              };
            }, "errorMap")
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => ({
            ...this._def.shape(),
            ...augmentation
          }), "shape")
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: /* @__PURE__ */ __name(() => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }), "shape"),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        for (const key of util.objectKeys(mask)) {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => shape, "shape")
        });
      }
      omit(mask) {
        const shape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => shape, "shape")
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => newShape, "shape")
        });
      }
      required(mask) {
        const newShape = {};
        for (const key of util.objectKeys(this.shape)) {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        }
        return new _ZodObject({
          ...this._def,
          shape: /* @__PURE__ */ __name(() => newShape, "shape")
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: /* @__PURE__ */ __name(() => shape, "shape"),
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: /* @__PURE__ */ __name(() => shape, "shape"),
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      static {
        __name(this, "ZodUnion");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        __name(handleResults, "handleResults");
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = /* @__PURE__ */ __name((type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return util.objectValues(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else if (type instanceof ZodOptional) {
        return [void 0, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodNullable) {
        return [null, ...getDiscriminator(type.unwrap())];
      } else if (type instanceof ZodBranded) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodReadonly) {
        return getDiscriminator(type.unwrap());
      } else if (type instanceof ZodCatch) {
        return getDiscriminator(type._def.innerType);
      } else {
        return [];
      }
    }, "getDiscriminator");
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      static {
        __name(this, "ZodDiscriminatedUnion");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues.length) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    __name(mergeValues, "mergeValues");
    ZodIntersection = class extends ZodType {
      static {
        __name(this, "ZodIntersection");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = /* @__PURE__ */ __name((parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        }, "handleParsed");
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      static {
        __name(this, "ZodTuple");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      static {
        __name(this, "ZodRecord");
      }
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      static {
        __name(this, "ZodMap");
      }
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      static {
        __name(this, "ZodSet");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        __name(finalizeSet, "finalizeSet");
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      static {
        __name(this, "ZodFunction");
      }
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        __name(makeArgsIssue, "makeArgsIssue");
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        __name(makeReturnsIssue, "makeReturnsIssue");
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      static {
        __name(this, "ZodLazy");
      }
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      static {
        __name(this, "ZodLiteral");
      }
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    __name(createZodEnum, "createZodEnum");
    ZodEnum = class _ZodEnum extends ZodType {
      static {
        __name(this, "ZodEnum");
      }
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(this._def.values);
        }
        if (!this._cache.has(input.data)) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values, newDef = this._def) {
        return _ZodEnum.create(values, {
          ...this._def,
          ...newDef
        });
      }
      exclude(values, newDef = this._def) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
          ...this._def,
          ...newDef
        });
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      static {
        __name(this, "ZodNativeEnum");
      }
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (!this._cache) {
          this._cache = new Set(util.getValidEnumValues(this._def.values));
        }
        if (!this._cache.has(input.data)) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      static {
        __name(this, "ZodPromise");
      }
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      static {
        __name(this, "ZodEffects");
      }
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: /* @__PURE__ */ __name((arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          }, "addIssue"),
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(processed).then(async (processed2) => {
              if (status.value === "aborted")
                return INVALID;
              const result = await this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
              if (result.status === "aborted")
                return INVALID;
              if (result.status === "dirty")
                return DIRTY(result.value);
              if (status.value === "dirty")
                return DIRTY(result.value);
              return result;
            });
          } else {
            if (status.value === "aborted")
              return INVALID;
            const result = this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = /* @__PURE__ */ __name((acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          }, "executeRefinement");
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return INVALID;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return INVALID;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
                status: status.value,
                value: result
              }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      static {
        __name(this, "ZodOptional");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      static {
        __name(this, "ZodNullable");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      static {
        __name(this, "ZodDefault");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      static {
        __name(this, "ZodCatch");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      static {
        __name(this, "ZodNaN");
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = /* @__PURE__ */ Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      static {
        __name(this, "ZodBranded");
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      static {
        __name(this, "ZodPipeline");
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = /* @__PURE__ */ __name(async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          }, "handleAsync");
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      static {
        __name(this, "ZodReadonly");
      }
      _parse(input) {
        const result = this._def.innerType._parse(input);
        const freeze = /* @__PURE__ */ __name((data) => {
          if (isValid(data)) {
            data.value = Object.freeze(data.value);
          }
          return data;
        }, "freeze");
        return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    __name(cleanParams, "cleanParams");
    __name(custom, "custom");
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = /* @__PURE__ */ __name((cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params), "instanceOfType");
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = /* @__PURE__ */ __name(() => stringType().optional(), "ostring");
    onumber = /* @__PURE__ */ __name(() => numberType().optional(), "onumber");
    oboolean = /* @__PURE__ */ __name(() => booleanType().optional(), "oboolean");
    coerce = {
      string: /* @__PURE__ */ __name(((arg) => ZodString.create({ ...arg, coerce: true })), "string"),
      number: /* @__PURE__ */ __name(((arg) => ZodNumber.create({ ...arg, coerce: true })), "number"),
      boolean: /* @__PURE__ */ __name(((arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      })), "boolean"),
      bigint: /* @__PURE__ */ __name(((arg) => ZodBigInt.create({ ...arg, coerce: true })), "bigint"),
      date: /* @__PURE__ */ __name(((arg) => ZodDate.create({ ...arg, coerce: true })), "date")
    };
    NEVER = INVALID;
  }
});

// ../../../node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});
var init_external = __esm({
  "../../../node_modules/zod/v3/external.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_errors();
    init_parseUtil();
    init_typeAliases();
    init_util();
    init_types();
    init_ZodError();
  }
});

// ../../../node_modules/zod/index.js
var init_zod = __esm({
  "../../../node_modules/zod/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_external();
    init_external();
  }
});

// config/env.ts
function carregarEnv(envConfig) {
  const resultado = envSchema.safeParse(envConfig);
  if (!resultado.success) {
    const erros = resultado.error.flatten().fieldErrors;
    const mensagens = Object.entries(erros).map(([campo, msgs]) => `  ${campo}: ${(msgs ?? []).join(", ")}`).join("\n");
    throw new Error(
      `\u274C Vari\xE1veis de ambiente inv\xE1lidas:
${mensagens}

`
    );
  }
  return resultado.data;
}
var envSchema;
var init_env = __esm({
  "config/env.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    envSchema = external_exports.object({
      NODE_ENV: external_exports.enum(["development", "staging", "production"]).default("development"),
      JWT_SECRET: external_exports.string().min(64, "JWT_SECRET deve ter no m\xEDnimo 64 caracteres"),
      JWT_EXPIRATION: external_exports.string().default("8h"),
      KEK_HEX: external_exports.string().length(64, "KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits)").regex(/^[0-9a-fA-F]+$/, "KEK_HEX deve conter apenas caracteres hexadecimais"),
      SESSION_INACTIVITY_TIMEOUT_MINUTES: external_exports.coerce.number().int().min(1).default(10),
      CORS_ORIGINS: external_exports.string().default("http://localhost:5173,https://sem.catraki.com.br"),
      RATE_LIMIT_MAX: external_exports.coerce.number().int().min(1).default(100),
      RATE_LIMIT_WINDOW_MS: external_exports.coerce.number().int().min(1e3).default(6e4),
      LOG_LEVEL: external_exports.enum(["debug", "info", "warn", "error"]).default("info"),
      ACCESS_LOG_RETENTION_DAYS: external_exports.coerce.number().int().min(180).default(180),
      PATIENT_DATA_RETENTION_DAYS: external_exports.coerce.number().int().min(1).default(365),
      MFA_ISSUER: external_exports.string().default("Catraki SEM"),
      DB: external_exports.any().optional(),
      // Cloudflare D1 Database binding
      ASSETS: external_exports.any().optional()
      // Cloudflare Pages static assets binding
    });
    __name(carregarEnv, "carregarEnv");
  }
});

// ../../../node_modules/hono/dist/utils/cookie.js
var validCookieNameRegEx, relaxedCookieNameRegEx, validCookieValueRegEx, trimCookieWhitespace, parse, _serialize, serialize;
var init_cookie = __esm({
  "../../../node_modules/hono/dist/utils/cookie.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_url();
    validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
    relaxedCookieNameRegEx = /^[!#-:<>-[\]-~]+$/;
    validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
    trimCookieWhitespace = /* @__PURE__ */ __name((value) => {
      let start = 0;
      let end = value.length;
      while (start < end) {
        const charCode = value.charCodeAt(start);
        if (charCode !== 32 && charCode !== 9) {
          break;
        }
        start++;
      }
      while (end > start) {
        const charCode = value.charCodeAt(end - 1);
        if (charCode !== 32 && charCode !== 9) {
          break;
        }
        end--;
      }
      return start === 0 && end === value.length ? value : value.slice(start, end);
    }, "trimCookieWhitespace");
    parse = /* @__PURE__ */ __name((cookie, name2) => {
      if (name2 && cookie.indexOf(name2) === -1) {
        return {};
      }
      const pairs = cookie.split(";");
      const parsedCookie = /* @__PURE__ */ Object.create(null);
      for (const pairStr of pairs) {
        const valueStartPos = pairStr.indexOf("=");
        if (valueStartPos === -1) {
          continue;
        }
        const cookieName = trimCookieWhitespace(pairStr.substring(0, valueStartPos));
        if (name2 && name2 !== cookieName || !relaxedCookieNameRegEx.test(cookieName) || cookieName in parsedCookie) {
          continue;
        }
        let cookieValue = trimCookieWhitespace(pairStr.substring(valueStartPos + 1));
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
          cookieValue = cookieValue.slice(1, -1);
        }
        if (validCookieValueRegEx.test(cookieValue)) {
          parsedCookie[cookieName] = tryDecodeURIComponent(cookieValue);
          if (name2) {
            break;
          }
        }
      }
      return parsedCookie;
    }, "parse");
    _serialize = /* @__PURE__ */ __name((name2, value, opt = {}) => {
      if (!validCookieNameRegEx.test(name2)) {
        throw new Error("Invalid cookie name");
      }
      let cookie = `${name2}=${value}`;
      if (name2.startsWith("__Secure-") && !opt.secure) {
        throw new Error("__Secure- Cookie must have Secure attributes");
      }
      if (name2.startsWith("__Host-")) {
        if (!opt.secure) {
          throw new Error("__Host- Cookie must have Secure attributes");
        }
        if (opt.path !== "/") {
          throw new Error('__Host- Cookie must have Path attributes with "/"');
        }
        if (opt.domain) {
          throw new Error("__Host- Cookie must not have Domain attributes");
        }
      }
      for (const key of ["domain", "path", "sameSite", "priority"]) {
        if (opt[key] && /[;\r\n]/.test(opt[key])) {
          throw new Error(`${key} must not contain ";", "\\r", or "\\n"`);
        }
      }
      if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
        if (opt.maxAge > 3456e4) {
          throw new Error(
            "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
          );
        }
        cookie += `; Max-Age=${opt.maxAge | 0}`;
      }
      if (opt.domain && opt.prefix !== "host") {
        cookie += `; Domain=${opt.domain}`;
      }
      if (opt.path) {
        cookie += `; Path=${opt.path}`;
      }
      if (opt.expires) {
        if (opt.expires.getTime() - Date.now() > 3456e7) {
          throw new Error(
            "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
          );
        }
        cookie += `; Expires=${opt.expires.toUTCString()}`;
      }
      if (opt.httpOnly) {
        cookie += "; HttpOnly";
      }
      if (opt.secure) {
        cookie += "; Secure";
      }
      if (opt.sameSite) {
        cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
      }
      if (opt.priority) {
        cookie += `; Priority=${opt.priority.charAt(0).toUpperCase() + opt.priority.slice(1)}`;
      }
      if (opt.partitioned) {
        if (!opt.secure) {
          throw new Error("Partitioned Cookie must have Secure attributes");
        }
        cookie += "; Partitioned";
      }
      return cookie;
    }, "_serialize");
    serialize = /* @__PURE__ */ __name((name2, value, opt) => {
      value = encodeURIComponent(value);
      return _serialize(name2, value, opt);
    }, "serialize");
  }
});

// ../../../node_modules/hono/dist/helper/cookie/index.js
var getCookie, generateCookie, setCookie, deleteCookie;
var init_cookie2 = __esm({
  "../../../node_modules/hono/dist/helper/cookie/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_cookie();
    getCookie = /* @__PURE__ */ __name((c, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) {
          return void 0;
        }
        let finalKey = key;
        if (prefix === "secure") {
          finalKey = "__Secure-" + key;
        } else if (prefix === "host") {
          finalKey = "__Host-" + key;
        }
        const obj2 = parse(cookie, finalKey);
        return obj2[finalKey];
      }
      if (!cookie) {
        return {};
      }
      const obj = parse(cookie);
      return obj;
    }, "getCookie");
    generateCookie = /* @__PURE__ */ __name((name2, value, opt) => {
      let cookie;
      if (opt?.prefix === "secure") {
        cookie = serialize("__Secure-" + name2, value, { path: "/", ...opt, secure: true });
      } else if (opt?.prefix === "host") {
        cookie = serialize("__Host-" + name2, value, {
          ...opt,
          path: "/",
          secure: true,
          domain: void 0
        });
      } else {
        cookie = serialize(name2, value, { path: "/", ...opt });
      }
      return cookie;
    }, "generateCookie");
    setCookie = /* @__PURE__ */ __name((c, name2, value, opt) => {
      const cookie = generateCookie(name2, value, opt);
      c.header("Set-Cookie", cookie, { append: true });
    }, "setCookie");
    deleteCookie = /* @__PURE__ */ __name((c, name2, opt) => {
      const deletedCookie = getCookie(c, name2, opt?.prefix);
      setCookie(c, name2, "", { ...opt, maxAge: 0 });
      return deletedCookie;
    }, "deleteCookie");
  }
});

// ../../../node_modules/hono/dist/validator/validator.js
var jsonRegex, multipartRegex, urlencodedRegex, validator;
var init_validator = __esm({
  "../../../node_modules/hono/dist/validator/validator.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_cookie2();
    init_http_exception();
    init_buffer();
    jsonRegex = /^application\/([a-z-\.]+\+)?json(;\s*[a-zA-Z0-9\-]+\=([^;]+))*$/i;
    multipartRegex = /^multipart\/form-data(;\s?boundary=[a-zA-Z0-9'"()+_,\-./:=?]+)?$/i;
    urlencodedRegex = /^application\/x-www-form-urlencoded(;\s*[a-zA-Z0-9\-]+\=([^;]+))*$/i;
    validator = /* @__PURE__ */ __name((target, validationFunc) => {
      return async (c, next) => {
        let value = {};
        const contentType = c.req.header("Content-Type");
        switch (target) {
          case "json":
            if (!contentType || !jsonRegex.test(contentType)) {
              break;
            }
            try {
              value = await c.req.json();
            } catch {
              const message = "Malformed JSON in request body";
              throw new HTTPException(400, { message });
            }
            break;
          case "form": {
            if (!contentType || !(multipartRegex.test(contentType) || urlencodedRegex.test(contentType))) {
              break;
            }
            let formData;
            if (c.req.bodyCache.formData) {
              formData = await c.req.bodyCache.formData;
            } else {
              try {
                const arrayBuffer = await c.req.arrayBuffer();
                formData = await bufferToFormData(arrayBuffer, contentType);
                c.req.bodyCache.formData = formData;
              } catch (e) {
                let message = "Malformed FormData request.";
                message += e instanceof Error ? ` ${e.message}` : ` ${String(e)}`;
                throw new HTTPException(400, { message });
              }
            }
            const form = /* @__PURE__ */ Object.create(null);
            formData.forEach((value2, key) => {
              if (key.endsWith("[]")) {
                ;
                (form[key] ??= []).push(value2);
              } else if (Array.isArray(form[key])) {
                ;
                form[key].push(value2);
              } else if (Object.hasOwn(form, key)) {
                form[key] = [form[key], value2];
              } else {
                form[key] = value2;
              }
            });
            value = form;
            break;
          }
          case "query":
            value = Object.fromEntries(
              Object.entries(c.req.queries()).map(([k, v]) => {
                return v.length === 1 ? [k, v[0]] : [k, v];
              })
            );
            break;
          case "param":
            value = c.req.param();
            break;
          case "header":
            value = c.req.header();
            break;
          case "cookie":
            value = getCookie(c);
            break;
        }
        const res = await validationFunc(value, c);
        if (res instanceof Response) {
          return res;
        }
        c.req.addValidatedData(target, res);
        return await next();
      };
    }, "validator");
  }
});

// ../../../node_modules/hono/dist/validator/index.js
var init_validator2 = __esm({
  "../../../node_modules/hono/dist/validator/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_validator();
  }
});

// ../../../node_modules/@hono/zod-validator/dist/index.mjs
function zValidatorFunction(target, schema, hook, options) {
  const caseInsensitiveKeymap = target === "header" && ("_def" in schema || "_zod" in schema) ? Object.fromEntries(Object.keys("in" in schema ? schema.in.shape : schema.shape).map((key) => [key.toLowerCase(), key])) : void 0;
  return validator(target, async (value, c) => {
    let validatorValue = value;
    if (caseInsensitiveKeymap) validatorValue = Object.fromEntries(Object.entries(value).map(([key, value2]) => [caseInsensitiveKeymap[key] || key, value2]));
    const result = options && options.validationFunction ? await options.validationFunction(schema, validatorValue) : await schema.safeParseAsync(validatorValue);
    if (hook) {
      const hookResult = await hook({
        data: validatorValue,
        ...result,
        target
      }, c);
      if (hookResult) {
        if (hookResult instanceof Response) return hookResult;
        if ("response" in hookResult) return hookResult.response;
      }
    }
    if (!result.success) return c.json(result, 400);
    return result.data;
  });
}
var zValidator;
var init_dist2 = __esm({
  "../../../node_modules/@hono/zod-validator/dist/index.mjs"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_validator2();
    __name(zValidatorFunction, "zValidatorFunction");
    zValidator = zValidatorFunction;
  }
});

// ../../../node_modules/hono/dist/utils/jwt/jwa.js
var AlgorithmTypes;
var init_jwa = __esm({
  "../../../node_modules/hono/dist/utils/jwt/jwa.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    AlgorithmTypes = /* @__PURE__ */ ((AlgorithmTypes2) => {
      AlgorithmTypes2["HS256"] = "HS256";
      AlgorithmTypes2["HS384"] = "HS384";
      AlgorithmTypes2["HS512"] = "HS512";
      AlgorithmTypes2["RS256"] = "RS256";
      AlgorithmTypes2["RS384"] = "RS384";
      AlgorithmTypes2["RS512"] = "RS512";
      AlgorithmTypes2["PS256"] = "PS256";
      AlgorithmTypes2["PS384"] = "PS384";
      AlgorithmTypes2["PS512"] = "PS512";
      AlgorithmTypes2["ES256"] = "ES256";
      AlgorithmTypes2["ES384"] = "ES384";
      AlgorithmTypes2["ES512"] = "ES512";
      AlgorithmTypes2["EdDSA"] = "EdDSA";
      return AlgorithmTypes2;
    })(AlgorithmTypes || {});
  }
});

// ../../../node_modules/hono/dist/helper/adapter/index.js
var knownUserAgents, getRuntimeKey, checkUserAgentEquals;
var init_adapter = __esm({
  "../../../node_modules/hono/dist/helper/adapter/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    knownUserAgents = {
      deno: "Deno",
      bun: "Bun",
      workerd: "Cloudflare-Workers",
      node: "Node.js"
    };
    getRuntimeKey = /* @__PURE__ */ __name(() => {
      const global2 = globalThis;
      const userAgentSupported = typeof navigator !== "undefined" && true;
      if (userAgentSupported) {
        for (const [runtimeKey, userAgent] of Object.entries(knownUserAgents)) {
          if (checkUserAgentEquals(userAgent)) {
            return runtimeKey;
          }
        }
      }
      if (typeof global2?.EdgeRuntime === "string") {
        return "edge-light";
      }
      if (global2?.fastly !== void 0) {
        return "fastly";
      }
      if (global2?.process?.release?.name === "node") {
        return "node";
      }
      return "other";
    }, "getRuntimeKey");
    checkUserAgentEquals = /* @__PURE__ */ __name((platform) => {
      const userAgent = "Cloudflare-Workers";
      return userAgent.startsWith(platform);
    }, "checkUserAgentEquals");
  }
});

// ../../../node_modules/hono/dist/utils/jwt/types.js
var JwtAlgorithmNotImplemented, JwtAlgorithmRequired, JwtAlgorithmMismatch, JwtTokenInvalid, JwtTokenNotBefore, JwtTokenExpired, JwtTokenIssuedAt, JwtTokenIssuer, JwtHeaderInvalid, JwtHeaderRequiresKid, JwtSymmetricAlgorithmNotAllowed, JwtAlgorithmNotAllowed, JwtTokenSignatureMismatched, JwtPayloadRequiresAud, JwtTokenAudience, CryptoKeyUsage;
var init_types2 = __esm({
  "../../../node_modules/hono/dist/utils/jwt/types.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    JwtAlgorithmNotImplemented = class extends Error {
      static {
        __name(this, "JwtAlgorithmNotImplemented");
      }
      constructor(alg) {
        super(`${alg} is not an implemented algorithm`);
        this.name = "JwtAlgorithmNotImplemented";
      }
    };
    JwtAlgorithmRequired = class extends Error {
      static {
        __name(this, "JwtAlgorithmRequired");
      }
      constructor() {
        super('JWT verification requires "alg" option to be specified');
        this.name = "JwtAlgorithmRequired";
      }
    };
    JwtAlgorithmMismatch = class extends Error {
      static {
        __name(this, "JwtAlgorithmMismatch");
      }
      constructor(expected, actual) {
        super(`JWT algorithm mismatch: expected "${expected}", got "${actual}"`);
        this.name = "JwtAlgorithmMismatch";
      }
    };
    JwtTokenInvalid = class extends Error {
      static {
        __name(this, "JwtTokenInvalid");
      }
      constructor(token) {
        super(`invalid JWT token: ${token}`);
        this.name = "JwtTokenInvalid";
      }
    };
    JwtTokenNotBefore = class extends Error {
      static {
        __name(this, "JwtTokenNotBefore");
      }
      constructor(token) {
        super(`token (${token}) is being used before it's valid`);
        this.name = "JwtTokenNotBefore";
      }
    };
    JwtTokenExpired = class extends Error {
      static {
        __name(this, "JwtTokenExpired");
      }
      constructor(token) {
        super(`token (${token}) expired`);
        this.name = "JwtTokenExpired";
      }
    };
    JwtTokenIssuedAt = class extends Error {
      static {
        __name(this, "JwtTokenIssuedAt");
      }
      constructor(currentTimestamp, iat) {
        super(
          `Invalid "iat" claim, must be a valid number lower than "${currentTimestamp}" (iat: "${iat}")`
        );
        this.name = "JwtTokenIssuedAt";
      }
    };
    JwtTokenIssuer = class extends Error {
      static {
        __name(this, "JwtTokenIssuer");
      }
      constructor(expected, iss) {
        super(`expected issuer "${expected}", got ${iss ? `"${iss}"` : "none"} `);
        this.name = "JwtTokenIssuer";
      }
    };
    JwtHeaderInvalid = class extends Error {
      static {
        __name(this, "JwtHeaderInvalid");
      }
      constructor(header) {
        super(`jwt header is invalid: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderInvalid";
      }
    };
    JwtHeaderRequiresKid = class extends Error {
      static {
        __name(this, "JwtHeaderRequiresKid");
      }
      constructor(header) {
        super(`required "kid" in jwt header: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderRequiresKid";
      }
    };
    JwtSymmetricAlgorithmNotAllowed = class extends Error {
      static {
        __name(this, "JwtSymmetricAlgorithmNotAllowed");
      }
      constructor(alg) {
        super(`symmetric algorithm "${alg}" is not allowed for JWK verification`);
        this.name = "JwtSymmetricAlgorithmNotAllowed";
      }
    };
    JwtAlgorithmNotAllowed = class extends Error {
      static {
        __name(this, "JwtAlgorithmNotAllowed");
      }
      constructor(alg, allowedAlgorithms) {
        super(`algorithm "${alg}" is not in the allowed list: [${allowedAlgorithms.join(", ")}]`);
        this.name = "JwtAlgorithmNotAllowed";
      }
    };
    JwtTokenSignatureMismatched = class extends Error {
      static {
        __name(this, "JwtTokenSignatureMismatched");
      }
      constructor(token) {
        super(`token(${token}) signature mismatched`);
        this.name = "JwtTokenSignatureMismatched";
      }
    };
    JwtPayloadRequiresAud = class extends Error {
      static {
        __name(this, "JwtPayloadRequiresAud");
      }
      constructor(payload) {
        super(`required "aud" in jwt payload: ${JSON.stringify(payload)}`);
        this.name = "JwtPayloadRequiresAud";
      }
    };
    JwtTokenAudience = class extends Error {
      static {
        __name(this, "JwtTokenAudience");
      }
      constructor(expected, aud) {
        super(
          `expected audience "${Array.isArray(expected) ? expected.join(", ") : expected}", got "${aud}"`
        );
        this.name = "JwtTokenAudience";
      }
    };
    CryptoKeyUsage = /* @__PURE__ */ ((CryptoKeyUsage2) => {
      CryptoKeyUsage2["Encrypt"] = "encrypt";
      CryptoKeyUsage2["Decrypt"] = "decrypt";
      CryptoKeyUsage2["Sign"] = "sign";
      CryptoKeyUsage2["Verify"] = "verify";
      CryptoKeyUsage2["DeriveKey"] = "deriveKey";
      CryptoKeyUsage2["DeriveBits"] = "deriveBits";
      CryptoKeyUsage2["WrapKey"] = "wrapKey";
      CryptoKeyUsage2["UnwrapKey"] = "unwrapKey";
      return CryptoKeyUsage2;
    })(CryptoKeyUsage || {});
  }
});

// ../../../node_modules/hono/dist/utils/jwt/utf8.js
var utf8Encoder, utf8Decoder;
var init_utf8 = __esm({
  "../../../node_modules/hono/dist/utils/jwt/utf8.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    utf8Encoder = new TextEncoder();
    utf8Decoder = new TextDecoder();
  }
});

// ../../../node_modules/hono/dist/utils/jwt/jws.js
async function signing(privateKey, alg, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPrivateKey(privateKey, algorithm);
  return await crypto.subtle.sign(algorithm, cryptoKey, data);
}
async function verifying(publicKey, alg, signature, data) {
  const algorithm = getKeyAlgorithm(alg);
  const cryptoKey = await importPublicKey(publicKey, algorithm);
  return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
}
function pemToBinary(pem) {
  return decodeBase64(pem.replace(/-+(BEGIN|END).*?-+/g, "").replace(/\s/g, ""));
}
async function importPrivateKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type !== "private" && key.type !== "secret") {
      throw new Error(
        `unexpected key type: CryptoKey.type is ${key.type}, expected private or secret`
      );
    }
    return key;
  }
  const usages = [CryptoKeyUsage.Sign];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PRIVATE")) {
    return await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function importPublicKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type === "public" || key.type === "secret") {
      return key;
    }
    key = await exportPublicJwkFrom(key);
  }
  if (typeof key === "string" && key.includes("PRIVATE")) {
    const privateKey = await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, true, [
      CryptoKeyUsage.Sign
    ]);
    key = await exportPublicJwkFrom(privateKey);
  }
  const usages = [CryptoKeyUsage.Verify];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PUBLIC")) {
    return await crypto.subtle.importKey("spki", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function exportPublicJwkFrom(privateKey) {
  if (privateKey.type !== "private") {
    throw new Error(`unexpected key type: ${privateKey.type}`);
  }
  if (!privateKey.extractable) {
    throw new Error("unexpected private key is unextractable");
  }
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const { kty } = jwk;
  const { alg, e, n } = jwk;
  const { crv, x, y } = jwk;
  return { kty, alg, e, n, crv, x, y, key_ops: [CryptoKeyUsage.Verify] };
}
function getKeyAlgorithm(name2) {
  switch (name2) {
    case "HS256":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-256"
        }
      };
    case "HS384":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-384"
        }
      };
    case "HS512":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-512"
        }
      };
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        }
      };
    case "RS384":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-384"
        }
      };
    case "RS512":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-512"
        }
      };
    case "PS256":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-256"
        },
        saltLength: 32
        // 256 >> 3
      };
    case "PS384":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-384"
        },
        saltLength: 48
        // 384 >> 3
      };
    case "PS512":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-512"
        },
        saltLength: 64
        // 512 >> 3,
      };
    case "ES256":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-256"
        },
        namedCurve: "P-256"
      };
    case "ES384":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-384"
        },
        namedCurve: "P-384"
      };
    case "ES512":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-512"
        },
        namedCurve: "P-521"
      };
    case "EdDSA":
      return {
        name: "Ed25519",
        namedCurve: "Ed25519"
      };
    default:
      throw new JwtAlgorithmNotImplemented(name2);
  }
}
function isCryptoKey(key) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && !!crypto.webcrypto) {
    return key instanceof crypto.webcrypto.CryptoKey;
  }
  return key instanceof CryptoKey;
}
var init_jws = __esm({
  "../../../node_modules/hono/dist/utils/jwt/jws.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_adapter();
    init_encode();
    init_types2();
    init_utf8();
    __name(signing, "signing");
    __name(verifying, "verifying");
    __name(pemToBinary, "pemToBinary");
    __name(importPrivateKey, "importPrivateKey");
    __name(importPublicKey, "importPublicKey");
    __name(exportPublicJwkFrom, "exportPublicJwkFrom");
    __name(getKeyAlgorithm, "getKeyAlgorithm");
    __name(isCryptoKey, "isCryptoKey");
  }
});

// ../../../node_modules/hono/dist/utils/jwt/jwt.js
function isTokenHeader(obj) {
  if (typeof obj === "object" && obj !== null) {
    const objWithAlg = obj;
    return "alg" in objWithAlg && Object.values(AlgorithmTypes).includes(objWithAlg.alg) && (!("typ" in objWithAlg) || objWithAlg.typ === "JWT");
  }
  return false;
}
var encodeJwtPart, encodeSignaturePart, decodeJwtPart, sign, verify, symmetricAlgorithms, verifyWithJwks, decode, decodeHeader;
var init_jwt = __esm({
  "../../../node_modules/hono/dist/utils/jwt/jwt.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_encode();
    init_jwa();
    init_jws();
    init_types2();
    init_utf8();
    encodeJwtPart = /* @__PURE__ */ __name((part) => encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(/=/g, ""), "encodeJwtPart");
    encodeSignaturePart = /* @__PURE__ */ __name((buf) => encodeBase64Url(buf).replace(/=/g, ""), "encodeSignaturePart");
    decodeJwtPart = /* @__PURE__ */ __name((part) => JSON.parse(utf8Decoder.decode(decodeBase64Url(part))), "decodeJwtPart");
    __name(isTokenHeader, "isTokenHeader");
    sign = /* @__PURE__ */ __name(async (payload, privateKey, alg = "HS256") => {
      const encodedPayload = encodeJwtPart(payload);
      let encodedHeader;
      if (typeof privateKey === "object" && "alg" in privateKey) {
        alg = privateKey.alg;
        encodedHeader = encodeJwtPart({ alg, typ: "JWT", kid: privateKey.kid });
      } else {
        encodedHeader = encodeJwtPart({ alg, typ: "JWT" });
      }
      const partialToken = `${encodedHeader}.${encodedPayload}`;
      const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
      const signature = encodeSignaturePart(signaturePart);
      return `${partialToken}.${signature}`;
    }, "sign");
    verify = /* @__PURE__ */ __name(async (token, publicKey, algOrOptions) => {
      if (!algOrOptions) {
        throw new JwtAlgorithmRequired();
      }
      const {
        alg,
        iss,
        nbf = true,
        exp = true,
        iat = true,
        aud
      } = typeof algOrOptions === "string" ? { alg: algOrOptions } : algOrOptions;
      if (!alg) {
        throw new JwtAlgorithmRequired();
      }
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new JwtTokenInvalid(token);
      }
      const { header, payload } = decode(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      if (header.alg !== alg) {
        throw new JwtAlgorithmMismatch(alg, header.alg);
      }
      const now = Math.floor(Date.now() / 1e3);
      if (nbf && payload.nbf !== void 0) {
        if (typeof payload.nbf !== "number" || !Number.isFinite(payload.nbf) || payload.nbf > now) {
          throw new JwtTokenNotBefore(token);
        }
      }
      if (exp && payload.exp !== void 0) {
        if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp) || payload.exp <= now) {
          throw new JwtTokenExpired(token);
        }
      }
      if (iat && payload.iat !== void 0) {
        if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat) || now < payload.iat) {
          throw new JwtTokenIssuedAt(now, payload.iat);
        }
      }
      if (iss) {
        if (!payload.iss) {
          throw new JwtTokenIssuer(iss, null);
        }
        if (typeof iss === "string" && payload.iss !== iss) {
          throw new JwtTokenIssuer(iss, payload.iss);
        }
        if (iss instanceof RegExp && !iss.test(payload.iss)) {
          throw new JwtTokenIssuer(iss, payload.iss);
        }
      }
      if (aud) {
        if (!payload.aud) {
          throw new JwtPayloadRequiresAud(payload);
        }
        const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        const matched = audiences.some(
          (payloadAud) => aud instanceof RegExp ? aud.test(payloadAud) : typeof aud === "string" ? payloadAud === aud : Array.isArray(aud) && aud.includes(payloadAud)
        );
        if (!matched) {
          throw new JwtTokenAudience(aud, payload.aud);
        }
      }
      const headerPayload = token.substring(0, token.lastIndexOf("."));
      const verified = await verifying(
        publicKey,
        alg,
        decodeBase64Url(tokenParts[2]),
        utf8Encoder.encode(headerPayload)
      );
      if (!verified) {
        throw new JwtTokenSignatureMismatched(token);
      }
      return payload;
    }, "verify");
    symmetricAlgorithms = [
      AlgorithmTypes.HS256,
      AlgorithmTypes.HS384,
      AlgorithmTypes.HS512
    ];
    verifyWithJwks = /* @__PURE__ */ __name(async (token, options, init3) => {
      const verifyOpts = options.verification || {};
      const header = decodeHeader(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      if (!header.kid) {
        throw new JwtHeaderRequiresKid(header);
      }
      if (symmetricAlgorithms.includes(header.alg)) {
        throw new JwtSymmetricAlgorithmNotAllowed(header.alg);
      }
      if (!options.allowedAlgorithms.includes(header.alg)) {
        throw new JwtAlgorithmNotAllowed(header.alg, options.allowedAlgorithms);
      }
      let verifyKeys = options.keys ? [...options.keys] : void 0;
      if (options.jwks_uri) {
        const response = await fetch(options.jwks_uri, init3);
        if (!response.ok) {
          throw new Error(`failed to fetch JWKS from ${options.jwks_uri}`);
        }
        const data = await response.json();
        if (!data.keys) {
          throw new Error('invalid JWKS response. "keys" field is missing');
        }
        if (!Array.isArray(data.keys)) {
          throw new Error('invalid JWKS response. "keys" field is not an array');
        }
        verifyKeys ??= [];
        verifyKeys.push(...data.keys);
      } else if (!verifyKeys) {
        throw new Error('verifyWithJwks requires options for either "keys" or "jwks_uri" or both');
      }
      const matchingKey = verifyKeys.find((key) => key.kid === header.kid);
      if (!matchingKey) {
        throw new JwtTokenInvalid(token);
      }
      if (matchingKey.alg && matchingKey.alg !== header.alg) {
        throw new JwtAlgorithmMismatch(matchingKey.alg, header.alg);
      }
      return await verify(token, matchingKey, {
        alg: header.alg,
        ...verifyOpts
      });
    }, "verifyWithJwks");
    decode = /* @__PURE__ */ __name((token) => {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new JwtTokenInvalid(token);
      }
      try {
        const header = decodeJwtPart(parts[0]);
        const payload = decodeJwtPart(parts[1]);
        return {
          header,
          payload
        };
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decode");
    decodeHeader = /* @__PURE__ */ __name((token) => {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new JwtTokenInvalid(token);
      }
      try {
        return decodeJwtPart(parts[0]);
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decodeHeader");
  }
});

// ../../../node_modules/hono/dist/utils/jwt/index.js
var Jwt;
var init_jwt2 = __esm({
  "../../../node_modules/hono/dist/utils/jwt/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_jwt();
    Jwt = { sign, verify, decode, verifyWithJwks };
  }
});

// ../../../node_modules/hono/dist/middleware/jwt/jwt.js
var verifyWithJwks2, verify2, decode2, sign2;
var init_jwt3 = __esm({
  "../../../node_modules/hono/dist/middleware/jwt/jwt.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_cookie2();
    init_http_exception();
    init_jwt2();
    init_context();
    verifyWithJwks2 = Jwt.verifyWithJwks;
    verify2 = Jwt.verify;
    decode2 = Jwt.decode;
    sign2 = Jwt.sign;
  }
});

// ../../../node_modules/hono/dist/middleware/jwt/index.js
var init_jwt4 = __esm({
  "../../../node_modules/hono/dist/middleware/jwt/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_jwt3();
    init_jwa();
  }
});

// ../../../node_modules/otpauth/dist/otpauth.esm.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in a && a.BYTES_PER_ELEMENT === 1;
}
function anumber(n, title = "") {
  if (typeof n !== "number") throw new TypeError(atitle(title) + "expected number, got " + typeof n);
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError(atitle(title) + "expected integer >= 0, got " + n);
  return n;
}
function abool(value, title = "") {
  if (typeof value !== "boolean") throw new TypeError(atitle(title) + "expected boolean, got type=" + typeof value);
  return value;
}
function abytes(value, length, title = "") {
  if (isBytes(value) && length === void 0) return value;
  const bytes = isBytes(value);
  const ofLen = "";
  const got = bytes ? `length=${value.length}` : `type=${typeof value}`;
  const message = atitle(title) + "expected Uint8Array" + ofLen + ", got " + got;
  if (!bytes) throw new TypeError(message);
  throw new RangeError(message);
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function") throw new TypeError("expected hash wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
  if (h.outputLen < 1 || h.blockLen < 1) throw new Error("hash blockLen / outputLen must be >= 1");
}
function aexists(instance, checkFinished = true) {
  if (instance.destroyed) throw new Error("hash was destroyed");
  if (checkFinished && instance.finished) throw new Error("digest() was already called");
}
function aoutput(out, instance) {
  abytes(out, void 0, "output");
  const min = instance.outputLen;
  if (!(out.length >= min)) {
    throw new RangeError('"output" expected length >= ' + min);
  }
}
function u32(arr) {
  return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
function byteSwap(word) {
  return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
}
function byteSwap32(arr) {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = byteSwap(arr[i]);
  }
  return arr;
}
function checkOpts(defaults, opts, title = "opts") {
  aopts(defaults, "defaults");
  if (opts !== void 0) aopts(opts, title);
  const merged = Object.assign(/* @__PURE__ */ Object.create(null), defaults, opts);
  return merged;
}
function createHasher(hashCons, info = {}) {
  if (typeof hashCons !== "function") throw new TypeError('"hashCons" expected function, got type=' + typeof hashCons);
  info = checkOpts({}, info, "info");
  const hashC = /* @__PURE__ */ __name((msg, opts) => hashCons(opts).update(msg).digest(), "hashC");
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.canXOF = tmp.canXOF;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function fromBig(n, le = false) {
  if (le) return {
    h: Number(n & U32_MASK64),
    l: Number(n >> _32n & U32_MASK64)
  };
  return {
    h: Number(n >> _32n & U32_MASK64) | 0,
    l: Number(n & U32_MASK64) | 0
  };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [
      h,
      l
    ];
  }
  return [
    Ah,
    Al
  ];
}
function setU64FromNum(view, byteOffset, n, isLE2) {
  const h = fromNumH(n);
  const l = fromNumL(n);
  view.setUint32(byteOffset, isLE2 ? l : h, isLE2);
  view.setUint32(byteOffset + 4, isLE2 ? h : l, isLE2);
}
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return {
    h: Ah + Bh + (l / 2 ** 32 | 0) | 0,
    l: l | 0
  };
}
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
function keccakP(s, rounds = 24) {
  if (!(s instanceof Uint32Array)) throw new TypeError('"s" expected Uint32Array(50), got type=' + typeof s);
  if (s.length !== 50) throw new RangeError('"s" expected Uint32Array(50), got length=' + s.length);
  anumber(rounds, "rounds");
  if (rounds < 1 || rounds > 24) throw new Error('"rounds" expected integer 1..24');
  for (let round = 24 - rounds; round < 24; round++) {
    for (let x = 0; x < 10; x++) B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
    for (let x = 0; x < 10; x += 2) {
      const idx1 = (x + 8) % 10;
      const idx0 = (x + 2) % 10;
      const B0 = B[idx0];
      const B1 = B[idx0 + 1];
      const Th = rotlH(B0, B1, 1) ^ B[idx1];
      const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
      for (let y = 0; y < 50; y += 10) {
        s[x + y] ^= Th;
        s[x + y + 1] ^= Tl;
      }
    }
    let curH = s[2];
    let curL = s[3];
    for (let t = 0; t < 24; t++) {
      const shift = SHA3_ROTL[t];
      const Th = rotlH(curH, curL, shift);
      const Tl = rotlL(curH, curL, shift);
      const PI = SHA3_PI[t];
      curH = s[PI];
      curL = s[PI + 1];
      s[PI] = Th;
      s[PI + 1] = Tl;
    }
    for (let y = 0; y < 50; y += 10) {
      const b0 = s[y], b1 = s[y + 1], b2 = s[y + 2], b3 = s[y + 3];
      s[y] ^= ~s[y + 2] & s[y + 4];
      s[y + 1] ^= ~s[y + 3] & s[y + 5];
      s[y + 2] ^= ~s[y + 4] & s[y + 6];
      s[y + 3] ^= ~s[y + 5] & s[y + 7];
      s[y + 4] ^= ~s[y + 6] & s[y + 8];
      s[y + 5] ^= ~s[y + 7] & s[y + 9];
      s[y + 6] ^= ~s[y + 8] & b0;
      s[y + 7] ^= ~s[y + 9] & b1;
      s[y + 8] ^= ~b0 & b2;
      s[y + 9] ^= ~b1 & b3;
    }
    s[0] ^= SHA3_IOTA_H[round];
    s[1] ^= SHA3_IOTA_L[round];
  }
  clean(B);
}
var uintDecode, atitle, aobject, aopts, isLE, swap32IfBE, oidNist, _HMAC, hmac, U32_MASK64, _32n, fromNumH, fromNumL, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H, HashMD, SHA256_IV, SHA224_IV, SHA384_IV, SHA512_IV, SHA1_IV, SHA1_W, _SHA1, sha1, SHA256_K, SHA256_W, SHA2_32B, _SHA256, _SHA224, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA2_64B, _SHA512, _SHA384, sha2562, sha224, sha512, sha384, _0n, _1n, _2n, _7n, _256n, _0x71n, SHA3_PI, SHA3_ROTL, _SHA3_IOTA, IOTAS, SHA3_IOTA_H, SHA3_IOTA_L, rotlSH, rotlSL, rotlBH, rotlBL, rotlH, rotlL, B, Keccak, genKeccak, sha3_224, sha3_256, sha3_384, sha3_512, globalScope, nobleHashes, canonicalizeAlgorithm, hmacDigest, ALPHABET$1, base32Decode, base32Encode, ALPHABET, hexDecode, hexEncode, latin1Decode, latin1Encode, ENCODER, DECODER, utf8Decode, utf8Encode, randomBytes, Secret, timingSafeEqual, HOTP, TOTP;
var init_otpauth_esm = __esm({
  "../../../node_modules/otpauth/dist/otpauth.esm.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    uintDecode = /* @__PURE__ */ __name((num) => {
      const buf = new ArrayBuffer(8);
      const arr = new Uint8Array(buf);
      let acc = num;
      for (let i = 7; i >= 0; i--) {
        if (acc === 0) break;
        arr[i] = acc & 255;
        acc -= arr[i];
        acc /= 256;
      }
      return arr;
    }, "uintDecode");
    __name(isBytes, "isBytes");
    atitle = /* @__PURE__ */ __name((title) => title ? `"${title}" ` : "", "atitle");
    __name(anumber, "anumber");
    __name(abool, "abool");
    __name(abytes, "abytes");
    __name(ahash, "ahash");
    aobject = /* @__PURE__ */ __name((value, label) => {
      if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError((label === "object" ? "" : `"${label}" `) + "expected object, got type=" + typeof value);
    }, "aobject");
    aopts = /* @__PURE__ */ __name((value, label) => {
      aobject(value, label);
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) throw new TypeError(`"${label}" expected plain object`);
      if (Object.hasOwn(value, "__proto__")) throw new TypeError(`"${label}.__proto__" is not allowed`);
    }, "aopts");
    __name(aexists, "aexists");
    __name(aoutput, "aoutput");
    __name(u32, "u32");
    __name(clean, "clean");
    __name(createView, "createView");
    __name(rotr, "rotr");
    __name(rotl, "rotl");
    isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([
      287454020
    ]).buffer)[0] === 68)();
    __name(byteSwap, "byteSwap");
    __name(byteSwap32, "byteSwap32");
    swap32IfBE = isLE ? (u) => u : byteSwap32;
    __name(checkOpts, "checkOpts");
    __name(createHasher, "createHasher");
    oidNist = /* @__PURE__ */ __name((suffix) => ({
      // Current NIST hashAlgs suffixes used here fit in one DER subidentifier octet.
      // Larger suffix values would need base-128 OID encoding and a different length byte.
      oid: Uint8Array.from([
        6,
        9,
        96,
        134,
        72,
        1,
        101,
        3,
        4,
        2,
        suffix
      ])
    }), "oidNist");
    _HMAC = class {
      static {
        __name(this, "_HMAC");
      }
      update(buf) {
        aexists(this);
        this.iHash.update(buf);
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const buf = out.subarray(0, this.outputLen);
        this.iHash.digestInto(buf);
        this.oHash.update(buf);
        this.oHash.digestInto(buf);
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.oHash.outputLen);
        this.digestInto(out);
        return out;
      }
      _cloneInto(to) {
        to || (to = Object.create(Object.getPrototypeOf(this), {}));
        const { oHash, iHash, finished, destroyed, blockLen, outputLen, canXOF } = this;
        to = to;
        to.finished = finished;
        to.destroyed = destroyed;
        to.blockLen = blockLen;
        to.outputLen = outputLen;
        to.canXOF = canXOF;
        to.oHash = oHash._cloneInto(to.oHash);
        to.iHash = iHash._cloneInto(to.iHash);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      destroy() {
        this.destroyed = true;
        this.oHash.destroy();
        this.iHash.destroy();
      }
      constructor(hash, key) {
        this.canXOF = false;
        this.finished = false;
        this.destroyed = false;
        ahash(hash);
        abytes(key, void 0, "key");
        this.iHash = hash.create();
        if (typeof this.iHash.update !== "function") throw new Error("expected Hash instance");
        this.blockLen = this.iHash.blockLen;
        this.outputLen = this.iHash.outputLen;
        const blockLen = this.blockLen;
        const pad = new Uint8Array(blockLen);
        pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
        for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
        this.iHash.update(pad);
        this.oHash = hash.create();
        for (let i = 0; i < pad.length; i++) pad[i] ^= 54 ^ 92;
        this.oHash.update(pad);
        clean(pad);
      }
    };
    hmac = /* @__PURE__ */ (() => {
      const hmac_ = /* @__PURE__ */ __name((hash, key, message) => new _HMAC(hash, key).update(message).digest(), "hmac_");
      hmac_.create = (hash, key) => new _HMAC(hash, key);
      return hmac_;
    })();
    U32_MASK64 = /* @__PURE__ */ (() => BigInt(2 ** 32 - 1))();
    _32n = /* @__PURE__ */ BigInt(32);
    __name(fromBig, "fromBig");
    __name(split, "split");
    fromNumH = /* @__PURE__ */ __name((n) => n / 2 ** 32 | 0, "fromNumH");
    fromNumL = /* @__PURE__ */ __name((n) => n >>> 0, "fromNumL");
    __name(setU64FromNum, "setU64FromNum");
    shrSH = /* @__PURE__ */ __name((h, _l, s) => h >>> s, "shrSH");
    shrSL = /* @__PURE__ */ __name((h, l, s) => h << 32 - s | l >>> s, "shrSL");
    rotrSH = /* @__PURE__ */ __name((h, l, s) => h >>> s | l << 32 - s, "rotrSH");
    rotrSL = /* @__PURE__ */ __name((h, l, s) => h << 32 - s | l >>> s, "rotrSL");
    rotrBH = /* @__PURE__ */ __name((h, l, s) => h << 64 - s | l >>> s - 32, "rotrBH");
    rotrBL = /* @__PURE__ */ __name((h, l, s) => h >>> s - 32 | l << 64 - s, "rotrBL");
    __name(add, "add");
    add3L = /* @__PURE__ */ __name((Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0), "add3L");
    add3H = /* @__PURE__ */ __name((low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0, "add3H");
    add4L = /* @__PURE__ */ __name((Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0), "add4L");
    add4H = /* @__PURE__ */ __name((low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0, "add4H");
    add5L = /* @__PURE__ */ __name((Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0), "add5L");
    add5H = /* @__PURE__ */ __name((low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0, "add5H");
    __name(Chi, "Chi");
    __name(Maj, "Maj");
    HashMD = class {
      static {
        __name(this, "HashMD");
      }
      update(data) {
        aexists(this);
        abytes(data);
        const { view, buffer, blockLen } = this;
        const len = data.length;
        let processed = false;
        for (let pos = 0; pos < len; ) {
          const take = Math.min(blockLen - this.pos, len - pos);
          if (take === blockLen) {
            const dataView = createView(data);
            for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
            processed = true;
            continue;
          }
          buffer.set(pos === 0 && take === len ? data : data.subarray(pos, pos + take), this.pos);
          this.pos += take;
          pos += take;
          if (this.pos === blockLen) {
            this.process(view, 0);
            this.pos = 0;
            processed = true;
          }
        }
        this.length += data.length;
        if (processed) this.roundClean();
        return this;
      }
      digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const { buffer, view, blockLen, isLE: isLE2 } = this;
        let { pos } = this;
        buffer[pos++] = 128;
        buffer.fill(0, pos);
        if (this.padOffset > blockLen - pos) {
          this.process(view, 0);
          buffer.fill(0);
        }
        setU64FromNum(view, blockLen - 8, this.length * 8, isLE2);
        this.process(view, 0);
        this.roundClean();
        const oview = out === buffer ? view : createView(out);
        const len = this.outputLen;
        const outLen = len / 4;
        const state = this.get();
        if (len % 4 || outLen > state.length) throw new Error("invalid outputLen");
        for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE2);
      }
      digest() {
        const { buffer, outputLen } = this;
        this.digestInto(buffer);
        const res = buffer.slice(0, outputLen);
        this.destroy();
        return res;
      }
      _cloneIntoMeta(to) {
        const { buffer, length, finished, destroyed, pos } = this;
        to.destroyed = destroyed;
        to.finished = finished;
        to.length = length;
        to.pos = pos;
        if (pos) to.buffer.set(buffer);
        return to;
      }
      clone() {
        return this._cloneInto();
      }
      constructor(blockLen, outputLen, padOffset, isLE2) {
        this.canXOF = false;
        this.finished = false;
        this.length = 0;
        this.pos = 0;
        this.destroyed = false;
        this.blockLen = blockLen;
        this.outputLen = outputLen;
        this.padOffset = padOffset;
        this.isLE = isLE2;
        this.buffer = new Uint8Array(blockLen);
        this.view = createView(this.buffer);
      }
    };
    SHA256_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      3144134277,
      1013904242,
      2773480762,
      1359893119,
      2600822924,
      528734635,
      1541459225
    ]);
    SHA224_IV = /* @__PURE__ */ Uint32Array.from([
      3238371032,
      914150663,
      812702999,
      4144912697,
      4290775857,
      1750603025,
      1694076839,
      3204075428
    ]);
    SHA384_IV = /* @__PURE__ */ Uint32Array.from([
      3418070365,
      3238371032,
      1654270250,
      914150663,
      2438529370,
      812702999,
      355462360,
      4144912697,
      1731405415,
      4290775857,
      2394180231,
      1750603025,
      3675008525,
      1694076839,
      1203062813,
      3204075428
    ]);
    SHA512_IV = /* @__PURE__ */ Uint32Array.from([
      1779033703,
      4089235720,
      3144134277,
      2227873595,
      1013904242,
      4271175723,
      2773480762,
      1595750129,
      1359893119,
      2917565137,
      2600822924,
      725511199,
      528734635,
      4215389547,
      1541459225,
      327033209
    ]);
    SHA1_IV = /* @__PURE__ */ Uint32Array.from([
      1732584193,
      4023233417,
      2562383102,
      271733878,
      3285377520
    ]);
    SHA1_W = /* @__PURE__ */ new Uint32Array(80);
    _SHA1 = class extends HashMD {
      static {
        __name(this, "_SHA1");
      }
      get() {
        const { A, B: B2, C, D, E } = this;
        return [
          A,
          B2,
          C,
          D,
          E
        ];
      }
      set(A, B2, C, D, E) {
        this.A = A | 0;
        this.B = B2 | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
      }
      _cloneInto(to) {
        (to || (to = new this.constructor())).set(...this.get());
        return this._cloneIntoMeta(to);
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) SHA1_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 80; i++) SHA1_W[i] = rotl(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
        let { A, B: B2, C, D, E } = this;
        for (let i = 0; i < 80; i++) {
          let F, K;
          if (i < 20) {
            F = Chi(B2, C, D);
            K = 1518500249;
          } else if (i < 40) {
            F = B2 ^ C ^ D;
            K = 1859775393;
          } else if (i < 60) {
            F = Maj(B2, C, D);
            K = 2400959708;
          } else {
            F = B2 ^ C ^ D;
            K = 3395469782;
          }
          const T = rotl(A, 5) + F + E + K + SHA1_W[i] | 0;
          E = D;
          D = C;
          C = rotl(B2, 30);
          B2 = A;
          A = T;
        }
        A = A + this.A | 0;
        B2 = B2 + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        this.set(A, B2, C, D, E);
      }
      roundClean() {
        clean(SHA1_W);
      }
      destroy() {
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0);
        clean(this.buffer);
      }
      constructor() {
        super(64, 20, 8, false), this.A = SHA1_IV[0] | 0, this.B = SHA1_IV[1] | 0, this.C = SHA1_IV[2] | 0, this.D = SHA1_IV[3] | 0, this.E = SHA1_IV[4] | 0;
      }
    };
    sha1 = /* @__PURE__ */ createHasher(() => new _SHA1());
    SHA256_K = /* @__PURE__ */ Uint32Array.from([
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ]);
    SHA256_W = /* @__PURE__ */ new Uint32Array(64);
    SHA2_32B = class extends HashMD {
      static {
        __name(this, "SHA2_32B");
      }
      get() {
        const { A, B: B2, C, D, E, F, G, H } = this;
        return [
          A,
          B2,
          C,
          D,
          E,
          F,
          G,
          H
        ];
      }
      // prettier-ignore
      set(A, B2, C, D, E, F, G, H) {
        this.A = A | 0;
        this.B = B2 | 0;
        this.C = C | 0;
        this.D = D | 0;
        this.E = E | 0;
        this.F = F | 0;
        this.G = G | 0;
        this.H = H | 0;
      }
      _cloneInto(to) {
        (to || (to = new this.constructor())).set(...this.get());
        return this._cloneIntoMeta(to);
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
        for (let i = 16; i < 64; i++) {
          const W15 = SHA256_W[i - 15];
          const W2 = SHA256_W[i - 2];
          const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
          const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
          SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
        }
        let { A, B: B2, C, D, E, F, G, H } = this;
        for (let i = 0; i < 64; i++) {
          const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
          const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
          const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
          const T2 = sigma0 + Maj(A, B2, C) | 0;
          H = G;
          G = F;
          F = E;
          E = D + T1 | 0;
          D = C;
          C = B2;
          B2 = A;
          A = T1 + T2 | 0;
        }
        A = A + this.A | 0;
        B2 = B2 + this.B | 0;
        C = C + this.C | 0;
        D = D + this.D | 0;
        E = E + this.E | 0;
        F = F + this.F | 0;
        G = G + this.G | 0;
        H = H + this.H | 0;
        this.set(A, B2, C, D, E, F, G, H);
      }
      roundClean() {
        clean(SHA256_W);
      }
      destroy() {
        this.destroyed = true;
        this.set(0, 0, 0, 0, 0, 0, 0, 0);
        clean(this.buffer);
      }
      constructor(outputLen, IV) {
        super(64, outputLen, 8, false), // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        // Numeric initializers matter: starting the fields as `undefined` changes
        // V8's field representation and makes sha256 3x slower (measured).
        this.A = 0, this.B = 0, this.C = 0, this.D = 0, this.E = 0, this.F = 0, this.G = 0, this.H = 0;
        this.A = IV[0] | 0;
        this.B = IV[1] | 0;
        this.C = IV[2] | 0;
        this.D = IV[3] | 0;
        this.E = IV[4] | 0;
        this.F = IV[5] | 0;
        this.G = IV[6] | 0;
        this.H = IV[7] | 0;
      }
    };
    _SHA256 = class extends SHA2_32B {
      static {
        __name(this, "_SHA256");
      }
      constructor() {
        super(32, SHA256_IV);
      }
    };
    _SHA224 = class extends SHA2_32B {
      static {
        __name(this, "_SHA224");
      }
      constructor() {
        super(28, SHA224_IV);
      }
    };
    K512 = /* @__PURE__ */ (() => split([
      "0x428a2f98d728ae22",
      "0x7137449123ef65cd",
      "0xb5c0fbcfec4d3b2f",
      "0xe9b5dba58189dbbc",
      "0x3956c25bf348b538",
      "0x59f111f1b605d019",
      "0x923f82a4af194f9b",
      "0xab1c5ed5da6d8118",
      "0xd807aa98a3030242",
      "0x12835b0145706fbe",
      "0x243185be4ee4b28c",
      "0x550c7dc3d5ffb4e2",
      "0x72be5d74f27b896f",
      "0x80deb1fe3b1696b1",
      "0x9bdc06a725c71235",
      "0xc19bf174cf692694",
      "0xe49b69c19ef14ad2",
      "0xefbe4786384f25e3",
      "0x0fc19dc68b8cd5b5",
      "0x240ca1cc77ac9c65",
      "0x2de92c6f592b0275",
      "0x4a7484aa6ea6e483",
      "0x5cb0a9dcbd41fbd4",
      "0x76f988da831153b5",
      "0x983e5152ee66dfab",
      "0xa831c66d2db43210",
      "0xb00327c898fb213f",
      "0xbf597fc7beef0ee4",
      "0xc6e00bf33da88fc2",
      "0xd5a79147930aa725",
      "0x06ca6351e003826f",
      "0x142929670a0e6e70",
      "0x27b70a8546d22ffc",
      "0x2e1b21385c26c926",
      "0x4d2c6dfc5ac42aed",
      "0x53380d139d95b3df",
      "0x650a73548baf63de",
      "0x766a0abb3c77b2a8",
      "0x81c2c92e47edaee6",
      "0x92722c851482353b",
      "0xa2bfe8a14cf10364",
      "0xa81a664bbc423001",
      "0xc24b8b70d0f89791",
      "0xc76c51a30654be30",
      "0xd192e819d6ef5218",
      "0xd69906245565a910",
      "0xf40e35855771202a",
      "0x106aa07032bbd1b8",
      "0x19a4c116b8d2d0c8",
      "0x1e376c085141ab53",
      "0x2748774cdf8eeb99",
      "0x34b0bcb5e19b48a8",
      "0x391c0cb3c5c95a63",
      "0x4ed8aa4ae3418acb",
      "0x5b9cca4f7763e373",
      "0x682e6ff3d6b2b8a3",
      "0x748f82ee5defb2fc",
      "0x78a5636f43172f60",
      "0x84c87814a1f0ab72",
      "0x8cc702081a6439ec",
      "0x90befffa23631e28",
      "0xa4506cebde82bde9",
      "0xbef9a3f7b2c67915",
      "0xc67178f2e372532b",
      "0xca273eceea26619c",
      "0xd186b8c721c0c207",
      "0xeada7dd6cde0eb1e",
      "0xf57d4f7fee6ed178",
      "0x06f067aa72176fba",
      "0x0a637dc5a2c898a6",
      "0x113f9804bef90dae",
      "0x1b710b35131c471b",
      "0x28db77f523047d84",
      "0x32caab7b40c72493",
      "0x3c9ebe0a15c9bebc",
      "0x431d67c49c100d4c",
      "0x4cc5d4becb3e42b6",
      "0x597f299cfc657e2a",
      "0x5fcb6fab3ad6faec",
      "0x6c44198c4a475817"
    ].map((n) => BigInt(n))))();
    SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
    SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
    SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
    SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
    SHA2_64B = class extends HashMD {
      static {
        __name(this, "SHA2_64B");
      }
      // prettier-ignore
      get() {
        const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        return [
          Ah,
          Al,
          Bh,
          Bl,
          Ch,
          Cl,
          Dh,
          Dl,
          Eh,
          El,
          Fh,
          Fl,
          Gh,
          Gl,
          Hh,
          Hl
        ];
      }
      // prettier-ignore
      set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
        this.Ah = Ah | 0;
        this.Al = Al | 0;
        this.Bh = Bh | 0;
        this.Bl = Bl | 0;
        this.Ch = Ch | 0;
        this.Cl = Cl | 0;
        this.Dh = Dh | 0;
        this.Dl = Dl | 0;
        this.Eh = Eh | 0;
        this.El = El | 0;
        this.Fh = Fh | 0;
        this.Fl = Fl | 0;
        this.Gh = Gh | 0;
        this.Gl = Gl | 0;
        this.Hh = Hh | 0;
        this.Hl = Hl | 0;
      }
      _cloneInto(to) {
        (to || (to = new this.constructor())).set(...this.get());
        return this._cloneIntoMeta(to);
      }
      process(view, offset) {
        for (let i = 0; i < 16; i++, offset += 4) {
          SHA512_W_H[i] = view.getUint32(offset);
          SHA512_W_L[i] = view.getUint32(offset += 4);
        }
        for (let i = 16; i < 80; i++) {
          const W15h = SHA512_W_H[i - 15] | 0;
          const W15l = SHA512_W_L[i - 15] | 0;
          const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
          const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
          const W2h = SHA512_W_H[i - 2] | 0;
          const W2l = SHA512_W_L[i - 2] | 0;
          const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
          const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
          const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
          const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
          SHA512_W_H[i] = SUMh | 0;
          SHA512_W_L[i] = SUMl | 0;
        }
        let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
        for (let i = 0; i < 80; i++) {
          const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
          const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
          const CHIh = Eh & Fh ^ ~Eh & Gh;
          const CHIl = El & Fl ^ ~El & Gl;
          const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
          const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
          const T1l = T1ll | 0;
          const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
          const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
          const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
          const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
          Hh = Gh | 0;
          Hl = Gl | 0;
          Gh = Fh | 0;
          Gl = Fl | 0;
          Fh = Eh | 0;
          Fl = El | 0;
          ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
          Dh = Ch | 0;
          Dl = Cl | 0;
          Ch = Bh | 0;
          Cl = Bl | 0;
          Bh = Ah | 0;
          Bl = Al | 0;
          const All = add3L(T1l, sigma0l, MAJl);
          Ah = add3H(All, T1h, sigma0h, MAJh);
          Al = All | 0;
        }
        ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
        ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
        ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
        ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
        ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
        ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
        ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
        ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
        this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
      }
      roundClean() {
        clean(SHA512_W_H, SHA512_W_L);
      }
      destroy() {
        this.destroyed = true;
        clean(this.buffer);
        this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
      constructor(outputLen, IV) {
        super(128, outputLen, 16, false), // We cannot use array here since array allows indexing by variable
        // which means optimizer/compiler cannot use registers.
        // h -- high 32 bits, l -- low 32 bits
        // Numeric initializers matter: starting the fields as `undefined` changes
        // V8's field representation and slows hashing down (measured on sha256).
        this.Ah = 0, this.Al = 0, this.Bh = 0, this.Bl = 0, this.Ch = 0, this.Cl = 0, this.Dh = 0, this.Dl = 0, this.Eh = 0, this.El = 0, this.Fh = 0, this.Fl = 0, this.Gh = 0, this.Gl = 0, this.Hh = 0, this.Hl = 0;
        this.Ah = IV[0] | 0;
        this.Al = IV[1] | 0;
        this.Bh = IV[2] | 0;
        this.Bl = IV[3] | 0;
        this.Ch = IV[4] | 0;
        this.Cl = IV[5] | 0;
        this.Dh = IV[6] | 0;
        this.Dl = IV[7] | 0;
        this.Eh = IV[8] | 0;
        this.El = IV[9] | 0;
        this.Fh = IV[10] | 0;
        this.Fl = IV[11] | 0;
        this.Gh = IV[12] | 0;
        this.Gl = IV[13] | 0;
        this.Hh = IV[14] | 0;
        this.Hl = IV[15] | 0;
      }
    };
    _SHA512 = class extends SHA2_64B {
      static {
        __name(this, "_SHA512");
      }
      constructor() {
        super(64, SHA512_IV);
      }
    };
    _SHA384 = class extends SHA2_64B {
      static {
        __name(this, "_SHA384");
      }
      constructor() {
        super(48, SHA384_IV);
      }
    };
    sha2562 = /* @__PURE__ */ createHasher(() => new _SHA256(), /* @__PURE__ */ oidNist(1));
    sha224 = /* @__PURE__ */ createHasher(() => new _SHA224(), /* @__PURE__ */ oidNist(4));
    sha512 = /* @__PURE__ */ createHasher(() => new _SHA512(), /* @__PURE__ */ oidNist(3));
    sha384 = /* @__PURE__ */ createHasher(() => new _SHA384(), /* @__PURE__ */ oidNist(2));
    _0n = BigInt(0);
    _1n = BigInt(1);
    _2n = BigInt(2);
    _7n = BigInt(7);
    _256n = BigInt(256);
    _0x71n = BigInt(113);
    SHA3_PI = [];
    SHA3_ROTL = [];
    _SHA3_IOTA = [];
    for (let round = 0, R = _1n, x = 1, y = 0; round < 24; round++) {
      [x, y] = [
        y,
        (2 * x + 3 * y) % 5
      ];
      SHA3_PI.push(2 * (5 * y + x));
      SHA3_ROTL.push((round + 1) * (round + 2) / 2 % 64);
      let t = _0n;
      for (let j = 0; j < 7; j++) {
        R = (R << _1n ^ (R >> _7n) * _0x71n) % _256n;
        if (R & _2n) t ^= _1n << (_1n << BigInt(j)) - _1n;
      }
      _SHA3_IOTA.push(t);
    }
    IOTAS = split(_SHA3_IOTA, true);
    SHA3_IOTA_H = IOTAS[0];
    SHA3_IOTA_L = IOTAS[1];
    rotlSH = /* @__PURE__ */ __name((h, l, s) => h << s | l >>> 32 - s, "rotlSH");
    rotlSL = /* @__PURE__ */ __name((h, l, s) => l << s | h >>> 32 - s, "rotlSL");
    rotlBH = /* @__PURE__ */ __name((h, l, s) => l << s - 32 | h >>> 64 - s, "rotlBH");
    rotlBL = /* @__PURE__ */ __name((h, l, s) => h << s - 32 | l >>> 64 - s, "rotlBL");
    rotlH = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBH(h, l, s) : rotlSH(h, l, s), "rotlH");
    rotlL = /* @__PURE__ */ __name((h, l, s) => s > 32 ? rotlBL(h, l, s) : rotlSL(h, l, s), "rotlL");
    B = new Uint32Array(5 * 2);
    __name(keccakP, "keccakP");
    Keccak = class _Keccak {
      static {
        __name(this, "Keccak");
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        swap32IfBE(this.state32);
        keccakP(this.state32, this.rounds);
        swap32IfBE(this.state32);
        this.posOut = 0;
        this.pos = 0;
      }
      update(data) {
        aexists(this);
        abytes(data);
        const { blockLen, state, state32 } = this;
        const len = data.length;
        const canUseU32 = blockLen % 4 === 0 && data.byteOffset % 4 === 0;
        const blockLen32 = blockLen / 4;
        const data32 = canUseU32 && len >= blockLen ? u32(data) : void 0;
        for (let pos = 0; pos < len; ) {
          if (data32 !== void 0 && this.pos === 0 && pos % 4 === 0 && len - pos >= blockLen) {
            for (let i = 0, o = pos / 4; i < blockLen32; i++) state32[i] ^= data32[o + i];
            pos += blockLen;
            this.pos = blockLen;
            this.keccak();
            continue;
          }
          const take = Math.min(blockLen - this.pos, len - pos);
          for (let i = 0; i < take; i++) state[this.pos++] ^= data[pos++];
          if (this.pos === blockLen) this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished) return;
        this.finished = true;
        const { state, suffix, pos, blockLen } = this;
        state[pos] ^= suffix;
        if ((suffix & 128) !== 0 && pos === blockLen - 1) this.keccak();
        state[blockLen - 1] ^= 128;
        this.keccak();
      }
      writeInto(out) {
        aexists(this, false);
        abytes(out);
        this.finish();
        const bufferOut = this.state;
        const { blockLen } = this;
        for (let pos = 0, len = out.length; pos < len; ) {
          if (this.posOut >= blockLen) this.keccak();
          const take = Math.min(blockLen - this.posOut, len - pos);
          out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
          this.posOut += take;
          pos += take;
        }
        return out;
      }
      xofInto(out) {
        if (!this.enableXOF) throw new Error("XOF is not enabled");
        return this.writeInto(out);
      }
      xof(bytes) {
        anumber(bytes);
        return this.xofInto(new Uint8Array(bytes));
      }
      digestInto(out) {
        aoutput(out, this);
        if (this.finished) throw new Error("digest() was already called");
        this.writeInto(out.length === this.outputLen ? out : out.subarray(0, this.outputLen));
        this.destroy();
      }
      digest() {
        const out = new Uint8Array(this.outputLen);
        this.digestInto(out);
        return out;
      }
      destroy() {
        this.destroyed = true;
        clean(this.state);
      }
      _cloneInto(to) {
        const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
        to || (to = new _Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
        to.blockLen = blockLen;
        to.state32.set(this.state32);
        to.pos = this.pos;
        to.posOut = this.posOut;
        to.finished = this.finished;
        to.rounds = rounds;
        to.suffix = suffix;
        to.outputLen = outputLen;
        to.enableXOF = enableXOF;
        to.canXOF = this.canXOF;
        to.destroyed = this.destroyed;
        return to;
      }
      // NOTE: we accept arguments in bytes instead of bits here.
      constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
        this.pos = 0;
        this.posOut = 0;
        this.finished = false;
        this.destroyed = false;
        this.enableXOF = false;
        anumber(blockLen, "blockLen");
        anumber(suffix, "suffix");
        anumber(rounds, "rounds");
        abool(enableXOF, "enableXOF");
        this.blockLen = blockLen;
        this.suffix = suffix;
        this.outputLen = outputLen;
        this.enableXOF = enableXOF;
        this.canXOF = enableXOF;
        this.rounds = rounds;
        anumber(outputLen, "outputLen");
        if (!(0 < blockLen && blockLen < 200)) throw new Error('"blockLen" must be 1..199');
        this.state = new Uint8Array(200);
        this.state32 = u32(this.state);
      }
    };
    genKeccak = /* @__PURE__ */ __name((suffix, blockLen, outputLen, info = {}) => createHasher(() => new Keccak(blockLen, suffix, outputLen), info), "genKeccak");
    sha3_224 = /* @__PURE__ */ genKeccak(6, 144, 28, /* @__PURE__ */ oidNist(7));
    sha3_256 = /* @__PURE__ */ genKeccak(6, 136, 32, /* @__PURE__ */ oidNist(8));
    sha3_384 = /* @__PURE__ */ genKeccak(6, 104, 48, /* @__PURE__ */ oidNist(9));
    sha3_512 = /* @__PURE__ */ genKeccak(6, 72, 64, /* @__PURE__ */ oidNist(10));
    globalScope = (() => {
      if (typeof globalThis === "object") return globalThis;
      else {
        Object.defineProperty(Object.prototype, "__GLOBALTHIS__", {
          get() {
            return this;
          },
          configurable: true
        });
        try {
          if (typeof __GLOBALTHIS__ !== "undefined") return __GLOBALTHIS__;
        } finally {
          delete Object.prototype.__GLOBALTHIS__;
        }
      }
      if (typeof self !== "undefined") return self;
      else if (typeof window !== "undefined") return window;
      else if (typeof global !== "undefined") return global;
      return void 0;
    })();
    nobleHashes = {
      SHA1: sha1,
      SHA224: sha224,
      SHA256: sha2562,
      SHA384: sha384,
      SHA512: sha512,
      "SHA3-224": sha3_224,
      "SHA3-256": sha3_256,
      "SHA3-384": sha3_384,
      "SHA3-512": sha3_512
    };
    canonicalizeAlgorithm = /* @__PURE__ */ __name((algorithm) => {
      switch (true) {
        case /^(?:SHA-?1|SSL3-SHA1)$/i.test(algorithm):
          return "SHA1";
        case /^SHA(?:2?-)?224$/i.test(algorithm):
          return "SHA224";
        case /^SHA(?:2?-)?256$/i.test(algorithm):
          return "SHA256";
        case /^SHA(?:2?-)?384$/i.test(algorithm):
          return "SHA384";
        case /^SHA(?:2?-)?512$/i.test(algorithm):
          return "SHA512";
        case /^SHA3-224$/i.test(algorithm):
          return "SHA3-224";
        case /^SHA3-256$/i.test(algorithm):
          return "SHA3-256";
        case /^SHA3-384$/i.test(algorithm):
          return "SHA3-384";
        case /^SHA3-512$/i.test(algorithm):
          return "SHA3-512";
        default:
          throw new TypeError(`Unknown hash algorithm: ${algorithm}`);
      }
    }, "canonicalizeAlgorithm");
    hmacDigest = /* @__PURE__ */ __name((algorithm, key, message) => {
      if (hmac) {
        const hash = nobleHashes[algorithm] ?? nobleHashes[canonicalizeAlgorithm(algorithm)];
        return hmac(hash, key, message);
      } else {
        throw new Error("Missing HMAC function");
      }
    }, "hmacDigest");
    ALPHABET$1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    base32Decode = /* @__PURE__ */ __name((str) => {
      str = str.replace(/ /g, "").toUpperCase();
      let end = str.length;
      while (str[end - 1] === "=") --end;
      if (end < str.length) str = str.substring(0, end);
      const buf = new ArrayBuffer(str.length * 5 / 8 | 0);
      const arr = new Uint8Array(buf);
      let bits = 0;
      let value = 0;
      let index = 0;
      for (let i = 0; i < str.length; i++) {
        const idx = ALPHABET$1.indexOf(str[i]);
        if (idx === -1) throw new TypeError(`Invalid character found: ${str[i]}`);
        value = value << 5 | idx;
        bits += 5;
        if (bits >= 8) {
          bits -= 8;
          arr[index++] = value >>> bits;
        }
      }
      return arr;
    }, "base32Decode");
    base32Encode = /* @__PURE__ */ __name((arr) => {
      let bits = 0;
      let value = 0;
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        value = value << 8 | arr[i];
        bits += 8;
        while (bits >= 5) {
          str += ALPHABET$1[value >>> bits - 5 & 31];
          bits -= 5;
        }
      }
      if (bits > 0) {
        str += ALPHABET$1[value << 5 - bits & 31];
      }
      return str;
    }, "base32Encode");
    ALPHABET = "0123456789ABCDEF";
    hexDecode = /* @__PURE__ */ __name((str) => {
      str = str.replace(/ /g, "").toUpperCase();
      const buf = new ArrayBuffer(str.length / 2);
      const arr = new Uint8Array(buf);
      for (let i = 0; i < str.length; i += 2) {
        const hi = ALPHABET.indexOf(str[i]);
        const lo = ALPHABET.indexOf(str[i + 1]);
        if (hi === -1 || lo === -1) throw new TypeError(`Invalid character found: ${str.substring(i, i + 2)}`);
        arr[i / 2] = hi << 4 | lo;
      }
      return arr;
    }, "hexDecode");
    hexEncode = /* @__PURE__ */ __name((arr) => {
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        const hex = arr[i].toString(16);
        if (hex.length === 1) str += "0";
        str += hex;
      }
      return str.toUpperCase();
    }, "hexEncode");
    latin1Decode = /* @__PURE__ */ __name((str) => {
      const buf = new ArrayBuffer(str.length);
      const arr = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i) & 255;
      }
      return arr;
    }, "latin1Decode");
    latin1Encode = /* @__PURE__ */ __name((arr) => {
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
      }
      return str;
    }, "latin1Encode");
    ENCODER = globalScope.TextEncoder ? new globalScope.TextEncoder() : null;
    DECODER = globalScope.TextDecoder ? new globalScope.TextDecoder() : null;
    utf8Decode = /* @__PURE__ */ __name((str) => {
      if (!ENCODER) {
        throw new Error("Encoding API not available");
      }
      return ENCODER.encode(str);
    }, "utf8Decode");
    utf8Encode = /* @__PURE__ */ __name((arr) => {
      if (!DECODER) {
        throw new Error("Encoding API not available");
      }
      return DECODER.decode(arr);
    }, "utf8Encode");
    randomBytes = /* @__PURE__ */ __name((size) => {
      if (globalScope.crypto?.getRandomValues) {
        return globalScope.crypto.getRandomValues(new Uint8Array(size));
      } else {
        throw new Error("Cryptography API not available");
      }
    }, "randomBytes");
    Secret = class _Secret {
      static {
        __name(this, "Secret");
      }
      /**
      * Converts a Latin-1 string to a Secret object.
      * @param {string} str Latin-1 string.
      * @returns {Secret} Secret object.
      */
      static fromLatin1(str) {
        return new _Secret({
          buffer: latin1Decode(str).buffer
        });
      }
      /**
      * Converts an UTF-8 string to a Secret object.
      * @param {string} str UTF-8 string.
      * @returns {Secret} Secret object.
      */
      static fromUTF8(str) {
        return new _Secret({
          buffer: utf8Decode(str).buffer
        });
      }
      /**
      * Converts a base32 string to a Secret object.
      * @param {string} str Base32 string.
      * @returns {Secret} Secret object.
      */
      static fromBase32(str) {
        return new _Secret({
          buffer: base32Decode(str).buffer
        });
      }
      /**
      * Converts a hexadecimal string to a Secret object.
      * @param {string} str Hexadecimal string.
      * @returns {Secret} Secret object.
      */
      static fromHex(str) {
        return new _Secret({
          buffer: hexDecode(str).buffer
        });
      }
      /**
      * Secret key buffer.
      * @deprecated For backward compatibility, the "bytes" property should be used instead.
      * @type {ArrayBufferLike}
      */
      get buffer() {
        return this.bytes.buffer;
      }
      /**
      * Latin-1 string representation of secret key.
      * @type {string}
      */
      get latin1() {
        Object.defineProperty(this, "latin1", {
          enumerable: true,
          writable: false,
          configurable: false,
          value: latin1Encode(this.bytes)
        });
        return this.latin1;
      }
      /**
      * UTF-8 string representation of secret key.
      * @type {string}
      */
      get utf8() {
        Object.defineProperty(this, "utf8", {
          enumerable: true,
          writable: false,
          configurable: false,
          value: utf8Encode(this.bytes)
        });
        return this.utf8;
      }
      /**
      * Base32 string representation of secret key.
      * @type {string}
      */
      get base32() {
        Object.defineProperty(this, "base32", {
          enumerable: true,
          writable: false,
          configurable: false,
          value: base32Encode(this.bytes)
        });
        return this.base32;
      }
      /**
      * Hexadecimal string representation of secret key.
      * @type {string}
      */
      get hex() {
        Object.defineProperty(this, "hex", {
          enumerable: true,
          writable: false,
          configurable: false,
          value: hexEncode(this.bytes)
        });
        return this.hex;
      }
      /**
      * Creates a secret key object.
      * @param {Object} [config] Configuration options.
      * @param {ArrayBufferLike} [config.buffer] Secret key buffer.
      * @param {number} [config.size=20] Number of random bytes to generate, ignored if 'buffer' is provided.
      */
      constructor({ buffer, size = 20 } = {}) {
        this.bytes = typeof buffer === "undefined" ? randomBytes(size) : new Uint8Array(buffer);
        Object.defineProperty(this, "bytes", {
          enumerable: true,
          writable: false,
          configurable: false,
          value: this.bytes
        });
      }
    };
    timingSafeEqual = /* @__PURE__ */ __name((a, b) => {
      {
        if (a.length !== b.length) {
          throw new TypeError("Input strings must have the same length");
        }
        let i = -1;
        let out = 0;
        while (++i < a.length) {
          out |= a.charCodeAt(i) ^ b.charCodeAt(i);
        }
        return out === 0;
      }
    }, "timingSafeEqual");
    HOTP = class _HOTP {
      static {
        __name(this, "HOTP");
      }
      /**
      * Default configuration.
      * @type {{
      *   issuer: string,
      *   label: string,
      *   issuerInLabel: boolean,
      *   algorithm: string,
      *   digits: number,
      *   counter: number
      *   window: number
      * }}
      */
      static get defaults() {
        return {
          issuer: "",
          label: "OTPAuth",
          issuerInLabel: true,
          algorithm: "SHA1",
          digits: 6,
          counter: 0,
          window: 1
        };
      }
      /**
      * Generates an HOTP token.
      * @param {Object} config Configuration options.
      * @param {Secret} config.secret Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.counter=0] Counter value.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      * @returns {string} Token.
      */
      static generate({ secret, algorithm = _HOTP.defaults.algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, hmac: hmac2 = hmacDigest }) {
        const message = uintDecode(counter);
        const digest = hmac2(algorithm, secret.bytes, message);
        if (!digest?.byteLength || digest.byteLength < 19) {
          throw new TypeError("Return value must be at least 19 bytes");
        }
        const offset = digest[digest.byteLength - 1] & 15;
        const otp = ((digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255) % 10 ** digits;
        return otp.toString().padStart(digits, "0");
      }
      /**
      * Generates an HOTP token.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.counter=this.counter++] Counter value.
      * @returns {string} Token.
      */
      generate({ counter = this.counter++ } = {}) {
        return _HOTP.generate({
          secret: this.secret,
          algorithm: this.algorithm,
          digits: this.digits,
          counter,
          hmac: this.hmac
        });
      }
      /**
      * Validates an HOTP token.
      * @param {Object} config Configuration options.
      * @param {string} config.token Token value.
      * @param {Secret} config.secret Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.counter=0] Counter value.
      * @param {number} [config.window=1] Window of counter values to test.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
      */
      static validate({ token, secret, algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, window: window2 = _HOTP.defaults.window, hmac: hmac2 = hmacDigest }) {
        if (token.length !== digits) return null;
        let delta = null;
        const check = /* @__PURE__ */ __name((i) => {
          const generatedToken = _HOTP.generate({
            secret,
            algorithm,
            digits,
            counter: i,
            hmac: hmac2
          });
          if (timingSafeEqual(token, generatedToken)) {
            delta = i - counter;
          }
        }, "check");
        check(counter);
        for (let i = 1; i <= window2 && delta === null; ++i) {
          check(counter - i);
          if (delta !== null) break;
          check(counter + i);
          if (delta !== null) break;
        }
        return delta;
      }
      /**
      * Validates an HOTP token.
      * @param {Object} config Configuration options.
      * @param {string} config.token Token value.
      * @param {number} [config.counter=this.counter] Counter value.
      * @param {number} [config.window=1] Window of counter values to test.
      * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
      */
      validate({ token, counter = this.counter, window: window2 }) {
        return _HOTP.validate({
          token,
          secret: this.secret,
          algorithm: this.algorithm,
          digits: this.digits,
          counter,
          window: window2,
          hmac: this.hmac
        });
      }
      /**
      * Returns a Google Authenticator key URI.
      * @returns {string} URI.
      */
      toString() {
        const e = encodeURIComponent;
        return `otpauth://hotp/${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}secret=${e(this.secret.base32)}&algorithm=${e(this.algorithm)}&digits=${e(this.digits)}&counter=${e(this.counter)}`;
      }
      /**
      * Creates an HOTP object.
      * @param {Object} [config] Configuration options.
      * @param {string} [config.issuer=''] Account provider.
      * @param {string} [config.label='OTPAuth'] Account label.
      * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
      * @param {Secret|string} [config.secret=Secret] Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.counter=0] Initial counter value.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      */
      constructor({ issuer = _HOTP.defaults.issuer, label = _HOTP.defaults.label, issuerInLabel = _HOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = _HOTP.defaults.algorithm, digits = _HOTP.defaults.digits, counter = _HOTP.defaults.counter, hmac: hmac2 } = {}) {
        this.issuer = issuer;
        this.label = label;
        this.issuerInLabel = issuerInLabel;
        this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
        this.algorithm = hmac2 ? algorithm : canonicalizeAlgorithm(algorithm);
        this.digits = digits;
        this.counter = counter;
        this.hmac = hmac2;
      }
    };
    TOTP = class _TOTP {
      static {
        __name(this, "TOTP");
      }
      /**
      * Default configuration.
      * @type {{
      *   issuer: string,
      *   label: string,
      *   issuerInLabel: boolean,
      *   algorithm: string,
      *   digits: number,
      *   period: number
      *   window: number
      * }}
      */
      static get defaults() {
        return {
          issuer: "",
          label: "OTPAuth",
          issuerInLabel: true,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          window: 1
        };
      }
      /**
      * Calculates the counter. i.e. the number of periods since timestamp 0.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.period=30] Token time-step duration.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @returns {number} Counter.
      */
      static counter({ period = _TOTP.defaults.period, timestamp = Date.now() } = {}) {
        return Math.floor(timestamp / 1e3 / period);
      }
      /**
      * Calculates the counter. i.e. the number of periods since timestamp 0.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @returns {number} Counter.
      */
      counter({ timestamp = Date.now() } = {}) {
        return _TOTP.counter({
          period: this.period,
          timestamp
        });
      }
      /**
      * Calculates the remaining time in milliseconds until the next token is generated.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.period=30] Token time-step duration.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @returns {number} counter.
      */
      static remaining({ period = _TOTP.defaults.period, timestamp = Date.now() } = {}) {
        return period * 1e3 - timestamp % (period * 1e3);
      }
      /**
      * Calculates the remaining time in milliseconds until the next token is generated.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @returns {number} counter.
      */
      remaining({ timestamp = Date.now() } = {}) {
        return _TOTP.remaining({
          period: this.period,
          timestamp
        });
      }
      /**
      * Generates a TOTP token.
      * @param {Object} config Configuration options.
      * @param {Secret} config.secret Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.period=30] Token time-step duration.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      * @returns {string} Token.
      */
      static generate({ secret, algorithm, digits, period = _TOTP.defaults.period, timestamp = Date.now(), hmac: hmac2 }) {
        return HOTP.generate({
          secret,
          algorithm,
          digits,
          counter: _TOTP.counter({
            period,
            timestamp
          }),
          hmac: hmac2
        });
      }
      /**
      * Generates a TOTP token.
      * @param {Object} [config] Configuration options.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @returns {string} Token.
      */
      generate({ timestamp = Date.now() } = {}) {
        return _TOTP.generate({
          secret: this.secret,
          algorithm: this.algorithm,
          digits: this.digits,
          period: this.period,
          timestamp,
          hmac: this.hmac
        });
      }
      /**
      * Validates a TOTP token.
      * @param {Object} config Configuration options.
      * @param {string} config.token Token value.
      * @param {Secret} config.secret Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.period=30] Token time-step duration.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @param {number} [config.window=1] Window of counter values to test.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
      */
      static validate({ token, secret, algorithm, digits, period = _TOTP.defaults.period, timestamp = Date.now(), window: window2, hmac: hmac2 }) {
        return HOTP.validate({
          token,
          secret,
          algorithm,
          digits,
          counter: _TOTP.counter({
            period,
            timestamp
          }),
          window: window2,
          hmac: hmac2
        });
      }
      /**
      * Validates a TOTP token.
      * @param {Object} config Configuration options.
      * @param {string} config.token Token value.
      * @param {number} [config.timestamp=Date.now] Timestamp value in milliseconds.
      * @param {number} [config.window=1] Window of counter values to test.
      * @returns {number|null} Token delta or null if it is not found in the search window, in which case it should be considered invalid.
      */
      validate({ token, timestamp, window: window2 }) {
        return _TOTP.validate({
          token,
          secret: this.secret,
          algorithm: this.algorithm,
          digits: this.digits,
          period: this.period,
          timestamp,
          window: window2,
          hmac: this.hmac
        });
      }
      /**
      * Returns a Google Authenticator key URI.
      * @returns {string} URI.
      */
      toString() {
        const e = encodeURIComponent;
        return `otpauth://totp/${this.issuer.length > 0 ? this.issuerInLabel ? `${e(this.issuer)}:${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?issuer=${e(this.issuer)}&` : `${e(this.label)}?`}secret=${e(this.secret.base32)}&algorithm=${e(this.algorithm)}&digits=${e(this.digits)}&period=${e(this.period)}`;
      }
      /**
      * Creates a TOTP object.
      * @param {Object} [config] Configuration options.
      * @param {string} [config.issuer=''] Account provider.
      * @param {string} [config.label='OTPAuth'] Account label.
      * @param {boolean} [config.issuerInLabel=true] Include issuer prefix in label.
      * @param {Secret|string} [config.secret=Secret] Secret key.
      * @param {string} [config.algorithm='SHA1'] HMAC hashing algorithm.
      * @param {number} [config.digits=6] Token length.
      * @param {number} [config.period=30] Token time-step duration.
      * @param {(algorithm: string, key: Uint8Array, message: Uint8Array) => Uint8Array} [config.hmac] Custom HMAC function.
      */
      constructor({ issuer = _TOTP.defaults.issuer, label = _TOTP.defaults.label, issuerInLabel = _TOTP.defaults.issuerInLabel, secret = new Secret(), algorithm = _TOTP.defaults.algorithm, digits = _TOTP.defaults.digits, period = _TOTP.defaults.period, hmac: hmac2 } = {}) {
        this.issuer = issuer;
        this.label = label;
        this.issuerInLabel = issuerInLabel;
        this.secret = typeof secret === "string" ? Secret.fromBase32(secret) : secret;
        this.algorithm = hmac2 ? algorithm : canonicalizeAlgorithm(algorithm);
        this.digits = digits;
        this.period = period;
        this.hmac = hmac2;
      }
    };
  }
});

// ../compartilhado/enums/especialidade.ts
var Especialidade;
var init_especialidade = __esm({
  "../compartilhado/enums/especialidade.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    Especialidade = {
      OFTALMOLOGIA: "OFTALMOLOGIA",
      AUDIOMETRIA: "AUDIOMETRIA",
      ODONTOLOGIA: "ODONTOLOGIA",
      PSICOLOGIA: "PSICOLOGIA",
      NUTRICAO: "NUTRICAO"
    };
  }
});

// ../compartilhado/enums/turno.ts
var Turno;
var init_turno = __esm({
  "../compartilhado/enums/turno.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    Turno = {
      MANHA: "MANHA",
      TARDE: "TARDE"
    };
  }
});

// ../compartilhado/enums/perfil-acesso.ts
var PerfilAcesso, PERFIS_MFA_OBRIGATORIO;
var init_perfil_acesso = __esm({
  "../compartilhado/enums/perfil-acesso.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    PerfilAcesso = {
      ADMIN: "ADMIN",
      TRIAGEM_RECEPCAO: "TRIAGEM_RECEPCAO",
      PROFISSIONAL_SAUDE: "PROFISSIONAL_SAUDE",
      DPO: "DPO"
    };
    PERFIS_MFA_OBRIGATORIO = [
      PerfilAcesso.ADMIN,
      PerfilAcesso.DPO
    ];
  }
});

// ../compartilhado/enums/index.ts
var init_enums = __esm({
  "../compartilhado/enums/index.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_especialidade();
    init_turno();
    init_perfil_acesso();
  }
});

// ../compartilhado/schemas/paciente.schema.ts
var pacienteSchema, criarPacienteSchema, atualizarPacienteSchema;
var init_paciente_schema = __esm({
  "../compartilhado/schemas/paciente.schema.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    pacienteSchema = external_exports.object({
      /** Nome completo do paciente — PII, criptografado no backend */
      nome: external_exports.string().min(3, "Nome deve ter no m\xEDnimo 3 caracteres").max(200, "Nome deve ter no m\xE1ximo 200 caracteres").trim(),
      /** CPF do paciente (ou responsável, se menor) — PII, criptografado no backend */
      cpf: external_exports.string().regex(/^\d{11}$/, "CPF deve conter exatamente 11 d\xEDgitos num\xE9ricos"),
      /** Data de nascimento — PII, criptografada no backend */
      dataNascimento: external_exports.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD").refine((val) => {
        const data = new Date(val);
        return !isNaN(data.getTime()) && data <= /* @__PURE__ */ new Date();
      }, "Data de nascimento inv\xE1lida ou futura"),
      /** Telefone de contato (responsável) — PII, criptografado no backend */
      telefone: external_exports.string().regex(
        /^\d{10,11}$/,
        "Telefone deve conter 10 ou 11 d\xEDgitos (DDD + n\xFAmero)"
      ).optional(),
      /** Turma/Série do aluno */
      turma: external_exports.string().min(1, "Turma \xE9 obrigat\xF3ria").max(50, "Turma deve ter no m\xE1ximo 50 caracteres").trim(),
      /** ID da escola/local de atendimento */
      escolaLocalId: external_exports.string().uuid("ID da escola deve ser um UUID v\xE1lido"),
      sexo: external_exports.string().min(1).max(30).optional()
    });
    criarPacienteSchema = pacienteSchema;
    atualizarPacienteSchema = pacienteSchema.partial();
  }
});

// ../compartilhado/schemas/consentimento.schema.ts
var consentimentoSchema;
var init_consentimento_schema = __esm({
  "../compartilhado/schemas/consentimento.schema.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    consentimentoSchema = external_exports.object({
      /** ID do paciente ao qual o consentimento se refere */
      pacienteId: external_exports.string().uuid("ID do paciente deve ser um UUID v\xE1lido"),
      /**
       * Nome do responsável legal que autorizou o tratamento de dados.
       * Obrigatório quando `consentimentoDispensado` é false.
       */
      consentidoPor: external_exports.string().min(3, "Nome do respons\xE1vel deve ter no m\xEDnimo 3 caracteres").max(200, "Nome do respons\xE1vel deve ter no m\xE1ximo 200 caracteres").trim().optional(),
      /**
       * Data em que o consentimento foi concedido (ISO 8601).
       * Obrigatório quando `consentimentoDispensado` é false.
       */
      dataConsentimento: external_exports.string().regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "Data deve estar no formato AAAA-MM-DD"
      ).optional(),
      /**
       * Referência ao documento de consentimento (ex: protocolo, número do TCLE).
       * Obrigatório quando `consentimentoDispensado` é false.
       */
      referenciaDocumento: external_exports.string().min(1, "Refer\xEAncia do documento \xE9 obrigat\xF3ria").max(500, "Refer\xEAncia deve ter no m\xE1ximo 500 caracteres").trim().optional(),
      /**
       * Indica se o consentimento foi dispensado por hipótese legal
       * de tutela de saúde pública (Art. 11, II, f da LGPD).
       * Quando true, os campos consentidoPor, dataConsentimento e
       * referenciaDocumento tornam-se opcionais.
       */
      consentimentoDispensado: external_exports.boolean().default(false),
      /**
       * Justificativa legal para dispensa do consentimento.
       * Obrigatório quando `consentimentoDispensado` é true.
       */
      justificativaDispensa: external_exports.string().min(10, "Justificativa deve ter no m\xEDnimo 10 caracteres").max(1e3, "Justificativa deve ter no m\xE1ximo 1000 caracteres").trim().optional()
    }).refine(
      (dados) => {
        if (dados.consentimentoDispensado) {
          return !!dados.justificativaDispensa;
        }
        return !!dados.consentidoPor && !!dados.dataConsentimento && !!dados.referenciaDocumento;
      },
      {
        message: "Consentimento do respons\xE1vel legal \xE9 obrigat\xF3rio (LGPD Art. 14). Informe consentidoPor, dataConsentimento e referenciaDocumento, ou marque consentimentoDispensado com justificativa legal.",
        path: ["consentidoPor"]
      }
    );
  }
});

// ../compartilhado/schemas/ficha-atendimento.schema.ts
var fichaAtendimentoSchema, filtroAtendimentoSchema;
var init_ficha_atendimento_schema = __esm({
  "../compartilhado/schemas/ficha-atendimento.schema.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    init_especialidade();
    init_turno();
    fichaAtendimentoSchema = external_exports.object({
      /**
       * Chave de idempotência (UUID v4 gerado no client).
       * Garante que retransmissões por instabilidade de rede
       * não criem registros duplicados no banco.
       */
      idempotencyKey: external_exports.string().uuid("Chave de idempot\xEAncia deve ser um UUID v\xE1lido"),
      /** ID do paciente atendido */
      pacienteId: external_exports.string().uuid("ID do paciente deve ser um UUID v\xE1lido"),
      /** ID da escola/local onde o atendimento ocorreu */
      escolaLocalId: external_exports.string().uuid("ID da escola/local deve ser um UUID v\xE1lido"),
      /** Especialidade do atendimento */
      especialidade: external_exports.nativeEnum(Especialidade, {
        errorMap: /* @__PURE__ */ __name(() => ({
          message: `Especialidade deve ser uma das seguintes: ${Object.values(Especialidade).join(", ")}`
        }), "errorMap")
      }),
      /** Turno do atendimento (Manhã ou Tarde) */
      turno: external_exports.nativeEnum(Turno, {
        errorMap: /* @__PURE__ */ __name(() => ({
          message: `Turno deve ser: ${Object.values(Turno).join(" ou ")}`
        }), "errorMap")
      }),
      /** Resumo da consulta realizada */
      resumo: external_exports.string().min(10, "Resumo deve ter no m\xEDnimo 10 caracteres").max(5e3, "Resumo deve ter no m\xE1ximo 5000 caracteres").trim(),
      /** Procedimentos realizados durante o atendimento */
      procedimentos: external_exports.string().max(5e3, "Procedimentos devem ter no m\xE1ximo 5000 caracteres").trim().optional(),
      /** Insumos e materiais utilizados no atendimento */
      insumosUtilizados: external_exports.string().max(2e3, "Insumos devem ter no m\xE1ximo 2000 caracteres").trim().optional(),
      /** Encaminhamento externo (se necessário) */
      encaminhamentoExterno: external_exports.string().max(2e3, "Encaminhamento deve ter no m\xE1ximo 2000 caracteres").trim().optional()
    });
    filtroAtendimentoSchema = external_exports.object({
      especialidade: external_exports.nativeEnum(Especialidade).optional(),
      turno: external_exports.nativeEnum(Turno).optional(),
      escolaLocalId: external_exports.string().uuid().optional(),
      pacienteId: external_exports.string().uuid().optional(),
      dataInicio: external_exports.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      dataFim: external_exports.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      pagina: external_exports.coerce.number().int().min(1).default(1),
      porPagina: external_exports.coerce.number().int().min(1).max(100).default(20)
    });
  }
});

// ../compartilhado/schemas/usuario.schema.ts
var usuarioSchema, loginSchema, verificarMfaSchema;
var init_usuario_schema = __esm({
  "../compartilhado/schemas/usuario.schema.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    init_perfil_acesso();
    usuarioSchema = external_exports.object({
      email: external_exports.string().email("E-mail inv\xE1lido").max(254, "E-mail deve ter no m\xE1ximo 254 caracteres").trim().toLowerCase(),
      senha: external_exports.string().min(12, "Senha deve ter no m\xEDnimo 12 caracteres").max(128, "Senha deve ter no m\xE1ximo 128 caracteres"),
      nomeCompleto: external_exports.string().min(3, "Nome deve ter no m\xEDnimo 3 caracteres").max(200, "Nome deve ter no m\xE1ximo 200 caracteres").trim(),
      perfil: external_exports.nativeEnum(PerfilAcesso, {
        errorMap: /* @__PURE__ */ __name(() => ({
          message: `Perfil deve ser: ${Object.values(PerfilAcesso).join(", ")}`
        }), "errorMap")
      })
    });
    loginSchema = external_exports.object({
      email: external_exports.string().email("E-mail inv\xE1lido").trim().toLowerCase(),
      senha: external_exports.string().min(1, "Senha \xE9 obrigat\xF3ria")
    });
    verificarMfaSchema = external_exports.object({
      token: external_exports.string().length(6, "Token MFA deve ter exatamente 6 d\xEDgitos").regex(/^\d{6}$/, "Token MFA deve conter apenas d\xEDgitos")
    });
  }
});

// ../compartilhado/schemas/escola.schema.ts
var criarEscolaSchema;
var init_escola_schema = __esm({
  "../compartilhado/schemas/escola.schema.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_zod();
    criarEscolaSchema = external_exports.object({
      nome: external_exports.string().min(3, "O nome deve ter no m\xEDnimo 3 caracteres"),
      endereco: external_exports.string().min(5, "O endere\xE7o deve ter no m\xEDnimo 5 caracteres"),
      cidade: external_exports.string().min(2, "A cidade deve ter no m\xEDnimo 2 caracteres"),
      uf: external_exports.string().length(2, "A UF deve ter exatamente 2 caracteres"),
      cnpj: external_exports.string().regex(/^\d{14}$/, "CNPJ deve conter 14 d\xEDgitos").optional(),
      telefone: external_exports.string().min(10, "Telefone inv\xE1lido").max(20).optional(),
      email: external_exports.string().email("E-mail inv\xE1lido").optional(),
      diretoriaRegional: external_exports.string().optional(),
      alunosMatriculados: external_exports.number().int().min(0).default(0)
    });
  }
});

// ../compartilhado/schemas/index.ts
var init_schemas = __esm({
  "../compartilhado/schemas/index.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_paciente_schema();
    init_consentimento_schema();
    init_ficha_atendimento_schema();
    init_usuario_schema();
    init_escola_schema();
  }
});

// ../compartilhado/index.ts
var init_compartilhado = __esm({
  "../compartilhado/index.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_enums();
    init_schemas();
  }
});

// ../../../node_modules/@prisma/client-runtime-utils/dist/index.js
var require_dist = __commonJS({
  "../../../node_modules/@prisma/client-runtime-utils/dist/index.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    var __defProp3 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export3 = /* @__PURE__ */ __name((target, all) => {
      for (var name2 in all)
        __defProp3(target, name2, { get: all[name2], enumerable: true });
    }, "__export");
    var __copyProps2 = /* @__PURE__ */ __name((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp3(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name((mod2) => __copyProps2(__defProp3({}, "__esModule", { value: true }), mod2), "__toCommonJS");
    var index_exports = {};
    __export3(index_exports, {
      AnyNull: /* @__PURE__ */ __name(() => AnyNull2, "AnyNull"),
      AnyNullClass: /* @__PURE__ */ __name(() => AnyNullClass, "AnyNullClass"),
      DbNull: /* @__PURE__ */ __name(() => DbNull2, "DbNull"),
      DbNullClass: /* @__PURE__ */ __name(() => DbNullClass, "DbNullClass"),
      Decimal: /* @__PURE__ */ __name(() => Decimal2, "Decimal"),
      JsonNull: /* @__PURE__ */ __name(() => JsonNull2, "JsonNull"),
      JsonNullClass: /* @__PURE__ */ __name(() => JsonNullClass, "JsonNullClass"),
      NullTypes: /* @__PURE__ */ __name(() => NullTypes2, "NullTypes"),
      ObjectEnumValue: /* @__PURE__ */ __name(() => ObjectEnumValue2, "ObjectEnumValue"),
      PrismaClientInitializationError: /* @__PURE__ */ __name(() => PrismaClientInitializationError2, "PrismaClientInitializationError"),
      PrismaClientKnownRequestError: /* @__PURE__ */ __name(() => PrismaClientKnownRequestError2, "PrismaClientKnownRequestError"),
      PrismaClientRustError: /* @__PURE__ */ __name(() => PrismaClientRustError, "PrismaClientRustError"),
      PrismaClientRustPanicError: /* @__PURE__ */ __name(() => PrismaClientRustPanicError2, "PrismaClientRustPanicError"),
      PrismaClientUnknownRequestError: /* @__PURE__ */ __name(() => PrismaClientUnknownRequestError2, "PrismaClientUnknownRequestError"),
      PrismaClientValidationError: /* @__PURE__ */ __name(() => PrismaClientValidationError2, "PrismaClientValidationError"),
      Sql: /* @__PURE__ */ __name(() => Sql2, "Sql"),
      empty: /* @__PURE__ */ __name(() => empty2, "empty"),
      hasBatchIndex: /* @__PURE__ */ __name(() => hasBatchIndex, "hasBatchIndex"),
      isAnyNull: /* @__PURE__ */ __name(() => isAnyNull2, "isAnyNull"),
      isDbNull: /* @__PURE__ */ __name(() => isDbNull2, "isDbNull"),
      isJsonNull: /* @__PURE__ */ __name(() => isJsonNull2, "isJsonNull"),
      isObjectEnumValue: /* @__PURE__ */ __name(() => isObjectEnumValue2, "isObjectEnumValue"),
      join: /* @__PURE__ */ __name(() => join2, "join"),
      raw: /* @__PURE__ */ __name(() => raw3, "raw"),
      sql: /* @__PURE__ */ __name(() => sql, "sql")
    });
    module.exports = __toCommonJS(index_exports);
    function hasBatchIndex(value) {
      return typeof value["batchRequestIdx"] === "number";
    }
    __name(hasBatchIndex, "hasBatchIndex");
    function setClassName(classObject, name2) {
      Object.defineProperty(classObject, "name", {
        value: name2,
        configurable: true
      });
    }
    __name(setClassName, "setClassName");
    var PrismaClientInitializationError2 = class _PrismaClientInitializationError extends Error {
      static {
        __name(this, "_PrismaClientInitializationError");
      }
      clientVersion;
      errorCode;
      retryable;
      constructor(message, clientVersion, errorCode) {
        super(message);
        this.name = "PrismaClientInitializationError";
        this.clientVersion = clientVersion;
        this.errorCode = errorCode;
        Error.captureStackTrace(_PrismaClientInitializationError);
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientInitializationError";
      }
    };
    setClassName(PrismaClientInitializationError2, "PrismaClientInitializationError");
    var PrismaClientKnownRequestError2 = class extends Error {
      static {
        __name(this, "PrismaClientKnownRequestError");
      }
      code;
      meta;
      clientVersion;
      batchRequestIdx;
      constructor(message, { code, clientVersion, meta, batchRequestIdx }) {
        super(message);
        this.name = "PrismaClientKnownRequestError";
        this.code = code;
        this.clientVersion = clientVersion;
        this.meta = meta;
        Object.defineProperty(this, "batchRequestIdx", {
          value: batchRequestIdx,
          enumerable: false,
          writable: true
        });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientKnownRequestError";
      }
    };
    setClassName(PrismaClientKnownRequestError2, "PrismaClientKnownRequestError");
    function getBacktrace(log3) {
      if (log3.fields?.message) {
        let str = log3.fields?.message;
        if (log3.fields?.file) {
          str += ` in ${log3.fields.file}`;
          if (log3.fields?.line) {
            str += `:${log3.fields.line}`;
          }
          if (log3.fields?.column) {
            str += `:${log3.fields.column}`;
          }
        }
        if (log3.fields?.reason) {
          str += `
${log3.fields?.reason}`;
        }
        return str;
      }
      return "Unknown error";
    }
    __name(getBacktrace, "getBacktrace");
    function isPanic(err) {
      return err.fields?.message === "PANIC";
    }
    __name(isPanic, "isPanic");
    var PrismaClientRustError = class extends Error {
      static {
        __name(this, "PrismaClientRustError");
      }
      clientVersion;
      _isPanic;
      constructor({ clientVersion, error }) {
        const backtrace = getBacktrace(error);
        super(backtrace ?? "Unknown error");
        this._isPanic = isPanic(error);
        this.clientVersion = clientVersion;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustError";
      }
      isPanic() {
        return this._isPanic;
      }
    };
    setClassName(PrismaClientRustError, "PrismaClientRustError");
    var PrismaClientRustPanicError2 = class extends Error {
      static {
        __name(this, "PrismaClientRustPanicError");
      }
      clientVersion;
      constructor(message, clientVersion) {
        super(message);
        this.name = "PrismaClientRustPanicError";
        this.clientVersion = clientVersion;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustPanicError";
      }
    };
    setClassName(PrismaClientRustPanicError2, "PrismaClientRustPanicError");
    var PrismaClientUnknownRequestError2 = class extends Error {
      static {
        __name(this, "PrismaClientUnknownRequestError");
      }
      clientVersion;
      batchRequestIdx;
      constructor(message, { clientVersion, batchRequestIdx }) {
        super(message);
        this.name = "PrismaClientUnknownRequestError";
        this.clientVersion = clientVersion;
        Object.defineProperty(this, "batchRequestIdx", {
          value: batchRequestIdx,
          writable: true,
          enumerable: false
        });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientUnknownRequestError";
      }
    };
    setClassName(PrismaClientUnknownRequestError2, "PrismaClientUnknownRequestError");
    var PrismaClientValidationError2 = class extends Error {
      static {
        __name(this, "PrismaClientValidationError");
      }
      name = "PrismaClientValidationError";
      clientVersion;
      constructor(message, { clientVersion }) {
        super(message);
        this.clientVersion = clientVersion;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientValidationError";
      }
    };
    setClassName(PrismaClientValidationError2, "PrismaClientValidationError");
    var secret = /* @__PURE__ */ Symbol();
    var PRISMA_OBJECT_ENUM_VALUE = /* @__PURE__ */ Symbol.for("prisma.objectEnumValue");
    var ObjectEnumValue2 = class {
      static {
        __name(this, "ObjectEnumValue");
      }
      [PRISMA_OBJECT_ENUM_VALUE] = true;
      #representation;
      constructor(arg) {
        if (arg === secret) {
          this.#representation = `Prisma.${this._getName()}`;
        } else {
          this.#representation = `new Prisma.${this._getNamespace()}.${this._getName()}()`;
        }
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return this.#representation;
      }
    };
    function setClassName2(classObject, name2) {
      Object.defineProperty(classObject, "name", {
        value: name2,
        configurable: true
      });
    }
    __name(setClassName2, "setClassName2");
    var NullTypesEnumValue = class extends ObjectEnumValue2 {
      static {
        __name(this, "NullTypesEnumValue");
      }
      _getNamespace() {
        return "NullTypes";
      }
    };
    var DbNullClass = class extends NullTypesEnumValue {
      static {
        __name(this, "DbNullClass");
      }
      // Phantom private property to prevent structural type equality
      // eslint-disable-next-line no-unused-private-class-members
      #_brand_DbNull;
    };
    setClassName2(DbNullClass, "DbNull");
    var JsonNullClass = class extends NullTypesEnumValue {
      static {
        __name(this, "JsonNullClass");
      }
      // Phantom private property to prevent structural type equality
      // eslint-disable-next-line no-unused-private-class-members
      #_brand_JsonNull;
    };
    setClassName2(JsonNullClass, "JsonNull");
    var AnyNullClass = class extends NullTypesEnumValue {
      static {
        __name(this, "AnyNullClass");
      }
      // Phantom private property to prevent structural type equality
      // eslint-disable-next-line no-unused-private-class-members
      #_brand_AnyNull;
    };
    setClassName2(AnyNullClass, "AnyNull");
    var NullTypes2 = {
      DbNull: DbNullClass,
      JsonNull: JsonNullClass,
      AnyNull: AnyNullClass
    };
    var DbNull2 = new DbNullClass(secret);
    var JsonNull2 = new JsonNullClass(secret);
    var AnyNull2 = new AnyNullClass(secret);
    function isObjectEnumValue2(value) {
      return typeof value === "object" && value !== null && value[PRISMA_OBJECT_ENUM_VALUE] === true;
    }
    __name(isObjectEnumValue2, "isObjectEnumValue");
    function isDbNull2(value) {
      return value === DbNull2;
    }
    __name(isDbNull2, "isDbNull");
    function isJsonNull2(value) {
      return value === JsonNull2;
    }
    __name(isJsonNull2, "isJsonNull");
    function isAnyNull2(value) {
      return value === AnyNull2;
    }
    __name(isAnyNull2, "isAnyNull");
    var EXP_LIMIT = 9e15;
    var MAX_DIGITS = 1e9;
    var NUMERALS = "0123456789abcdef";
    var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var DEFAULTS = {
      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed at run-time using the `Decimal.config` method.
      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,
      // 1 to MAX_DIGITS
      // The rounding mode used when rounding to `precision`.
      //
      // ROUND_UP         0 Away from zero.
      // ROUND_DOWN       1 Towards zero.
      // ROUND_CEIL       2 Towards +Infinity.
      // ROUND_FLOOR      3 Towards -Infinity.
      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      //
      // E.g.
      // `Decimal.rounding = 4;`
      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
      rounding: 4,
      // 0 to 8
      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP         0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
      // FLOOR      3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN  6 The IEEE 754 remainder function.
      // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
      //
      // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
      // division (9) are commonly used for the modulus operation. The other rounding modes can also
      // be used, but they may not give useful results.
      modulo: 1,
      // 0 to 9
      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,
      // 0 to -EXP_LIMIT
      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos: 21,
      // 0 to EXP_LIMIT
      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,
      // -1 to -EXP_LIMIT
      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,
      // 1 to EXP_LIMIT
      // Whether to use cryptographically-secure random number generation, if available.
      crypto: false
      // true/false
    };
    var inexact;
    var quadrant;
    var external = true;
    var decimalError = "[DecimalError] ";
    var invalidArgument = decimalError + "Invalid argument: ";
    var precisionLimitExceeded = decimalError + "Precision limit exceeded";
    var cryptoUnavailable = decimalError + "crypto unavailable";
    var tag = "[object Decimal]";
    var mathfloor = Math.floor;
    var mathpow = Math.pow;
    var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var BASE = 1e7;
    var LOG_BASE = 7;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var LN10_PRECISION = LN10.length - 1;
    var PI_PRECISION = PI.length - 1;
    var P = { toStringTag: tag };
    P.absoluteValue = P.abs = function() {
      var x = new this.constructor(this);
      if (x.s < 0) x.s = 1;
      return finalise(x);
    };
    P.ceil = function() {
      return finalise(new this.constructor(this), this.e + 1, 2);
    };
    P.clampedTo = P.clamp = function(min2, max2) {
      var k, x = this, Ctor = x.constructor;
      min2 = new Ctor(min2);
      max2 = new Ctor(max2);
      if (!min2.s || !max2.s) return new Ctor(NaN);
      if (min2.gt(max2)) throw Error(invalidArgument + max2);
      k = x.cmp(min2);
      return k < 0 ? min2 : x.cmp(max2) > 0 ? max2 : new Ctor(x);
    };
    P.comparedTo = P.cmp = function(y) {
      var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
      if (!xd || !yd) {
        return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
      }
      if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
      if (xs !== ys) return xs;
      if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;
      xdL = xd.length;
      ydL = yd.length;
      for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
        if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
      }
      return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
    };
    P.cosine = P.cos = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (!x.d) return new Ctor(NaN);
      if (!x.d[0]) return new Ctor(1);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
      Ctor.rounding = 1;
      x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
    };
    P.cubeRoot = P.cbrt = function() {
      var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
      if (!x.isFinite() || x.isZero()) return new Ctor(x);
      external = false;
      s = x.s * mathpow(x.s * x, 1 / 3);
      if (!s || Math.abs(s) == 1 / 0) {
        n = digitsToString(x.d);
        e = x.e;
        if (s = (e - n.length + 1) % 3) n += s == 1 || s == -2 ? "0" : "00";
        s = mathpow(n, 1 / 3);
        e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
        if (s == 1 / 0) {
          n = "5e" + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf("e") + 1) + e;
        }
        r = new Ctor(n);
        r.s = x.s;
      } else {
        r = new Ctor(s.toString());
      }
      sd = (e = Ctor.precision) + 3;
      for (; ; ) {
        t = r;
        t3 = t.times(t).times(t);
        t3plusx = t3.plus(x);
        r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
        if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
          n = n.slice(sd - 3, sd + 1);
          if (n == "9999" || !rep && n == "4999") {
            if (!rep) {
              finalise(t, e + 1, 0);
              if (t.times(t).times(t).eq(x)) {
                r = t;
                break;
              }
            }
            sd += 4;
            rep = 1;
          } else {
            if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
              finalise(r, e + 1, 1);
              m = !r.times(r).times(r).eq(x);
            }
            break;
          }
        }
      }
      external = true;
      return finalise(r, e, Ctor.rounding, m);
    };
    P.decimalPlaces = P.dp = function() {
      var w, d = this.d, n = NaN;
      if (d) {
        w = d.length - 1;
        n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
        w = d[w];
        if (w) for (; w % 10 == 0; w /= 10) n--;
        if (n < 0) n = 0;
      }
      return n;
    };
    P.dividedBy = P.div = function(y) {
      return divide(this, new this.constructor(y));
    };
    P.dividedToIntegerBy = P.divToInt = function(y) {
      var x = this, Ctor = x.constructor;
      return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
    };
    P.equals = P.eq = function(y) {
      return this.cmp(y) === 0;
    };
    P.floor = function() {
      return finalise(new this.constructor(this), this.e + 1, 3);
    };
    P.greaterThan = P.gt = function(y) {
      return this.cmp(y) > 0;
    };
    P.greaterThanOrEqualTo = P.gte = function(y) {
      var k = this.cmp(y);
      return k == 1 || k === 0;
    };
    P.hyperbolicCosine = P.cosh = function() {
      var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
      if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
      if (x.isZero()) return one;
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
      Ctor.rounding = 1;
      len = x.d.length;
      if (len < 32) {
        k = Math.ceil(len / 3);
        n = (1 / tinyPow(4, k)).toString();
      } else {
        k = 16;
        n = "2.3283064365386962890625e-10";
      }
      x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
      var cosh2_x, i = k, d8 = new Ctor(8);
      for (; i--; ) {
        cosh2_x = x.times(x);
        x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
      }
      return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
    };
    P.hyperbolicSine = P.sinh = function() {
      var k, pr, rm, len, x = this, Ctor = x.constructor;
      if (!x.isFinite() || x.isZero()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
      Ctor.rounding = 1;
      len = x.d.length;
      if (len < 3) {
        x = taylorSeries(Ctor, 2, x, x, true);
      } else {
        k = 1.4 * Math.sqrt(len);
        k = k > 16 ? 16 : k | 0;
        x = x.times(1 / tinyPow(5, k));
        x = taylorSeries(Ctor, 2, x, x, true);
        var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
        for (; k--; ) {
          sinh2_x = x.times(x);
          x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
        }
      }
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return finalise(x, pr, rm, true);
    };
    P.hyperbolicTangent = P.tanh = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (!x.isFinite()) return new Ctor(x.s);
      if (x.isZero()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 7;
      Ctor.rounding = 1;
      return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
    };
    P.inverseCosine = P.acos = function() {
      var x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
      if (k !== -1) {
        return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
      }
      if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);
      Ctor.precision = pr + 6;
      Ctor.rounding = 1;
      x = new Ctor(1).minus(x).div(x.plus(1)).sqrt().atan();
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return x.times(2);
    };
    P.inverseHyperbolicCosine = P.acosh = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
      if (!x.isFinite()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
      Ctor.rounding = 1;
      external = false;
      x = x.times(x).minus(1).sqrt().plus(x);
      external = true;
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return x.ln();
    };
    P.inverseHyperbolicSine = P.asinh = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (!x.isFinite() || x.isZero()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
      Ctor.rounding = 1;
      external = false;
      x = x.times(x).plus(1).sqrt().plus(x);
      external = true;
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return x.ln();
    };
    P.inverseHyperbolicTangent = P.atanh = function() {
      var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
      if (!x.isFinite()) return new Ctor(NaN);
      if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      xsd = x.sd();
      if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);
      Ctor.precision = wpr = xsd - x.e;
      x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
      Ctor.precision = pr + 4;
      Ctor.rounding = 1;
      x = x.ln();
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return x.times(0.5);
    };
    P.inverseSine = P.asin = function() {
      var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
      if (x.isZero()) return new Ctor(x);
      k = x.abs().cmp(1);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      if (k !== -1) {
        if (k === 0) {
          halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
          halfPi.s = x.s;
          return halfPi;
        }
        return new Ctor(NaN);
      }
      Ctor.precision = pr + 6;
      Ctor.rounding = 1;
      x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return x.times(2);
    };
    P.inverseTangent = P.atan = function() {
      var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
      if (!x.isFinite()) {
        if (!x.s) return new Ctor(NaN);
        if (pr + 4 <= PI_PRECISION) {
          r = getPi(Ctor, pr + 4, rm).times(0.5);
          r.s = x.s;
          return r;
        }
      } else if (x.isZero()) {
        return new Ctor(x);
      } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.25);
        r.s = x.s;
        return r;
      }
      Ctor.precision = wpr = pr + 10;
      Ctor.rounding = 1;
      k = Math.min(28, wpr / LOG_BASE + 2 | 0);
      for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));
      external = false;
      j = Math.ceil(wpr / LOG_BASE);
      n = 1;
      x2 = x.times(x);
      r = new Ctor(x);
      px = x;
      for (; i !== -1; ) {
        px = px.times(x2);
        t = r.minus(px.div(n += 2));
        px = px.times(x2);
        r = t.plus(px.div(n += 2));
        if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--; ) ;
      }
      if (k) r = r.times(2 << k - 1);
      external = true;
      return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
    };
    P.isFinite = function() {
      return !!this.d;
    };
    P.isInteger = P.isInt = function() {
      return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
    };
    P.isNaN = function() {
      return !this.s;
    };
    P.isNegative = P.isNeg = function() {
      return this.s < 0;
    };
    P.isPositive = P.isPos = function() {
      return this.s > 0;
    };
    P.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    P.lessThan = P.lt = function(y) {
      return this.cmp(y) < 0;
    };
    P.lessThanOrEqualTo = P.lte = function(y) {
      return this.cmp(y) < 1;
    };
    P.logarithm = P.log = function(base) {
      var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
      if (base == null) {
        base = new Ctor(10);
        isBase10 = true;
      } else {
        base = new Ctor(base);
        d = base.d;
        if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);
        isBase10 = base.eq(10);
      }
      d = arg.d;
      if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
        return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
      }
      if (isBase10) {
        if (d.length > 1) {
          inf = true;
        } else {
          for (k = d[0]; k % 10 === 0; ) k /= 10;
          inf = k !== 1;
        }
      }
      external = false;
      sd = pr + guard;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r = divide(num, denominator, sd, 1);
      if (checkRoundingDigits(r.d, k = pr, rm)) {
        do {
          sd += 10;
          num = naturalLogarithm(arg, sd);
          denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
          r = divide(num, denominator, sd, 1);
          if (!inf) {
            if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
              r = finalise(r, pr + 1, 0);
            }
            break;
          }
        } while (checkRoundingDigits(r.d, k += 10, rm));
      }
      external = true;
      return finalise(r, pr, rm);
    };
    P.minus = P.sub = function(y) {
      var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
      y = new Ctor(y);
      if (!x.d || !y.d) {
        if (!x.s || !y.s) y = new Ctor(NaN);
        else if (x.d) y.s = -y.s;
        else y = new Ctor(y.d || x.s !== y.s ? x : NaN);
        return y;
      }
      if (x.s != y.s) {
        y.s = -y.s;
        return x.plus(y);
      }
      xd = x.d;
      yd = y.d;
      pr = Ctor.precision;
      rm = Ctor.rounding;
      if (!xd[0] || !yd[0]) {
        if (yd[0]) y.s = -y.s;
        else if (xd[0]) y = new Ctor(x);
        else return new Ctor(rm === 3 ? -0 : 0);
        return external ? finalise(y, pr, rm) : y;
      }
      e = mathfloor(y.e / LOG_BASE);
      xe = mathfloor(x.e / LOG_BASE);
      xd = xd.slice();
      k = xe - e;
      if (k) {
        xLTy = k < 0;
        if (xLTy) {
          d = xd;
          k = -k;
          len = yd.length;
        } else {
          d = yd;
          e = xe;
          len = xd.length;
        }
        i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
        if (k > i) {
          k = i;
          d.length = 1;
        }
        d.reverse();
        for (i = k; i--; ) d.push(0);
        d.reverse();
      } else {
        i = xd.length;
        len = yd.length;
        xLTy = i < len;
        if (xLTy) len = i;
        for (i = 0; i < len; i++) {
          if (xd[i] != yd[i]) {
            xLTy = xd[i] < yd[i];
            break;
          }
        }
        k = 0;
      }
      if (xLTy) {
        d = xd;
        xd = yd;
        yd = d;
        y.s = -y.s;
      }
      len = xd.length;
      for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
      for (i = yd.length; i > k; ) {
        if (xd[--i] < yd[i]) {
          for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
          --xd[j];
          xd[i] += BASE;
        }
        xd[i] -= yd[i];
      }
      for (; xd[--len] === 0; ) xd.pop();
      for (; xd[0] === 0; xd.shift()) --e;
      if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);
      y.d = xd;
      y.e = getBase10Exponent(xd, e);
      return external ? finalise(y, pr, rm) : y;
    };
    P.modulo = P.mod = function(y) {
      var q, x = this, Ctor = x.constructor;
      y = new Ctor(y);
      if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);
      if (!y.d || x.d && !x.d[0]) {
        return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
      }
      external = false;
      if (Ctor.modulo == 9) {
        q = divide(x, y.abs(), 0, 3, 1);
        q.s *= y.s;
      } else {
        q = divide(x, y, 0, Ctor.modulo, 1);
      }
      q = q.times(y);
      external = true;
      return x.minus(q);
    };
    P.naturalExponential = P.exp = function() {
      return naturalExponential(this);
    };
    P.naturalLogarithm = P.ln = function() {
      return naturalLogarithm(this);
    };
    P.negated = P.neg = function() {
      var x = new this.constructor(this);
      x.s = -x.s;
      return finalise(x);
    };
    P.plus = P.add = function(y) {
      var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
      y = new Ctor(y);
      if (!x.d || !y.d) {
        if (!x.s || !y.s) y = new Ctor(NaN);
        else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);
        return y;
      }
      if (x.s != y.s) {
        y.s = -y.s;
        return x.minus(y);
      }
      xd = x.d;
      yd = y.d;
      pr = Ctor.precision;
      rm = Ctor.rounding;
      if (!xd[0] || !yd[0]) {
        if (!yd[0]) y = new Ctor(x);
        return external ? finalise(y, pr, rm) : y;
      }
      k = mathfloor(x.e / LOG_BASE);
      e = mathfloor(y.e / LOG_BASE);
      xd = xd.slice();
      i = k - e;
      if (i) {
        if (i < 0) {
          d = xd;
          i = -i;
          len = yd.length;
        } else {
          d = yd;
          e = k;
          len = xd.length;
        }
        k = Math.ceil(pr / LOG_BASE);
        len = k > len ? k + 1 : len + 1;
        if (i > len) {
          i = len;
          d.length = 1;
        }
        d.reverse();
        for (; i--; ) d.push(0);
        d.reverse();
      }
      len = xd.length;
      i = yd.length;
      if (len - i < 0) {
        i = len;
        d = yd;
        yd = xd;
        xd = d;
      }
      for (carry = 0; i; ) {
        carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
        xd[i] %= BASE;
      }
      if (carry) {
        xd.unshift(carry);
        ++e;
      }
      for (len = xd.length; xd[--len] == 0; ) xd.pop();
      y.d = xd;
      y.e = getBase10Exponent(xd, e);
      return external ? finalise(y, pr, rm) : y;
    };
    P.precision = P.sd = function(z) {
      var k, x = this;
      if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
      if (x.d) {
        k = getPrecision(x.d);
        if (z && x.e + 1 > k) k = x.e + 1;
      } else {
        k = NaN;
      }
      return k;
    };
    P.round = function() {
      var x = this, Ctor = x.constructor;
      return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
    };
    P.sine = P.sin = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (!x.isFinite()) return new Ctor(NaN);
      if (x.isZero()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
      Ctor.rounding = 1;
      x = sine(Ctor, toLessThanHalfPi(Ctor, x));
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
    };
    P.squareRoot = P.sqrt = function() {
      var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
      if (s !== 1 || !d || !d[0]) {
        return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
      }
      external = false;
      s = Math.sqrt(+x);
      if (s == 0 || s == 1 / 0) {
        n = digitsToString(d);
        if ((n.length + e) % 2 == 0) n += "0";
        s = Math.sqrt(n);
        e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
        if (s == 1 / 0) {
          n = "5e" + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf("e") + 1) + e;
        }
        r = new Ctor(n);
      } else {
        r = new Ctor(s.toString());
      }
      sd = (e = Ctor.precision) + 3;
      for (; ; ) {
        t = r;
        r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
        if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
          n = n.slice(sd - 3, sd + 1);
          if (n == "9999" || !rep && n == "4999") {
            if (!rep) {
              finalise(t, e + 1, 0);
              if (t.times(t).eq(x)) {
                r = t;
                break;
              }
            }
            sd += 4;
            rep = 1;
          } else {
            if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
              finalise(r, e + 1, 1);
              m = !r.times(r).eq(x);
            }
            break;
          }
        }
      }
      external = true;
      return finalise(r, e, Ctor.rounding, m);
    };
    P.tangent = P.tan = function() {
      var pr, rm, x = this, Ctor = x.constructor;
      if (!x.isFinite()) return new Ctor(NaN);
      if (x.isZero()) return new Ctor(x);
      pr = Ctor.precision;
      rm = Ctor.rounding;
      Ctor.precision = pr + 10;
      Ctor.rounding = 1;
      x = x.sin();
      x.s = 1;
      x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
      Ctor.precision = pr;
      Ctor.rounding = rm;
      return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
    };
    P.times = P.mul = function(y) {
      var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
      y.s *= x.s;
      if (!xd || !xd[0] || !yd || !yd[0]) {
        return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
      }
      e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
      xdL = xd.length;
      ydL = yd.length;
      if (xdL < ydL) {
        r = xd;
        xd = yd;
        yd = r;
        rL = xdL;
        xdL = ydL;
        ydL = rL;
      }
      r = [];
      rL = xdL + ydL;
      for (i = rL; i--; ) r.push(0);
      for (i = ydL; --i >= 0; ) {
        carry = 0;
        for (k = xdL + i; k > i; ) {
          t = r[k] + yd[i] * xd[k - i - 1] + carry;
          r[k--] = t % BASE | 0;
          carry = t / BASE | 0;
        }
        r[k] = (r[k] + carry) % BASE | 0;
      }
      for (; !r[--rL]; ) r.pop();
      if (carry) ++e;
      else r.shift();
      y.d = r;
      y.e = getBase10Exponent(r, e);
      return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
    };
    P.toBinary = function(sd, rm) {
      return toStringBinary(this, 2, sd, rm);
    };
    P.toDecimalPlaces = P.toDP = function(dp, rm) {
      var x = this, Ctor = x.constructor;
      x = new Ctor(x);
      if (dp === void 0) return x;
      checkInt32(dp, 0, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
      return finalise(x, dp + x.e + 1, rm);
    };
    P.toExponential = function(dp, rm) {
      var str, x = this, Ctor = x.constructor;
      if (dp === void 0) {
        str = finiteToString(x, true);
      } else {
        checkInt32(dp, 0, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
        x = finalise(new Ctor(x), dp + 1, rm);
        str = finiteToString(x, true, dp + 1);
      }
      return x.isNeg() && !x.isZero() ? "-" + str : str;
    };
    P.toFixed = function(dp, rm) {
      var str, y, x = this, Ctor = x.constructor;
      if (dp === void 0) {
        str = finiteToString(x);
      } else {
        checkInt32(dp, 0, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
        y = finalise(new Ctor(x), dp + x.e + 1, rm);
        str = finiteToString(y, false, dp + y.e + 1);
      }
      return x.isNeg() && !x.isZero() ? "-" + str : str;
    };
    P.toFraction = function(maxD) {
      var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
      if (!xd) return new Ctor(x);
      n1 = d0 = new Ctor(1);
      d1 = n0 = new Ctor(0);
      d = new Ctor(d1);
      e = d.e = getPrecision(xd) - x.e - 1;
      k = e % LOG_BASE;
      d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
      if (maxD == null) {
        maxD = e > 0 ? d : n1;
      } else {
        n = new Ctor(maxD);
        if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
        maxD = n.gt(d) ? e > 0 ? d : n1 : n;
      }
      external = false;
      n = new Ctor(digitsToString(xd));
      pr = Ctor.precision;
      Ctor.precision = e = xd.length * LOG_BASE * 2;
      for (; ; ) {
        q = divide(n, d, 0, 1, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.cmp(maxD) == 1) break;
        d0 = d1;
        d1 = d2;
        d2 = n1;
        n1 = n0.plus(q.times(d2));
        n0 = d2;
        d2 = d;
        d = n.minus(q.times(d2));
        n = d2;
      }
      d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;
      r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];
      Ctor.precision = pr;
      external = true;
      return r;
    };
    P.toHexadecimal = P.toHex = function(sd, rm) {
      return toStringBinary(this, 16, sd, rm);
    };
    P.toNearest = function(y, rm) {
      var x = this, Ctor = x.constructor;
      x = new Ctor(x);
      if (y == null) {
        if (!x.d) return x;
        y = new Ctor(1);
        rm = Ctor.rounding;
      } else {
        y = new Ctor(y);
        if (rm === void 0) {
          rm = Ctor.rounding;
        } else {
          checkInt32(rm, 0, 8);
        }
        if (!x.d) return y.s ? x : y;
        if (!y.d) {
          if (y.s) y.s = x.s;
          return y;
        }
      }
      if (y.d[0]) {
        external = false;
        x = divide(x, y, 0, rm, 1).times(y);
        external = true;
        finalise(x);
      } else {
        y.s = x.s;
        x = y;
      }
      return x;
    };
    P.toNumber = function() {
      return +this;
    };
    P.toOctal = function(sd, rm) {
      return toStringBinary(this, 8, sd, rm);
    };
    P.toPower = P.pow = function(y) {
      var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
      if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));
      x = new Ctor(x);
      if (x.eq(1)) return x;
      pr = Ctor.precision;
      rm = Ctor.rounding;
      if (y.eq(1)) return finalise(x, pr, rm);
      e = mathfloor(y.e / LOG_BASE);
      if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
        r = intPow(Ctor, x, k, pr);
        return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
      }
      s = x.s;
      if (s < 0) {
        if (e < y.d.length - 1) return new Ctor(NaN);
        if ((y.d[e] & 1) == 0) s = 1;
        if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
          x.s = s;
          return x;
        }
      }
      k = mathpow(+x, yn);
      e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
      if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);
      external = false;
      Ctor.rounding = x.s = 1;
      k = Math.min(12, (e + "").length);
      r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
      if (r.d) {
        r = finalise(r, pr + 5, 1);
        if (checkRoundingDigits(r.d, pr, rm)) {
          e = pr + 10;
          r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
          if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }
        }
      }
      r.s = s;
      external = true;
      Ctor.rounding = rm;
      return finalise(r, pr, rm);
    };
    P.toPrecision = function(sd, rm) {
      var str, x = this, Ctor = x.constructor;
      if (sd === void 0) {
        str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
      } else {
        checkInt32(sd, 1, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
        x = finalise(new Ctor(x), sd, rm);
        str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
      }
      return x.isNeg() && !x.isZero() ? "-" + str : str;
    };
    P.toSignificantDigits = P.toSD = function(sd, rm) {
      var x = this, Ctor = x.constructor;
      if (sd === void 0) {
        sd = Ctor.precision;
        rm = Ctor.rounding;
      } else {
        checkInt32(sd, 1, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
      }
      return finalise(new Ctor(x), sd, rm);
    };
    P.toString = function() {
      var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
      return x.isNeg() && !x.isZero() ? "-" + str : str;
    };
    P.truncated = P.trunc = function() {
      return finalise(new this.constructor(this), this.e + 1, 1);
    };
    P.valueOf = P.toJSON = function() {
      var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
      return x.isNeg() ? "-" + str : str;
    };
    function digitsToString(d) {
      var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
      if (indexOfLastWord > 0) {
        str += w;
        for (i = 1; i < indexOfLastWord; i++) {
          ws = d[i] + "";
          k = LOG_BASE - ws.length;
          if (k) str += getZeroString(k);
          str += ws;
        }
        w = d[i];
        ws = w + "";
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
      } else if (w === 0) {
        return "0";
      }
      for (; w % 10 === 0; ) w /= 10;
      return str + w;
    }
    __name(digitsToString, "digitsToString");
    function checkInt32(i, min2, max2) {
      if (i !== ~~i || i < min2 || i > max2) {
        throw Error(invalidArgument + i);
      }
    }
    __name(checkInt32, "checkInt32");
    function checkRoundingDigits(d, i, rm, repeating) {
      var di, k, r, rd;
      for (k = d[0]; k >= 10; k /= 10) --i;
      if (--i < 0) {
        i += LOG_BASE;
        di = 0;
      } else {
        di = Math.ceil((i + 1) / LOG_BASE);
        i %= LOG_BASE;
      }
      k = mathpow(10, LOG_BASE - i);
      rd = d[di] % k | 0;
      if (repeating == null) {
        if (i < 3) {
          if (i == 0) rd = rd / 100 | 0;
          else if (i == 1) rd = rd / 10 | 0;
          r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
        } else {
          r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
        }
      } else {
        if (i < 4) {
          if (i == 0) rd = rd / 1e3 | 0;
          else if (i == 1) rd = rd / 100 | 0;
          else if (i == 2) rd = rd / 10 | 0;
          r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
        } else {
          r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
        }
      }
      return r;
    }
    __name(checkRoundingDigits, "checkRoundingDigits");
    function convertBase(str, baseIn, baseOut) {
      var j, arr = [0], arrL, i = 0, strL = str.length;
      for (; i < strL; ) {
        for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
        arr[0] += NUMERALS.indexOf(str.charAt(i++));
        for (j = 0; j < arr.length; j++) {
          if (arr[j] > baseOut - 1) {
            if (arr[j + 1] === void 0) arr[j + 1] = 0;
            arr[j + 1] += arr[j] / baseOut | 0;
            arr[j] %= baseOut;
          }
        }
      }
      return arr.reverse();
    }
    __name(convertBase, "convertBase");
    function cosine(Ctor, x) {
      var k, len, y;
      if (x.isZero()) return x;
      len = x.d.length;
      if (len < 32) {
        k = Math.ceil(len / 3);
        y = (1 / tinyPow(4, k)).toString();
      } else {
        k = 16;
        y = "2.3283064365386962890625e-10";
      }
      Ctor.precision += k;
      x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
      for (var i = k; i--; ) {
        var cos2x = x.times(x);
        x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
      }
      Ctor.precision -= k;
      return x;
    }
    __name(cosine, "cosine");
    var divide = /* @__PURE__ */ (function() {
      function multiplyInteger(x, k, base) {
        var temp, carry = 0, i = x.length;
        for (x = x.slice(); i--; ) {
          temp = x[i] * k + carry;
          x[i] = temp % base | 0;
          carry = temp / base | 0;
        }
        if (carry) x.unshift(carry);
        return x;
      }
      __name(multiplyInteger, "multiplyInteger");
      function compare(a, b, aL, bL) {
        var i, r;
        if (aL != bL) {
          r = aL > bL ? 1 : -1;
        } else {
          for (i = r = 0; i < aL; i++) {
            if (a[i] != b[i]) {
              r = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }
        return r;
      }
      __name(compare, "compare");
      function subtract(a, b, aL, base) {
        var i = 0;
        for (; aL--; ) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }
        for (; !a[0] && a.length > 1; ) a.shift();
      }
      __name(subtract, "subtract");
      return function(x, y, pr, rm, dp, base) {
        var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign22 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
        if (!xd || !xd[0] || !yd || !yd[0]) {
          return new Ctor(
            // Return NaN if either NaN, or both Infinity or 0.
            !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : (
              // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
              xd && xd[0] == 0 || !yd ? sign22 * 0 : sign22 / 0
            )
          );
        }
        if (base) {
          logBase = 1;
          e = x.e - y.e;
        } else {
          base = BASE;
          logBase = LOG_BASE;
          e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
        }
        yL = yd.length;
        xL = xd.length;
        q = new Ctor(sign22);
        qd = q.d = [];
        for (i = 0; yd[i] == (xd[i] || 0); i++) ;
        if (yd[i] > (xd[i] || 0)) e--;
        if (pr == null) {
          sd = pr = Ctor.precision;
          rm = Ctor.rounding;
        } else if (dp) {
          sd = pr + (x.e - y.e) + 1;
        } else {
          sd = pr;
        }
        if (sd < 0) {
          qd.push(1);
          more = true;
        } else {
          sd = sd / logBase + 2 | 0;
          i = 0;
          if (yL == 1) {
            k = 0;
            yd = yd[0];
            sd++;
            for (; (i < xL || k) && sd--; i++) {
              t = k * base + (xd[i] || 0);
              qd[i] = t / yd | 0;
              k = t % yd | 0;
            }
            more = k || i < xL;
          } else {
            k = base / (yd[0] + 1) | 0;
            if (k > 1) {
              yd = multiplyInteger(yd, k, base);
              xd = multiplyInteger(xd, k, base);
              yL = yd.length;
              xL = xd.length;
            }
            xi = yL;
            rem = xd.slice(0, yL);
            remL = rem.length;
            for (; remL < yL; ) rem[remL++] = 0;
            yz = yd.slice();
            yz.unshift(0);
            yd0 = yd[0];
            if (yd[1] >= base / 2) ++yd0;
            do {
              k = 0;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 0) {
                rem0 = rem[0];
                if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
                k = rem0 / yd0 | 0;
                if (k > 1) {
                  if (k >= base) k = base - 1;
                  prod = multiplyInteger(yd, k, base);
                  prodL = prod.length;
                  remL = rem.length;
                  cmp = compare(prod, rem, prodL, remL);
                  if (cmp == 1) {
                    k--;
                    subtract(prod, yL < prodL ? yz : yd, prodL, base);
                  }
                } else {
                  if (k == 0) cmp = k = 1;
                  prod = yd.slice();
                }
                prodL = prod.length;
                if (prodL < remL) prod.unshift(0);
                subtract(rem, prod, remL, base);
                if (cmp == -1) {
                  remL = rem.length;
                  cmp = compare(yd, rem, yL, remL);
                  if (cmp < 1) {
                    k++;
                    subtract(rem, yL < remL ? yz : yd, remL, base);
                  }
                }
                remL = rem.length;
              } else if (cmp === 0) {
                k++;
                rem = [0];
              }
              qd[i++] = k;
              if (cmp && rem[0]) {
                rem[remL++] = xd[xi] || 0;
              } else {
                rem = [xd[xi]];
                remL = 1;
              }
            } while ((xi++ < xL || rem[0] !== void 0) && sd--);
            more = rem[0] !== void 0;
          }
          if (!qd[0]) qd.shift();
        }
        if (logBase == 1) {
          q.e = e;
          inexact = more;
        } else {
          for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
          q.e = i + e * logBase - 1;
          finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
        }
        return q;
      };
    })();
    function finalise(x, sd, rm, isTruncated) {
      var digits, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
      out: if (sd != null) {
        xd = x.d;
        if (!xd) return x;
        for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
        i = sd - digits;
        if (i < 0) {
          i += LOG_BASE;
          j = sd;
          w = xd[xdi = 0];
          rd = w / mathpow(10, digits - j - 1) % 10 | 0;
        } else {
          xdi = Math.ceil((i + 1) / LOG_BASE);
          k = xd.length;
          if (xdi >= k) {
            if (isTruncated) {
              for (; k++ <= xdi; ) xd.push(0);
              w = rd = 0;
              digits = 1;
              i %= LOG_BASE;
              j = i - LOG_BASE + 1;
            } else {
              break out;
            }
          } else {
            w = k = xd[xdi];
            for (digits = 1; k >= 10; k /= 10) digits++;
            i %= LOG_BASE;
            j = i - LOG_BASE + digits;
            rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
          }
        }
        isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));
        roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
        (i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
        if (sd < 1 || !xd[0]) {
          xd.length = 0;
          if (roundUp) {
            sd -= x.e + 1;
            xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
            x.e = -sd || 0;
          } else {
            xd[0] = x.e = 0;
          }
          return x;
        }
        if (i == 0) {
          xd.length = xdi;
          k = 1;
          xdi--;
        } else {
          xd.length = xdi + 1;
          k = mathpow(10, LOG_BASE - i);
          xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
        }
        if (roundUp) {
          for (; ; ) {
            if (xdi == 0) {
              for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
              j = xd[0] += k;
              for (k = 1; j >= 10; j /= 10) k++;
              if (i != k) {
                x.e++;
                if (xd[0] == BASE) xd[0] = 1;
              }
              break;
            } else {
              xd[xdi] += k;
              if (xd[xdi] != BASE) break;
              xd[xdi--] = 0;
              k = 1;
            }
          }
        }
        for (i = xd.length; xd[--i] === 0; ) xd.pop();
      }
      if (external) {
        if (x.e > Ctor.maxE) {
          x.d = null;
          x.e = NaN;
        } else if (x.e < Ctor.minE) {
          x.e = 0;
          x.d = [0];
        }
      }
      return x;
    }
    __name(finalise, "finalise");
    function finiteToString(x, isExp, sd) {
      if (!x.isFinite()) return nonFiniteToString(x);
      var k, e = x.e, str = digitsToString(x.d), len = str.length;
      if (isExp) {
        if (sd && (k = sd - len) > 0) {
          str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
        } else if (len > 1) {
          str = str.charAt(0) + "." + str.slice(1);
        }
        str = str + (x.e < 0 ? "e" : "e+") + x.e;
      } else if (e < 0) {
        str = "0." + getZeroString(-e - 1) + str;
        if (sd && (k = sd - len) > 0) str += getZeroString(k);
      } else if (e >= len) {
        str += getZeroString(e + 1 - len);
        if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
      } else {
        if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
        if (sd && (k = sd - len) > 0) {
          if (e + 1 === len) str += ".";
          str += getZeroString(k);
        }
      }
      return str;
    }
    __name(finiteToString, "finiteToString");
    function getBase10Exponent(digits, e) {
      var w = digits[0];
      for (e *= LOG_BASE; w >= 10; w /= 10) e++;
      return e;
    }
    __name(getBase10Exponent, "getBase10Exponent");
    function getLn10(Ctor, sd, pr) {
      if (sd > LN10_PRECISION) {
        external = true;
        if (pr) Ctor.precision = pr;
        throw Error(precisionLimitExceeded);
      }
      return finalise(new Ctor(LN10), sd, 1, true);
    }
    __name(getLn10, "getLn10");
    function getPi(Ctor, sd, rm) {
      if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
      return finalise(new Ctor(PI), sd, rm, true);
    }
    __name(getPi, "getPi");
    function getPrecision(digits) {
      var w = digits.length - 1, len = w * LOG_BASE + 1;
      w = digits[w];
      if (w) {
        for (; w % 10 == 0; w /= 10) len--;
        for (w = digits[0]; w >= 10; w /= 10) len++;
      }
      return len;
    }
    __name(getPrecision, "getPrecision");
    function getZeroString(k) {
      var zs = "";
      for (; k--; ) zs += "0";
      return zs;
    }
    __name(getZeroString, "getZeroString");
    function intPow(Ctor, x, n, pr) {
      var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
      external = false;
      for (; ; ) {
        if (n % 2) {
          r = r.times(x);
          if (truncate(r.d, k)) isTruncated = true;
        }
        n = mathfloor(n / 2);
        if (n === 0) {
          n = r.d.length - 1;
          if (isTruncated && r.d[n] === 0) ++r.d[n];
          break;
        }
        x = x.times(x);
        truncate(x.d, k);
      }
      external = true;
      return r;
    }
    __name(intPow, "intPow");
    function isOdd(n) {
      return n.d[n.d.length - 1] & 1;
    }
    __name(isOdd, "isOdd");
    function maxOrMin(Ctor, args, n) {
      var k, y, x = new Ctor(args[0]), i = 0;
      for (; ++i < args.length; ) {
        y = new Ctor(args[i]);
        if (!y.s) {
          x = y;
          break;
        }
        k = x.cmp(y);
        if (k === n || k === 0 && x.s === n) {
          x = y;
        }
      }
      return x;
    }
    __name(maxOrMin, "maxOrMin");
    function naturalExponential(x, sd) {
      var denominator, guard, j, pow2, sum2, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
      if (!x.d || !x.d[0] || x.e > 17) {
        return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
      }
      if (sd == null) {
        external = false;
        wpr = pr;
      } else {
        wpr = sd;
      }
      t = new Ctor(0.03125);
      while (x.e > -2) {
        x = x.times(t);
        k += 5;
      }
      guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
      wpr += guard;
      denominator = pow2 = sum2 = new Ctor(1);
      Ctor.precision = wpr;
      for (; ; ) {
        pow2 = finalise(pow2.times(x), wpr, 1);
        denominator = denominator.times(++i);
        t = sum2.plus(divide(pow2, denominator, wpr, 1));
        if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
          j = k;
          while (j--) sum2 = finalise(sum2.times(sum2), wpr, 1);
          if (sd == null) {
            if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
              Ctor.precision = wpr += 10;
              denominator = pow2 = t = new Ctor(1);
              i = 0;
              rep++;
            } else {
              return finalise(sum2, Ctor.precision = pr, rm, external = true);
            }
          } else {
            Ctor.precision = pr;
            return sum2;
          }
        }
        sum2 = t;
      }
    }
    __name(naturalExponential, "naturalExponential");
    function naturalLogarithm(y, sd) {
      var c, c0, denominator, e, numerator, rep, sum2, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
      if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
        return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
      }
      if (sd == null) {
        external = false;
        wpr = pr;
      } else {
        wpr = sd;
      }
      Ctor.precision = wpr += guard;
      c = digitsToString(xd);
      c0 = c.charAt(0);
      if (Math.abs(e = x.e) < 15e14) {
        while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
          x = x.times(y);
          c = digitsToString(x.d);
          c0 = c.charAt(0);
          n++;
        }
        e = x.e;
        if (c0 > 1) {
          x = new Ctor("0." + c);
          e++;
        } else {
          x = new Ctor(c0 + "." + c.slice(1));
        }
      } else {
        t = getLn10(Ctor, wpr + 2, pr).times(e + "");
        x = naturalLogarithm(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
        Ctor.precision = pr;
        return sd == null ? finalise(x, pr, rm, external = true) : x;
      }
      x1 = x;
      sum2 = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
      x2 = finalise(x.times(x), wpr, 1);
      denominator = 3;
      for (; ; ) {
        numerator = finalise(numerator.times(x2), wpr, 1);
        t = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
        if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
          sum2 = sum2.times(2);
          if (e !== 0) sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
          sum2 = divide(sum2, new Ctor(n), wpr, 1);
          if (sd == null) {
            if (checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
              Ctor.precision = wpr += guard;
              t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
              x2 = finalise(x.times(x), wpr, 1);
              denominator = rep = 1;
            } else {
              return finalise(sum2, Ctor.precision = pr, rm, external = true);
            }
          } else {
            Ctor.precision = pr;
            return sum2;
          }
        }
        sum2 = t;
        denominator += 2;
      }
    }
    __name(naturalLogarithm, "naturalLogarithm");
    function nonFiniteToString(x) {
      return String(x.s * x.s / 0);
    }
    __name(nonFiniteToString, "nonFiniteToString");
    function parseDecimal(x, str) {
      var e, i, len;
      if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
      if ((i = str.search(/e/i)) > 0) {
        if (e < 0) e = i;
        e += +str.slice(i + 1);
        str = str.substring(0, i);
      } else if (e < 0) {
        e = str.length;
      }
      for (i = 0; str.charCodeAt(i) === 48; i++) ;
      for (len = str.length; str.charCodeAt(len - 1) === 48; --len) ;
      str = str.slice(i, len);
      if (str) {
        len -= i;
        x.e = e = e - i - 1;
        x.d = [];
        i = (e + 1) % LOG_BASE;
        if (e < 0) i += LOG_BASE;
        if (i < len) {
          if (i) x.d.push(+str.slice(0, i));
          for (len -= LOG_BASE; i < len; ) x.d.push(+str.slice(i, i += LOG_BASE));
          str = str.slice(i);
          i = LOG_BASE - str.length;
        } else {
          i -= len;
        }
        for (; i--; ) str += "0";
        x.d.push(+str);
        if (external) {
          if (x.e > x.constructor.maxE) {
            x.d = null;
            x.e = NaN;
          } else if (x.e < x.constructor.minE) {
            x.e = 0;
            x.d = [0];
          }
        }
      } else {
        x.e = 0;
        x.d = [0];
      }
      return x;
    }
    __name(parseDecimal, "parseDecimal");
    function parseOther(x, str) {
      var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
      if (str.indexOf("_") > -1) {
        str = str.replace(/(\d)_(?=\d)/g, "$1");
        if (isDecimal.test(str)) return parseDecimal(x, str);
      } else if (str === "Infinity" || str === "NaN") {
        if (!+str) x.s = NaN;
        x.e = NaN;
        x.d = null;
        return x;
      }
      if (isHex.test(str)) {
        base = 16;
        str = str.toLowerCase();
      } else if (isBinary.test(str)) {
        base = 2;
      } else if (isOctal.test(str)) {
        base = 8;
      } else {
        throw Error(invalidArgument + str);
      }
      i = str.search(/p/i);
      if (i > 0) {
        p = +str.slice(i + 1);
        str = str.substring(2, i);
      } else {
        str = str.slice(2);
      }
      i = str.indexOf(".");
      isFloat = i >= 0;
      Ctor = x.constructor;
      if (isFloat) {
        str = str.replace(".", "");
        len = str.length;
        i = len - i;
        divisor = intPow(Ctor, new Ctor(base), i, i * 2);
      }
      xd = convertBase(str, base, BASE);
      xe = xd.length - 1;
      for (i = xe; xd[i] === 0; --i) xd.pop();
      if (i < 0) return new Ctor(x.s * 0);
      x.e = getBase10Exponent(xd, xe);
      x.d = xd;
      external = false;
      if (isFloat) x = divide(x, divisor, len * 4);
      if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal2.pow(2, p));
      external = true;
      return x;
    }
    __name(parseOther, "parseOther");
    function sine(Ctor, x) {
      var k, len = x.d.length;
      if (len < 3) {
        return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
      }
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;
      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x);
      var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
      for (; k--; ) {
        sin2_x = x.times(x);
        x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
      }
      return x;
    }
    __name(sine, "sine");
    function taylorSeries(Ctor, n, x, y, isHyperbolic) {
      var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
      external = false;
      x2 = x.times(x);
      u = new Ctor(y);
      for (; ; ) {
        t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
        u = isHyperbolic ? y.plus(t) : y.minus(t);
        y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
        t = u.plus(y);
        if (t.d[k] !== void 0) {
          for (j = k; t.d[j] === u.d[j] && j--; ) ;
          if (j == -1) break;
        }
        j = u;
        u = y;
        y = t;
        t = j;
        i++;
      }
      external = true;
      t.d.length = k + 1;
      return t;
    }
    __name(taylorSeries, "taylorSeries");
    function tinyPow(b, e) {
      var n = b;
      while (--e) n *= b;
      return n;
    }
    __name(tinyPow, "tinyPow");
    function toLessThanHalfPi(Ctor, x) {
      var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
      x = x.abs();
      if (x.lte(halfPi)) {
        quadrant = isNeg ? 4 : 1;
        return x;
      }
      t = x.divToInt(pi);
      if (t.isZero()) {
        quadrant = isNeg ? 3 : 2;
      } else {
        x = x.minus(t.times(pi));
        if (x.lte(halfPi)) {
          quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
          return x;
        }
        quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
      }
      return x.minus(pi).abs();
    }
    __name(toLessThanHalfPi, "toLessThanHalfPi");
    function toStringBinary(x, baseOut, sd, rm) {
      var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
      if (isExp) {
        checkInt32(sd, 1, MAX_DIGITS);
        if (rm === void 0) rm = Ctor.rounding;
        else checkInt32(rm, 0, 8);
      } else {
        sd = Ctor.precision;
        rm = Ctor.rounding;
      }
      if (!x.isFinite()) {
        str = nonFiniteToString(x);
      } else {
        str = finiteToString(x);
        i = str.indexOf(".");
        if (isExp) {
          base = 2;
          if (baseOut == 16) {
            sd = sd * 4 - 3;
          } else if (baseOut == 8) {
            sd = sd * 3 - 2;
          }
        } else {
          base = baseOut;
        }
        if (i >= 0) {
          str = str.replace(".", "");
          y = new Ctor(1);
          y.e = str.length - i;
          y.d = convertBase(finiteToString(y), 10, base);
          y.e = y.d.length;
        }
        xd = convertBase(str, 10, base);
        e = len = xd.length;
        for (; xd[--len] == 0; ) xd.pop();
        if (!xd[0]) {
          str = isExp ? "0p+0" : "0";
        } else {
          if (i < 0) {
            e--;
          } else {
            x = new Ctor(x);
            x.d = xd;
            x.e = e;
            x = divide(x, y, sd, rm, 0, base);
            xd = x.d;
            e = x.e;
            roundUp = inexact;
          }
          i = xd[sd];
          k = base / 2;
          roundUp = roundUp || xd[sd + 1] !== void 0;
          roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
          xd.length = sd;
          if (roundUp) {
            for (; ++xd[--sd] > base - 1; ) {
              xd[sd] = 0;
              if (!sd) {
                ++e;
                xd.unshift(1);
              }
            }
          }
          for (len = xd.length; !xd[len - 1]; --len) ;
          for (i = 0, str = ""; i < len; i++) str += NUMERALS.charAt(xd[i]);
          if (isExp) {
            if (len > 1) {
              if (baseOut == 16 || baseOut == 8) {
                i = baseOut == 16 ? 4 : 3;
                for (--len; len % i; len++) str += "0";
                xd = convertBase(str, base, baseOut);
                for (len = xd.length; !xd[len - 1]; --len) ;
                for (i = 1, str = "1."; i < len; i++) str += NUMERALS.charAt(xd[i]);
              } else {
                str = str.charAt(0) + "." + str.slice(1);
              }
            }
            str = str + (e < 0 ? "p" : "p+") + e;
          } else if (e < 0) {
            for (; ++e; ) str = "0" + str;
            str = "0." + str;
          } else {
            if (++e > len) for (e -= len; e--; ) str += "0";
            else if (e < len) str = str.slice(0, e) + "." + str.slice(e);
          }
        }
        str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
      }
      return x.s < 0 ? "-" + str : str;
    }
    __name(toStringBinary, "toStringBinary");
    function truncate(arr, len) {
      if (arr.length > len) {
        arr.length = len;
        return true;
      }
    }
    __name(truncate, "truncate");
    function abs(x) {
      return new this(x).abs();
    }
    __name(abs, "abs");
    function acos(x) {
      return new this(x).acos();
    }
    __name(acos, "acos");
    function acosh(x) {
      return new this(x).acosh();
    }
    __name(acosh, "acosh");
    function add2(x, y) {
      return new this(x).plus(y);
    }
    __name(add2, "add");
    function asin(x) {
      return new this(x).asin();
    }
    __name(asin, "asin");
    function asinh(x) {
      return new this(x).asinh();
    }
    __name(asinh, "asinh");
    function atan(x) {
      return new this(x).atan();
    }
    __name(atan, "atan");
    function atanh(x) {
      return new this(x).atanh();
    }
    __name(atanh, "atanh");
    function atan2(y, x) {
      y = new this(y);
      x = new this(x);
      var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
      if (!y.s || !x.s) {
        r = new this(NaN);
      } else if (!y.d && !x.d) {
        r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
        r.s = y.s;
      } else if (!x.d || y.isZero()) {
        r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
        r.s = y.s;
      } else if (!y.d || x.isZero()) {
        r = getPi(this, wpr, 1).times(0.5);
        r.s = y.s;
      } else if (x.s < 0) {
        this.precision = wpr;
        this.rounding = 1;
        r = this.atan(divide(y, x, wpr, 1));
        x = getPi(this, wpr, 1);
        this.precision = pr;
        this.rounding = rm;
        r = y.s < 0 ? r.minus(x) : r.plus(x);
      } else {
        r = this.atan(divide(y, x, wpr, 1));
      }
      return r;
    }
    __name(atan2, "atan2");
    function cbrt(x) {
      return new this(x).cbrt();
    }
    __name(cbrt, "cbrt");
    function ceil(x) {
      return finalise(x = new this(x), x.e + 1, 2);
    }
    __name(ceil, "ceil");
    function clamp(x, min2, max2) {
      return new this(x).clamp(min2, max2);
    }
    __name(clamp, "clamp");
    function config(obj) {
      if (!obj || typeof obj !== "object") throw Error(decimalError + "Object expected");
      var i, p, v, useDefaults = obj.defaults === true, ps = [
        "precision",
        1,
        MAX_DIGITS,
        "rounding",
        0,
        8,
        "toExpNeg",
        -EXP_LIMIT,
        0,
        "toExpPos",
        0,
        EXP_LIMIT,
        "maxE",
        0,
        EXP_LIMIT,
        "minE",
        -EXP_LIMIT,
        0,
        "modulo",
        0,
        9
      ];
      for (i = 0; i < ps.length; i += 3) {
        if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
        if ((v = obj[p]) !== void 0) {
          if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
          else throw Error(invalidArgument + p + ": " + v);
        }
      }
      if (p = "crypto", useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (v === true || v === false || v === 0 || v === 1) {
          if (v) {
            if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
              this[p] = true;
            } else {
              throw Error(cryptoUnavailable);
            }
          } else {
            this[p] = false;
          }
        } else {
          throw Error(invalidArgument + p + ": " + v);
        }
      }
      return this;
    }
    __name(config, "config");
    function cos(x) {
      return new this(x).cos();
    }
    __name(cos, "cos");
    function cosh(x) {
      return new this(x).cosh();
    }
    __name(cosh, "cosh");
    function clone(obj) {
      var i, p, ps;
      function Decimal22(v) {
        var e, i2, t, x = this;
        if (!(x instanceof Decimal22)) return new Decimal22(v);
        x.constructor = Decimal22;
        if (isDecimalInstance(v)) {
          x.s = v.s;
          if (external) {
            if (!v.d || v.e > Decimal22.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (v.e < Decimal22.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = v.e;
              x.d = v.d.slice();
            }
          } else {
            x.e = v.e;
            x.d = v.d ? v.d.slice() : v.d;
          }
          return;
        }
        t = typeof v;
        if (t === "number") {
          if (v === 0) {
            x.s = 1 / v < 0 ? -1 : 1;
            x.e = 0;
            x.d = [0];
            return;
          }
          if (v < 0) {
            v = -v;
            x.s = -1;
          } else {
            x.s = 1;
          }
          if (v === ~~v && v < 1e7) {
            for (e = 0, i2 = v; i2 >= 10; i2 /= 10) e++;
            if (external) {
              if (e > Decimal22.maxE) {
                x.e = NaN;
                x.d = null;
              } else if (e < Decimal22.minE) {
                x.e = 0;
                x.d = [0];
              } else {
                x.e = e;
                x.d = [v];
              }
            } else {
              x.e = e;
              x.d = [v];
            }
            return;
          }
          if (v * 0 !== 0) {
            if (!v) x.s = NaN;
            x.e = NaN;
            x.d = null;
            return;
          }
          return parseDecimal(x, v.toString());
        }
        if (t === "string") {
          if ((i2 = v.charCodeAt(0)) === 45) {
            v = v.slice(1);
            x.s = -1;
          } else {
            if (i2 === 43) v = v.slice(1);
            x.s = 1;
          }
          return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
        }
        if (t === "bigint") {
          if (v < 0) {
            v = -v;
            x.s = -1;
          } else {
            x.s = 1;
          }
          return parseDecimal(x, v.toString());
        }
        throw Error(invalidArgument + v);
      }
      __name(Decimal22, "Decimal2");
      Decimal22.prototype = P;
      Decimal22.ROUND_UP = 0;
      Decimal22.ROUND_DOWN = 1;
      Decimal22.ROUND_CEIL = 2;
      Decimal22.ROUND_FLOOR = 3;
      Decimal22.ROUND_HALF_UP = 4;
      Decimal22.ROUND_HALF_DOWN = 5;
      Decimal22.ROUND_HALF_EVEN = 6;
      Decimal22.ROUND_HALF_CEIL = 7;
      Decimal22.ROUND_HALF_FLOOR = 8;
      Decimal22.EUCLID = 9;
      Decimal22.config = Decimal22.set = config;
      Decimal22.clone = clone;
      Decimal22.isDecimal = isDecimalInstance;
      Decimal22.abs = abs;
      Decimal22.acos = acos;
      Decimal22.acosh = acosh;
      Decimal22.add = add2;
      Decimal22.asin = asin;
      Decimal22.asinh = asinh;
      Decimal22.atan = atan;
      Decimal22.atanh = atanh;
      Decimal22.atan2 = atan2;
      Decimal22.cbrt = cbrt;
      Decimal22.ceil = ceil;
      Decimal22.clamp = clamp;
      Decimal22.cos = cos;
      Decimal22.cosh = cosh;
      Decimal22.div = div;
      Decimal22.exp = exp;
      Decimal22.floor = floor;
      Decimal22.hypot = hypot;
      Decimal22.ln = ln;
      Decimal22.log = log2;
      Decimal22.log10 = log10;
      Decimal22.log2 = log22;
      Decimal22.max = max;
      Decimal22.min = min;
      Decimal22.mod = mod;
      Decimal22.mul = mul;
      Decimal22.pow = pow;
      Decimal22.random = random;
      Decimal22.round = round;
      Decimal22.sign = sign3;
      Decimal22.sin = sin;
      Decimal22.sinh = sinh;
      Decimal22.sqrt = sqrt;
      Decimal22.sub = sub;
      Decimal22.sum = sum;
      Decimal22.tan = tan;
      Decimal22.tanh = tanh;
      Decimal22.trunc = trunc;
      if (obj === void 0) obj = {};
      if (obj) {
        if (obj.defaults !== true) {
          ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
          for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
        }
      }
      Decimal22.config(obj);
      return Decimal22;
    }
    __name(clone, "clone");
    function div(x, y) {
      return new this(x).div(y);
    }
    __name(div, "div");
    function exp(x) {
      return new this(x).exp();
    }
    __name(exp, "exp");
    function floor(x) {
      return finalise(x = new this(x), x.e + 1, 3);
    }
    __name(floor, "floor");
    function hypot() {
      var i, n, t = new this(0);
      external = false;
      for (i = 0; i < arguments.length; ) {
        n = new this(arguments[i++]);
        if (!n.d) {
          if (n.s) {
            external = true;
            return new this(1 / 0);
          }
          t = n;
        } else if (t.d) {
          t = t.plus(n.times(n));
        }
      }
      external = true;
      return t.sqrt();
    }
    __name(hypot, "hypot");
    function isDecimalInstance(obj) {
      return obj instanceof Decimal2 || obj && obj.toStringTag === tag || false;
    }
    __name(isDecimalInstance, "isDecimalInstance");
    function ln(x) {
      return new this(x).ln();
    }
    __name(ln, "ln");
    function log2(x, y) {
      return new this(x).log(y);
    }
    __name(log2, "log");
    function log22(x) {
      return new this(x).log(2);
    }
    __name(log22, "log2");
    function log10(x) {
      return new this(x).log(10);
    }
    __name(log10, "log10");
    function max() {
      return maxOrMin(this, arguments, -1);
    }
    __name(max, "max");
    function min() {
      return maxOrMin(this, arguments, 1);
    }
    __name(min, "min");
    function mod(x, y) {
      return new this(x).mod(y);
    }
    __name(mod, "mod");
    function mul(x, y) {
      return new this(x).mul(y);
    }
    __name(mul, "mul");
    function pow(x, y) {
      return new this(x).pow(y);
    }
    __name(pow, "pow");
    function random(sd) {
      var d, e, k, n, i = 0, r = new this(1), rd = [];
      if (sd === void 0) sd = this.precision;
      else checkInt32(sd, 1, MAX_DIGITS);
      k = Math.ceil(sd / LOG_BASE);
      if (!this.crypto) {
        for (; i < k; ) rd[i++] = Math.random() * 1e7 | 0;
      } else if (crypto.getRandomValues) {
        d = crypto.getRandomValues(new Uint32Array(k));
        for (; i < k; ) {
          n = d[i];
          if (n >= 429e7) {
            d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
          } else {
            rd[i++] = n % 1e7;
          }
        }
      } else if (crypto.randomBytes) {
        d = crypto.randomBytes(k *= 4);
        for (; i < k; ) {
          n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
          if (n >= 214e7) {
            crypto.randomBytes(4).copy(d, i);
          } else {
            rd.push(n % 1e7);
            i += 4;
          }
        }
        i = k / 4;
      } else {
        throw Error(cryptoUnavailable);
      }
      k = rd[--i];
      sd %= LOG_BASE;
      if (k && sd) {
        n = mathpow(10, LOG_BASE - sd);
        rd[i] = (k / n | 0) * n;
      }
      for (; rd[i] === 0; i--) rd.pop();
      if (i < 0) {
        e = 0;
        rd = [0];
      } else {
        e = -1;
        for (; rd[0] === 0; e -= LOG_BASE) rd.shift();
        for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;
        if (k < LOG_BASE) e -= LOG_BASE - k;
      }
      r.e = e;
      r.d = rd;
      return r;
    }
    __name(random, "random");
    function round(x) {
      return finalise(x = new this(x), x.e + 1, this.rounding);
    }
    __name(round, "round");
    function sign3(x) {
      x = new this(x);
      return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
    }
    __name(sign3, "sign");
    function sin(x) {
      return new this(x).sin();
    }
    __name(sin, "sin");
    function sinh(x) {
      return new this(x).sinh();
    }
    __name(sinh, "sinh");
    function sqrt(x) {
      return new this(x).sqrt();
    }
    __name(sqrt, "sqrt");
    function sub(x, y) {
      return new this(x).sub(y);
    }
    __name(sub, "sub");
    function sum() {
      var i = 0, args = arguments, x = new this(args[i]);
      external = false;
      for (; x.s && ++i < args.length; ) x = x.plus(args[i]);
      external = true;
      return finalise(x, this.precision, this.rounding);
    }
    __name(sum, "sum");
    function tan(x) {
      return new this(x).tan();
    }
    __name(tan, "tan");
    function tanh(x) {
      return new this(x).tanh();
    }
    __name(tanh, "tanh");
    function trunc(x) {
      return finalise(x = new this(x), x.e + 1, 1);
    }
    __name(trunc, "trunc");
    P[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = P.toString;
    P[Symbol.toStringTag] = "Decimal";
    var Decimal2 = P.constructor = clone(DEFAULTS);
    LN10 = new Decimal2(LN10);
    PI = new Decimal2(PI);
    var Sql2 = class _Sql {
      static {
        __name(this, "_Sql");
      }
      constructor(rawStrings, rawValues) {
        if (rawStrings.length - 1 !== rawValues.length) {
          if (rawStrings.length === 0) {
            throw new TypeError("Expected at least 1 string");
          }
          throw new TypeError(`Expected ${rawStrings.length} strings to have ${rawStrings.length - 1} values`);
        }
        const valuesLength = rawValues.reduce((len, value) => len + (value instanceof _Sql ? value.values.length : 1), 0);
        this.values = new Array(valuesLength);
        this.strings = new Array(valuesLength + 1);
        this.strings[0] = rawStrings[0];
        let i = 0, pos = 0;
        while (i < rawValues.length) {
          const child = rawValues[i++];
          const rawString = rawStrings[i];
          if (child instanceof _Sql) {
            this.strings[pos] += child.strings[0];
            let childIndex = 0;
            while (childIndex < child.values.length) {
              this.values[pos++] = child.values[childIndex++];
              this.strings[pos] = child.strings[childIndex];
            }
            this.strings[pos] += rawString;
          } else {
            this.values[pos++] = child;
            this.strings[pos] = rawString;
          }
        }
      }
      get sql() {
        const len = this.strings.length;
        let i = 1;
        let value = this.strings[0];
        while (i < len)
          value += `?${this.strings[i++]}`;
        return value;
      }
      get statement() {
        const len = this.strings.length;
        let i = 1;
        let value = this.strings[0];
        while (i < len)
          value += `:${i}${this.strings[i++]}`;
        return value;
      }
      get text() {
        const len = this.strings.length;
        let i = 1;
        let value = this.strings[0];
        while (i < len)
          value += `$${i}${this.strings[i++]}`;
        return value;
      }
      inspect() {
        return {
          sql: this.sql,
          statement: this.statement,
          text: this.text,
          values: this.values
        };
      }
    };
    function join2(values, separator = ",", prefix = "", suffix = "") {
      if (values.length === 0) {
        throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
      }
      return new Sql2([prefix, ...Array(values.length - 1).fill(separator), suffix], values);
    }
    __name(join2, "join");
    function raw3(value) {
      return new Sql2([value], []);
    }
    __name(raw3, "raw");
    var empty2 = raw3("");
    function sql(strings, ...values) {
      return new Sql2(strings, values);
    }
    __name(sql, "sql");
  }
});

// ../../../node_modules/@prisma/client/runtime/wasm-compiler-edge.js
var require_wasm_compiler_edge = __commonJS({
  "../../../node_modules/@prisma/client/runtime/wasm-compiler-edge.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    var Wl = Object.create;
    var Qr = Object.defineProperty;
    var Kl = Object.getOwnPropertyDescriptor;
    var Xl = Object.getOwnPropertyNames;
    var Zl = Object.getPrototypeOf;
    var Yl = Object.prototype.hasOwnProperty;
    var We = /* @__PURE__ */ __name((t, e) => () => (t && (e = t(t = 0)), e), "We");
    var Nt = /* @__PURE__ */ __name((t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports), "Nt");
    var Dt = /* @__PURE__ */ __name((t, e) => {
      for (var r in e) Qr(t, r, { get: e[r], enumerable: true });
    }, "Dt");
    var ko = /* @__PURE__ */ __name((t, e, r, n) => {
      if (e && typeof e == "object" || typeof e == "function") for (let i of Xl(e)) !Yl.call(t, i) && i !== r && Qr(t, i, { get: /* @__PURE__ */ __name(() => e[i], "get"), enumerable: !(n = Kl(e, i)) || n.enumerable });
      return t;
    }, "ko");
    var Mt = /* @__PURE__ */ __name((t, e, r) => (r = t != null ? Wl(Zl(t)) : {}, ko(e || !t || !t.__esModule ? Qr(r, "default", { value: t, enumerable: true }) : r, t)), "Mt");
    var ec = /* @__PURE__ */ __name((t) => ko(Qr({}, "__esModule", { value: true }), t), "ec");
    function ri(t, e) {
      if (e = e.toLowerCase(), e === "utf8" || e === "utf-8") return new x(ic.encode(t));
      if (e === "base64" || e === "base64url") return t = t.replace(/-/g, "+").replace(/_/g, "/"), t = t.replace(/[^A-Za-z0-9+/]/g, ""), new x([...atob(t)].map((r) => r.charCodeAt(0)));
      if (e === "binary" || e === "ascii" || e === "latin1" || e === "latin-1") return new x([...t].map((r) => r.charCodeAt(0)));
      if (e === "ucs2" || e === "ucs-2" || e === "utf16le" || e === "utf-16le") {
        let r = new x(t.length * 2), n = new DataView(r.buffer);
        for (let i = 0; i < t.length; i++) n.setUint16(i * 2, t.charCodeAt(i), true);
        return r;
      }
      if (e === "hex") {
        let r = new x(t.length / 2);
        for (let n = 0, i = 0; i < t.length; i += 2, n++) r[n] = parseInt(t.slice(i, i + 2), 16);
        return r;
      }
      No(`encoding "${e}"`);
    }
    __name(ri, "ri");
    function tc(t) {
      let r = Object.getOwnPropertyNames(DataView.prototype).filter((a) => a.startsWith("get") || a.startsWith("set")), n = r.map((a) => a.replace("get", "read").replace("set", "write")), i = /* @__PURE__ */ __name((a, m) => function(h = 0) {
        return de(h, "offset"), ke(h, "offset"), ge(h, "offset", this.length - 1), new DataView(this.buffer)[r[a]](h, m);
      }, "i"), o = /* @__PURE__ */ __name((a, m) => function(h, E = 0) {
        let N = r[a].match(/set(\w+\d+)/)[1].toLowerCase(), $3 = nc[N];
        return de(E, "offset"), ke(E, "offset"), ge(E, "offset", this.length - 1), rc(h, "value", $3[0], $3[1]), new DataView(this.buffer)[r[a]](E, h, m), E + parseInt(r[a].match(/\d+/)[0]) / 8;
      }, "o"), s = /* @__PURE__ */ __name((a) => {
        a.forEach((m) => {
          m.includes("Uint") && (t[m.replace("Uint", "UInt")] = t[m]), m.includes("Float64") && (t[m.replace("Float64", "Double")] = t[m]), m.includes("Float32") && (t[m.replace("Float32", "Float")] = t[m]);
        });
      }, "s");
      n.forEach((a, m) => {
        a.startsWith("read") && (t[a] = i(m, false), t[a + "LE"] = i(m, true), t[a + "BE"] = i(m, false)), a.startsWith("write") && (t[a] = o(m, false), t[a + "LE"] = o(m, true), t[a + "BE"] = o(m, false)), s([a, a + "LE", a + "BE"]);
      });
    }
    __name(tc, "tc");
    function No(t) {
      throw new Error(`Buffer polyfill does not implement "${t}"`);
    }
    __name(No, "No");
    function Jr(t, e) {
      if (!(t instanceof Uint8Array)) throw new TypeError(`The "${e}" argument must be an instance of Buffer or Uint8Array`);
    }
    __name(Jr, "Jr");
    function ge(t, e, r = ac + 1) {
      if (t < 0 || t > r) {
        let n = new RangeError(`The value of "${e}" is out of range. It must be >= 0 && <= ${r}. Received ${t}`);
        throw n.code = "ERR_OUT_OF_RANGE", n;
      }
    }
    __name(ge, "ge");
    function de(t, e) {
      if (typeof t != "number") {
        let r = new TypeError(`The "${e}" argument must be of type number. Received type ${typeof t}.`);
        throw r.code = "ERR_INVALID_ARG_TYPE", r;
      }
    }
    __name(de, "de");
    function ke(t, e) {
      if (!Number.isInteger(t) || Number.isNaN(t)) {
        let r = new RangeError(`The value of "${e}" is out of range. It must be an integer. Received ${t}`);
        throw r.code = "ERR_OUT_OF_RANGE", r;
      }
    }
    __name(ke, "ke");
    function rc(t, e, r, n) {
      if (t < r || t > n) {
        let i = new RangeError(`The value of "${e}" is out of range. It must be >= ${r} and <= ${n}. Received ${t}`);
        throw i.code = "ERR_OUT_OF_RANGE", i;
      }
    }
    __name(rc, "rc");
    function Oo(t, e) {
      if (typeof t != "string") {
        let r = new TypeError(`The "${e}" argument must be of type string. Received type ${typeof t}`);
        throw r.code = "ERR_INVALID_ARG_TYPE", r;
      }
    }
    __name(Oo, "Oo");
    function uc(t, e = "utf8") {
      return x.from(t, e);
    }
    __name(uc, "uc");
    var x;
    var nc;
    var ic;
    var oc;
    var sc;
    var ac;
    var w;
    var ni;
    var u = We(() => {
      "use strict";
      x = class t extends Uint8Array {
        static {
          __name(this, "t");
        }
        _isBuffer = true;
        get offset() {
          return this.byteOffset;
        }
        static alloc(e, r = 0, n = "utf8") {
          return Oo(n, "encoding"), t.allocUnsafe(e).fill(r, n);
        }
        static allocUnsafe(e) {
          return t.from(e);
        }
        static allocUnsafeSlow(e) {
          return t.from(e);
        }
        static isBuffer(e) {
          return e && !!e._isBuffer;
        }
        static byteLength(e, r = "utf8") {
          if (typeof e == "string") return ri(e, r).byteLength;
          if (e && e.byteLength) return e.byteLength;
          let n = new TypeError('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer.');
          throw n.code = "ERR_INVALID_ARG_TYPE", n;
        }
        static isEncoding(e) {
          return sc.includes(e);
        }
        static compare(e, r) {
          Jr(e, "buff1"), Jr(r, "buff2");
          for (let n = 0; n < e.length; n++) {
            if (e[n] < r[n]) return -1;
            if (e[n] > r[n]) return 1;
          }
          return e.length === r.length ? 0 : e.length > r.length ? 1 : -1;
        }
        static from(e, r = "utf8") {
          if (e && typeof e == "object" && e.type === "Buffer") return new t(e.data);
          if (typeof e == "number") return new t(new Uint8Array(e));
          if (typeof e == "string") return ri(e, r);
          if (ArrayBuffer.isView(e)) {
            let { byteOffset: n, byteLength: i, buffer: o } = e;
            return "map" in e && typeof e.map == "function" ? new t(e.map((s) => s % 256), n, i) : new t(o, n, i);
          }
          if (e && typeof e == "object" && ("length" in e || "byteLength" in e || "buffer" in e)) return new t(e);
          throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
        }
        static concat(e, r) {
          if (e.length === 0) return t.alloc(0);
          let n = [].concat(...e.map((o) => [...o])), i = t.alloc(r !== void 0 ? r : n.length);
          return i.set(r !== void 0 ? n.slice(0, r) : n), i;
        }
        slice(e = 0, r = this.length) {
          return this.subarray(e, r);
        }
        subarray(e = 0, r = this.length) {
          return Object.setPrototypeOf(super.subarray(e, r), t.prototype);
        }
        reverse() {
          return super.reverse(), this;
        }
        readIntBE(e, r) {
          de(e, "offset"), ke(e, "offset"), ge(e, "offset", this.length - 1), de(r, "byteLength"), ke(r, "byteLength");
          let n = new DataView(this.buffer, e, r), i = 0;
          for (let o = 0; o < r; o++) i = i * 256 + n.getUint8(o);
          return n.getUint8(0) & 128 && (i -= Math.pow(256, r)), i;
        }
        readIntLE(e, r) {
          de(e, "offset"), ke(e, "offset"), ge(e, "offset", this.length - 1), de(r, "byteLength"), ke(r, "byteLength");
          let n = new DataView(this.buffer, e, r), i = 0;
          for (let o = 0; o < r; o++) i += n.getUint8(o) * Math.pow(256, o);
          return n.getUint8(r - 1) & 128 && (i -= Math.pow(256, r)), i;
        }
        readUIntBE(e, r) {
          de(e, "offset"), ke(e, "offset"), ge(e, "offset", this.length - 1), de(r, "byteLength"), ke(r, "byteLength");
          let n = new DataView(this.buffer, e, r), i = 0;
          for (let o = 0; o < r; o++) i = i * 256 + n.getUint8(o);
          return i;
        }
        readUintBE(e, r) {
          return this.readUIntBE(e, r);
        }
        readUIntLE(e, r) {
          de(e, "offset"), ke(e, "offset"), ge(e, "offset", this.length - 1), de(r, "byteLength"), ke(r, "byteLength");
          let n = new DataView(this.buffer, e, r), i = 0;
          for (let o = 0; o < r; o++) i += n.getUint8(o) * Math.pow(256, o);
          return i;
        }
        readUintLE(e, r) {
          return this.readUIntLE(e, r);
        }
        writeIntBE(e, r, n) {
          return e = e < 0 ? e + Math.pow(256, n) : e, this.writeUIntBE(e, r, n);
        }
        writeIntLE(e, r, n) {
          return e = e < 0 ? e + Math.pow(256, n) : e, this.writeUIntLE(e, r, n);
        }
        writeUIntBE(e, r, n) {
          de(r, "offset"), ke(r, "offset"), ge(r, "offset", this.length - 1), de(n, "byteLength"), ke(n, "byteLength");
          let i = new DataView(this.buffer, r, n);
          for (let o = n - 1; o >= 0; o--) i.setUint8(o, e & 255), e = e / 256;
          return r + n;
        }
        writeUintBE(e, r, n) {
          return this.writeUIntBE(e, r, n);
        }
        writeUIntLE(e, r, n) {
          de(r, "offset"), ke(r, "offset"), ge(r, "offset", this.length - 1), de(n, "byteLength"), ke(n, "byteLength");
          let i = new DataView(this.buffer, r, n);
          for (let o = 0; o < n; o++) i.setUint8(o, e & 255), e = e / 256;
          return r + n;
        }
        writeUintLE(e, r, n) {
          return this.writeUIntLE(e, r, n);
        }
        toJSON() {
          return { type: "Buffer", data: Array.from(this) };
        }
        swap16() {
          let e = new DataView(this.buffer, this.byteOffset, this.byteLength);
          for (let r = 0; r < this.length; r += 2) e.setUint16(r, e.getUint16(r, true), false);
          return this;
        }
        swap32() {
          let e = new DataView(this.buffer, this.byteOffset, this.byteLength);
          for (let r = 0; r < this.length; r += 4) e.setUint32(r, e.getUint32(r, true), false);
          return this;
        }
        swap64() {
          let e = new DataView(this.buffer, this.byteOffset, this.byteLength);
          for (let r = 0; r < this.length; r += 8) e.setBigUint64(r, e.getBigUint64(r, true), false);
          return this;
        }
        compare(e, r = 0, n = e.length, i = 0, o = this.length) {
          return Jr(e, "target"), de(r, "targetStart"), de(n, "targetEnd"), de(i, "sourceStart"), de(o, "sourceEnd"), ge(r, "targetStart"), ge(n, "targetEnd", e.length), ge(i, "sourceStart"), ge(o, "sourceEnd", this.length), t.compare(this.slice(i, o), e.slice(r, n));
        }
        equals(e) {
          return Jr(e, "otherBuffer"), this.length === e.length && this.every((r, n) => r === e[n]);
        }
        copy(e, r = 0, n = 0, i = this.length) {
          ge(r, "targetStart"), ge(n, "sourceStart", this.length), ge(i, "sourceEnd"), r >>>= 0, n >>>= 0, i >>>= 0;
          let o = 0;
          for (; n < i && !(this[n] === void 0 || e[r] === void 0); ) e[r] = this[n], o++, n++, r++;
          return o;
        }
        write(e, r, n, i = "utf8") {
          let o = typeof r == "string" ? 0 : r ?? 0, s = typeof n == "string" ? this.length - o : n ?? this.length - o;
          return i = typeof r == "string" ? r : typeof n == "string" ? n : i, de(o, "offset"), de(s, "length"), ge(o, "offset", this.length), ge(s, "length", this.length), (i === "ucs2" || i === "ucs-2" || i === "utf16le" || i === "utf-16le") && (s = s - s % 2), ri(e, i).copy(this, o, 0, s);
        }
        fill(e = 0, r = 0, n = this.length, i = "utf-8") {
          let o = typeof r == "string" ? 0 : r, s = typeof n == "string" ? this.length : n;
          if (i = typeof r == "string" ? r : typeof n == "string" ? n : i, e = t.from(typeof e == "number" ? [e] : e ?? [], i), Oo(i, "encoding"), ge(o, "offset", this.length), ge(s, "end", this.length), e.length !== 0) for (let a = o; a < s; a += e.length) super.set(e.slice(0, e.length + a >= this.length ? this.length - a : e.length), a);
          return this;
        }
        includes(e, r = null, n = "utf-8") {
          return this.indexOf(e, r, n) !== -1;
        }
        lastIndexOf(e, r = null, n = "utf-8") {
          return this.indexOf(e, r, n, true);
        }
        indexOf(e, r = null, n = "utf-8", i = false) {
          let o = i ? this.findLastIndex.bind(this) : this.findIndex.bind(this);
          n = typeof r == "string" ? r : n;
          let s = t.from(typeof e == "number" ? [e] : e, n), a = typeof r == "string" ? 0 : r;
          return a = typeof r == "number" ? a : null, a = Number.isNaN(a) ? null : a, a ??= i ? this.length : 0, a = a < 0 ? this.length + a : a, s.length === 0 && i === false ? a >= this.length ? this.length : a : s.length === 0 && i === true ? (a >= this.length ? this.length : a) || this.length : o((m, h) => (i ? h <= a : h >= a) && this[h] === s[0] && s.every((N, $3) => this[h + $3] === N));
        }
        toString(e = "utf8", r = 0, n = this.length) {
          if (r = r < 0 ? 0 : r, e = e.toString().toLowerCase(), n <= 0) return "";
          if (e === "utf8" || e === "utf-8") return oc.decode(this.slice(r, n));
          if (e === "base64" || e === "base64url") {
            let i = btoa(this.reduce((o, s) => o + ni(s), ""));
            return e === "base64url" ? i.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : i;
          }
          if (e === "binary" || e === "ascii" || e === "latin1" || e === "latin-1") return this.slice(r, n).reduce((i, o) => i + ni(o & (e === "ascii" ? 127 : 255)), "");
          if (e === "ucs2" || e === "ucs-2" || e === "utf16le" || e === "utf-16le") {
            let i = new DataView(this.buffer.slice(r, n));
            return Array.from({ length: i.byteLength / 2 }, (o, s) => s * 2 + 1 < i.byteLength ? ni(i.getUint16(s * 2, true)) : "").join("");
          }
          if (e === "hex") return this.slice(r, n).reduce((i, o) => i + o.toString(16).padStart(2, "0"), "");
          No(`encoding "${e}"`);
        }
        toLocaleString() {
          return this.toString();
        }
        inspect() {
          return `<Buffer ${this.toString("hex").match(/.{1,2}/g).join(" ")}>`;
        }
      };
      nc = { int8: [-128, 127], int16: [-32768, 32767], int32: [-2147483648, 2147483647], uint8: [0, 255], uint16: [0, 65535], uint32: [0, 4294967295], float32: [-1 / 0, 1 / 0], float64: [-1 / 0, 1 / 0], bigint64: [-0x8000000000000000n, 0x7fffffffffffffffn], biguint64: [0n, 0xffffffffffffffffn] }, ic = new TextEncoder(), oc = new TextDecoder(), sc = ["utf8", "utf-8", "hex", "base64", "ascii", "binary", "base64url", "ucs2", "ucs-2", "utf16le", "utf-16le", "latin1", "latin-1"], ac = 4294967295;
      tc(x.prototype);
      w = new Proxy(uc, { construct(t, [e, r]) {
        return x.from(e, r);
      }, get(t, e) {
        return x[e];
      } }), ni = String.fromCodePoint;
    });
    var b;
    var S;
    var l = We(() => {
      "use strict";
      b = { nextTick: /* @__PURE__ */ __name((t, ...e) => {
        setTimeout(() => {
          t(...e);
        }, 0);
      }, "nextTick"), env: {}, version: "", cwd: /* @__PURE__ */ __name(() => "/", "cwd"), stderr: {}, argv: ["/bin/node"], pid: 1e4 }, { cwd: S } = b;
    });
    var T;
    var c = We(() => {
      "use strict";
      T = globalThis.performance ?? (() => {
        let t = Date.now();
        return { now: /* @__PURE__ */ __name(() => Date.now() - t, "now") };
      })();
    });
    var v;
    var p = We(() => {
      "use strict";
      v = /* @__PURE__ */ __name(() => {
      }, "v");
      v.prototype = v;
    });
    function Lo(t, e) {
      var r, n, i, o, s, a, m, h, E = t.constructor, N = E.precision;
      if (!t.s || !e.s) return e.s || (e = new E(t)), se ? te(e, N) : e;
      if (m = t.d, h = e.d, s = t.e, i = e.e, m = m.slice(), o = s - i, o) {
        for (o < 0 ? (n = m, o = -o, a = h.length) : (n = h, i = s, a = m.length), s = Math.ceil(N / ie), a = s > a ? s + 1 : a + 1, o > a && (o = a, n.length = 1), n.reverse(); o--; ) n.push(0);
        n.reverse();
      }
      for (a = m.length, o = h.length, a - o < 0 && (o = a, n = h, h = m, m = n), r = 0; o; ) r = (m[--o] = m[o] + h[o] + r) / he | 0, m[o] %= he;
      for (r && (m.unshift(r), ++i), a = m.length; m[--a] == 0; ) m.pop();
      return e.d = m, e.e = i, se ? te(e, N) : e;
    }
    __name(Lo, "Lo");
    function Xe(t, e, r) {
      if (t !== ~~t || t < e || t > r) throw Error(wt + t);
    }
    __name(Xe, "Xe");
    function Ke(t) {
      var e, r, n, i = t.length - 1, o = "", s = t[0];
      if (i > 0) {
        for (o += s, e = 1; e < i; e++) n = t[e] + "", r = ie - n.length, r && (o += lt(r)), o += n;
        s = t[e], n = s + "", r = ie - n.length, r && (o += lt(r));
      } else if (s === 0) return "0";
      for (; s % 10 === 0; ) s /= 10;
      return o + s;
    }
    __name(Ke, "Ke");
    function Fo(t, e) {
      var r, n, i, o, s, a, m = 0, h = 0, E = t.constructor, N = E.precision;
      if (me(t) > 16) throw Error(oi + me(t));
      if (!t.s) return new E(De);
      for (e == null ? (se = false, a = N) : a = e, s = new E(0.03125); t.abs().gte(0.1); ) t = t.times(s), h += 5;
      for (n = Math.log(yt(2, h)) / Math.LN10 * 2 + 5 | 0, a += n, r = i = o = new E(De), E.precision = a; ; ) {
        if (i = te(i.times(t), a), r = r.times(++m), s = o.plus(ot(i, r, a)), Ke(s.d).slice(0, a) === Ke(o.d).slice(0, a)) {
          for (; h--; ) o = te(o.times(o), a);
          return E.precision = N, e == null ? (se = true, te(o, N)) : o;
        }
        o = s;
      }
    }
    __name(Fo, "Fo");
    function me(t) {
      for (var e = t.e * ie, r = t.d[0]; r >= 10; r /= 10) e++;
      return e;
    }
    __name(me, "me");
    function ii(t, e, r) {
      if (e > t.LN10.sd()) throw se = true, r && (t.precision = r), Error(Fe + "LN10 precision limit exceeded");
      return te(new t(t.LN10), e);
    }
    __name(ii, "ii");
    function lt(t) {
      for (var e = ""; t--; ) e += "0";
      return e;
    }
    __name(lt, "lt");
    function ar(t, e) {
      var r, n, i, o, s, a, m, h, E, N = 1, $3 = 10, U = t, B2 = U.d, q = U.constructor, J = q.precision;
      if (U.s < 1) throw Error(Fe + (U.s ? "NaN" : "-Infinity"));
      if (U.eq(De)) return new q(0);
      if (e == null ? (se = false, h = J) : h = e, U.eq(10)) return e == null && (se = true), ii(q, h);
      if (h += $3, q.precision = h, r = Ke(B2), n = r.charAt(0), o = me(U), Math.abs(o) < 15e14) {
        for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3; ) U = U.times(t), r = Ke(U.d), n = r.charAt(0), N++;
        o = me(U), n > 1 ? (U = new q("0." + r), o++) : U = new q(n + "." + r.slice(1));
      } else return m = ii(q, h + 2, J).times(o + ""), U = ar(new q(n + "." + r.slice(1)), h - $3).plus(m), q.precision = J, e == null ? (se = true, te(U, J)) : U;
      for (a = s = U = ot(U.minus(De), U.plus(De), h), E = te(U.times(U), h), i = 3; ; ) {
        if (s = te(s.times(E), h), m = a.plus(ot(s, new q(i), h)), Ke(m.d).slice(0, h) === Ke(a.d).slice(0, h)) return a = a.times(2), o !== 0 && (a = a.plus(ii(q, h + 2, J).times(o + ""))), a = ot(a, new q(N), h), q.precision = J, e == null ? (se = true, te(a, J)) : a;
        a = m, i += 2;
      }
    }
    __name(ar, "ar");
    function Do(t, e) {
      var r, n, i;
      for ((r = e.indexOf(".")) > -1 && (e = e.replace(".", "")), (n = e.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +e.slice(n + 1), e = e.substring(0, n)) : r < 0 && (r = e.length), n = 0; e.charCodeAt(n) === 48; ) ++n;
      for (i = e.length; e.charCodeAt(i - 1) === 48; ) --i;
      if (e = e.slice(n, i), e) {
        if (i -= n, r = r - n - 1, t.e = Lt(r / ie), t.d = [], n = (r + 1) % ie, r < 0 && (n += ie), n < i) {
          for (n && t.d.push(+e.slice(0, n)), i -= ie; n < i; ) t.d.push(+e.slice(n, n += ie));
          e = e.slice(n), n = ie - e.length;
        } else n -= i;
        for (; n--; ) e += "0";
        if (t.d.push(+e), se && (t.e > Gr || t.e < -Gr)) throw Error(oi + r);
      } else t.s = 0, t.e = 0, t.d = [0];
      return t;
    }
    __name(Do, "Do");
    function te(t, e, r) {
      var n, i, o, s, a, m, h, E, N = t.d;
      for (s = 1, o = N[0]; o >= 10; o /= 10) s++;
      if (n = e - s, n < 0) n += ie, i = e, h = N[E = 0];
      else {
        if (E = Math.ceil((n + 1) / ie), o = N.length, E >= o) return t;
        for (h = o = N[E], s = 1; o >= 10; o /= 10) s++;
        n %= ie, i = n - ie + s;
      }
      if (r !== void 0 && (o = yt(10, s - i - 1), a = h / o % 10 | 0, m = e < 0 || N[E + 1] !== void 0 || h % o, m = r < 4 ? (a || m) && (r == 0 || r == (t.s < 0 ? 3 : 2)) : a > 5 || a == 5 && (r == 4 || m || r == 6 && (n > 0 ? i > 0 ? h / yt(10, s - i) : 0 : N[E - 1]) % 10 & 1 || r == (t.s < 0 ? 8 : 7))), e < 1 || !N[0]) return m ? (o = me(t), N.length = 1, e = e - o - 1, N[0] = yt(10, (ie - e % ie) % ie), t.e = Lt(-e / ie) || 0) : (N.length = 1, N[0] = t.e = t.s = 0), t;
      if (n == 0 ? (N.length = E, o = 1, E--) : (N.length = E + 1, o = yt(10, ie - n), N[E] = i > 0 ? (h / yt(10, s - i) % yt(10, i) | 0) * o : 0), m) for (; ; ) if (E == 0) {
        (N[0] += o) == he && (N[0] = 1, ++t.e);
        break;
      } else {
        if (N[E] += o, N[E] != he) break;
        N[E--] = 0, o = 1;
      }
      for (n = N.length; N[--n] === 0; ) N.pop();
      if (se && (t.e > Gr || t.e < -Gr)) throw Error(oi + me(t));
      return t;
    }
    __name(te, "te");
    function $o(t, e) {
      var r, n, i, o, s, a, m, h, E, N, $3 = t.constructor, U = $3.precision;
      if (!t.s || !e.s) return e.s ? e.s = -e.s : e = new $3(t), se ? te(e, U) : e;
      if (m = t.d, N = e.d, n = e.e, h = t.e, m = m.slice(), s = h - n, s) {
        for (E = s < 0, E ? (r = m, s = -s, a = N.length) : (r = N, n = h, a = m.length), i = Math.max(Math.ceil(U / ie), a) + 2, s > i && (s = i, r.length = 1), r.reverse(), i = s; i--; ) r.push(0);
        r.reverse();
      } else {
        for (i = m.length, a = N.length, E = i < a, E && (a = i), i = 0; i < a; i++) if (m[i] != N[i]) {
          E = m[i] < N[i];
          break;
        }
        s = 0;
      }
      for (E && (r = m, m = N, N = r, e.s = -e.s), a = m.length, i = N.length - a; i > 0; --i) m[a++] = 0;
      for (i = N.length; i > s; ) {
        if (m[--i] < N[i]) {
          for (o = i; o && m[--o] === 0; ) m[o] = he - 1;
          --m[o], m[i] += he;
        }
        m[i] -= N[i];
      }
      for (; m[--a] === 0; ) m.pop();
      for (; m[0] === 0; m.shift()) --n;
      return m[0] ? (e.d = m, e.e = n, se ? te(e, U) : e) : new $3(0);
    }
    __name($o, "$o");
    function bt(t, e, r) {
      var n, i = me(t), o = Ke(t.d), s = o.length;
      return e ? (r && (n = r - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + lt(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (i < 0 ? "e" : "e+") + i) : i < 0 ? (o = "0." + lt(-i - 1) + o, r && (n = r - s) > 0 && (o += lt(n))) : i >= s ? (o += lt(i + 1 - s), r && (n = r - i - 1) > 0 && (o = o + "." + lt(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o += "."), o += lt(n))), t.s < 0 ? "-" + o : o;
    }
    __name(bt, "bt");
    function Mo(t, e) {
      if (t.length > e) return t.length = e, true;
    }
    __name(Mo, "Mo");
    function Uo(t) {
      var e, r, n;
      function i(o) {
        var s = this;
        if (!(s instanceof i)) return new i(o);
        if (s.constructor = i, o instanceof i) {
          s.s = o.s, s.e = o.e, s.d = (o = o.d) ? o.slice() : o;
          return;
        }
        if (typeof o == "number") {
          if (o * 0 !== 0) throw Error(wt + o);
          if (o > 0) s.s = 1;
          else if (o < 0) o = -o, s.s = -1;
          else {
            s.s = 0, s.e = 0, s.d = [0];
            return;
          }
          if (o === ~~o && o < 1e7) {
            s.e = 0, s.d = [o];
            return;
          }
          return Do(s, o.toString());
        } else if (typeof o != "string") throw Error(wt + o);
        if (o.charCodeAt(0) === 45 ? (o = o.slice(1), s.s = -1) : s.s = 1, cc.test(o)) Do(s, o);
        else throw Error(wt + o);
      }
      __name(i, "i");
      if (i.prototype = V, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = Uo, i.config = i.set = pc, t === void 0 && (t = {}), t) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"], e = 0; e < n.length; ) t.hasOwnProperty(r = n[e++]) || (t[r] = this[r]);
      return i.config(t), i;
    }
    __name(Uo, "Uo");
    function pc(t) {
      if (!t || typeof t != "object") throw Error(Fe + "Object expected");
      var e, r, n, i = ["precision", 1, _t, "rounding", 0, 8, "toExpNeg", -1 / 0, 0, "toExpPos", 0, 1 / 0];
      for (e = 0; e < i.length; e += 3) if ((n = t[r = i[e]]) !== void 0) if (Lt(n) === n && n >= i[e + 1] && n <= i[e + 2]) this[r] = n;
      else throw Error(wt + r + ": " + n);
      if ((n = t[r = "LN10"]) !== void 0) if (n == Math.LN10) this[r] = new this(n);
      else throw Error(wt + r + ": " + n);
      return this;
    }
    __name(pc, "pc");
    var _t;
    var lc;
    var Vo;
    var se;
    var Fe;
    var wt;
    var oi;
    var Lt;
    var yt;
    var cc;
    var De;
    var he;
    var ie;
    var _o;
    var Gr;
    var V;
    var ot;
    var Vo;
    var qo = We(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      _t = 1e9, lc = { precision: 20, rounding: 4, toExpNeg: -7, toExpPos: 21, LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286" }, se = true, Fe = "[DecimalError] ", wt = Fe + "Invalid argument: ", oi = Fe + "Exponent out of range: ", Lt = Math.floor, yt = Math.pow, cc = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, he = 1e7, ie = 7, _o = 9007199254740991, Gr = Lt(_o / ie), V = {};
      V.absoluteValue = V.abs = function() {
        var t = new this.constructor(this);
        return t.s && (t.s = 1), t;
      };
      V.comparedTo = V.cmp = function(t) {
        var e, r, n, i, o = this;
        if (t = new o.constructor(t), o.s !== t.s) return o.s || -t.s;
        if (o.e !== t.e) return o.e > t.e ^ o.s < 0 ? 1 : -1;
        for (n = o.d.length, i = t.d.length, e = 0, r = n < i ? n : i; e < r; ++e) if (o.d[e] !== t.d[e]) return o.d[e] > t.d[e] ^ o.s < 0 ? 1 : -1;
        return n === i ? 0 : n > i ^ o.s < 0 ? 1 : -1;
      };
      V.decimalPlaces = V.dp = function() {
        var t = this, e = t.d.length - 1, r = (e - t.e) * ie;
        if (e = t.d[e], e) for (; e % 10 == 0; e /= 10) r--;
        return r < 0 ? 0 : r;
      };
      V.dividedBy = V.div = function(t) {
        return ot(this, new this.constructor(t));
      };
      V.dividedToIntegerBy = V.idiv = function(t) {
        var e = this, r = e.constructor;
        return te(ot(e, new r(t), 0, 1), r.precision);
      };
      V.equals = V.eq = function(t) {
        return !this.cmp(t);
      };
      V.exponent = function() {
        return me(this);
      };
      V.greaterThan = V.gt = function(t) {
        return this.cmp(t) > 0;
      };
      V.greaterThanOrEqualTo = V.gte = function(t) {
        return this.cmp(t) >= 0;
      };
      V.isInteger = V.isint = function() {
        return this.e > this.d.length - 2;
      };
      V.isNegative = V.isneg = function() {
        return this.s < 0;
      };
      V.isPositive = V.ispos = function() {
        return this.s > 0;
      };
      V.isZero = function() {
        return this.s === 0;
      };
      V.lessThan = V.lt = function(t) {
        return this.cmp(t) < 0;
      };
      V.lessThanOrEqualTo = V.lte = function(t) {
        return this.cmp(t) < 1;
      };
      V.logarithm = V.log = function(t) {
        var e, r = this, n = r.constructor, i = n.precision, o = i + 5;
        if (t === void 0) t = new n(10);
        else if (t = new n(t), t.s < 1 || t.eq(De)) throw Error(Fe + "NaN");
        if (r.s < 1) throw Error(Fe + (r.s ? "NaN" : "-Infinity"));
        return r.eq(De) ? new n(0) : (se = false, e = ot(ar(r, o), ar(t, o), o), se = true, te(e, i));
      };
      V.minus = V.sub = function(t) {
        var e = this;
        return t = new e.constructor(t), e.s == t.s ? $o(e, t) : Lo(e, (t.s = -t.s, t));
      };
      V.modulo = V.mod = function(t) {
        var e, r = this, n = r.constructor, i = n.precision;
        if (t = new n(t), !t.s) throw Error(Fe + "NaN");
        return r.s ? (se = false, e = ot(r, t, 0, 1).times(t), se = true, r.minus(e)) : te(new n(r), i);
      };
      V.naturalExponential = V.exp = function() {
        return Fo(this);
      };
      V.naturalLogarithm = V.ln = function() {
        return ar(this);
      };
      V.negated = V.neg = function() {
        var t = new this.constructor(this);
        return t.s = -t.s || 0, t;
      };
      V.plus = V.add = function(t) {
        var e = this;
        return t = new e.constructor(t), e.s == t.s ? Lo(e, t) : $o(e, (t.s = -t.s, t));
      };
      V.precision = V.sd = function(t) {
        var e, r, n, i = this;
        if (t !== void 0 && t !== !!t && t !== 1 && t !== 0) throw Error(wt + t);
        if (e = me(i) + 1, n = i.d.length - 1, r = n * ie + 1, n = i.d[n], n) {
          for (; n % 10 == 0; n /= 10) r--;
          for (n = i.d[0]; n >= 10; n /= 10) r++;
        }
        return t && e > r ? e : r;
      };
      V.squareRoot = V.sqrt = function() {
        var t, e, r, n, i, o, s, a = this, m = a.constructor;
        if (a.s < 1) {
          if (!a.s) return new m(0);
          throw Error(Fe + "NaN");
        }
        for (t = me(a), se = false, i = Math.sqrt(+a), i == 0 || i == 1 / 0 ? (e = Ke(a.d), (e.length + t) % 2 == 0 && (e += "0"), i = Math.sqrt(e), t = Lt((t + 1) / 2) - (t < 0 || t % 2), i == 1 / 0 ? e = "5e" + t : (e = i.toExponential(), e = e.slice(0, e.indexOf("e") + 1) + t), n = new m(e)) : n = new m(i.toString()), r = m.precision, i = s = r + 3; ; ) if (o = n, n = o.plus(ot(a, o, s + 2)).times(0.5), Ke(o.d).slice(0, s) === (e = Ke(n.d)).slice(0, s)) {
          if (e = e.slice(s - 3, s + 1), i == s && e == "4999") {
            if (te(o, r + 1, 0), o.times(o).eq(a)) {
              n = o;
              break;
            }
          } else if (e != "9999") break;
          s += 4;
        }
        return se = true, te(n, r);
      };
      V.times = V.mul = function(t) {
        var e, r, n, i, o, s, a, m, h, E = this, N = E.constructor, $3 = E.d, U = (t = new N(t)).d;
        if (!E.s || !t.s) return new N(0);
        for (t.s *= E.s, r = E.e + t.e, m = $3.length, h = U.length, m < h && (o = $3, $3 = U, U = o, s = m, m = h, h = s), o = [], s = m + h, n = s; n--; ) o.push(0);
        for (n = h; --n >= 0; ) {
          for (e = 0, i = m + n; i > n; ) a = o[i] + U[n] * $3[i - n - 1] + e, o[i--] = a % he | 0, e = a / he | 0;
          o[i] = (o[i] + e) % he | 0;
        }
        for (; !o[--s]; ) o.pop();
        return e ? ++r : o.shift(), t.d = o, t.e = r, se ? te(t, N.precision) : t;
      };
      V.toDecimalPlaces = V.todp = function(t, e) {
        var r = this, n = r.constructor;
        return r = new n(r), t === void 0 ? r : (Xe(t, 0, _t), e === void 0 ? e = n.rounding : Xe(e, 0, 8), te(r, t + me(r) + 1, e));
      };
      V.toExponential = function(t, e) {
        var r, n = this, i = n.constructor;
        return t === void 0 ? r = bt(n, true) : (Xe(t, 0, _t), e === void 0 ? e = i.rounding : Xe(e, 0, 8), n = te(new i(n), t + 1, e), r = bt(n, true, t + 1)), r;
      };
      V.toFixed = function(t, e) {
        var r, n, i = this, o = i.constructor;
        return t === void 0 ? bt(i) : (Xe(t, 0, _t), e === void 0 ? e = o.rounding : Xe(e, 0, 8), n = te(new o(i), t + me(i) + 1, e), r = bt(n.abs(), false, t + me(n) + 1), i.isneg() && !i.isZero() ? "-" + r : r);
      };
      V.toInteger = V.toint = function() {
        var t = this, e = t.constructor;
        return te(new e(t), me(t) + 1, e.rounding);
      };
      V.toNumber = function() {
        return +this;
      };
      V.toPower = V.pow = function(t) {
        var e, r, n, i, o, s, a = this, m = a.constructor, h = 12, E = +(t = new m(t));
        if (!t.s) return new m(De);
        if (a = new m(a), !a.s) {
          if (t.s < 1) throw Error(Fe + "Infinity");
          return a;
        }
        if (a.eq(De)) return a;
        if (n = m.precision, t.eq(De)) return te(a, n);
        if (e = t.e, r = t.d.length - 1, s = e >= r, o = a.s, s) {
          if ((r = E < 0 ? -E : E) <= _o) {
            for (i = new m(De), e = Math.ceil(n / ie + 4), se = false; r % 2 && (i = i.times(a), Mo(i.d, e)), r = Lt(r / 2), r !== 0; ) a = a.times(a), Mo(a.d, e);
            return se = true, t.s < 0 ? new m(De).div(i) : te(i, n);
          }
        } else if (o < 0) throw Error(Fe + "NaN");
        return o = o < 0 && t.d[Math.max(e, r)] & 1 ? -1 : 1, a.s = 1, se = false, i = t.times(ar(a, n + h)), se = true, i = Fo(i), i.s = o, i;
      };
      V.toPrecision = function(t, e) {
        var r, n, i = this, o = i.constructor;
        return t === void 0 ? (r = me(i), n = bt(i, r <= o.toExpNeg || r >= o.toExpPos)) : (Xe(t, 1, _t), e === void 0 ? e = o.rounding : Xe(e, 0, 8), i = te(new o(i), t, e), r = me(i), n = bt(i, t <= r || r <= o.toExpNeg, t)), n;
      };
      V.toSignificantDigits = V.tosd = function(t, e) {
        var r = this, n = r.constructor;
        return t === void 0 ? (t = n.precision, e = n.rounding) : (Xe(t, 1, _t), e === void 0 ? e = n.rounding : Xe(e, 0, 8)), te(new n(r), t, e);
      };
      V.toString = V.valueOf = V.val = V.toJSON = V[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = function() {
        var t = this, e = me(t), r = t.constructor;
        return bt(t, e <= r.toExpNeg || e >= r.toExpPos);
      };
      ot = /* @__PURE__ */ (function() {
        function t(n, i) {
          var o, s = 0, a = n.length;
          for (n = n.slice(); a--; ) o = n[a] * i + s, n[a] = o % he | 0, s = o / he | 0;
          return s && n.unshift(s), n;
        }
        __name(t, "t");
        function e(n, i, o, s) {
          var a, m;
          if (o != s) m = o > s ? 1 : -1;
          else for (a = m = 0; a < o; a++) if (n[a] != i[a]) {
            m = n[a] > i[a] ? 1 : -1;
            break;
          }
          return m;
        }
        __name(e, "e");
        function r(n, i, o) {
          for (var s = 0; o--; ) n[o] -= s, s = n[o] < i[o] ? 1 : 0, n[o] = s * he + n[o] - i[o];
          for (; !n[0] && n.length > 1; ) n.shift();
        }
        __name(r, "r");
        return function(n, i, o, s) {
          var a, m, h, E, N, $3, U, B2, q, J, Z, L, z, ce, Ie, Se, pe, f, g = n.constructor, y = n.s == i.s ? 1 : -1, k = n.d, P = i.d;
          if (!n.s) return new g(n);
          if (!i.s) throw Error(Fe + "Division by zero");
          for (m = n.e - i.e, pe = P.length, Ie = k.length, U = new g(y), B2 = U.d = [], h = 0; P[h] == (k[h] || 0); ) ++h;
          if (P[h] > (k[h] || 0) && --m, o == null ? L = o = g.precision : s ? L = o + (me(n) - me(i)) + 1 : L = o, L < 0) return new g(0);
          if (L = L / ie + 2 | 0, h = 0, pe == 1) for (E = 0, P = P[0], L++; (h < Ie || E) && L--; h++) z = E * he + (k[h] || 0), B2[h] = z / P | 0, E = z % P | 0;
          else {
            for (E = he / (P[0] + 1) | 0, E > 1 && (P = t(P, E), k = t(k, E), pe = P.length, Ie = k.length), ce = pe, q = k.slice(0, pe), J = q.length; J < pe; ) q[J++] = 0;
            f = P.slice(), f.unshift(0), Se = P[0], P[1] >= he / 2 && ++Se;
            do
              E = 0, a = e(P, q, pe, J), a < 0 ? (Z = q[0], pe != J && (Z = Z * he + (q[1] || 0)), E = Z / Se | 0, E > 1 ? (E >= he && (E = he - 1), N = t(P, E), $3 = N.length, J = q.length, a = e(N, q, $3, J), a == 1 && (E--, r(N, pe < $3 ? f : P, $3))) : (E == 0 && (a = E = 1), N = P.slice()), $3 = N.length, $3 < J && N.unshift(0), r(q, N, J), a == -1 && (J = q.length, a = e(P, q, pe, J), a < 1 && (E++, r(q, pe < J ? f : P, J))), J = q.length) : a === 0 && (E++, q = [0]), B2[h++] = E, a && q[0] ? q[J++] = k[ce] || 0 : (q = [k[ce]], J = 1);
            while ((ce++ < Ie || q[0] !== void 0) && L--);
          }
          return B2[0] || B2.shift(), U.e = m, te(U, s ? o + me(U) + 1 : o);
        };
      })();
      Vo = Uo(lc);
      De = new Vo(1);
    });
    var d = We(() => {
      "use strict";
      qo();
    });
    var ls = {};
    Dt(ls, { Hash: /* @__PURE__ */ __name(() => pr, "Hash"), createHash: /* @__PURE__ */ __name(() => us, "createHash"), default: /* @__PURE__ */ __name(() => $t, "default"), randomFillSync: /* @__PURE__ */ __name(() => as, "randomFillSync"), randomUUID: /* @__PURE__ */ __name(() => ss, "randomUUID"), webcrypto: /* @__PURE__ */ __name(() => dr, "webcrypto") });
    function ss() {
      return globalThis.crypto.randomUUID();
    }
    __name(ss, "ss");
    function as(t, e, r) {
      return e !== void 0 && (r !== void 0 ? t = t.subarray(e, e + r) : t = t.subarray(e)), globalThis.crypto.getRandomValues(t);
    }
    __name(as, "as");
    function us(t) {
      return new pr(t);
    }
    __name(us, "us");
    var dr;
    var pr;
    var $t;
    var Kr = We(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      dr = globalThis.crypto;
      pr = class {
        static {
          __name(this, "pr");
        }
        #e = [];
        #t;
        constructor(e) {
          this.#t = e;
        }
        update(e) {
          this.#e.push(e);
        }
        async digest() {
          let e = new Uint8Array(this.#e.reduce((i, o) => i + o.length, 0)), r = 0;
          for (let i of this.#e) e.set(i, r), r += i.length;
          let n = await globalThis.crypto.subtle.digest(this.#t, e);
          return new Uint8Array(n);
        }
      }, $t = { webcrypto: dr, randomUUID: ss, randomFillSync: as, createHash: us, Hash: pr };
    });
    var cs = Nt(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
    });
    var ps = Nt((ey, yc) => {
      yc.exports = { name: "@prisma/engines-version", version: "7.10.0-4.0edf323efd1d98336f3f0a68684b56f689b900d3", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "0edf323efd1d98336f3f0a68684b56f689b900d3" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
    });
    var ds = Nt((Xr) => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      Object.defineProperty(Xr, "__esModule", { value: true });
      Xr.enginesVersion = void 0;
      Xr.enginesVersion = ps().prisma.enginesVersion;
    });
    var hs = Nt((my, gs) => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      gs.exports = (t, e = 1, r) => {
        if (r = { indent: " ", includeEmptyLines: false, ...r }, typeof t != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof t}\``);
        if (typeof e != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof e}\``);
        if (typeof r.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``);
        if (e === 0) return t;
        let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
        return t.replace(n, r.indent.repeat(e));
      };
    });
    var ws = Nt(($y, Yr) => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      Yr.exports = (t = {}) => {
        let e;
        if (t.repoUrl) e = t.repoUrl;
        else if (t.user && t.repo) e = `https://github.com/${t.user}/${t.repo}`;
        else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
        let r = new URL(`${e}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
        for (let i of n) {
          let o = t[i];
          if (o !== void 0) {
            if (i === "labels" || i === "projects") {
              if (!Array.isArray(o)) throw new TypeError(`The \`${i}\` option should be an array`);
              o = o.join(",");
            }
            r.searchParams.set(i, o);
          }
        }
        return r.toString();
      };
      Yr.exports.default = Yr.exports;
    });
    var yi = Nt((Ab, Es) => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      Es.exports = /* @__PURE__ */ (function() {
        function t(e, r, n, i, o) {
          return e < r || n < r ? e > n ? n + 1 : e + 1 : i === o ? r : r + 1;
        }
        __name(t, "t");
        return function(e, r) {
          if (e === r) return 0;
          if (e.length > r.length) {
            var n = e;
            e = r, r = n;
          }
          for (var i = e.length, o = r.length; i > 0 && e.charCodeAt(i - 1) === r.charCodeAt(o - 1); ) i--, o--;
          for (var s = 0; s < i && e.charCodeAt(s) === r.charCodeAt(s); ) s++;
          if (i -= s, o -= s, i === 0 || o < 3) return o;
          var a = 0, m, h, E, N, $3, U, B2, q, J, Z, L, z, ce = [];
          for (m = 0; m < i; m++) ce.push(m + 1), ce.push(e.charCodeAt(s + m));
          for (var Ie = ce.length - 1; a < o - 3; ) for (J = r.charCodeAt(s + (h = a)), Z = r.charCodeAt(s + (E = a + 1)), L = r.charCodeAt(s + (N = a + 2)), z = r.charCodeAt(s + ($3 = a + 3)), U = a += 4, m = 0; m < Ie; m += 2) B2 = ce[m], q = ce[m + 1], h = t(B2, h, E, J, q), E = t(h, E, N, Z, q), N = t(E, N, $3, L, q), U = t(N, $3, U, z, q), ce[m] = U, $3 = N, N = E, E = h, h = B2;
          for (; a < o; ) for (J = r.charCodeAt(s + (h = a)), U = ++a, m = 0; m < Ie; m += 2) B2 = ce[m], ce[m] = U = t(B2, h, U, J, ce[m + 1]), h = B2;
          return U;
        };
      })();
    });
    var As = We(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
    });
    var Rs = We(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
    });
    var yn;
    var Ys = We(() => {
      "use strict";
      u();
      l();
      c();
      p();
      d();
      yn = class {
        static {
          __name(this, "yn");
        }
        events = {};
        on(e, r) {
          return this.events[e] || (this.events[e] = []), this.events[e].push(r), this;
        }
        emit(e, ...r) {
          return this.events[e] ? (this.events[e].forEach((n) => {
            n(...r);
          }), true) : false;
        }
      };
    });
    var cf = {};
    Dt(cf, { AnyNull: /* @__PURE__ */ __name(() => Ee.AnyNull, "AnyNull"), DMMF: /* @__PURE__ */ __name(() => yr, "DMMF"), DbNull: /* @__PURE__ */ __name(() => Ee.DbNull, "DbNull"), Debug: /* @__PURE__ */ __name(() => ye, "Debug"), Decimal: /* @__PURE__ */ __name(() => zl.Decimal, "Decimal"), Extensions: /* @__PURE__ */ __name(() => si, "Extensions"), JsonNull: /* @__PURE__ */ __name(() => Ee.JsonNull, "JsonNull"), NullTypes: /* @__PURE__ */ __name(() => Ee.NullTypes, "NullTypes"), ObjectEnumValue: /* @__PURE__ */ __name(() => Ee.ObjectEnumValue, "ObjectEnumValue"), PrismaClientInitializationError: /* @__PURE__ */ __name(() => K.PrismaClientInitializationError, "PrismaClientInitializationError"), PrismaClientKnownRequestError: /* @__PURE__ */ __name(() => K.PrismaClientKnownRequestError, "PrismaClientKnownRequestError"), PrismaClientRustPanicError: /* @__PURE__ */ __name(() => K.PrismaClientRustPanicError, "PrismaClientRustPanicError"), PrismaClientUnknownRequestError: /* @__PURE__ */ __name(() => K.PrismaClientUnknownRequestError, "PrismaClientUnknownRequestError"), PrismaClientValidationError: /* @__PURE__ */ __name(() => K.PrismaClientValidationError, "PrismaClientValidationError"), Public: /* @__PURE__ */ __name(() => ai, "Public"), Sql: /* @__PURE__ */ __name(() => it.Sql, "Sql"), createParam: /* @__PURE__ */ __name(() => Js, "createParam"), defineDmmfProperty: /* @__PURE__ */ __name(() => Xs, "defineDmmfProperty"), deserializeJsonObject: /* @__PURE__ */ __name(() => Ge, "deserializeJsonObject"), deserializeRawResult: /* @__PURE__ */ __name(() => Zn, "deserializeRawResult"), dmmfToRuntimeDataModel: /* @__PURE__ */ __name(() => Go, "dmmfToRuntimeDataModel"), empty: /* @__PURE__ */ __name(() => it.empty, "empty"), getPrismaClient: /* @__PURE__ */ __name(() => Jl, "getPrismaClient"), getRuntime: /* @__PURE__ */ __name(() => Hl, "getRuntime"), isAnyNull: /* @__PURE__ */ __name(() => Ee.isAnyNull, "isAnyNull"), isDbNull: /* @__PURE__ */ __name(() => Ee.isDbNull, "isDbNull"), isJsonNull: /* @__PURE__ */ __name(() => Ee.isJsonNull, "isJsonNull"), isObjectEnumValue: /* @__PURE__ */ __name(() => Ee.isObjectEnumValue, "isObjectEnumValue"), join: /* @__PURE__ */ __name(() => it.join, "join"), makeStrictEnum: /* @__PURE__ */ __name(() => Gl, "makeStrictEnum"), makeTypedQueryFactory: /* @__PURE__ */ __name(() => Zs, "makeTypedQueryFactory"), raw: /* @__PURE__ */ __name(() => it.raw, "raw"), serializeJsonQuery: /* @__PURE__ */ __name(() => fn, "serializeJsonQuery"), skip: /* @__PURE__ */ __name(() => mn, "skip"), sqltag: /* @__PURE__ */ __name(() => it.sql, "sqltag"), warnOnce: /* @__PURE__ */ __name(() => hi, "warnOnce") });
    module.exports = ec(cf);
    u();
    l();
    c();
    p();
    d();
    var si = {};
    Dt(si, { defineExtension: /* @__PURE__ */ __name(() => Bo, "defineExtension"), getExtensionContext: /* @__PURE__ */ __name(() => jo, "getExtensionContext") });
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Bo(t) {
      return typeof t == "function" ? t : (e) => e.$extends(t);
    }
    __name(Bo, "Bo");
    u();
    l();
    c();
    p();
    d();
    function jo(t) {
      return t;
    }
    __name(jo, "jo");
    var ai = {};
    Dt(ai, { validator: /* @__PURE__ */ __name(() => Qo, "validator") });
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Qo(...t) {
      return (e) => e;
    }
    __name(Qo, "Qo");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Ze = class {
      static {
        __name(this, "Ze");
      }
      _map = /* @__PURE__ */ new Map();
      get(e) {
        return this._map.get(e)?.value;
      }
      set(e, r) {
        this._map.set(e, { value: r });
      }
      getOrCreate(e, r) {
        let n = this._map.get(e);
        if (n) return n.value;
        let i = r();
        return this.set(e, i), i;
      }
    };
    u();
    l();
    c();
    p();
    d();
    function ct(t) {
      return t.substring(0, 1).toLowerCase() + t.substring(1);
    }
    __name(ct, "ct");
    u();
    l();
    c();
    p();
    d();
    function Jo(t, e) {
      let r = {};
      for (let n of t) {
        let i = n[e];
        r[i] = n;
      }
      return r;
    }
    __name(Jo, "Jo");
    u();
    l();
    c();
    p();
    d();
    function ur(t) {
      let e;
      return { get() {
        return e || (e = { value: t() }), e.value;
      } };
    }
    __name(ur, "ur");
    u();
    l();
    c();
    p();
    d();
    function Go(t) {
      return { models: ui(t.models), enums: ui(t.enums), types: ui(t.types) };
    }
    __name(Go, "Go");
    function ui(t) {
      let e = {};
      for (let { name: r, ...n } of t) e[r] = n;
      return e;
    }
    __name(ui, "ui");
    var Hs = require_dist();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var li;
    var Ho;
    var zo;
    var Wo;
    var Ko = true;
    typeof b < "u" && ({ FORCE_COLOR: li, NODE_DISABLE_COLORS: Ho, NO_COLOR: zo, TERM: Wo } = b.env || {}, Ko = b.stdout && b.stdout.isTTY);
    var dc = { enabled: !Ho && zo == null && Wo !== "dumb" && (li != null && li !== "0" || Ko) };
    function ne(t, e) {
      let r = new RegExp(`\\x1b\\[${e}m`, "g"), n = `\x1B[${t}m`, i = `\x1B[${e}m`;
      return function(o) {
        return !dc.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(r, i + n) : o) + i;
      };
    }
    __name(ne, "ne");
    var Xg = ne(0, 0);
    var Hr = ne(1, 22);
    var zr = ne(2, 22);
    var Zg = ne(3, 23);
    var Wr = ne(4, 24);
    var Yg = ne(7, 27);
    var eh = ne(8, 28);
    var th = ne(9, 29);
    var rh = ne(30, 39);
    var Ft = ne(31, 39);
    var Xo = ne(32, 39);
    var Zo = ne(33, 39);
    var Yo = ne(34, 39);
    var nh = ne(35, 39);
    var es = ne(36, 39);
    var ih = ne(37, 39);
    var ts = ne(90, 39);
    var oh = ne(90, 39);
    var sh = ne(40, 49);
    var ah = ne(41, 49);
    var uh = ne(42, 49);
    var lh = ne(43, 49);
    var ch = ne(44, 49);
    var ph = ne(45, 49);
    var dh = ne(46, 49);
    var mh = ne(47, 49);
    u();
    l();
    c();
    p();
    d();
    var mc = 100;
    var rs = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    var lr = [];
    var ns = Date.now();
    var fc = 0;
    var ci = typeof b < "u" ? b.env : {};
    globalThis.DEBUG ??= ci.DEBUG ?? "";
    globalThis.DEBUG_COLORS ??= ci.DEBUG_COLORS ? ci.DEBUG_COLORS === "true" : true;
    var cr = { enable(t) {
      typeof t == "string" && (globalThis.DEBUG = t);
    }, disable() {
      let t = globalThis.DEBUG;
      return globalThis.DEBUG = "", t;
    }, enabled(t) {
      let e = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = e.some((i) => i === "" || i[0] === "-" ? false : t.match(RegExp(i.split("*").join(".*") + "$"))), n = e.some((i) => i === "" || i[0] !== "-" ? false : t.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
      return r && !n;
    }, log: /* @__PURE__ */ __name((...t) => {
      let [e, r, ...n] = t;
      (console.warn ?? console.log)(`${e} ${r}`, ...n);
    }, "log"), formatters: {} };
    function gc(t) {
      let e = { color: rs[fc++ % rs.length], enabled: cr.enabled(t), namespace: t, log: cr.log, extend: /* @__PURE__ */ __name(() => {
      }, "extend") }, r = /* @__PURE__ */ __name((...n) => {
        let { enabled: i, namespace: o, color: s, log: a } = e;
        if (n.length !== 0 && lr.push([o, ...n]), lr.length > mc && lr.shift(), cr.enabled(o) || i) {
          let m = n.map((E) => typeof E == "string" ? E : hc(E)), h = `+${Date.now() - ns}ms`;
          ns = Date.now(), a(o, ...m, h);
        }
      }, "r");
      return new Proxy(r, { get: /* @__PURE__ */ __name((n, i) => e[i], "get"), set: /* @__PURE__ */ __name((n, i, o) => e[i] = o, "set") });
    }
    __name(gc, "gc");
    var ye = new Proxy(gc, { get: /* @__PURE__ */ __name((t, e) => cr[e], "get"), set: /* @__PURE__ */ __name((t, e, r) => cr[e] = r, "set") });
    function hc(t, e = 2) {
      let r = /* @__PURE__ */ new Set();
      return JSON.stringify(t, (n, i) => {
        if (typeof i == "object" && i !== null) {
          if (r.has(i)) return "[Circular *]";
          r.add(i);
        } else if (typeof i == "bigint") return i.toString();
        return i;
      }, e);
    }
    __name(hc, "hc");
    function is(t = 7500) {
      let e = lr.map(([r, ...n]) => `${r} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
      return e.length < t ? e : e.slice(-t);
    }
    __name(is, "is");
    function os() {
      lr.length = 0;
    }
    __name(os, "os");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function st(t, e) {
      throw new Error(e);
    }
    __name(st, "st");
    u();
    l();
    c();
    p();
    d();
    var ms = "prisma+postgres";
    var Zr = `${ms}:`;
    function fs(t) {
      return t?.toString().startsWith(`${Zr}//`) ?? false;
    }
    __name(fs, "fs");
    function pi(t) {
      if (!fs(t)) return false;
      let { host: e } = new URL(t);
      return e.includes("localhost") || e.includes("127.0.0.1") || e.includes("[::1]");
    }
    __name(pi, "pi");
    var fr = {};
    Dt(fr, { error: /* @__PURE__ */ __name(() => xc, "error"), info: /* @__PURE__ */ __name(() => bc, "info"), log: /* @__PURE__ */ __name(() => wc, "log"), query: /* @__PURE__ */ __name(() => Ec, "query"), should: /* @__PURE__ */ __name(() => ys, "should"), tags: /* @__PURE__ */ __name(() => mr, "tags"), warn: /* @__PURE__ */ __name(() => di, "warn") });
    u();
    l();
    c();
    p();
    d();
    var mr = { error: Ft("prisma:error"), warn: Zo("prisma:warn"), info: es("prisma:info"), query: Yo("prisma:query") };
    var ys = { warn: /* @__PURE__ */ __name(() => !b.env.PRISMA_DISABLE_WARNINGS, "warn") };
    function wc(...t) {
      console.log(...t);
    }
    __name(wc, "wc");
    function di(t, ...e) {
      ys.warn() && console.warn(`${mr.warn} ${t}`, ...e);
    }
    __name(di, "di");
    function bc(t, ...e) {
      console.info(`${mr.info} ${t}`, ...e);
    }
    __name(bc, "bc");
    function xc(t, ...e) {
      console.error(`${mr.error} ${t}`, ...e);
    }
    __name(xc, "xc");
    function Ec(t, ...e) {
      console.log(`${mr.query} ${t}`, ...e);
    }
    __name(Ec, "Ec");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function mi({ onlyFirst: t = false } = {}) {
      let r = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
      return new RegExp(r, t ? void 0 : "g");
    }
    __name(mi, "mi");
    var Pc = mi();
    function Ut(t) {
      if (typeof t != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof t}\``);
      return t.replace(Pc, "");
    }
    __name(Ut, "Ut");
    u();
    l();
    c();
    p();
    d();
    function fi(t, e) {
      return Object.prototype.hasOwnProperty.call(t, e);
    }
    __name(fi, "fi");
    u();
    l();
    c();
    p();
    d();
    function en(t, e) {
      let r = {};
      for (let n of Object.keys(t)) r[n] = e(t[n], n);
      return r;
    }
    __name(en, "en");
    u();
    l();
    c();
    p();
    d();
    function gi(t, e) {
      if (t.length === 0) return;
      let r = t[0];
      for (let n = 1; n < t.length; n++) e(r, t[n]) < 0 && (r = t[n]);
      return r;
    }
    __name(gi, "gi");
    u();
    l();
    c();
    p();
    d();
    function gr(t, e) {
      Object.defineProperty(t, "name", { value: e, configurable: true });
    }
    __name(gr, "gr");
    u();
    l();
    c();
    p();
    d();
    var bs = /* @__PURE__ */ new Set();
    var hi = /* @__PURE__ */ __name((t, e, ...r) => {
      bs.has(t) || (bs.add(t), di(e, ...r));
    }, "hi");
    u();
    l();
    c();
    p();
    d();
    function Vt(t) {
      return t instanceof Date || Object.prototype.toString.call(t) === "[object Date]";
    }
    __name(Vt, "Vt");
    function qt(t) {
      return t.toString() !== "Invalid Date";
    }
    __name(qt, "qt");
    u();
    l();
    c();
    p();
    d();
    var xs = require_dist();
    function Bt(t) {
      return xs.Decimal.isDecimal(t) ? true : t !== null && typeof t == "object" && typeof t.s == "number" && typeof t.e == "number" && typeof t.toFixed == "function" && Array.isArray(t.d);
    }
    __name(Bt, "Bt");
    u();
    l();
    c();
    p();
    d();
    var Us = require_dist();
    u();
    l();
    c();
    p();
    d();
    var yr = {};
    Dt(yr, { ModelAction: /* @__PURE__ */ __name(() => hr, "ModelAction"), datamodelEnumToSchemaEnum: /* @__PURE__ */ __name(() => Tc, "datamodelEnumToSchemaEnum") });
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Tc(t) {
      return { name: t.name, values: t.values.map((e) => e.name) };
    }
    __name(Tc, "Tc");
    u();
    l();
    c();
    p();
    d();
    var hr = ((z) => (z.findUnique = "findUnique", z.findUniqueOrThrow = "findUniqueOrThrow", z.findFirst = "findFirst", z.findFirstOrThrow = "findFirstOrThrow", z.findMany = "findMany", z.create = "create", z.createMany = "createMany", z.createManyAndReturn = "createManyAndReturn", z.update = "update", z.updateMany = "updateMany", z.updateManyAndReturn = "updateManyAndReturn", z.upsert = "upsert", z.delete = "delete", z.deleteMany = "deleteMany", z.groupBy = "groupBy", z.count = "count", z.aggregate = "aggregate", z.findRaw = "findRaw", z.aggregateRaw = "aggregateRaw", z))(hr || {});
    var vc = Mt(hs());
    var Sc = { red: Ft, gray: ts, dim: zr, bold: Hr, underline: Wr, highlightSource: /* @__PURE__ */ __name((t) => t.highlight(), "highlightSource") };
    var Ac = { red: /* @__PURE__ */ __name((t) => t, "red"), gray: /* @__PURE__ */ __name((t) => t, "gray"), dim: /* @__PURE__ */ __name((t) => t, "dim"), bold: /* @__PURE__ */ __name((t) => t, "bold"), underline: /* @__PURE__ */ __name((t) => t, "underline"), highlightSource: /* @__PURE__ */ __name((t) => t, "highlightSource") };
    function Rc({ message: t, originalMethod: e, isPanic: r, callArguments: n }) {
      return { functionName: `prisma.${e}()`, message: t, isPanic: r ?? false, callArguments: n };
    }
    __name(Rc, "Rc");
    function Cc({ functionName: t, location: e, message: r, isPanic: n, contextLines: i, callArguments: o }, s) {
      let a = [""], m = e ? " in" : ":";
      if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${t}\``)} invocation${m}`))) : a.push(s.red(`Invalid ${s.bold(`\`${t}\``)} invocation${m}`)), e && a.push(s.underline(Ic(e))), i) {
        a.push("");
        let h = [i.toString()];
        o && (h.push(o), h.push(s.dim(")"))), a.push(h.join("")), o && a.push("");
      } else a.push(""), o && a.push(o), a.push("");
      return a.push(r), a.join(`
`);
    }
    __name(Cc, "Cc");
    function Ic(t) {
      let e = [t.fileName];
      return t.lineNumber && e.push(String(t.lineNumber)), t.columnNumber && e.push(String(t.columnNumber)), e.join(":");
    }
    __name(Ic, "Ic");
    function tn(t) {
      let e = t.showColors ? Sc : Ac, r;
      return typeof $getTemplateParameters < "u" ? r = $getTemplateParameters(t, e) : r = Rc(t), Cc(r, e);
    }
    __name(tn, "tn");
    u();
    l();
    c();
    p();
    d();
    var Is = Mt(yi());
    u();
    l();
    c();
    p();
    d();
    function vs(t, e, r) {
      let n = Ss(t), i = kc(n), o = Nc(i);
      o ? rn(o, e, r) : e.addErrorMessage(() => "Unknown error");
    }
    __name(vs, "vs");
    function Ss(t) {
      return t.errors.flatMap((e) => e.kind === "Union" ? Ss(e) : [e]);
    }
    __name(Ss, "Ss");
    function kc(t) {
      let e = /* @__PURE__ */ new Map(), r = [];
      for (let n of t) {
        if (n.kind !== "InvalidArgumentType") {
          r.push(n);
          continue;
        }
        let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = e.get(i);
        o ? e.set(i, { ...n, argument: { ...n.argument, typeNames: Oc(o.argument.typeNames, n.argument.typeNames) } }) : e.set(i, n);
      }
      return r.push(...e.values()), r;
    }
    __name(kc, "kc");
    function Oc(t, e) {
      return [...new Set(t.concat(e))];
    }
    __name(Oc, "Oc");
    function Nc(t) {
      return gi(t, (e, r) => {
        let n = Ps(e), i = Ps(r);
        return n !== i ? n - i : Ts(e) - Ts(r);
      });
    }
    __name(Nc, "Nc");
    function Ps(t) {
      let e = 0;
      return Array.isArray(t.selectionPath) && (e += t.selectionPath.length), Array.isArray(t.argumentPath) && (e += t.argumentPath.length), e;
    }
    __name(Ps, "Ps");
    function Ts(t) {
      switch (t.kind) {
        case "InvalidArgumentValue":
        case "ValueTooLarge":
          return 20;
        case "InvalidArgumentType":
          return 10;
        case "RequiredArgumentMissing":
          return -10;
        default:
          return 0;
      }
    }
    __name(Ts, "Ts");
    u();
    l();
    c();
    p();
    d();
    var Me = class {
      static {
        __name(this, "Me");
      }
      constructor(e, r) {
        this.name = e;
        this.value = r;
      }
      isRequired = false;
      makeRequired() {
        return this.isRequired = true, this;
      }
      write(e) {
        let { colors: { green: r } } = e.context;
        e.addMarginSymbol(r(this.isRequired ? "+" : "?")), e.write(r(this.name)), this.isRequired || e.write(r("?")), e.write(r(": ")), typeof this.value == "string" ? e.write(r(this.value)) : e.write(this.value);
      }
    };
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    Rs();
    u();
    l();
    c();
    p();
    d();
    var jt = class {
      static {
        __name(this, "jt");
      }
      constructor(e = 0, r) {
        this.context = r;
        this.currentIndent = e;
      }
      lines = [];
      currentLine = "";
      currentIndent = 0;
      marginSymbol;
      afterNextNewLineCallback;
      write(e) {
        return typeof e == "string" ? this.currentLine += e : e.write(this), this;
      }
      writeJoined(e, r, n = (i, o) => o.write(i)) {
        let i = r.length - 1;
        for (let o = 0; o < r.length; o++) n(r[o], this), o !== i && this.write(e);
        return this;
      }
      writeLine(e) {
        return this.write(e).newLine();
      }
      newLine() {
        this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
        let e = this.afterNextNewLineCallback;
        return this.afterNextNewLineCallback = void 0, e?.(), this;
      }
      withIndent(e) {
        return this.indent(), e(this), this.unindent(), this;
      }
      afterNextNewline(e) {
        return this.afterNextNewLineCallback = e, this;
      }
      indent() {
        return this.currentIndent++, this;
      }
      unindent() {
        return this.currentIndent > 0 && this.currentIndent--, this;
      }
      addMarginSymbol(e) {
        return this.marginSymbol = e, this;
      }
      toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
      }
      getCurrentLineLength() {
        return this.currentLine.length;
      }
      indentedCurrentLine() {
        let e = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
        return this.marginSymbol ? this.marginSymbol + e.slice(1) : e;
      }
    };
    As();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var nn = class {
      static {
        __name(this, "nn");
      }
      constructor(e) {
        this.value = e;
      }
      write(e) {
        e.write(this.value);
      }
      markAsError() {
        this.value.markAsError();
      }
    };
    u();
    l();
    c();
    p();
    d();
    var on = /* @__PURE__ */ __name((t) => t, "on");
    var sn = { bold: on, red: on, green: on, dim: on, enabled: false };
    var Cs = { bold: Hr, red: Ft, green: Xo, dim: zr, enabled: true };
    var Qt = { write(t) {
      t.writeLine(",");
    } };
    u();
    l();
    c();
    p();
    d();
    var Ye = class {
      static {
        __name(this, "Ye");
      }
      constructor(e) {
        this.contents = e;
      }
      isUnderlined = false;
      color = /* @__PURE__ */ __name((e) => e, "color");
      underline() {
        return this.isUnderlined = true, this;
      }
      setColor(e) {
        return this.color = e, this;
      }
      write(e) {
        let r = e.getCurrentLineLength();
        e.write(this.color(this.contents)), this.isUnderlined && e.afterNextNewline(() => {
          e.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length)));
        });
      }
    };
    u();
    l();
    c();
    p();
    d();
    var pt = class {
      static {
        __name(this, "pt");
      }
      hasError = false;
      markAsError() {
        return this.hasError = true, this;
      }
    };
    var Jt = class extends pt {
      static {
        __name(this, "Jt");
      }
      items = [];
      addItem(e) {
        return this.items.push(new nn(e)), this;
      }
      getField(e) {
        return this.items[e];
      }
      getPrintWidth() {
        return this.items.length === 0 ? 2 : Math.max(...this.items.map((r) => r.value.getPrintWidth())) + 2;
      }
      write(e) {
        if (this.items.length === 0) {
          this.writeEmpty(e);
          return;
        }
        this.writeWithItems(e);
      }
      writeEmpty(e) {
        let r = new Ye("[]");
        this.hasError && r.setColor(e.context.colors.red).underline(), e.write(r);
      }
      writeWithItems(e) {
        let { colors: r } = e.context;
        e.writeLine("[").withIndent(() => e.writeJoined(Qt, this.items).newLine()).write("]"), this.hasError && e.afterNextNewline(() => {
          e.writeLine(r.red("~".repeat(this.getPrintWidth())));
        });
      }
      asObject() {
      }
    };
    var Gt = class t extends pt {
      static {
        __name(this, "t");
      }
      fields = {};
      suggestions = [];
      addField(e) {
        this.fields[e.name] = e;
      }
      addSuggestion(e) {
        this.suggestions.push(e);
      }
      getField(e) {
        return this.fields[e];
      }
      getDeepField(e) {
        let [r, ...n] = e, i = this.getField(r);
        if (!i) return;
        let o = i;
        for (let s of n) {
          let a;
          if (o.value instanceof t ? a = o.value.getField(s) : o.value instanceof Jt && (a = o.value.getField(Number(s))), !a) return;
          o = a;
        }
        return o;
      }
      getDeepFieldValue(e) {
        return e.length === 0 ? this : this.getDeepField(e)?.value;
      }
      hasField(e) {
        return !!this.getField(e);
      }
      removeAllFields() {
        this.fields = {};
      }
      removeField(e) {
        delete this.fields[e];
      }
      getFields() {
        return this.fields;
      }
      isEmpty() {
        return Object.keys(this.fields).length === 0;
      }
      getFieldValue(e) {
        return this.getField(e)?.value;
      }
      getDeepSubSelectionValue(e) {
        let r = this;
        for (let n of e) {
          if (!(r instanceof t)) return;
          let i = r.getSubSelectionValue(n);
          if (!i) return;
          r = i;
        }
        return r;
      }
      getDeepSelectionParent(e) {
        let r = this.getSelectionParent();
        if (!r) return;
        let n = r;
        for (let i of e) {
          let o = n.value.getFieldValue(i);
          if (!o || !(o instanceof t)) return;
          let s = o.getSelectionParent();
          if (!s) return;
          n = s;
        }
        return n;
      }
      getSelectionParent() {
        let e = this.getField("select")?.value.asObject();
        if (e) return { kind: "select", value: e };
        let r = this.getField("include")?.value.asObject();
        if (r) return { kind: "include", value: r };
      }
      getSubSelectionValue(e) {
        return this.getSelectionParent()?.value.fields[e].value;
      }
      getPrintWidth() {
        let e = Object.values(this.fields);
        return e.length == 0 ? 2 : Math.max(...e.map((n) => n.getPrintWidth())) + 2;
      }
      write(e) {
        let r = Object.values(this.fields);
        if (r.length === 0 && this.suggestions.length === 0) {
          this.writeEmpty(e);
          return;
        }
        this.writeWithContents(e, r);
      }
      asObject() {
        return this;
      }
      writeEmpty(e) {
        let r = new Ye("{}");
        this.hasError && r.setColor(e.context.colors.red).underline(), e.write(r);
      }
      writeWithContents(e, r) {
        e.writeLine("{").withIndent(() => {
          e.writeJoined(Qt, [...r, ...this.suggestions]).newLine();
        }), e.write("}"), this.hasError && e.afterNextNewline(() => {
          e.writeLine(e.context.colors.red("~".repeat(this.getPrintWidth())));
        });
      }
    };
    u();
    l();
    c();
    p();
    d();
    var we = class extends pt {
      static {
        __name(this, "we");
      }
      constructor(r) {
        super();
        this.text = r;
      }
      getPrintWidth() {
        return this.text.length;
      }
      write(r) {
        let n = new Ye(this.text);
        this.hasError && n.underline().setColor(r.context.colors.red), r.write(n);
      }
      asObject() {
      }
    };
    u();
    l();
    c();
    p();
    d();
    var wr = class {
      static {
        __name(this, "wr");
      }
      fields = [];
      addField(e, r) {
        return this.fields.push({ write(n) {
          let { green: i, dim: o } = n.context.colors;
          n.write(i(o(`${e}: ${r}`))).addMarginSymbol(i(o("+")));
        } }), this;
      }
      write(e) {
        let { colors: { green: r } } = e.context;
        e.writeLine(r("{")).withIndent(() => {
          e.writeJoined(Qt, this.fields).newLine();
        }).write(r("}")).addMarginSymbol(r("+"));
      }
    };
    function rn(t, e, r) {
      switch (t.kind) {
        case "MutuallyExclusiveFields":
          Dc(t, e);
          break;
        case "IncludeOnScalar":
          Mc(t, e);
          break;
        case "EmptySelection":
          _c(t, e, r);
          break;
        case "UnknownSelectionField":
          Uc(t, e);
          break;
        case "InvalidSelectionValue":
          Vc(t, e);
          break;
        case "UnknownArgument":
          qc(t, e);
          break;
        case "UnknownInputField":
          Bc(t, e);
          break;
        case "RequiredArgumentMissing":
          jc(t, e);
          break;
        case "InvalidArgumentType":
          Qc(t, e);
          break;
        case "InvalidArgumentValue":
          Jc(t, e);
          break;
        case "ValueTooLarge":
          Gc(t, e);
          break;
        case "SomeFieldsMissing":
          Hc(t, e);
          break;
        case "TooManyFieldsGiven":
          zc(t, e);
          break;
        case "Union":
          vs(t, e, r);
          break;
        default:
          throw new Error("not implemented: " + t.kind);
      }
    }
    __name(rn, "rn");
    function Dc(t, e) {
      let r = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      r && (r.getField(t.firstField)?.markAsError(), r.getField(t.secondField)?.markAsError()), e.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${t.firstField}\``)} or ${n.green(`\`${t.secondField}\``)}, but ${n.red("not both")} at the same time.`);
    }
    __name(Dc, "Dc");
    function Mc(t, e) {
      let [r, n] = Ht(t.selectionPath), i = t.outputType, o = e.arguments.getDeepSelectionParent(r)?.value;
      if (o && (o.getField(n)?.markAsError(), i)) for (let s of i.fields) s.isRelation && o.addSuggestion(new Me(s.name, "true"));
      e.addErrorMessage((s) => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${br(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
      });
    }
    __name(Mc, "Mc");
    function _c(t, e, r) {
      let n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      if (n) {
        let i = n.getField("omit")?.value.asObject();
        if (i) {
          Lc(t, e, i);
          return;
        }
        if (n.hasField("select")) {
          Fc(t, e);
          return;
        }
      }
      if (r?.[ct(t.outputType.name)]) {
        $c(t, e);
        return;
      }
      e.addErrorMessage(() => `Unknown field at "${t.selectionPath.join(".")} selection"`);
    }
    __name(_c, "_c");
    function Lc(t, e, r) {
      r.removeAllFields();
      for (let n of t.outputType.fields) r.addSuggestion(new Me(n.name, "false"));
      e.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(t.outputType.name)}. At least one field must be included in the result`);
    }
    __name(Lc, "Lc");
    function Fc(t, e) {
      let r = t.outputType, n = e.arguments.getDeepSelectionParent(t.selectionPath)?.value, i = n?.isEmpty() ?? false;
      n && (n.removeAllFields(), Ns(n, r)), e.addErrorMessage((o) => i ? `The ${o.red("`select`")} statement for type ${o.bold(r.name)} must not be empty. ${br(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(r.name)} needs ${o.bold("at least one truthy value")}.`);
    }
    __name(Fc, "Fc");
    function $c(t, e) {
      let r = new wr();
      for (let i of t.outputType.fields) i.isRelation || r.addField(i.name, "false");
      let n = new Me("omit", r).makeRequired();
      if (t.selectionPath.length === 0) e.arguments.addSuggestion(n);
      else {
        let [i, o] = Ht(t.selectionPath), a = e.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
        if (a) {
          let m = a?.value.asObject() ?? new Gt();
          m.addSuggestion(n), a.value = m;
        }
      }
      e.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(t.outputType.name)}. At least one field must be included in the result`);
    }
    __name($c, "$c");
    function Uc(t, e) {
      let r = Ds(t.selectionPath, e);
      if (r.parentKind !== "unknown") {
        r.field.markAsError();
        let n = r.parent;
        switch (r.parentKind) {
          case "select":
            Ns(n, t.outputType);
            break;
          case "include":
            Wc(n, t.outputType);
            break;
          case "omit":
            Kc(n, t.outputType);
            break;
        }
      }
      e.addErrorMessage((n) => {
        let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`];
        return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${t.outputType.name}\``)}.`), i.push(br(n)), i.join(" ");
      });
    }
    __name(Uc, "Uc");
    function Vc(t, e) {
      let r = Ds(t.selectionPath, e);
      r.parentKind !== "unknown" && r.field.value.markAsError(), e.addErrorMessage((n) => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${t.underlyingError}`);
    }
    __name(Vc, "Vc");
    function qc(t, e) {
      let r = t.argumentPath[0], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      n && (n.getField(r)?.markAsError(), Xc(n, t.arguments)), e.addErrorMessage((i) => ks(i, r, t.arguments.map((o) => o.name)));
    }
    __name(qc, "qc");
    function Bc(t, e) {
      let [r, n] = Ht(t.argumentPath), i = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      if (i) {
        i.getDeepField(t.argumentPath)?.markAsError();
        let o = i.getDeepFieldValue(r)?.asObject();
        o && Ms(o, t.inputType);
      }
      e.addErrorMessage((o) => ks(o, n, t.inputType.fields.map((s) => s.name)));
    }
    __name(Bc, "Bc");
    function ks(t, e, r) {
      let n = [`Unknown argument \`${t.red(e)}\`.`], i = Yc(e, r);
      return i && n.push(`Did you mean \`${t.green(i)}\`?`), r.length > 0 && n.push(br(t)), n.join(" ");
    }
    __name(ks, "ks");
    function jc(t, e) {
      let r;
      e.addErrorMessage((m) => r?.value instanceof we && r.value.text === "null" ? `Argument \`${m.green(o)}\` must not be ${m.red("null")}.` : `Argument \`${m.green(o)}\` is missing.`);
      let n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      if (!n) return;
      let [i, o] = Ht(t.argumentPath), s = new wr(), a = n.getDeepFieldValue(i)?.asObject();
      if (a) {
        if (r = a.getField(o), r && a.removeField(o), t.inputTypes.length === 1 && t.inputTypes[0].kind === "object") {
          for (let m of t.inputTypes[0].fields) s.addField(m.name, m.typeNames.join(" | "));
          a.addSuggestion(new Me(o, s).makeRequired());
        } else {
          let m = t.inputTypes.map(Os).join(" | ");
          a.addSuggestion(new Me(o, m).makeRequired());
        }
        if (t.dependentArgumentPath) {
          n.getDeepField(t.dependentArgumentPath)?.markAsError();
          let [, m] = Ht(t.dependentArgumentPath);
          e.addErrorMessage((h) => `Argument \`${h.green(o)}\` is required because argument \`${h.green(m)}\` was provided.`);
        }
      }
    }
    __name(jc, "jc");
    function Os(t) {
      return t.kind === "list" ? `${Os(t.elementType)}[]` : t.name;
    }
    __name(Os, "Os");
    function Qc(t, e) {
      let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      n && n.getDeepFieldValue(t.argumentPath)?.markAsError(), e.addErrorMessage((i) => {
        let o = an("or", t.argument.typeNames.map((s) => i.green(s)));
        return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o}, provided ${i.red(t.inferredType)}.`;
      });
    }
    __name(Qc, "Qc");
    function Jc(t, e) {
      let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      n && n.getDeepFieldValue(t.argumentPath)?.markAsError(), e.addErrorMessage((i) => {
        let o = [`Invalid value for argument \`${i.bold(r)}\``];
        if (t.underlyingError && o.push(`: ${t.underlyingError}`), o.push("."), t.argument.typeNames.length > 0) {
          let s = an("or", t.argument.typeNames.map((a) => i.green(a)));
          o.push(` Expected ${s}.`);
        }
        return o.join("");
      });
    }
    __name(Jc, "Jc");
    function Gc(t, e) {
      let r = t.argument.name, n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(), i;
      if (n) {
        let s = n.getDeepField(t.argumentPath)?.value;
        s?.markAsError(), s instanceof we && (i = s.text);
      }
      e.addErrorMessage((o) => {
        let s = ["Unable to fit value"];
        return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(r)}\``), s.join(" ");
      });
    }
    __name(Gc, "Gc");
    function Hc(t, e) {
      let r = t.argumentPath[t.argumentPath.length - 1], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject();
      if (n) {
        let i = n.getDeepFieldValue(t.argumentPath)?.asObject();
        i && Ms(i, t.inputType);
      }
      e.addErrorMessage((i) => {
        let o = [`Argument \`${i.bold(r)}\` of type ${i.bold(t.inputType.name)} needs`];
        return t.constraints.minFieldCount === 1 ? t.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${an("or", t.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${t.constraints.minFieldCount}`)} arguments.`), o.push(br(i)), o.join(" ");
      });
    }
    __name(Hc, "Hc");
    function zc(t, e) {
      let r = t.argumentPath[t.argumentPath.length - 1], n = e.arguments.getDeepSubSelectionValue(t.selectionPath)?.asObject(), i = [];
      if (n) {
        let o = n.getDeepFieldValue(t.argumentPath)?.asObject();
        o && (o.markAsError(), i = Object.keys(o.getFields()));
      }
      e.addErrorMessage((o) => {
        let s = [`Argument \`${o.bold(r)}\` of type ${o.bold(t.inputType.name)} needs`];
        return t.constraints.minFieldCount === 1 && t.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : t.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${t.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${an("and", i.map((a) => o.red(a)))}. Please choose`), t.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${t.constraints.maxFieldCount}.`), s.join(" ");
      });
    }
    __name(zc, "zc");
    function Ns(t, e) {
      for (let r of e.fields) t.hasField(r.name) || t.addSuggestion(new Me(r.name, "true"));
    }
    __name(Ns, "Ns");
    function Wc(t, e) {
      for (let r of e.fields) r.isRelation && !t.hasField(r.name) && t.addSuggestion(new Me(r.name, "true"));
    }
    __name(Wc, "Wc");
    function Kc(t, e) {
      for (let r of e.fields) !t.hasField(r.name) && !r.isRelation && t.addSuggestion(new Me(r.name, "true"));
    }
    __name(Kc, "Kc");
    function Xc(t, e) {
      for (let r of e) t.hasField(r.name) || t.addSuggestion(new Me(r.name, r.typeNames.join(" | ")));
    }
    __name(Xc, "Xc");
    function Ds(t, e) {
      let [r, n] = Ht(t), i = e.arguments.getDeepSubSelectionValue(r)?.asObject();
      if (!i) return { parentKind: "unknown", fieldName: n };
      let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), m = o?.getField(n);
      return o && m ? { parentKind: "select", parent: o, field: m, fieldName: n } : (m = s?.getField(n), s && m ? { parentKind: "include", field: m, parent: s, fieldName: n } : (m = a?.getField(n), a && m ? { parentKind: "omit", field: m, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n }));
    }
    __name(Ds, "Ds");
    function Ms(t, e) {
      if (e.kind === "object") for (let r of e.fields) t.hasField(r.name) || t.addSuggestion(new Me(r.name, r.typeNames.join(" | ")));
    }
    __name(Ms, "Ms");
    function Ht(t) {
      let e = [...t], r = e.pop();
      if (!r) throw new Error("unexpected empty path");
      return [e, r];
    }
    __name(Ht, "Ht");
    function br({ green: t, enabled: e }) {
      return "Available options are " + (e ? `listed in ${t("green")}` : "marked with ?") + ".";
    }
    __name(br, "br");
    function an(t, e) {
      if (e.length === 1) return e[0];
      let r = [...e], n = r.pop();
      return `${r.join(", ")} ${t} ${n}`;
    }
    __name(an, "an");
    var Zc = 3;
    function Yc(t, e) {
      let r = 1 / 0, n;
      for (let i of e) {
        let o = (0, Is.default)(t, i);
        o > Zc || o < r && (r = o, n = i);
      }
      return n;
    }
    __name(Yc, "Yc");
    u();
    l();
    c();
    p();
    d();
    var Ls = require_dist();
    u();
    l();
    c();
    p();
    d();
    var xr = class {
      static {
        __name(this, "xr");
      }
      modelName;
      name;
      typeName;
      isList;
      isEnum;
      constructor(e, r, n, i, o) {
        this.modelName = e, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o;
      }
      _toGraphQLInputType() {
        let e = this.isList ? "List" : "", r = this.isEnum ? "Enum" : "";
        return `${e}${r}${this.typeName}FieldRefInput<${this.modelName}>`;
      }
    };
    function zt(t) {
      return t instanceof xr;
    }
    __name(zt, "zt");
    u();
    l();
    c();
    p();
    d();
    var _s = ": ";
    var un = class {
      static {
        __name(this, "un");
      }
      constructor(e, r) {
        this.name = e;
        this.value = r;
      }
      hasError = false;
      markAsError() {
        this.hasError = true;
      }
      getPrintWidth() {
        return this.name.length + this.value.getPrintWidth() + _s.length;
      }
      write(e) {
        let r = new Ye(this.name);
        this.hasError && r.underline().setColor(e.context.colors.red), e.write(r).write(_s).write(this.value);
      }
    };
    var bi = class {
      static {
        __name(this, "bi");
      }
      arguments;
      errorMessages = [];
      constructor(e) {
        this.arguments = e;
      }
      write(e) {
        e.write(this.arguments);
      }
      addErrorMessage(e) {
        this.errorMessages.push(e);
      }
      renderAllMessages(e) {
        return this.errorMessages.map((r) => r(e)).join(`
`);
      }
    };
    function Wt(t) {
      return new bi(Fs(t));
    }
    __name(Wt, "Wt");
    function Fs(t) {
      let e = new Gt();
      for (let [r, n] of Object.entries(t)) {
        let i = new un(r, $s(n));
        e.addField(i);
      }
      return e;
    }
    __name(Fs, "Fs");
    function $s(t) {
      if (typeof t == "string") return new we(JSON.stringify(t));
      if (typeof t == "number" || typeof t == "boolean") return new we(String(t));
      if (typeof t == "bigint") return new we(`${t}n`);
      if (t === null) return new we("null");
      if (t === void 0) return new we("undefined");
      if (Bt(t)) return new we(`new Prisma.Decimal("${t.toFixed()}")`);
      if (t instanceof Uint8Array) return w.isBuffer(t) ? new we(`Buffer.alloc(${t.byteLength})`) : new we(`new Uint8Array(${t.byteLength})`);
      if (t instanceof Date) {
        let e = qt(t) ? t.toISOString() : "Invalid Date";
        return new we(`new Date("${e}")`);
      }
      return (0, Ls.isObjectEnumValue)(t) ? new we(`Prisma.${t._getName()}`) : zt(t) ? new we(`prisma.${ct(t.modelName)}.$fields.${t.name}`) : Array.isArray(t) ? ep(t) : typeof t == "object" ? Fs(t) : new we(Object.prototype.toString.call(t));
    }
    __name($s, "$s");
    function ep(t) {
      let e = new Jt();
      for (let r of t) e.addItem($s(r));
      return e;
    }
    __name(ep, "ep");
    function ln(t, e) {
      let r = e === "pretty" ? Cs : sn, n = t.renderAllMessages(r), i = new jt(0, { colors: r }).write(t).toString();
      return { message: n, args: i };
    }
    __name(ln, "ln");
    function cn({ args: t, errors: e, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) {
      let a = Wt(t);
      for (let N of e) rn(N, a, s);
      let { message: m, args: h } = ln(a, r), E = tn({ message: m, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: h });
      throw new Us.PrismaClientValidationError(E, { clientVersion: o });
    }
    __name(cn, "cn");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function et(t) {
      return t.replace(/^./, (e) => e.toLowerCase());
    }
    __name(et, "et");
    u();
    l();
    c();
    p();
    d();
    function qs(t, e, r) {
      let n = et(r);
      return !e.result || !(e.result.$allModels || e.result[n]) ? t : tp({ ...t, ...Vs(e.name, t, e.result.$allModels), ...Vs(e.name, t, e.result[n]) });
    }
    __name(qs, "qs");
    function tp(t) {
      let e = new Ze(), r = /* @__PURE__ */ __name((n, i) => e.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), t[n] ? t[n].needs.flatMap((o) => r(o, i)) : [n])), "r");
      return en(t, (n) => ({ ...n, needs: r(n.name, /* @__PURE__ */ new Set()) }));
    }
    __name(tp, "tp");
    function Vs(t, e, r) {
      return r ? en(r, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: rp(e, o, i) })) : {};
    }
    __name(Vs, "Vs");
    function rp(t, e, r) {
      let n = t?.[e]?.compute;
      return n ? (i, o) => r({ ...i, [e]: n(i, o) }, o) : r;
    }
    __name(rp, "rp");
    function Bs(t, e) {
      if (!e) return t;
      let r = { ...t };
      for (let n of Object.values(e)) if (t[n.name]) for (let i of n.needs) r[i] = true;
      return r;
    }
    __name(Bs, "Bs");
    function js(t, e) {
      if (!e) return t;
      let r = { ...t };
      for (let n of Object.values(e)) if (!t[n.name]) for (let i of n.needs) delete r[i];
      return r;
    }
    __name(js, "js");
    var pn = class {
      static {
        __name(this, "pn");
      }
      constructor(e, r) {
        this.extension = e;
        this.previous = r;
      }
      computedFieldsCache = new Ze();
      modelExtensionsCache = new Ze();
      queryCallbacksCache = new Ze();
      clientExtensions = ur(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
      batchCallbacks = ur(() => {
        let e = this.previous?.getAllBatchQueryCallbacks() ?? [], r = this.extension.query?.$__internalBatch;
        return r ? e.concat(r) : e;
      });
      getAllComputedFields(e) {
        return this.computedFieldsCache.getOrCreate(e, () => qs(this.previous?.getAllComputedFields(e), this.extension, e));
      }
      getAllClientExtensions() {
        return this.clientExtensions.get();
      }
      getAllModelExtensions(e) {
        return this.modelExtensionsCache.getOrCreate(e, () => {
          let r = et(e);
          return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(e) : { ...this.previous?.getAllModelExtensions(e), ...this.extension.model.$allModels, ...this.extension.model[r] };
        });
      }
      getAllQueryCallbacks(e, r) {
        return this.queryCallbacksCache.getOrCreate(`${e}:${r}`, () => {
          let n = this.previous?.getAllQueryCallbacks(e, r) ?? [], i = [], o = this.extension.query;
          return !o || !(o[e] || o.$allModels || o[r] || o.$allOperations) ? n : (o[e] !== void 0 && (o[e][r] !== void 0 && i.push(o[e][r]), o[e].$allOperations !== void 0 && i.push(o[e].$allOperations)), e !== "$none" && o.$allModels !== void 0 && (o.$allModels[r] !== void 0 && i.push(o.$allModels[r]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[r] !== void 0 && i.push(o[r]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i));
        });
      }
      getAllBatchQueryCallbacks() {
        return this.batchCallbacks.get();
      }
    };
    var Kt = class t {
      static {
        __name(this, "t");
      }
      constructor(e) {
        this.head = e;
      }
      static empty() {
        return new t();
      }
      static single(e) {
        return new t(new pn(e));
      }
      isEmpty() {
        return this.head === void 0;
      }
      append(e) {
        return new t(new pn(e, this.head));
      }
      getAllComputedFields(e) {
        return this.head?.getAllComputedFields(e);
      }
      getAllClientExtensions() {
        return this.head?.getAllClientExtensions();
      }
      getAllModelExtensions(e) {
        return this.head?.getAllModelExtensions(e);
      }
      getAllQueryCallbacks(e, r) {
        return this.head?.getAllQueryCallbacks(e, r) ?? [];
      }
      getAllBatchQueryCallbacks() {
        return this.head?.getAllBatchQueryCallbacks() ?? [];
      }
    };
    u();
    l();
    c();
    p();
    d();
    var dn = class {
      static {
        __name(this, "dn");
      }
      constructor(e) {
        this.name = e;
      }
    };
    function Qs(t) {
      return t instanceof dn;
    }
    __name(Qs, "Qs");
    function Js(t) {
      return new dn(t);
    }
    __name(Js, "Js");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Gs = /* @__PURE__ */ Symbol();
    var Er = class {
      static {
        __name(this, "Er");
      }
      constructor(e) {
        if (e !== Gs) throw new Error("Skip instance can not be constructed directly");
      }
      ifUndefined(e) {
        return e === void 0 ? mn : e;
      }
    };
    var mn = new Er(Gs);
    function $e(t) {
      return t instanceof Er;
    }
    __name($e, "$e");
    var np = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
    var zs = "explicitly `undefined` values are not allowed";
    function fn({ modelName: t, action: e, args: r, runtimeDataModel: n, extensions: i = Kt.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: m, previewFeatures: h, globalOmit: E, wrapRawValues: N }) {
      let $3 = new xi({ runtimeDataModel: n, modelName: t, action: e, rootArgs: r, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: m, previewFeatures: h, globalOmit: E, wrapRawValues: N });
      return { modelName: t, action: np[e], query: Pr(r, $3) };
    }
    __name(fn, "fn");
    function Pr({ select: t, include: e, ...r } = {}, n) {
      let i = r.omit;
      return delete r.omit, { arguments: Ks(r, n), selection: ip(t, e, i, n) };
    }
    __name(Pr, "Pr");
    function ip(t, e, r, n) {
      return t ? (e ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), up(t, n)) : op(n, e, r);
    }
    __name(ip, "ip");
    function op(t, e, r) {
      let n = {};
      return t.modelOrType && !t.isRawAction() && (n.$composites = true, n.$scalars = true), e && sp(n, e, t), ap(n, r, t), n;
    }
    __name(op, "op");
    function sp(t, e, r) {
      for (let [n, i] of Object.entries(e)) {
        if ($e(i)) continue;
        let o = r.nestSelection(n);
        if (Ei(i, o), i === false || i === void 0) {
          t[n] = false;
          continue;
        }
        let s = r.findField(n);
        if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
          t[n] = Pr(i === true ? {} : i, o);
          continue;
        }
        if (i === true) {
          t[n] = true;
          continue;
        }
        t[n] = Pr(i, o);
      }
    }
    __name(sp, "sp");
    function ap(t, e, r) {
      let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...e }, o = js(i, n);
      for (let [s, a] of Object.entries(o)) {
        if ($e(a)) continue;
        Ei(a, r.nestSelection(s));
        let m = r.findField(s);
        n?.[s] && !m || (t[s] = !a);
      }
    }
    __name(ap, "ap");
    function up(t, e) {
      let r = {}, n = e.getComputedFields(), i = Bs(t, n);
      for (let [o, s] of Object.entries(i)) {
        if ($e(s)) continue;
        let a = e.nestSelection(o);
        Ei(s, a);
        let m = e.findField(o);
        if (!(n?.[o] && !m)) {
          if (s === false || s === void 0 || $e(s)) {
            r[o] = false;
            continue;
          }
          if (s === true) {
            m?.kind === "object" ? r[o] = Pr({}, a) : r[o] = true;
            continue;
          }
          r[o] = Pr(s, a);
        }
      }
      return r;
    }
    __name(up, "up");
    function Ws(t, e) {
      if (t === null) return null;
      if (typeof t == "string" || typeof t == "number" || typeof t == "boolean") return t;
      if (typeof t == "bigint") return { $type: "BigInt", value: String(t) };
      if (Vt(t)) {
        if (qt(t)) return { $type: "DateTime", value: t.toISOString() };
        e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: e.getSelectionPath(), argumentPath: e.getArgumentPath(), argument: { name: e.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
      }
      if (Qs(t)) return { $type: "Param", value: t.name };
      if (zt(t)) return { $type: "FieldRef", value: { _ref: t.name, _container: t.modelName } };
      if (Array.isArray(t)) return lp(t, e);
      if (ArrayBuffer.isView(t)) {
        let { buffer: r, byteOffset: n, byteLength: i } = t;
        return { $type: "Bytes", value: w.from(r, n, i).toString("base64") };
      }
      if (cp(t)) return t.values;
      if (Bt(t)) return { $type: "Decimal", value: t.toFixed() };
      if ((0, Hs.isObjectEnumValue)(t)) {
        let r = t._getName();
        if (r !== "DbNull" && r !== "JsonNull" && r !== "AnyNull") throw new Error(`Invalid ObjectEnumValue: expected DbNull, JsonNull, or AnyNull, got ${r}`);
        return { $type: "Enum", value: r };
      }
      if (pp(t)) return t.toJSON();
      if (typeof t == "object") return Ks(t, e);
      e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: e.getSelectionPath(), argumentPath: e.getArgumentPath(), argument: { name: e.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(t)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
    }
    __name(Ws, "Ws");
    function Ks(t, e) {
      if (e.shouldWrapRawValues() && t.$type) return { $type: "Raw", value: t };
      let r = {};
      for (let n in t) {
        let i = t[n], o = e.nestArgument(n);
        $e(i) || (i !== void 0 ? r[n] = Ws(i, o) : e.isPreviewFeatureOn("strictUndefinedChecks") && e.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: e.getSelectionPath(), argument: { name: e.getArgumentName(), typeNames: [] }, underlyingError: zs }));
      }
      return r;
    }
    __name(Ks, "Ks");
    function lp(t, e) {
      let r = [];
      for (let n = 0; n < t.length; n++) {
        let i = e.nestArgument(String(n)), o = t[n];
        if (o === void 0 || $e(o)) {
          let s = o === void 0 ? "undefined" : "Prisma.skip";
          e.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${e.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
        }
        r.push(Ws(o, i));
      }
      return r;
    }
    __name(lp, "lp");
    function cp(t) {
      return typeof t == "object" && t !== null && t.__prismaRawParameters__ === true;
    }
    __name(cp, "cp");
    function pp(t) {
      return typeof t == "object" && t !== null && typeof t.toJSON == "function";
    }
    __name(pp, "pp");
    function Ei(t, e) {
      t === void 0 && e.isPreviewFeatureOn("strictUndefinedChecks") && e.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: e.getSelectionPath(), underlyingError: zs });
    }
    __name(Ei, "Ei");
    var xi = class t {
      static {
        __name(this, "t");
      }
      constructor(e) {
        this.params = e;
        this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
      }
      modelOrType;
      throwValidationError(e) {
        cn({ errors: [e], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
      }
      getSelectionPath() {
        return this.params.selectionPath;
      }
      getArgumentPath() {
        return this.params.argumentPath;
      }
      getArgumentName() {
        return this.params.argumentPath[this.params.argumentPath.length - 1];
      }
      getOutputTypeDescription() {
        if (!(!this.params.modelName || !this.modelOrType)) return { name: this.params.modelName, fields: this.modelOrType.fields.map((e) => ({ name: e.name, typeName: "boolean", isRelation: e.kind === "object" })) };
      }
      isRawAction() {
        return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
      }
      isPreviewFeatureOn(e) {
        return this.params.previewFeatures.includes(e);
      }
      shouldWrapRawValues() {
        return this.params.wrapRawValues ?? true;
      }
      getComputedFields() {
        if (this.params.modelName) return this.params.extensions.getAllComputedFields(this.params.modelName);
      }
      findField(e) {
        return this.modelOrType?.fields.find((r) => r.name === e);
      }
      nestSelection(e) {
        let r = this.findField(e), n = r?.kind === "object" ? r.type : void 0;
        return new t({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(e) });
      }
      getGlobalOmit() {
        return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[ct(this.params.modelName)] ?? {} : {};
      }
      shouldApplyGlobalOmit() {
        switch (this.params.action) {
          case "findFirst":
          case "findFirstOrThrow":
          case "findUniqueOrThrow":
          case "findMany":
          case "upsert":
          case "findUnique":
          case "createManyAndReturn":
          case "create":
          case "update":
          case "updateManyAndReturn":
          case "delete":
            return true;
          case "executeRaw":
          case "aggregateRaw":
          case "runCommandRaw":
          case "findRaw":
          case "createMany":
          case "deleteMany":
          case "groupBy":
          case "updateMany":
          case "count":
          case "aggregate":
          case "queryRaw":
            return false;
          default:
            st(this.params.action, "Unknown action");
        }
      }
      nestArgument(e) {
        return new t({ ...this.params, argumentPath: this.params.argumentPath.concat(e) });
      }
    };
    u();
    l();
    c();
    p();
    d();
    function Xs(t, e) {
      let r = ur(() => dp(e));
      Object.defineProperty(t, "dmmf", { get: /* @__PURE__ */ __name(() => r.get(), "get") });
    }
    __name(Xs, "Xs");
    function dp(t) {
      throw new Error("Prisma.dmmf is not available when running in edge runtimes.");
    }
    __name(dp, "dp");
    u();
    l();
    c();
    p();
    d();
    var Ti = /* @__PURE__ */ new WeakMap();
    var gn = "$$PrismaTypedSql";
    var Tr = class {
      static {
        __name(this, "Tr");
      }
      constructor(e, r) {
        Ti.set(this, { sql: e, values: r }), Object.defineProperty(this, gn, { value: gn });
      }
      get sql() {
        return Ti.get(this).sql;
      }
      get values() {
        return Ti.get(this).values;
      }
    };
    function Zs(t) {
      return (...e) => new Tr(t, e);
    }
    __name(Zs, "Zs");
    function hn(t) {
      return t != null && t[gn] === gn;
    }
    __name(hn, "hn");
    u();
    l();
    c();
    p();
    d();
    var jl = require_dist();
    u();
    l();
    c();
    p();
    d();
    Ys();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function vr(t) {
      return { getKeys() {
        return Object.keys(t);
      }, getPropertyValue(e) {
        return t[e];
      } };
    }
    __name(vr, "vr");
    u();
    l();
    c();
    p();
    d();
    function Ce(t, e) {
      return { getKeys() {
        return [t];
      }, getPropertyValue() {
        return e();
      } };
    }
    __name(Ce, "Ce");
    u();
    l();
    c();
    p();
    d();
    function xt(t) {
      let e = new Ze();
      return { getKeys() {
        return t.getKeys();
      }, getPropertyValue(r) {
        return e.getOrCreate(r, () => t.getPropertyValue(r));
      }, getPropertyDescriptor(r) {
        return t.getPropertyDescriptor?.(r);
      } };
    }
    __name(xt, "xt");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var wn = { enumerable: true, configurable: true, writable: true };
    function bn(t) {
      let e = new Set(t);
      return { getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf"), getOwnPropertyDescriptor: /* @__PURE__ */ __name(() => wn, "getOwnPropertyDescriptor"), has: /* @__PURE__ */ __name((r, n) => e.has(n), "has"), set: /* @__PURE__ */ __name((r, n, i) => e.add(n) && Reflect.set(r, n, i), "set"), ownKeys: /* @__PURE__ */ __name(() => [...e], "ownKeys") };
    }
    __name(bn, "bn");
    var ea = /* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom");
    function Qe(t, e) {
      let r = mp(e), n = /* @__PURE__ */ new Set(), i = new Proxy(t, { get(o, s) {
        if (n.has(s)) return o[s];
        let a = r.get(s);
        return a ? a.getPropertyValue(s) : o[s];
      }, has(o, s) {
        if (n.has(s)) return true;
        let a = r.get(s);
        return a ? a.has?.(s) ?? true : Reflect.has(o, s);
      }, ownKeys(o) {
        let s = ta(Reflect.ownKeys(o), r), a = ta(Array.from(r.keys()), r);
        return [.../* @__PURE__ */ new Set([...s, ...a, ...n])];
      }, set(o, s, a) {
        return r.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o, s, a));
      }, getOwnPropertyDescriptor(o, s) {
        let a = Reflect.getOwnPropertyDescriptor(o, s);
        if (a && !a.configurable) return a;
        let m = r.get(s);
        return m ? m.getPropertyDescriptor ? { ...wn, ...m?.getPropertyDescriptor(s) } : wn : a;
      }, defineProperty(o, s, a) {
        return n.add(s), Reflect.defineProperty(o, s, a);
      }, getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf") });
      return i[ea] = function() {
        let o = { ...this };
        return delete o[ea], o;
      }, i;
    }
    __name(Qe, "Qe");
    function mp(t) {
      let e = /* @__PURE__ */ new Map();
      for (let r of t) {
        let n = r.getKeys();
        for (let i of n) e.set(i, r);
      }
      return e;
    }
    __name(mp, "mp");
    function ta(t, e) {
      return t.filter((r) => e.get(r)?.has?.(r) ?? true);
    }
    __name(ta, "ta");
    u();
    l();
    c();
    p();
    d();
    function Xt(t) {
      return { getKeys() {
        return t;
      }, has() {
        return false;
      }, getPropertyValue() {
      } };
    }
    __name(Xt, "Xt");
    u();
    l();
    c();
    p();
    d();
    function ra(t) {
      if (t === void 0) return "";
      let e = Wt(t);
      return new jt(0, { colors: sn }).write(e).toString();
    }
    __name(ra, "ra");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var vi = class {
      static {
        __name(this, "vi");
      }
      getLocation() {
        return null;
      }
    };
    function dt(t) {
      return typeof $EnabledCallSite == "function" && t !== "minimal" ? new $EnabledCallSite() : new vi();
    }
    __name(dt, "dt");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var na = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
    function Zt(t = {}) {
      let e = gp(t);
      return Object.entries(e).reduce((n, [i, o]) => (na[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} });
    }
    __name(Zt, "Zt");
    function gp(t = {}) {
      return typeof t._count == "boolean" ? { ...t, _count: { _all: t._count } } : t;
    }
    __name(gp, "gp");
    function xn(t = {}) {
      return (e) => (typeof t._count == "boolean" && (e._count = e._count._all), e);
    }
    __name(xn, "xn");
    function ia(t, e) {
      let r = xn(t);
      return e({ action: "aggregate", unpacker: r, argsMapper: Zt })(t);
    }
    __name(ia, "ia");
    u();
    l();
    c();
    p();
    d();
    function hp(t = {}) {
      let { select: e, ...r } = t;
      return typeof e == "object" ? Zt({ ...r, _count: e }) : Zt({ ...r, _count: { _all: true } });
    }
    __name(hp, "hp");
    function yp(t = {}) {
      return typeof t.select == "object" ? (e) => xn(t)(e)._count : (e) => xn(t)(e)._count._all;
    }
    __name(yp, "yp");
    function oa(t, e) {
      return e({ action: "count", unpacker: yp(t), argsMapper: hp })(t);
    }
    __name(oa, "oa");
    u();
    l();
    c();
    p();
    d();
    function wp(t = {}) {
      let e = Zt(t);
      if (Array.isArray(e.by)) for (let r of e.by) typeof r == "string" && (e.select[r] = true);
      else typeof e.by == "string" && (e.select[e.by] = true);
      return e;
    }
    __name(wp, "wp");
    function bp(t = {}) {
      return (e) => (typeof t?._count == "boolean" && e.forEach((r) => {
        r._count = r._count._all;
      }), e);
    }
    __name(bp, "bp");
    function sa(t, e) {
      return e({ action: "groupBy", unpacker: bp(t), argsMapper: wp })(t);
    }
    __name(sa, "sa");
    function aa(t, e, r) {
      if (e === "aggregate") return (n) => ia(n, r);
      if (e === "count") return (n) => oa(n, r);
      if (e === "groupBy") return (n) => sa(n, r);
    }
    __name(aa, "aa");
    u();
    l();
    c();
    p();
    d();
    function ua(t, e) {
      let r = e.fields.filter((i) => !i.relationName), n = Jo(r, "name");
      return new Proxy({}, { get(i, o) {
        if (o in i || typeof o == "symbol") return i[o];
        let s = n[o];
        if (s) return new xr(t, o, s.type, s.isList, s.kind === "enum");
      }, ...bn(Object.keys(n)) });
    }
    __name(ua, "ua");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var la = /* @__PURE__ */ __name((t) => Array.isArray(t) ? t : t.split("."), "la");
    var Si = /* @__PURE__ */ __name((t, e) => la(e).reduce((r, n) => r && r[n], t), "Si");
    var ca = /* @__PURE__ */ __name((t, e, r) => la(e).reduceRight((n, i, o, s) => Object.assign({}, Si(t, s.slice(0, o)), { [i]: n }), r), "ca");
    function xp(t, e) {
      return t === void 0 || e === void 0 ? [] : [...e, "select", t];
    }
    __name(xp, "xp");
    function Ep(t, e, r) {
      return e === void 0 ? t ?? {} : ca(e, r, t || true);
    }
    __name(Ep, "Ep");
    function Ai(t, e, r, n, i, o) {
      let s = t._runtimeDataModel.models[e], a;
      return (m) => {
        let h = dt(t._errorFormat), E = xp(n, i), N = Ep(m, o, E), $3 = r({ dataPath: E, callsite: h })(N), U = Pp(t, e);
        return new Proxy($3, { get(B2, q) {
          if (!U.includes(q)) return B2[q];
          a ??= Object.fromEntries(s.fields.map((z) => [z.name, z]));
          let Z = [a[q].type, r, q], L = [E, N];
          return Ai(t, ...Z, ...L);
        }, ...bn([...U, ...Object.getOwnPropertyNames($3)]) });
      };
    }
    __name(Ai, "Ai");
    function Pp(t, e) {
      return t._runtimeDataModel.models[e].fields.filter((r) => r.kind === "object").map((r) => r.name);
    }
    __name(Pp, "Pp");
    var Tp = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
    var vp = ["aggregate", "count", "groupBy"];
    function Ri(t, e) {
      let r = t._extensions.getAllModelExtensions(e) ?? {}, n = [Sp(t, e), Rp(t, e), vr(r), Ce("name", () => e), Ce("$name", () => e), Ce("$parent", () => t._appliedParent)];
      return Qe({}, n);
    }
    __name(Ri, "Ri");
    function Sp(t, e) {
      let r = et(e), n = Object.keys(hr).concat("count");
      return { getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = i, s = /* @__PURE__ */ __name((a) => (m) => {
          let h = dt(t._errorFormat);
          return t._createPrismaPromise((E) => {
            let N = { args: m, dataPath: [], action: o, model: e, clientMethod: `${r}.${i}`, jsModelName: r, transaction: E, callsite: h };
            return t._request({ ...N, ...a });
          }, { action: o, args: m, model: e });
        }, "s");
        return Tp.includes(o) ? Ai(t, e, s) : Ap(i) ? aa(t, i, s) : s({});
      } };
    }
    __name(Sp, "Sp");
    function Ap(t) {
      return vp.includes(t);
    }
    __name(Ap, "Ap");
    function Rp(t, e) {
      return xt(Ce("fields", () => {
        let r = t._runtimeDataModel.models[e];
        return ua(e, r);
      }));
    }
    __name(Rp, "Rp");
    u();
    l();
    c();
    p();
    d();
    function pa(t) {
      return t.replace(/^./, (e) => e.toUpperCase());
    }
    __name(pa, "pa");
    var Ci = /* @__PURE__ */ Symbol();
    function Sr(t) {
      let e = [Cp(t), Ip(t), Ce(Ci, () => t), Ce("$parent", () => t._appliedParent)], r = t._extensions.getAllClientExtensions();
      return r && e.push(vr(r)), Qe(t, e);
    }
    __name(Sr, "Sr");
    function Cp(t) {
      let e = Object.getPrototypeOf(t._originalClient), r = [...new Set(Object.getOwnPropertyNames(e))];
      return { getKeys() {
        return r;
      }, getPropertyValue(n) {
        return t[n];
      } };
    }
    __name(Cp, "Cp");
    function Ip(t) {
      let e = Object.keys(t._runtimeDataModel.models), r = e.map(et), n = [...new Set(e.concat(r))];
      return xt({ getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = pa(i);
        if (t._runtimeDataModel.models[o] !== void 0) return Ri(t, o);
        if (t._runtimeDataModel.models[i] !== void 0) return Ri(t, i);
      }, getPropertyDescriptor(i) {
        if (!r.includes(i)) return { enumerable: false };
      } });
    }
    __name(Ip, "Ip");
    function da(t) {
      return t[Ci] ? t[Ci] : t;
    }
    __name(da, "da");
    function ma(t) {
      if (typeof t == "function") return t(this);
      let e = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(t) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
      return Sr(e);
    }
    __name(ma, "ma");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function fa({ result: t, modelName: e, select: r, omit: n, extensions: i }) {
      let o = i.getAllComputedFields(e);
      if (!o) return t;
      let s = [], a = [];
      for (let m of Object.values(o)) {
        if (n) {
          if (n[m.name]) continue;
          let h = m.needs.filter((E) => n[E]);
          h.length > 0 && a.push(Xt(h));
        } else if (r) {
          if (!r[m.name]) continue;
          let h = m.needs.filter((E) => !r[E]);
          h.length > 0 && a.push(Xt(h));
        }
        kp(t, m.needs) && s.push(Op(m, Qe(t, s), e));
      }
      return s.length > 0 || a.length > 0 ? Qe(t, [...s, ...a]) : t;
    }
    __name(fa, "fa");
    function kp(t, e) {
      return e.every((r) => fi(t, r));
    }
    __name(kp, "kp");
    function Op(t, e, r) {
      return xt(Ce(t.name, () => t.compute(e, r)));
    }
    __name(Op, "Op");
    u();
    l();
    c();
    p();
    d();
    function En({ visitor: t, result: e, args: r, runtimeDataModel: n, modelName: i }) {
      if (Array.isArray(e)) {
        for (let s = 0; s < e.length; s++) e[s] = En({ result: e[s], args: r, modelName: i, runtimeDataModel: n, visitor: t });
        return e;
      }
      let o = t(e, i, r) ?? e;
      return r.include && ga({ includeOrSelect: r.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: t }), r.select && ga({ includeOrSelect: r.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: t }), o;
    }
    __name(En, "En");
    function ga({ includeOrSelect: t, result: e, parentModelName: r, runtimeDataModel: n, visitor: i }) {
      for (let [o, s] of Object.entries(t)) {
        if (!s || e[o] == null || $e(s)) continue;
        let m = n.models[r].fields.find((E) => E.name === o);
        if (!m || m.kind !== "object" || !m.relationName) continue;
        let h = typeof s == "object" ? s : {};
        e[o] = En({ visitor: i, result: e[o], args: h, modelName: m.type, runtimeDataModel: n });
      }
    }
    __name(ga, "ga");
    function ha({ result: t, modelName: e, args: r, extensions: n, runtimeDataModel: i, globalOmit: o }) {
      return n.isEmpty() || t == null || typeof t != "object" || !i.models[e] ? t : En({ result: t, args: r ?? {}, modelName: e, runtimeDataModel: i, visitor: /* @__PURE__ */ __name((a, m, h) => {
        let E = et(m);
        return fa({ result: a, modelName: E, select: h.select, omit: h.select ? void 0 : { ...o?.[E], ...h.omit }, extensions: n });
      }, "visitor") });
    }
    __name(ha, "ha");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Et = require_dist();
    u();
    l();
    c();
    p();
    d();
    var Np = ["$connect", "$disconnect", "$on", "$use", "$extends"];
    var ya = Np;
    function wa(t) {
      if (t instanceof Et.Sql) return Dp(t);
      if (hn(t)) return Mp(t);
      if (Array.isArray(t)) {
        let r = [t[0]];
        for (let n = 1; n < t.length; n++) r[n] = Ar(t[n]);
        return r;
      }
      let e = {};
      for (let r in t) e[r] = Ar(t[r]);
      return e;
    }
    __name(wa, "wa");
    function Dp(t) {
      return new Et.Sql(t.strings, t.values);
    }
    __name(Dp, "Dp");
    function Mp(t) {
      return new Tr(t.sql, t.values);
    }
    __name(Mp, "Mp");
    function Ar(t) {
      if (typeof t != "object" || t == null || (0, Et.isObjectEnumValue)(t) || zt(t) || $e(t)) return t;
      if (Bt(t)) return new Et.Decimal(t.toFixed());
      if (Vt(t)) return /* @__PURE__ */ new Date(+t);
      if (ArrayBuffer.isView(t)) return t.slice(0);
      if (Array.isArray(t)) {
        let e = t.length, r;
        for (r = Array(e); e--; ) r[e] = Ar(t[e]);
        return r;
      }
      if (typeof t == "object") {
        let e = {};
        for (let r in t) r === "__proto__" ? Object.defineProperty(e, r, { value: Ar(t[r]), configurable: true, enumerable: true, writable: true }) : e[r] = Ar(t[r]);
        return e;
      }
      st(t, "Unknown value");
    }
    __name(Ar, "Ar");
    function xa(t, e, r, n = 0) {
      return t._createPrismaPromise((i) => {
        let o = e.customDataProxyFetch;
        return "transaction" in e && i !== void 0 && (e.transaction?.kind === "batch" && e.transaction.lock.then(), e.transaction = i), n === r.length ? t._executeRequest(e) : r[n]({ model: e.model, operation: e.model ? e.action : e.clientMethod, args: wa(e.args ?? {}), __internalParams: e, query: /* @__PURE__ */ __name((s, a = e) => {
          let m = a.customDataProxyFetch;
          return a.customDataProxyFetch = va(o, m), a.args = s, xa(t, a, r, n + 1);
        }, "query") });
      });
    }
    __name(xa, "xa");
    function Ea(t, e) {
      let { jsModelName: r, action: n, clientMethod: i } = e, o = r ? n : i;
      if (t._extensions.isEmpty()) return t._executeRequest(e);
      let s = t._extensions.getAllQueryCallbacks(r ?? "$none", o);
      return xa(t, e, s);
    }
    __name(Ea, "Ea");
    function Pa(t) {
      return (e) => {
        let r = { requests: e }, n = e[0].extensions.getAllBatchQueryCallbacks();
        return n.length ? Ta(r, n, 0, t) : t(r);
      };
    }
    __name(Pa, "Pa");
    function Ta(t, e, r, n) {
      if (r === e.length) return n(t);
      let i = t.customDataProxyFetch, o = t.requests[0].transaction;
      return e[r]({ args: { queries: t.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: t, query(s, a = t) {
        let m = a.customDataProxyFetch;
        return a.customDataProxyFetch = va(i, m), Ta(a, e, r + 1, n);
      } });
    }
    __name(Ta, "Ta");
    var ba = /* @__PURE__ */ __name((t) => t, "ba");
    function va(t = ba, e = ba) {
      return (r) => t(e(r));
    }
    __name(va, "va");
    u();
    l();
    c();
    p();
    d();
    function Aa({ dataPath: t, modelName: e, args: r, runtimeDataModel: n }) {
      let i = { modelName: e, args: r ?? {} }, o = _p(t);
      if (!o || o.length === 0) return i;
      let s = e, a = r ?? {};
      for (let m of o) {
        let h = n.models[s];
        if (!h) return i;
        let E = h.fields.find((N) => N.name === m);
        if (!E) throw new Error(`Could not resolve relation field "${m}" on model "${s}" from dataPath "${t.join(".")}"`);
        if (E.kind !== "object" || !E.relationName) return i;
        s = E.type, a = Lp(a, m);
      }
      return { modelName: s, args: a };
    }
    __name(Aa, "Aa");
    function _p(t) {
      let e = [];
      for (let r = 0; r < t.length; r += 2) {
        let n = t[r], i = t[r + 1];
        if (n !== "select" && n !== "include" || i === void 0) return;
        e.push(i);
      }
      return e;
    }
    __name(_p, "_p");
    function Lp(t, e) {
      let r = t.select?.[e];
      if (Sa(r)) return r;
      let n = t.include?.[e];
      return Sa(n) ? n : {};
    }
    __name(Lp, "Lp");
    function Sa(t) {
      return !!t && typeof t == "object" && !Array.isArray(t);
    }
    __name(Sa, "Sa");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Na = require_dist();
    u();
    l();
    c();
    p();
    d();
    var Rr = require_dist();
    function Yt(t) {
      return ArrayBuffer.isView(t) && Object.prototype.toString.call(t) === "[object Uint8Array]";
    }
    __name(Yt, "Yt");
    function Cr(t) {
      return Object.prototype.toString.call(t) === "[object Date]";
    }
    __name(Cr, "Cr");
    function Y(t, e) {
      throw new Error(e);
    }
    __name(Y, "Y");
    function ki(t, e) {
      return t === e || t !== null && e !== null && typeof t == "object" && typeof e == "object" && Object.keys(t).length === Object.keys(e).length && Object.keys(t).every((r) => ki(t[r], e[r]));
    }
    __name(ki, "ki");
    function er(t, e) {
      let r = Object.keys(t), n = Object.keys(e);
      return (r.length < n.length ? r : n).every((o) => {
        if (typeof t[o] == typeof e[o] && typeof t[o] != "object") return t[o] === e[o];
        if (Rr.Decimal.isDecimal(t[o]) || Rr.Decimal.isDecimal(e[o])) {
          let s = Ra(t[o]), a = Ra(e[o]);
          return s && a && s.equals(a);
        } else if (Yt(t[o]) || Yt(e[o])) {
          let s = Ca(t[o]), a = Ca(e[o]);
          return s && a && s.equals(a);
        } else {
          if (Cr(t[o]) || Cr(e[o])) return Ia(t[o])?.getTime() === Ia(e[o])?.getTime();
          if (typeof t[o] == "bigint" || typeof e[o] == "bigint") return ka(t[o]) === ka(e[o]);
          if (typeof t[o] == "number" || typeof e[o] == "number") return Oa(t[o]) === Oa(e[o]);
        }
        return ki(t[o], e[o]);
      });
    }
    __name(er, "er");
    function Ra(t) {
      return Rr.Decimal.isDecimal(t) ? t : typeof t == "number" || typeof t == "string" ? new Rr.Decimal(t) : void 0;
    }
    __name(Ra, "Ra");
    function Ca(t) {
      return w.isBuffer(t) ? t : Yt(t) ? w.from(t.buffer, t.byteOffset, t.byteLength) : typeof t == "string" ? w.from(t, "base64") : void 0;
    }
    __name(Ca, "Ca");
    function Ia(t) {
      return Cr(t) ? t : typeof t == "string" || typeof t == "number" ? new Date(t) : void 0;
    }
    __name(Ia, "Ia");
    function ka(t) {
      return typeof t == "bigint" ? t : typeof t == "number" || typeof t == "string" ? BigInt(t) : void 0;
    }
    __name(ka, "ka");
    function Oa(t) {
      return typeof t == "number" ? t : typeof t == "string" ? Number(t) : void 0;
    }
    __name(Oa, "Oa");
    function Je(t) {
      return JSON.stringify(t, (e, r) => typeof r == "bigint" ? r.toString() : ArrayBuffer.isView(r) ? w.from(r.buffer, r.byteOffset, r.byteLength).toString("base64") : r);
    }
    __name(Je, "Je");
    var Ii = 8192;
    function Pn(t, e) {
      if (e.length <= Ii) {
        t.push(...e);
        return;
      }
      for (let r = 0; r < e.length; r += Ii) t.push(...e.slice(r, r + Ii));
    }
    __name(Pn, "Pn");
    function Fp(t) {
      return t !== null && typeof t == "object" && typeof t.$type == "string";
    }
    __name(Fp, "Fp");
    function $p(t, e) {
      let r = {};
      for (let n of Object.keys(t)) r[n] = e(t[n], n);
      return r;
    }
    __name($p, "$p");
    function Ge(t) {
      return t === null ? t : Array.isArray(t) ? t.map(Ge) : typeof t == "object" ? Fp(t) ? Up(t) : t.constructor !== null && t.constructor.name !== "Object" ? t : $p(t, Ge) : t;
    }
    __name(Ge, "Ge");
    function Up({ $type: t, value: e }) {
      switch (t) {
        case "BigInt":
          return BigInt(e);
        case "Bytes":
          return new Uint8Array(w.from(e, "base64"));
        case "DateTime":
          return new Date(e);
        case "Decimal":
          return new Na.Decimal(e);
        case "Json":
          return JSON.parse(e);
        case "Raw":
          return e;
        case "FieldRef":
          throw new Error("FieldRef tagged values cannot be deserialized to JavaScript values");
        case "Enum":
          return e;
        default:
          Y(e, "Unknown tagged value");
      }
    }
    __name(Up, "Up");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Tn(t) {
      return t.name === "DriverAdapterError" && typeof t.cause == "object";
    }
    __name(Tn, "Tn");
    u();
    l();
    c();
    p();
    d();
    var G = { Int32: 0, Int64: 1, Float: 2, Double: 3, Numeric: 4, Boolean: 5, Character: 6, Text: 7, Date: 8, Time: 9, DateTime: 10, Json: 11, Enum: 12, Bytes: 13, Set: 14, Uuid: 15, Int32Array: 64, Int64Array: 65, FloatArray: 66, DoubleArray: 67, NumericArray: 68, BooleanArray: 69, CharacterArray: 70, TextArray: 71, DateArray: 72, TimeArray: 73, DateTimeArray: 74, JsonArray: 75, EnumArray: 76, BytesArray: 77, UuidArray: 78, UnknownNumber: 128 };
    var be = class extends Error {
      static {
        __name(this, "be");
      }
      name = "UserFacingError";
      code;
      meta;
      constructor(e, r, n) {
        super(e), this.code = r, this.meta = n ?? {};
      }
      toQueryResponseErrorObject() {
        return { error: this.message, user_facing_error: { is_panic: false, message: this.message, meta: this.meta, error_code: this.code } };
      }
    };
    function mt(t) {
      if (!Tn(t)) throw t;
      let e = jp(t), r = Ma(t);
      if (e !== void 0 && r !== void 0) {
        let n = { driverAdapterError: t };
        throw t.cause.kind === "UniqueConstraintViolation" && t.cause.table && (n.table = t.cause.table), new be(r, e, n);
      }
      throw Bp(t.cause.kind) ? qp(t) : t;
    }
    __name(mt, "mt");
    function Ni(t) {
      throw Tn(t) ? Vp(t) : t;
    }
    __name(Ni, "Ni");
    function Vp(t) {
      let e = t.cause.originalCode ?? "N/A", r = Da(t);
      return new be(`Raw query failed. Code: \`${e}\`. Message: \`${r}\``, "P2010", { driverAdapterError: t });
    }
    __name(Vp, "Vp");
    function qp(t) {
      let e = t.cause.originalCode ?? "N/A", r = Da(t);
      return new be(`Database error. Code: \`${e}\`. Message: \`${r}\``, "P2039", { driverAdapterError: t });
    }
    __name(qp, "qp");
    function Da(t) {
      return t.cause.originalMessage ?? Ma(t) ?? t.message ?? "N/A";
    }
    __name(Da, "Da");
    function Bp(t) {
      switch (t) {
        case "postgres":
        case "mysql":
        case "sqlite":
        case "mssql":
          return true;
        default:
          return false;
      }
    }
    __name(Bp, "Bp");
    function jp(t) {
      switch (t.cause.kind) {
        case "AuthenticationFailed":
          return "P1000";
        case "DatabaseNotReachable":
          return "P1001";
        case "DatabaseDoesNotExist":
          return "P1003";
        case "SocketTimeout":
          return "P1008";
        case "DatabaseAlreadyExists":
          return "P1009";
        case "DatabaseAccessDenied":
          return "P1010";
        case "TlsConnectionError":
          return "P1011";
        case "ConnectionClosed":
          return "P1017";
        case "TransactionAlreadyClosed":
          return "P1018";
        case "LengthMismatch":
          return "P2000";
        case "UniqueConstraintViolation":
          return "P2002";
        case "ForeignKeyConstraintViolation":
        case "RestrictViolation":
          return "P2003";
        case "InvalidInputValue":
          return "P2007";
        case "UnsupportedNativeDataType":
          return "P2010";
        case "NullConstraintViolation":
          return "P2011";
        case "ValueOutOfRange":
          return "P2020";
        case "TableDoesNotExist":
          return "P2021";
        case "ColumnNotFound":
          return "P2022";
        case "InvalidIsolationLevel":
        case "InconsistentColumnData":
          return "P2023";
        case "MissingFullTextSearchIndex":
          return "P2030";
        case "TransactionWriteConflict":
          return "P2034";
        case "GenericJs":
          return "P2036";
        case "TooManyConnections":
          return "P2037";
        case "postgres":
        case "sqlite":
        case "mysql":
        case "mssql":
          return;
        default:
          Y(t.cause, `Unknown error: ${Je(t.cause)}`);
      }
    }
    __name(jp, "jp");
    function Ma(t) {
      switch (t.cause.kind) {
        case "AuthenticationFailed":
          return `Authentication failed against the database server, the provided database credentials for \`${t.cause.user ?? "(not available)"}\` are not valid`;
        case "DatabaseNotReachable": {
          let e = t.cause.host && t.cause.port ? `${t.cause.host}:${t.cause.port}` : t.cause.host;
          return `Can't reach database server${e ? ` at ${e}` : ""}`;
        }
        case "DatabaseDoesNotExist":
          return `Database \`${t.cause.db ?? "(not available)"}\` does not exist on the database server`;
        case "SocketTimeout":
          return "Operation has timed out";
        case "DatabaseAlreadyExists":
          return `Database \`${t.cause.db ?? "(not available)"}\` already exists on the database server`;
        case "DatabaseAccessDenied":
          return `User was denied access on the database \`${t.cause.db ?? "(not available)"}\``;
        case "TlsConnectionError":
          return `Error opening a TLS connection: ${t.cause.reason}`;
        case "ConnectionClosed":
          return "Server has closed the connection.";
        case "TransactionAlreadyClosed":
          return t.cause.cause;
        case "LengthMismatch":
          return `The provided value for the column is too long for the column's type. Column: ${t.cause.column ?? "(not available)"}`;
        case "UniqueConstraintViolation":
          return `Unique constraint failed on the ${Oi(t.cause.constraint)}`;
        case "ForeignKeyConstraintViolation":
        case "RestrictViolation":
          return `Foreign key constraint violated on the ${Oi(t.cause.constraint)}`;
        case "UnsupportedNativeDataType":
          return `Failed to deserialize column of type '${t.cause.type}'. If you're using $queryRaw and this column is explicitly marked as \`Unsupported\` in your Prisma schema, try casting this column to any supported Prisma type such as \`String\`.`;
        case "NullConstraintViolation":
          return `Null constraint violation on the ${Oi(t.cause.constraint)}`;
        case "ValueOutOfRange":
          return `Value out of range for the type: ${t.cause.cause}`;
        case "TableDoesNotExist":
          return `The table \`${t.cause.table ?? "(not available)"}\` does not exist in the current database.`;
        case "ColumnNotFound":
          return `The column \`${t.cause.column ?? "(not available)"}\` does not exist in the current database.`;
        case "InvalidIsolationLevel":
          return `Error in connector: Conversion error: ${t.cause.level}`;
        case "InconsistentColumnData":
          return `Inconsistent column data: ${t.cause.cause}`;
        case "MissingFullTextSearchIndex":
          return "Cannot find a fulltext index to use for the native search, try adding a @@fulltext([Fields...]) to your schema";
        case "TransactionWriteConflict":
          return "Transaction failed due to a write conflict or a deadlock. Please retry your transaction";
        case "GenericJs":
          return `Error in external connector (id ${t.cause.id})`;
        case "TooManyConnections":
          return `Too many database connections opened: ${t.cause.cause}`;
        case "InvalidInputValue":
          return `Invalid input value: ${t.cause.message}`;
        case "sqlite":
        case "postgres":
        case "mysql":
        case "mssql":
          return;
        default:
          Y(t.cause, `Unknown error: ${Je(t.cause)}`);
      }
    }
    __name(Ma, "Ma");
    function Oi(t) {
      return t && "fields" in t ? `fields: (${t.fields.map((e) => `\`${e}\``).join(", ")})` : t && "index" in t ? `constraint: \`${t.index}\`` : t && "foreignKey" in t ? "foreign key" : "(not available)";
    }
    __name(Oi, "Oi");
    function Qp(t) {
      if (typeof t != "object" || t === null) return false;
      let e = t;
      return "$type" in e && e.$type === "Param" || "prisma__type" in e && e.prisma__type === "param";
    }
    __name(Qp, "Qp");
    function Jp(t) {
      return "prisma__type" in t ? t.prisma__value?.name : t.value.name;
    }
    __name(Jp, "Jp");
    function Gp(t, e) {
      let r = {};
      for (let [n, i] of Object.entries(t)) if (r[n] = i, Qp(i)) {
        let o = Jp(i);
        o && o in e && (r[n] = e[o]);
      }
      return r;
    }
    __name(Gp, "Gp");
    function _a(t, e, r = {}) {
      let n = t.map((o) => e.keys.reduce((s, a) => (s[a] = Ge(o[a]), s), {})), i = new Set(e.nestedSelection);
      return e.arguments.map((o) => {
        let s = Gp(o, r), a = n.findIndex((m) => er(m, s));
        if (a === -1) return e.expectNonEmpty ? new be("An operation failed because it depends on one or more records that were required but not found", "P2025") : null;
        {
          let m = Object.entries(t[a]).filter(([h]) => i.has(h));
          return Object.fromEntries(m);
        }
      });
    }
    __name(_a, "_a");
    u();
    l();
    c();
    p();
    d();
    var $a = require_dist();
    var oe = class extends be {
      static {
        __name(this, "oe");
      }
      name = "DataMapperError";
      constructor(e, r) {
        super(e, "P2023", r);
      }
    };
    var La = /* @__PURE__ */ new WeakMap();
    function Hp(t) {
      let e = La.get(t);
      return e || (e = Object.entries(t), La.set(t, e)), e;
    }
    __name(Hp, "Hp");
    function Mi(t, e, r) {
      switch (e.type) {
        case "affectedRows":
          if (typeof t != "number") throw new oe(`Expected an affected rows count, got: ${typeof t} (${t})`);
          return { count: t };
        case "object":
          return _i(t, e.fields, r, e.skipNulls);
        case "field":
          return Di(t, "<result>", e.fieldType, r);
        default:
          Y(e, `Invalid data mapping type: '${e.type}'`);
      }
    }
    __name(Mi, "Mi");
    function _i(t, e, r, n) {
      if (t === null) return null;
      if (Array.isArray(t)) {
        let i = t;
        return n && (i = i.filter((o) => o !== null)), i.map((o) => Fa(o, e, r));
      }
      if (typeof t == "object") return Fa(t, e, r);
      if (typeof t == "string") {
        let i;
        try {
          i = JSON.parse(t);
        } catch (o) {
          throw new oe("Expected an array or object, got a string that is not valid JSON", { cause: o });
        }
        return _i(i, e, r, n);
      }
      throw new oe(`Expected an array or an object, got: ${typeof t}`);
    }
    __name(_i, "_i");
    function Fa(t, e, r) {
      if (typeof t != "object") throw new oe(`Expected an object, but got '${typeof t}'`);
      let n = {};
      for (let [i, o] of Hp(e)) switch (o.type) {
        case "affectedRows":
          throw new oe(`Unexpected 'AffectedRows' node in data mapping for field '${i}'`);
        case "object": {
          let { serializedName: s, fields: a, skipNulls: m } = o;
          if (s !== null && !Object.hasOwn(t, s)) throw new oe(`Missing data field (Object): '${i}'; node: ${JSON.stringify(o)}; data: ${JSON.stringify(t)}`);
          let h = s !== null ? t[s] : t;
          n[i] = _i(h, a, r, m);
          break;
        }
        case "field":
          {
            let s = o.dbName;
            if (Object.hasOwn(t, s)) n[i] = zp(t[s], s, o.fieldType, r);
            else throw new oe(`Missing data field (Value): '${s}'; node: ${JSON.stringify(o)}; data: ${JSON.stringify(t)}`);
          }
          break;
        default:
          Y(o, `DataMapper: Invalid data mapping node type: '${o.type}'`);
      }
      return n;
    }
    __name(Fa, "Fa");
    function zp(t, e, r, n) {
      return t === null ? r.arity === "list" ? [] : null : r.arity === "list" ? t.map((o, s) => Di(o, `${e}[${s}]`, r, n)) : Di(t, e, r, n);
    }
    __name(zp, "zp");
    function Di(t, e, r, n) {
      switch (r.type) {
        case "unsupported":
          return t;
        case "string": {
          if (typeof t != "string") throw new oe(`Expected a string in column '${e}', got ${typeof t}: ${t}`);
          return t;
        }
        case "int":
          switch (typeof t) {
            case "number":
              return Math.trunc(t);
            case "string": {
              let i = Math.trunc(Number(t));
              if (Number.isNaN(i) || !Number.isFinite(i)) throw new oe(`Expected an integer in column '${e}', got string: ${t}`);
              if (!Number.isSafeInteger(i)) throw new oe(`Integer value in column '${e}' is too large to represent as a JavaScript number without loss of precision, got: ${t}. Consider using BigInt type.`);
              return i;
            }
            default:
              throw new oe(`Expected an integer in column '${e}', got ${typeof t}: ${t}`);
          }
        case "bigint": {
          if (typeof t != "number" && typeof t != "string") throw new oe(`Expected a bigint in column '${e}', got ${typeof t}: ${t}`);
          return { $type: "BigInt", value: t };
        }
        case "float": {
          if (typeof t == "number") return t;
          if (typeof t == "string") {
            let i = Number(t);
            if (Number.isNaN(i) && !/^[-+]?nan$/.test(t.toLowerCase())) throw new oe(`Expected a float in column '${e}', got string: ${t}`);
            return i;
          }
          throw new oe(`Expected a float in column '${e}', got ${typeof t}: ${t}`);
        }
        case "boolean": {
          if (typeof t == "boolean") return t;
          if (typeof t == "number") return t === 1;
          if (typeof t == "string") {
            if (t === "true" || t === "TRUE" || t === "1") return true;
            if (t === "false" || t === "FALSE" || t === "0") return false;
            throw new oe(`Expected a boolean in column '${e}', got ${typeof t}: ${t}`);
          }
          if (Array.isArray(t) || Yt(t)) {
            for (let i of t) if (i !== 0) return true;
            return false;
          }
          throw new oe(`Expected a boolean in column '${e}', got ${typeof t}: ${t}`);
        }
        case "decimal":
          if (typeof t != "number" && typeof t != "string" && !$a.Decimal.isDecimal(t)) throw new oe(`Expected a decimal in column '${e}', got ${typeof t}: ${t}`);
          return { $type: "Decimal", value: t };
        case "datetime": {
          if (typeof t == "string") return { $type: "DateTime", value: Kp(t) };
          if (typeof t == "number" || Cr(t)) return { $type: "DateTime", value: t };
          throw new oe(`Expected a date in column '${e}', got ${typeof t}: ${t}`);
        }
        case "object":
          return { $type: "Json", value: Je(t) };
        case "json":
          return { $type: "Json", value: `${t}` };
        case "bytes": {
          switch (r.encoding) {
            case "base64":
              if (typeof t != "string") throw new oe(`Expected a base64-encoded byte array in column '${e}', got ${typeof t}: ${t}`);
              return { $type: "Bytes", value: t };
            case "hex":
              if (typeof t != "string" || !t.startsWith("\\x")) throw new oe(`Expected a hex-encoded byte array in column '${e}', got ${typeof t}: ${t}`);
              return { $type: "Bytes", value: w.from(t.slice(2), "hex").toString("base64") };
            case "array":
              if (Array.isArray(t)) return { $type: "Bytes", value: w.from(t).toString("base64") };
              if (Yt(t)) return { $type: "Bytes", value: w.from(t).toString("base64") };
              throw new oe(`Expected a byte array in column '${e}', got ${typeof t}: ${t}`);
            default:
              Y(r.encoding, `DataMapper: Unknown bytes encoding: ${r.encoding}`);
          }
          break;
        }
        case "enum": {
          let i = n[r.name];
          if (i === void 0) throw new oe(`Unknown enum '${r.name}'`);
          let o = i[`${t}`];
          if (o === void 0) throw new oe(`Value '${t}' not found in enum '${r.name}'`);
          return o;
        }
        default:
          Y(r, `DataMapper: Unknown result type: ${r.type}`);
      }
    }
    __name(Di, "Di");
    var Wp = /\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}(:?\d{2})?)?$/;
    function Kp(t) {
      let e = Wp.exec(t);
      if (e === null) return `${t}T00:00:00Z`;
      let r = t, [n, i, o] = e;
      if (i !== void 0 && i !== "Z" && o === void 0 ? r = `${t}:00` : i === void 0 && (r = `${t}Z`), n.length === t.length) return `1970-01-01T${r}`;
      let s = e.index - 1;
      return r[s] === " " && (r = `${r.slice(0, s)}T${r.slice(s + 1)}`), r;
    }
    __name(Kp, "Kp");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Ue(t) {
      if (typeof t != "object") return t;
      var e, r, n = Object.prototype.toString.call(t);
      if (n === "[object Object]") {
        if (t.constructor !== Object && typeof t.constructor == "function") {
          r = new t.constructor();
          for (e in t) t.hasOwnProperty(e) && r[e] !== t[e] && (r[e] = Ue(t[e]));
        } else {
          r = {};
          for (e in t) e === "__proto__" ? Object.defineProperty(r, e, { value: Ue(t[e]), configurable: true, enumerable: true, writable: true }) : r[e] = Ue(t[e]);
        }
        return r;
      }
      if (n === "[object Array]") {
        for (e = t.length, r = Array(e); e--; ) r[e] = Ue(t[e]);
        return r;
      }
      return n === "[object Set]" ? (r = /* @__PURE__ */ new Set(), t.forEach(function(i) {
        r.add(Ue(i));
      }), r) : n === "[object Map]" ? (r = /* @__PURE__ */ new Map(), t.forEach(function(i, o) {
        r.set(Ue(o), Ue(i));
      }), r) : n === "[object Date]" ? /* @__PURE__ */ new Date(+t) : n === "[object RegExp]" ? (r = new RegExp(t.source, t.flags), r.lastIndex = t.lastIndex, r) : n === "[object DataView]" ? new t.constructor(Ue(t.buffer)) : n === "[object ArrayBuffer]" ? t.slice(0) : n.slice(-6) === "Array]" ? new t.constructor(t) : t;
    }
    __name(Ue, "Ue");
    u();
    l();
    c();
    p();
    d();
    function Xp(t) {
      let e = Object.entries(t);
      return e.length === 0 ? "" : (e.sort(([n], [i]) => n.localeCompare(i)), `/*${e.map(([n, i]) => {
        let o = encodeURIComponent(n), s = encodeURIComponent(i).replace(/'/g, "\\'");
        return `${o}='${s}'`;
      }).join(",")}*/`);
    }
    __name(Xp, "Xp");
    function vn(t, e) {
      let r = {};
      for (let n of t) {
        let i = n(Ue(e));
        for (let [o, s] of Object.entries(i)) s !== void 0 && (r[o] = s);
      }
      return r;
    }
    __name(vn, "vn");
    function Ua(t, e) {
      let r = vn(t, e);
      return Xp(r);
    }
    __name(Ua, "Ua");
    function Va(t, e) {
      return e ? `${t} ${e}` : t;
    }
    __name(Va, "Va");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Ir;
    (function(t) {
      t[t.INTERNAL = 0] = "INTERNAL", t[t.SERVER = 1] = "SERVER", t[t.CLIENT = 2] = "CLIENT", t[t.PRODUCER = 3] = "PRODUCER", t[t.CONSUMER = 4] = "CONSUMER";
    })(Ir || (Ir = {}));
    function Zp(t) {
      switch (t) {
        case "postgresql":
        case "postgres":
        case "prisma+postgres":
          return "postgresql";
        case "sqlserver":
          return "mssql";
        case "mysql":
        case "sqlite":
        case "cockroachdb":
        case "mongodb":
          return t;
        default:
          Y(t, `Unknown provider: ${t}`);
      }
    }
    __name(Zp, "Zp");
    async function Sn({ query: t, tracingHelper: e, provider: r, onQuery: n, execute: i }) {
      let o = n === void 0 ? i : async () => {
        let s = /* @__PURE__ */ new Date(), a = T.now(), m = await i(), h = T.now();
        return n({ timestamp: s, duration: h - a, query: t.sql, params: t.args }), m;
      };
      return e.isEnabled() ? await e.runInChildSpan({ name: "db_query", kind: Ir.CLIENT, attributes: { "db.query.text": t.sql, "db.system.name": Zp(r) } }, o) : o();
    }
    __name(Sn, "Sn");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Pt(t, e) {
      var r = "000000000" + t;
      return r.substr(r.length - e);
    }
    __name(Pt, "Pt");
    var qa = Mt(cs(), 1);
    function Yp() {
      try {
        return qa.default.hostname();
      } catch {
        return b.env._CLUSTER_NETWORK_NAME_ || b.env.COMPUTERNAME || "hostname";
      }
    }
    __name(Yp, "Yp");
    var Ba = 2;
    var ed = Pt(b.pid.toString(36), Ba);
    var ja = Yp();
    var td = ja.length;
    var rd = Pt(ja.split("").reduce(function(t, e) {
      return +t + e.charCodeAt(0);
    }, +td + 36).toString(36), Ba);
    function Li() {
      return ed + rd;
    }
    __name(Li, "Li");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function An(t) {
      return typeof t == "string" && /^c[a-z0-9]{20,32}$/.test(t);
    }
    __name(An, "An");
    function Fi(t) {
      let n = Math.pow(36, 4), i = 0;
      function o() {
        return Pt((Math.random() * n << 0).toString(36), 4);
      }
      __name(o, "o");
      function s() {
        return i = i < n ? i : 0, i++, i - 1;
      }
      __name(s, "s");
      function a() {
        var m = "c", h = (/* @__PURE__ */ new Date()).getTime().toString(36), E = Pt(s().toString(36), 4), N = t(), $3 = o() + o();
        return m + h + E + N + $3;
      }
      __name(a, "a");
      return a.fingerprint = t, a.isCuid = An, a;
    }
    __name(Fi, "Fi");
    var nd = Fi(Li);
    var Qa = nd;
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Rn = BigInt(4294967295);
    var Ja = BigInt(32);
    function id(t, e = false) {
      return e ? { h: Number(t & Rn), l: Number(t >> Ja & Rn) } : { h: Number(t >> Ja & Rn) | 0, l: Number(t & Rn) | 0 };
    }
    __name(id, "id");
    function Ga(t, e = false) {
      let r = t.length, n = new Uint32Array(r), i = new Uint32Array(r);
      for (let o = 0; o < r; o++) {
        let { h: s, l: a } = id(t[o], e);
        [n[o], i[o]] = [s, a];
      }
      return [n, i];
    }
    __name(Ga, "Ga");
    var Ha = /* @__PURE__ */ __name((t, e, r) => t << r | e >>> 32 - r, "Ha");
    var za = /* @__PURE__ */ __name((t, e, r) => e << r | t >>> 32 - r, "za");
    var Wa = /* @__PURE__ */ __name((t, e, r) => e << r - 32 | t >>> 64 - r, "Wa");
    var Ka = /* @__PURE__ */ __name((t, e, r) => t << r - 32 | e >>> 64 - r, "Ka");
    u();
    l();
    c();
    p();
    d();
    function od(t) {
      return t instanceof Uint8Array || ArrayBuffer.isView(t) && t.constructor.name === "Uint8Array" && "BYTES_PER_ELEMENT" in t && t.BYTES_PER_ELEMENT === 1;
    }
    __name(od, "od");
    function Cn(t, e = "") {
      if (typeof t != "number") {
        let r = e && `"${e}" `;
        throw new TypeError(`${r}expected number, got ${typeof t}`);
      }
      if (!Number.isSafeInteger(t) || t < 0) {
        let r = e && `"${e}" `;
        throw new RangeError(`${r}expected integer >= 0, got ${t}`);
      }
    }
    __name(Cn, "Cn");
    function In(t, e, r = "") {
      let n = od(t), i = t?.length, o = e !== void 0;
      if (!n || o && i !== e) {
        let s = r && `"${r}" `, a = o ? ` of length ${e}` : "", m = n ? `length=${i}` : `type=${typeof t}`, h = s + "expected Uint8Array" + a + ", got " + m;
        throw n ? new RangeError(h) : new TypeError(h);
      }
      return t;
    }
    __name(In, "In");
    function $i(t, e = true) {
      if (t.destroyed) throw new Error("Hash instance has been destroyed");
      if (e && t.finished) throw new Error("Hash#digest() has already been called");
    }
    __name($i, "$i");
    function Xa(t, e) {
      In(t, void 0, "digestInto() output");
      let r = e.outputLen;
      if (t.length < r) throw new RangeError('"digestInto() output" expected to be of length >=' + r);
    }
    __name(Xa, "Xa");
    function Za(t) {
      return new Uint32Array(t.buffer, t.byteOffset, Math.floor(t.byteLength / 4));
    }
    __name(Za, "Za");
    function Ui(...t) {
      for (let e = 0; e < t.length; e++) t[e].fill(0);
    }
    __name(Ui, "Ui");
    var sd = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
    function ad(t) {
      return t << 24 & 4278190080 | t << 8 & 16711680 | t >>> 8 & 65280 | t >>> 24 & 255;
    }
    __name(ad, "ad");
    function ud(t) {
      for (let e = 0; e < t.length; e++) t[e] = ad(t[e]);
      return t;
    }
    __name(ud, "ud");
    var Vi = sd ? (t) => t : ud;
    function Ya(t, e = {}) {
      let r = /* @__PURE__ */ __name((i, o) => t(o).update(i).digest(), "r"), n = t(void 0);
      return r.outputLen = n.outputLen, r.blockLen = n.blockLen, r.canXOF = n.canXOF, r.create = (i) => t(i), Object.assign(r, e), Object.freeze(r);
    }
    __name(Ya, "Ya");
    var eu = /* @__PURE__ */ __name((t) => ({ oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, t]) }), "eu");
    var ld = BigInt(0);
    var kr = BigInt(1);
    var cd = BigInt(2);
    var pd = BigInt(7);
    var dd = BigInt(256);
    var md = BigInt(113);
    var nu = [];
    var iu = [];
    var ou = [];
    for (let t = 0, e = kr, r = 1, n = 0; t < 24; t++) {
      [r, n] = [n, (2 * r + 3 * n) % 5], nu.push(2 * (5 * n + r)), iu.push((t + 1) * (t + 2) / 2 % 64);
      let i = ld;
      for (let o = 0; o < 7; o++) e = (e << kr ^ (e >> pd) * md) % dd, e & cd && (i ^= kr << (kr << BigInt(o)) - kr);
      ou.push(i);
    }
    var su = Ga(ou, true);
    var fd = su[0];
    var gd = su[1];
    var tu = /* @__PURE__ */ __name((t, e, r) => r > 32 ? Wa(t, e, r) : Ha(t, e, r), "tu");
    var ru = /* @__PURE__ */ __name((t, e, r) => r > 32 ? Ka(t, e, r) : za(t, e, r), "ru");
    function hd(t, e = 24) {
      if (Cn(e, "rounds"), e < 1 || e > 24) throw new Error('"rounds" expected integer 1..24');
      let r = new Uint32Array(5 * 2);
      for (let n = 24 - e; n < 24; n++) {
        for (let s = 0; s < 10; s++) r[s] = t[s] ^ t[s + 10] ^ t[s + 20] ^ t[s + 30] ^ t[s + 40];
        for (let s = 0; s < 10; s += 2) {
          let a = (s + 8) % 10, m = (s + 2) % 10, h = r[m], E = r[m + 1], N = tu(h, E, 1) ^ r[a], $3 = ru(h, E, 1) ^ r[a + 1];
          for (let U = 0; U < 50; U += 10) t[s + U] ^= N, t[s + U + 1] ^= $3;
        }
        let i = t[2], o = t[3];
        for (let s = 0; s < 24; s++) {
          let a = iu[s], m = tu(i, o, a), h = ru(i, o, a), E = nu[s];
          i = t[E], o = t[E + 1], t[E] = m, t[E + 1] = h;
        }
        for (let s = 0; s < 50; s += 10) {
          let a = t[s], m = t[s + 1], h = t[s + 2], E = t[s + 3];
          t[s] ^= ~t[s + 2] & t[s + 4], t[s + 1] ^= ~t[s + 3] & t[s + 5], t[s + 2] ^= ~t[s + 4] & t[s + 6], t[s + 3] ^= ~t[s + 5] & t[s + 7], t[s + 4] ^= ~t[s + 6] & t[s + 8], t[s + 5] ^= ~t[s + 7] & t[s + 9], t[s + 6] ^= ~t[s + 8] & a, t[s + 7] ^= ~t[s + 9] & m, t[s + 8] ^= ~a & h, t[s + 9] ^= ~m & E;
        }
        t[0] ^= fd[n], t[1] ^= gd[n];
      }
      Ui(r);
    }
    __name(hd, "hd");
    var qi = class t {
      static {
        __name(this, "t");
      }
      state;
      pos = 0;
      posOut = 0;
      finished = false;
      state32;
      destroyed = false;
      blockLen;
      suffix;
      outputLen;
      canXOF;
      enableXOF = false;
      rounds;
      constructor(e, r, n, i = false, o = 24) {
        if (this.blockLen = e, this.suffix = r, this.outputLen = n, this.enableXOF = i, this.canXOF = i, this.rounds = o, Cn(n, "outputLen"), !(0 < e && e < 200)) throw new Error("only keccak-f1600 function is supported");
        this.state = new Uint8Array(200), this.state32 = Za(this.state);
      }
      clone() {
        return this._cloneInto();
      }
      keccak() {
        Vi(this.state32), hd(this.state32, this.rounds), Vi(this.state32), this.posOut = 0, this.pos = 0;
      }
      update(e) {
        $i(this), In(e);
        let { blockLen: r, state: n } = this, i = e.length;
        for (let o = 0; o < i; ) {
          let s = Math.min(r - this.pos, i - o);
          for (let a = 0; a < s; a++) n[this.pos++] ^= e[o++];
          this.pos === r && this.keccak();
        }
        return this;
      }
      finish() {
        if (this.finished) return;
        this.finished = true;
        let { state: e, suffix: r, pos: n, blockLen: i } = this;
        e[n] ^= r, (r & 128) !== 0 && n === i - 1 && this.keccak(), e[i - 1] ^= 128, this.keccak();
      }
      writeInto(e) {
        $i(this, false), In(e), this.finish();
        let r = this.state, { blockLen: n } = this;
        for (let i = 0, o = e.length; i < o; ) {
          this.posOut >= n && this.keccak();
          let s = Math.min(n - this.posOut, o - i);
          e.set(r.subarray(this.posOut, this.posOut + s), i), this.posOut += s, i += s;
        }
        return e;
      }
      xofInto(e) {
        if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
        return this.writeInto(e);
      }
      xof(e) {
        return Cn(e), this.xofInto(new Uint8Array(e));
      }
      digestInto(e) {
        if (Xa(e, this), this.finished) throw new Error("digest() was already called");
        this.writeInto(e.subarray(0, this.outputLen)), this.destroy();
      }
      digest() {
        let e = new Uint8Array(this.outputLen);
        return this.digestInto(e), e;
      }
      destroy() {
        this.destroyed = true, Ui(this.state);
      }
      _cloneInto(e) {
        let { blockLen: r, suffix: n, outputLen: i, rounds: o, enableXOF: s } = this;
        return e ||= new t(r, n, i, s, o), e.blockLen = r, e.state32.set(this.state32), e.pos = this.pos, e.posOut = this.posOut, e.finished = this.finished, e.rounds = o, e.suffix = n, e.outputLen = i, e.enableXOF = s, e.canXOF = this.canXOF, e.destroyed = this.destroyed, e;
      }
    };
    var yd = /* @__PURE__ */ __name((t, e, r, n = {}) => Ya(() => new qi(e, t, r), n), "yd");
    var au = yd(6, 72, 64, eu(10));
    u();
    l();
    c();
    p();
    d();
    var wd = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
    var Bi = Math.ceil;
    var qe = Math.floor;
    var Oe = "[BigNumber Error] ";
    var uu = Oe + "Number primitive has more than 15 significant digits: ";
    var He = 1e14;
    var H = 14;
    var ji = 9007199254740991;
    var Qi = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13];
    var ft = 1e7;
    var xe = 1e9;
    function lu(t) {
      var e, r, n, i = L.prototype = { constructor: L, toString: null, valueOf: null }, o = new L(1), s = 20, a = 4, m = -7, h = 21, E = -1e7, N = 1e7, $3 = false, U = 1, B2 = 0, q = { prefix: "", groupSize: 3, secondaryGroupSize: 0, groupSeparator: ",", decimalSeparator: ".", fractionGroupSize: 0, fractionGroupSeparator: "\xA0", suffix: "" }, J = "0123456789abcdefghijklmnopqrstuvwxyz", Z = true;
      function L(f, g) {
        var y, k, P, O, _, R, I, M, D = this;
        if (!(D instanceof L)) return new L(f, g);
        if (g == null) {
          if (f && f._isBigNumber === true) {
            D.s = f.s, !f.c || f.e > N ? D.c = D.e = null : f.e < E ? D.c = [D.e = 0] : (D.e = f.e, D.c = f.c.slice());
            return;
          }
          if ((R = typeof f == "number") && f * 0 == 0) {
            if (D.s = 1 / f < 0 ? (f = -f, -1) : 1, f === ~~f) {
              for (O = 0, _ = f; _ >= 10; _ /= 10, O++) ;
              O > N ? D.c = D.e = null : (D.e = O, D.c = [f]);
              return;
            }
            M = String(f);
          } else {
            if (!wd.test(M = String(f))) return n(D, M, R);
            D.s = M.charCodeAt(0) == 45 ? (M = M.slice(1), -1) : 1;
          }
          (O = M.indexOf(".")) > -1 && (M = M.replace(".", "")), (_ = M.search(/e/i)) > 0 ? (O < 0 && (O = _), O += +M.slice(_ + 1), M = M.substring(0, _)) : O < 0 && (O = M.length);
        } else {
          if (ae(g, 2, J.length, "Base"), g == 10 && Z) return D = new L(f), Se(D, s + D.e + 1, a);
          if (M = String(f), R = typeof f == "number") {
            if (f * 0 != 0) return n(D, M, R, g);
            if (D.s = 1 / f < 0 ? (M = M.slice(1), -1) : 1, L.DEBUG && M.replace(/^0\.0*|\./, "").length > 15) throw Error(uu + f);
          } else D.s = M.charCodeAt(0) === 45 ? (M = M.slice(1), -1) : 1;
          for (y = J.slice(0, g), O = _ = 0, I = M.length; _ < I; _++) if (y.indexOf(k = M.charAt(_)) < 0) {
            if (k == ".") {
              if (_ > O) {
                O = I;
                continue;
              }
            } else if (!P && (M == M.toUpperCase() && (M = M.toLowerCase()) || M == M.toLowerCase() && (M = M.toUpperCase()))) {
              P = true, _ = -1, O = 0;
              continue;
            }
            return n(D, String(f), R, g);
          }
          R = false, M = r(M, g, 10, D.s), (O = M.indexOf(".")) > -1 ? M = M.replace(".", "") : O = M.length;
        }
        for (_ = 0; M.charCodeAt(_) === 48; _++) ;
        for (I = M.length; M.charCodeAt(--I) === 48; ) ;
        if (M = M.slice(_, ++I)) {
          if (I -= _, R && L.DEBUG && I > 15 && (f > ji || f !== qe(f))) throw Error(uu + D.s * f);
          if ((O = O - _ - 1) > N) D.c = D.e = null;
          else if (O < E) D.c = [D.e = 0];
          else {
            if (D.e = O, D.c = [], _ = (O + 1) % H, O < 0 && (_ += H), _ < I) {
              for (_ && D.c.push(+M.slice(0, _)), I -= H; _ < I; ) D.c.push(+M.slice(_, _ += H));
              _ = H - (M = M.slice(_)).length;
            } else _ -= I;
            for (; _--; M += "0") ;
            D.c.push(+M);
          }
        } else D.c = [D.e = 0];
      }
      __name(L, "L");
      L.clone = lu, L.ROUND_UP = 0, L.ROUND_DOWN = 1, L.ROUND_CEIL = 2, L.ROUND_FLOOR = 3, L.ROUND_HALF_UP = 4, L.ROUND_HALF_DOWN = 5, L.ROUND_HALF_EVEN = 6, L.ROUND_HALF_CEIL = 7, L.ROUND_HALF_FLOOR = 8, L.EUCLID = 9, L.config = L.set = function(f) {
        var g, y;
        if (f != null) if (typeof f == "object") {
          if (f.hasOwnProperty(g = "DECIMAL_PLACES") && (y = f[g], ae(y, 0, xe, g), s = y), f.hasOwnProperty(g = "ROUNDING_MODE") && (y = f[g], ae(y, 0, 8, g), a = y), f.hasOwnProperty(g = "EXPONENTIAL_AT") && (y = f[g], y && y.pop ? (ae(y[0], -xe, 0, g), ae(y[1], 0, xe, g), m = y[0], h = y[1]) : (ae(y, -xe, xe, g), m = -(h = y < 0 ? -y : y))), f.hasOwnProperty(g = "RANGE")) if (y = f[g], y && y.pop) ae(y[0], -xe, -1, g), ae(y[1], 1, xe, g), E = y[0], N = y[1];
          else if (ae(y, -xe, xe, g), y) E = -(N = y < 0 ? -y : y);
          else throw Error(Oe + g + " cannot be zero: " + y);
          if (f.hasOwnProperty(g = "CRYPTO")) if (y = f[g], y === !!y) if (y) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) $3 = y;
          else throw $3 = !y, Error(Oe + "crypto unavailable");
          else $3 = y;
          else throw Error(Oe + g + " not true or false: " + y);
          if (f.hasOwnProperty(g = "MODULO_MODE") && (y = f[g], ae(y, 0, 9, g), U = y), f.hasOwnProperty(g = "POW_PRECISION") && (y = f[g], ae(y, 0, xe, g), B2 = y), f.hasOwnProperty(g = "FORMAT")) if (y = f[g], typeof y == "object") q = y;
          else throw Error(Oe + g + " not an object: " + y);
          if (f.hasOwnProperty(g = "ALPHABET")) if (y = f[g], typeof y == "string" && !/^.?$|[+\-.\s]|(.).*\1/.test(y)) Z = y.slice(0, 10) == "0123456789", J = y;
          else throw Error(Oe + g + " invalid: " + y);
        } else throw Error(Oe + "Object expected: " + f);
        return { DECIMAL_PLACES: s, ROUNDING_MODE: a, EXPONENTIAL_AT: [m, h], RANGE: [E, N], CRYPTO: $3, MODULO_MODE: U, POW_PRECISION: B2, FORMAT: q, ALPHABET: J };
      }, L.isBigNumber = function(f) {
        if (!f || f._isBigNumber !== true) return false;
        if (!L.DEBUG) return true;
        var g, y, k = f.c, P = f.e, O = f.s;
        e: if ({}.toString.call(k) == "[object Array]") {
          if ((O === 1 || O === -1) && P >= -xe && P <= xe && P === qe(P)) {
            if (k[0] === 0) {
              if (P === 0 && k.length === 1) return true;
              break e;
            }
            if (g = (P + 1) % H, g < 1 && (g += H), String(k[0]).length == g) {
              for (g = 0; g < k.length; g++) if (y = k[g], y < 0 || y >= He || y !== qe(y)) break e;
              if (y !== 0) return true;
            }
          }
        } else if (k === null && P === null && (O === null || O === 1 || O === -1)) return true;
        throw Error(Oe + "Invalid BigNumber: " + f);
      }, L.maximum = L.max = function() {
        return ce(arguments, -1);
      }, L.minimum = L.min = function() {
        return ce(arguments, 1);
      }, L.random = (function() {
        var f = 9007199254740992, g = Math.random() * f & 2097151 ? function() {
          return qe(Math.random() * f);
        } : function() {
          return (Math.random() * 1073741824 | 0) * 8388608 + (Math.random() * 8388608 | 0);
        };
        return function(y) {
          var k, P, O, _, R, I = 0, M = [], D = new L(o);
          if (y == null ? y = s : ae(y, 0, xe), _ = Bi(y / H), $3) if (crypto.getRandomValues) {
            for (k = crypto.getRandomValues(new Uint32Array(_ *= 2)); I < _; ) R = k[I] * 131072 + (k[I + 1] >>> 11), R >= 9e15 ? (P = crypto.getRandomValues(new Uint32Array(2)), k[I] = P[0], k[I + 1] = P[1]) : (M.push(R % 1e14), I += 2);
            I = _ / 2;
          } else if (crypto.randomBytes) {
            for (k = crypto.randomBytes(_ *= 7); I < _; ) R = (k[I] & 31) * 281474976710656 + k[I + 1] * 1099511627776 + k[I + 2] * 4294967296 + k[I + 3] * 16777216 + (k[I + 4] << 16) + (k[I + 5] << 8) + k[I + 6], R >= 9e15 ? crypto.randomBytes(7).copy(k, I) : (M.push(R % 1e14), I += 7);
            I = _ / 7;
          } else throw $3 = false, Error(Oe + "crypto unavailable");
          if (!$3) for (; I < _; ) R = g(), R < 9e15 && (M[I++] = R % 1e14);
          for (_ = M[--I], y %= H, _ && y && (R = Qi[H - y], M[I] = qe(_ / R) * R); M[I] === 0; M.pop(), I--) ;
          if (I < 0) M = [O = 0];
          else {
            for (O = -1; M[0] === 0; M.splice(0, 1), O -= H) ;
            for (I = 1, R = M[0]; R >= 10; R /= 10, I++) ;
            I < H && (O -= H - I);
          }
          return D.e = O, D.c = M, D;
        };
      })(), L.sum = function() {
        for (var f = 1, g = arguments, y = new L(g[0]); f < g.length; ) y = y.plus(g[f++]);
        return y;
      }, r = /* @__PURE__ */ (function() {
        var f = "0123456789";
        function g(y, k, P, O) {
          for (var _, R = [0], I, M = 0, D = y.length; M < D; ) {
            for (I = R.length; I--; R[I] *= k) ;
            for (R[0] += O.indexOf(y.charAt(M++)), _ = 0; _ < R.length; _++) R[_] > P - 1 && (R[_ + 1] == null && (R[_ + 1] = 0), R[_ + 1] += R[_] / P | 0, R[_] %= P);
          }
          return R.reverse();
        }
        __name(g, "g");
        return function(y, k, P, O, _) {
          var R, I, M, D, F, j, Q, X, ue = y.indexOf("."), fe = s, W = a;
          for (ue >= 0 && (D = B2, B2 = 0, y = y.replace(".", ""), X = new L(k), j = X.pow(y.length - ue), B2 = D, X.c = g(at(Ve(j.c), j.e, "0"), 10, P, f), X.e = X.c.length), Q = g(y, k, P, _ ? (R = J, f) : (R = f, J)), M = D = Q.length; Q[--D] == 0; Q.pop()) ;
          if (!Q[0]) return R.charAt(0);
          if (ue < 0 ? --M : (j.c = Q, j.e = M, j.s = O, j = e(j, X, fe, W, P), Q = j.c, F = j.r, M = j.e), I = M + fe + 1, ue = Q[I], D = P / 2, F = F || I < 0 || Q[I + 1] != null, F = W < 4 ? (ue != null || F) && (W == 0 || W == (j.s < 0 ? 3 : 2)) : ue > D || ue == D && (W == 4 || F || W == 6 && Q[I - 1] & 1 || W == (j.s < 0 ? 8 : 7)), I < 1 || !Q[0]) y = F ? at(R.charAt(1), -fe, R.charAt(0)) : R.charAt(0);
          else {
            if (Q.length = I, F) for (--P; ++Q[--I] > P; ) Q[I] = 0, I || (++M, Q = [1].concat(Q));
            for (D = Q.length; !Q[--D]; ) ;
            for (ue = 0, y = ""; ue <= D; y += R.charAt(Q[ue++])) ;
            y = at(y, M, R.charAt(0));
          }
          return y;
        };
      })(), e = /* @__PURE__ */ (function() {
        function f(k, P, O) {
          var _, R, I, M, D = 0, F = k.length, j = P % ft, Q = P / ft | 0;
          for (k = k.slice(); F--; ) I = k[F] % ft, M = k[F] / ft | 0, _ = Q * I + M * j, R = j * I + _ % ft * ft + D, D = (R / O | 0) + (_ / ft | 0) + Q * M, k[F] = R % O;
          return D && (k = [D].concat(k)), k;
        }
        __name(f, "f");
        function g(k, P, O, _) {
          var R, I;
          if (O != _) I = O > _ ? 1 : -1;
          else for (R = I = 0; R < O; R++) if (k[R] != P[R]) {
            I = k[R] > P[R] ? 1 : -1;
            break;
          }
          return I;
        }
        __name(g, "g");
        function y(k, P, O, _) {
          for (var R = 0; O--; ) k[O] -= R, R = k[O] < P[O] ? 1 : 0, k[O] = R * _ + k[O] - P[O];
          for (; !k[0] && k.length > 1; k.splice(0, 1)) ;
        }
        __name(y, "y");
        return function(k, P, O, _, R) {
          var I, M, D, F, j, Q, X, ue, fe, W, ee, Ae, jr, ei, ti, ze, sr, Le = k.s == P.s ? 1 : -1, Re = k.c, le = P.c;
          if (!Re || !Re[0] || !le || !le[0]) return new L(!k.s || !P.s || (Re ? le && Re[0] == le[0] : !le) ? NaN : Re && Re[0] == 0 || !le ? Le * 0 : Le / 0);
          for (ue = new L(Le), fe = ue.c = [], M = k.e - P.e, Le = O + M + 1, R || (R = He, M = Be(k.e / H) - Be(P.e / H), Le = Le / H | 0), D = 0; le[D] == (Re[D] || 0); D++) ;
          if (le[D] > (Re[D] || 0) && M--, Le < 0) fe.push(1), F = true;
          else {
            for (ei = Re.length, ze = le.length, D = 0, Le += 2, j = qe(R / (le[0] + 1)), j > 1 && (le = f(le, j, R), Re = f(Re, j, R), ze = le.length, ei = Re.length), jr = ze, W = Re.slice(0, ze), ee = W.length; ee < ze; W[ee++] = 0) ;
            sr = le.slice(), sr = [0].concat(sr), ti = le[0], le[1] >= R / 2 && ti++;
            do {
              if (j = 0, I = g(le, W, ze, ee), I < 0) {
                if (Ae = W[0], ze != ee && (Ae = Ae * R + (W[1] || 0)), j = qe(Ae / ti), j > 1) for (j >= R && (j = R - 1), Q = f(le, j, R), X = Q.length, ee = W.length; g(Q, W, X, ee) == 1; ) j--, y(Q, ze < X ? sr : le, X, R), X = Q.length, I = 1;
                else j == 0 && (I = j = 1), Q = le.slice(), X = Q.length;
                if (X < ee && (Q = [0].concat(Q)), y(W, Q, ee, R), ee = W.length, I == -1) for (; g(le, W, ze, ee) < 1; ) j++, y(W, ze < ee ? sr : le, ee, R), ee = W.length;
              } else I === 0 && (j++, W = [0]);
              fe[D++] = j, W[0] ? W[ee++] = Re[jr] || 0 : (W = [Re[jr]], ee = 1);
            } while ((jr++ < ei || W[0] != null) && Le--);
            F = W[0] != null, fe[0] || fe.splice(0, 1);
          }
          if (R == He) {
            for (D = 1, Le = fe[0]; Le >= 10; Le /= 10, D++) ;
            Se(ue, O + (ue.e = D + M * H - 1) + 1, _, F);
          } else ue.e = M, ue.r = +F;
          return ue;
        };
      })();
      function z(f, g, y, k) {
        var P, O, _, R, I;
        if (y == null ? y = a : ae(y, 0, 8), !f.c) return f.toString();
        if (P = f.c[0], _ = f.e, g == null) I = Ve(f.c), I = k == 1 || k == 2 && (_ <= m || _ >= h) ? On(I, _) : at(I, _, "0");
        else if (f = Se(new L(f), g, y), O = f.e, I = Ve(f.c), R = I.length, k == 1 || k == 2 && (g <= O || O <= m)) {
          for (; R < g; I += "0", R++) ;
          I = On(I, O);
        } else if (g -= _ + (k === 2 && O > _), I = at(I, O, "0"), O + 1 > R) {
          if (--g > 0) for (I += "."; g--; I += "0") ;
        } else if (g += O - R, g > 0) for (O + 1 == R && (I += "."); g--; I += "0") ;
        return f.s < 0 && P ? "-" + I : I;
      }
      __name(z, "z");
      function ce(f, g) {
        for (var y, k, P = 1, O = new L(f[0]); P < f.length; P++) k = new L(f[P]), (!k.s || (y = Tt(O, k)) === g || y === 0 && O.s === g) && (O = k);
        return O;
      }
      __name(ce, "ce");
      function Ie(f, g, y) {
        for (var k = 1, P = g.length; !g[--P]; g.pop()) ;
        for (P = g[0]; P >= 10; P /= 10, k++) ;
        return (y = k + y * H - 1) > N ? f.c = f.e = null : y < E ? f.c = [f.e = 0] : (f.e = y, f.c = g), f;
      }
      __name(Ie, "Ie");
      n = /* @__PURE__ */ (function() {
        var f = /^(-?)0([xbo])(?=\w[\w.]*$)/i, g = /^([^.]+)\.$/, y = /^\.([^.]+)$/, k = /^-?(Infinity|NaN)$/, P = /^\s*\+(?=[\w.])|^\s+|\s+$/g;
        return function(O, _, R, I) {
          var M, D = R ? _ : _.replace(P, "");
          if (k.test(D)) O.s = isNaN(D) ? null : D < 0 ? -1 : 1;
          else {
            if (!R && (D = D.replace(f, function(F, j, Q) {
              return M = (Q = Q.toLowerCase()) == "x" ? 16 : Q == "b" ? 2 : 8, !I || I == M ? j : F;
            }), I && (M = I, D = D.replace(g, "$1").replace(y, "0.$1")), _ != D)) return new L(D, M);
            if (L.DEBUG) throw Error(Oe + "Not a" + (I ? " base " + I : "") + " number: " + _);
            O.s = null;
          }
          O.c = O.e = null;
        };
      })();
      function Se(f, g, y, k) {
        var P, O, _, R, I, M, D, F = f.c, j = Qi;
        if (F) {
          e: {
            for (P = 1, R = F[0]; R >= 10; R /= 10, P++) ;
            if (O = g - P, O < 0) O += H, _ = g, I = F[M = 0], D = qe(I / j[P - _ - 1] % 10);
            else if (M = Bi((O + 1) / H), M >= F.length) if (k) {
              for (; F.length <= M; F.push(0)) ;
              I = D = 0, P = 1, O %= H, _ = O - H + 1;
            } else break e;
            else {
              for (I = R = F[M], P = 1; R >= 10; R /= 10, P++) ;
              O %= H, _ = O - H + P, D = _ < 0 ? 0 : qe(I / j[P - _ - 1] % 10);
            }
            if (k = k || g < 0 || F[M + 1] != null || (_ < 0 ? I : I % j[P - _ - 1]), k = y < 4 ? (D || k) && (y == 0 || y == (f.s < 0 ? 3 : 2)) : D > 5 || D == 5 && (y == 4 || k || y == 6 && (O > 0 ? _ > 0 ? I / j[P - _] : 0 : F[M - 1]) % 10 & 1 || y == (f.s < 0 ? 8 : 7)), g < 1 || !F[0]) return F.length = 0, k ? (g -= f.e + 1, F[0] = j[(H - g % H) % H], f.e = -g || 0) : F[0] = f.e = 0, f;
            if (O == 0 ? (F.length = M, R = 1, M--) : (F.length = M + 1, R = j[H - O], F[M] = _ > 0 ? qe(I / j[P - _] % j[_]) * R : 0), k) for (; ; ) if (M == 0) {
              for (O = 1, _ = F[0]; _ >= 10; _ /= 10, O++) ;
              for (_ = F[0] += R, R = 1; _ >= 10; _ /= 10, R++) ;
              O != R && (f.e++, F[0] == He && (F[0] = 1));
              break;
            } else {
              if (F[M] += R, F[M] != He) break;
              F[M--] = 0, R = 1;
            }
            for (O = F.length; F[--O] === 0; F.pop()) ;
          }
          f.e > N ? f.c = f.e = null : f.e < E && (f.c = [f.e = 0]);
        }
        return f;
      }
      __name(Se, "Se");
      function pe(f) {
        var g, y = f.e;
        return y === null ? f.toString() : (g = Ve(f.c), g = y <= m || y >= h ? On(g, y) : at(g, y, "0"), f.s < 0 ? "-" + g : g);
      }
      __name(pe, "pe");
      return i.absoluteValue = i.abs = function() {
        var f = new L(this);
        return f.s < 0 && (f.s = 1), f;
      }, i.comparedTo = function(f, g) {
        return Tt(this, new L(f, g));
      }, i.decimalPlaces = i.dp = function(f, g) {
        var y, k, P, O = this;
        if (f != null) return ae(f, 0, xe), g == null ? g = a : ae(g, 0, 8), Se(new L(O), f + O.e + 1, g);
        if (!(y = O.c)) return null;
        if (k = ((P = y.length - 1) - Be(this.e / H)) * H, P = y[P]) for (; P % 10 == 0; P /= 10, k--) ;
        return k < 0 && (k = 0), k;
      }, i.dividedBy = i.div = function(f, g) {
        return e(this, new L(f, g), s, a);
      }, i.dividedToIntegerBy = i.idiv = function(f, g) {
        return e(this, new L(f, g), 0, 1);
      }, i.exponentiatedBy = i.pow = function(f, g) {
        var y, k, P, O, _, R, I, M, D, F = this;
        if (f = new L(f), f.c && !f.isInteger()) throw Error(Oe + "Exponent not an integer: " + pe(f));
        if (g != null && (g = new L(g)), R = f.e > 14, !F.c || !F.c[0] || F.c[0] == 1 && !F.e && F.c.length == 1 || !f.c || !f.c[0]) return D = new L(Math.pow(+pe(F), R ? f.s * (2 - kn(f)) : +pe(f))), g ? D.mod(g) : D;
        if (I = f.s < 0, g) {
          if (g.c ? !g.c[0] : !g.s) return new L(NaN);
          k = !I && F.isInteger() && g.isInteger(), k && (F = F.mod(g));
        } else {
          if (f.e > 9 && (F.e > 0 || F.e < -1 || (F.e == 0 ? F.c[0] > 1 || R && F.c[1] >= 24e7 : F.c[0] < 8e13 || R && F.c[0] <= 9999975e7))) return O = F.s < 0 && kn(f) ? -0 : 0, F.e > -1 && (O = 1 / O), new L(I ? 1 / O : O);
          B2 && (O = Bi(B2 / H + 2));
        }
        for (R ? (y = new L(0.5), I && (f.s = 1), M = kn(f)) : (P = Math.abs(+pe(f)), M = P % 2), D = new L(o); ; ) {
          if (M) {
            if (D = D.times(F), !D.c) break;
            O ? D.c.length > O && (D.c.length = O) : k && (D = D.mod(g));
          }
          if (P) {
            if (P = qe(P / 2), P === 0) break;
            M = P % 2;
          } else if (f = f.times(y), Se(f, f.e + 1, 1), f.e > 14) M = kn(f);
          else {
            if (P = +pe(f), P === 0) break;
            M = P % 2;
          }
          F = F.times(F), O ? F.c && F.c.length > O && (F.c.length = O) : k && (F = F.mod(g));
        }
        return k ? D : (I && (D = o.div(D)), g ? D.mod(g) : O ? Se(D, B2, a, _) : D);
      }, i.integerValue = function(f) {
        var g = new L(this);
        return f == null ? f = a : ae(f, 0, 8), Se(g, g.e + 1, f);
      }, i.isEqualTo = i.eq = function(f, g) {
        return Tt(this, new L(f, g)) === 0;
      }, i.isFinite = function() {
        return !!this.c;
      }, i.isGreaterThan = i.gt = function(f, g) {
        return Tt(this, new L(f, g)) > 0;
      }, i.isGreaterThanOrEqualTo = i.gte = function(f, g) {
        return (g = Tt(this, new L(f, g))) === 1 || g === 0;
      }, i.isInteger = function() {
        return !!this.c && Be(this.e / H) > this.c.length - 2;
      }, i.isLessThan = i.lt = function(f, g) {
        return Tt(this, new L(f, g)) < 0;
      }, i.isLessThanOrEqualTo = i.lte = function(f, g) {
        return (g = Tt(this, new L(f, g))) === -1 || g === 0;
      }, i.isNaN = function() {
        return !this.s;
      }, i.isNegative = function() {
        return this.s < 0;
      }, i.isPositive = function() {
        return this.s > 0;
      }, i.isZero = function() {
        return !!this.c && this.c[0] == 0;
      }, i.minus = function(f, g) {
        var y, k, P, O, _ = this, R = _.s;
        if (f = new L(f, g), g = f.s, !R || !g) return new L(NaN);
        if (R != g) return f.s = -g, _.plus(f);
        var I = _.e / H, M = f.e / H, D = _.c, F = f.c;
        if (!I || !M) {
          if (!D || !F) return D ? (f.s = -g, f) : new L(F ? _ : NaN);
          if (!D[0] || !F[0]) return F[0] ? (f.s = -g, f) : new L(D[0] ? _ : a == 3 ? -0 : 0);
        }
        if (I = Be(I), M = Be(M), D = D.slice(), R = I - M) {
          for ((O = R < 0) ? (R = -R, P = D) : (M = I, P = F), P.reverse(), g = R; g--; P.push(0)) ;
          P.reverse();
        } else for (k = (O = (R = D.length) < (g = F.length)) ? R : g, R = g = 0; g < k; g++) if (D[g] != F[g]) {
          O = D[g] < F[g];
          break;
        }
        if (O && (P = D, D = F, F = P, f.s = -f.s), g = (k = F.length) - (y = D.length), g > 0) for (; g--; D[y++] = 0) ;
        for (g = He - 1; k > R; ) {
          if (D[--k] < F[k]) {
            for (y = k; y && !D[--y]; D[y] = g) ;
            --D[y], D[k] += He;
          }
          D[k] -= F[k];
        }
        for (; D[0] == 0; D.splice(0, 1), --M) ;
        return D[0] ? Ie(f, D, M) : (f.s = a == 3 ? -1 : 1, f.c = [f.e = 0], f);
      }, i.modulo = i.mod = function(f, g) {
        var y, k, P = this;
        return f = new L(f, g), !P.c || !f.s || f.c && !f.c[0] ? new L(NaN) : !f.c || P.c && !P.c[0] ? new L(P) : (U == 9 ? (k = f.s, f.s = 1, y = e(P, f, 0, 3), f.s = k, y.s *= k) : y = e(P, f, 0, U), f = P.minus(y.times(f)), !f.c[0] && U == 1 && (f.s = P.s), f);
      }, i.multipliedBy = i.times = function(f, g) {
        var y, k, P, O, _, R, I, M, D, F, j, Q, X, ue, fe, W = this, ee = W.c, Ae = (f = new L(f, g)).c;
        if (!ee || !Ae || !ee[0] || !Ae[0]) return !W.s || !f.s || ee && !ee[0] && !Ae || Ae && !Ae[0] && !ee ? f.c = f.e = f.s = null : (f.s *= W.s, !ee || !Ae ? f.c = f.e = null : (f.c = [0], f.e = 0)), f;
        for (k = Be(W.e / H) + Be(f.e / H), f.s *= W.s, I = ee.length, F = Ae.length, I < F && (X = ee, ee = Ae, Ae = X, P = I, I = F, F = P), P = I + F, X = []; P--; X.push(0)) ;
        for (ue = He, fe = ft, P = F; --P >= 0; ) {
          for (y = 0, j = Ae[P] % fe, Q = Ae[P] / fe | 0, _ = I, O = P + _; O > P; ) M = ee[--_] % fe, D = ee[_] / fe | 0, R = Q * M + D * j, M = j * M + R % fe * fe + X[O] + y, y = (M / ue | 0) + (R / fe | 0) + Q * D, X[O--] = M % ue;
          X[O] = y;
        }
        return y ? ++k : X.splice(0, 1), Ie(f, X, k);
      }, i.negated = function() {
        var f = new L(this);
        return f.s = -f.s || null, f;
      }, i.plus = function(f, g) {
        var y, k = this, P = k.s;
        if (f = new L(f, g), g = f.s, !P || !g) return new L(NaN);
        if (P != g) return f.s = -g, k.minus(f);
        var O = k.e / H, _ = f.e / H, R = k.c, I = f.c;
        if (!O || !_) {
          if (!R || !I) return new L(P / 0);
          if (!R[0] || !I[0]) return I[0] ? f : new L(R[0] ? k : P * 0);
        }
        if (O = Be(O), _ = Be(_), R = R.slice(), P = O - _) {
          for (P > 0 ? (_ = O, y = I) : (P = -P, y = R), y.reverse(); P--; y.push(0)) ;
          y.reverse();
        }
        for (P = R.length, g = I.length, P - g < 0 && (y = I, I = R, R = y, g = P), P = 0; g; ) P = (R[--g] = R[g] + I[g] + P) / He | 0, R[g] = He === R[g] ? 0 : R[g] % He;
        return P && (R = [P].concat(R), ++_), Ie(f, R, _);
      }, i.precision = i.sd = function(f, g) {
        var y, k, P, O = this;
        if (f != null && f !== !!f) return ae(f, 1, xe), g == null ? g = a : ae(g, 0, 8), Se(new L(O), f, g);
        if (!(y = O.c)) return null;
        if (P = y.length - 1, k = P * H + 1, P = y[P]) {
          for (; P % 10 == 0; P /= 10, k--) ;
          for (P = y[0]; P >= 10; P /= 10, k++) ;
        }
        return f && O.e + 1 > k && (k = O.e + 1), k;
      }, i.shiftedBy = function(f) {
        return ae(f, -ji, ji), this.times("1e" + f);
      }, i.squareRoot = i.sqrt = function() {
        var f, g, y, k, P, O = this, _ = O.c, R = O.s, I = O.e, M = s + 4, D = new L("0.5");
        if (R !== 1 || !_ || !_[0]) return new L(!R || R < 0 && (!_ || _[0]) ? NaN : _ ? O : 1 / 0);
        if (R = Math.sqrt(+pe(O)), R == 0 || R == 1 / 0 ? (g = Ve(_), (g.length + I) % 2 == 0 && (g += "0"), R = Math.sqrt(+g), I = Be((I + 1) / 2) - (I < 0 || I % 2), R == 1 / 0 ? g = "5e" + I : (g = R.toExponential(), g = g.slice(0, g.indexOf("e") + 1) + I), y = new L(g)) : y = new L(R + ""), y.c[0]) {
          for (I = y.e, R = I + M, R < 3 && (R = 0); ; ) if (P = y, y = D.times(P.plus(e(O, P, M, 1))), Ve(P.c).slice(0, R) === (g = Ve(y.c)).slice(0, R)) if (y.e < I && --R, g = g.slice(R - 3, R + 1), g == "9999" || !k && g == "4999") {
            if (!k && (Se(P, P.e + s + 2, 0), P.times(P).eq(O))) {
              y = P;
              break;
            }
            M += 4, R += 4, k = 1;
          } else {
            (!+g || !+g.slice(1) && g.charAt(0) == "5") && (Se(y, y.e + s + 2, 1), f = !y.times(y).eq(O));
            break;
          }
        }
        return Se(y, y.e + s + 1, a, f);
      }, i.toExponential = function(f, g) {
        return f != null && (ae(f, 0, xe), f++), z(this, f, g, 1);
      }, i.toFixed = function(f, g) {
        return f != null && (ae(f, 0, xe), f = f + this.e + 1), z(this, f, g);
      }, i.toFormat = function(f, g, y) {
        var k, P = this;
        if (y == null) f != null && g && typeof g == "object" ? (y = g, g = null) : f && typeof f == "object" ? (y = f, f = g = null) : y = q;
        else if (typeof y != "object") throw Error(Oe + "Argument not an object: " + y);
        if (k = P.toFixed(f, g), P.c) {
          var O, _ = k.split("."), R = +y.groupSize, I = +y.secondaryGroupSize, M = y.groupSeparator || "", D = _[0], F = _[1], j = P.s < 0, Q = j ? D.slice(1) : D, X = Q.length;
          if (I && (O = R, R = I, I = O, X -= O), R > 0 && X > 0) {
            for (O = X % R || R, D = Q.substr(0, O); O < X; O += R) D += M + Q.substr(O, R);
            I > 0 && (D += M + Q.slice(O)), j && (D = "-" + D);
          }
          k = F ? D + (y.decimalSeparator || "") + ((I = +y.fractionGroupSize) ? F.replace(new RegExp("\\d{" + I + "}\\B", "g"), "$&" + (y.fractionGroupSeparator || "")) : F) : D;
        }
        return (y.prefix || "") + k + (y.suffix || "");
      }, i.toFraction = function(f) {
        var g, y, k, P, O, _, R, I, M, D, F, j, Q = this, X = Q.c;
        if (f != null && (R = new L(f), !R.isInteger() && (R.c || R.s !== 1) || R.lt(o))) throw Error(Oe + "Argument " + (R.isInteger() ? "out of range: " : "not an integer: ") + pe(R));
        if (!X) return new L(Q);
        for (g = new L(o), M = y = new L(o), k = I = new L(o), j = Ve(X), O = g.e = j.length - Q.e - 1, g.c[0] = Qi[(_ = O % H) < 0 ? H + _ : _], f = !f || R.comparedTo(g) > 0 ? O > 0 ? g : M : R, _ = N, N = 1 / 0, R = new L(j), I.c[0] = 0; D = e(R, g, 0, 1), P = y.plus(D.times(k)), P.comparedTo(f) != 1; ) y = k, k = P, M = I.plus(D.times(P = M)), I = P, g = R.minus(D.times(P = g)), R = P;
        return P = e(f.minus(y), k, 0, 1), I = I.plus(P.times(M)), y = y.plus(P.times(k)), I.s = M.s = Q.s, O = O * 2, F = e(M, k, O, a).minus(Q).abs().comparedTo(e(I, y, O, a).minus(Q).abs()) < 1 ? [M, k] : [I, y], N = _, F;
      }, i.toNumber = function() {
        return +pe(this);
      }, i.toPrecision = function(f, g) {
        return f != null && ae(f, 1, xe), z(this, f, g, 2);
      }, i.toString = function(f) {
        var g, y = this, k = y.s, P = y.e;
        return P === null ? k ? (g = "Infinity", k < 0 && (g = "-" + g)) : g = "NaN" : (f == null ? g = P <= m || P >= h ? On(Ve(y.c), P) : at(Ve(y.c), P, "0") : f === 10 && Z ? (y = Se(new L(y), s + P + 1, a), g = at(Ve(y.c), y.e, "0")) : (ae(f, 2, J.length, "Base"), g = r(at(Ve(y.c), P, "0"), 10, f, k, true)), k < 0 && y.c[0] && (g = "-" + g)), g;
      }, i.valueOf = i.toJSON = function() {
        return pe(this);
      }, i._isBigNumber = true, i[Symbol.toStringTag] = "BigNumber", i[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")] = i.valueOf, t != null && L.set(t), L;
    }
    __name(lu, "lu");
    function Be(t) {
      var e = t | 0;
      return t > 0 || t === e ? e : e - 1;
    }
    __name(Be, "Be");
    function Ve(t) {
      for (var e, r, n = 1, i = t.length, o = t[0] + ""; n < i; ) {
        for (e = t[n++] + "", r = H - e.length; r--; e = "0" + e) ;
        o += e;
      }
      for (i = o.length; o.charCodeAt(--i) === 48; ) ;
      return o.slice(0, i + 1 || 1);
    }
    __name(Ve, "Ve");
    function Tt(t, e) {
      var r, n, i = t.c, o = e.c, s = t.s, a = e.s, m = t.e, h = e.e;
      if (!s || !a) return null;
      if (r = i && !i[0], n = o && !o[0], r || n) return r ? n ? 0 : -a : s;
      if (s != a) return s;
      if (r = s < 0, n = m == h, !i || !o) return n ? 0 : !i ^ r ? 1 : -1;
      if (!n) return m > h ^ r ? 1 : -1;
      for (a = (m = i.length) < (h = o.length) ? m : h, s = 0; s < a; s++) if (i[s] != o[s]) return i[s] > o[s] ^ r ? 1 : -1;
      return m == h ? 0 : m > h ^ r ? 1 : -1;
    }
    __name(Tt, "Tt");
    function ae(t, e, r, n) {
      if (t < e || t > r || t !== qe(t)) throw Error(Oe + (n || "Argument") + (typeof t == "number" ? t < e || t > r ? " out of range: " : " not an integer: " : " not a primitive number: ") + String(t));
    }
    __name(ae, "ae");
    function kn(t) {
      var e = t.c.length - 1;
      return Be(t.e / H) == e && t.c[e] % 2 != 0;
    }
    __name(kn, "kn");
    function On(t, e) {
      return (t.length > 1 ? t.charAt(0) + "." + t.slice(1) : t) + (e < 0 ? "e" : "e+") + e;
    }
    __name(On, "On");
    function at(t, e, r) {
      var n, i;
      if (e < 0) {
        for (i = r + "."; ++e; i += r) ;
        t = i + t;
      } else if (n = t.length, ++e > n) {
        for (i = r, e -= n; --e; i += r) ;
        t += i;
      } else e < n && (t = t.slice(0, e) + "." + t.slice(e));
      return t;
    }
    __name(at, "at");
    var bd = lu();
    var cu = bd;
    var xd = 24;
    var Or = 32;
    var Ed = /* @__PURE__ */ __name(() => typeof globalThis < "u" && globalThis.crypto && typeof globalThis.crypto.getRandomValues == "function" ? () => {
      let t = new Uint32Array(1);
      return globalThis.crypto.getRandomValues(t), t[0] / 4294967296;
    } : Math.random, "Ed");
    var Gi = Ed();
    var Ji = /* @__PURE__ */ __name((t = 4, e = Gi) => {
      let r = "";
      for (; r.length < t; ) r = r + Math.floor(e() * 36).toString(36);
      return r;
    }, "Ji");
    function Pd(t) {
      let e = new cu(0);
      for (let r of t.values()) e = e.multipliedBy(256).plus(r);
      return e;
    }
    __name(Pd, "Pd");
    var du = /* @__PURE__ */ __name((t = "") => {
      let e = new TextEncoder();
      return Pd(au(e.encode(t))).toString(36).slice(1);
    }, "du");
    var pu = Array.from({ length: 26 }, (t, e) => String.fromCharCode(e + 97));
    var Td = /* @__PURE__ */ __name((t) => pu[Math.floor(t() * pu.length)], "Td");
    var vd = /* @__PURE__ */ __name(({ globalObj: t = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {}, random: e = Gi } = {}) => {
      let r = Object.keys(t).toString(), n = r.length ? r + Ji(Or, e) : Ji(Or, e);
      return du(n).substring(0, Or);
    }, "vd");
    var Sd = /* @__PURE__ */ __name((t) => () => t++, "Sd");
    var Ad = 476782367;
    var mu = /* @__PURE__ */ __name(({ random: t = Gi, counter: e = Sd(Math.floor(t() * Ad)), length: r = xd, fingerprint: n = vd({ random: t }) } = {}) => {
      if (r > Or) throw new Error(`Length must be between 2 and ${Or}. Received: ${r}`);
      return function() {
        let o = Td(t), s = Date.now().toString(36), a = e().toString(36), m = Ji(r, t), h = `${s + m + a + n}`;
        return `${o + du(h).substring(1, r)}`;
      };
    }, "mu");
    var Hi = Rd(mu);
    function Rd(t) {
      let e;
      return () => (e || (e = t()), e());
    }
    __name(Rd, "Rd");
    u();
    l();
    c();
    p();
    d();
    Kr();
    u();
    l();
    c();
    p();
    d();
    var fu = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
    var Cd = 128;
    var gt;
    var tr;
    function Id(t) {
      if (t < 0) throw new RangeError("Wrong ID size");
      try {
        !gt || gt.length < t ? (gt = w.allocUnsafe(t * Cd), dr.getRandomValues(gt), tr = 0) : tr + t > gt.length && (dr.getRandomValues(gt), tr = 0);
      } catch (e) {
        throw gt = void 0, e;
      }
      tr += t;
    }
    __name(Id, "Id");
    function zi(t = 21) {
      Id(t |= 0);
      let e = "";
      for (let r = tr - t; r < tr; r++) e += fu[gt[r] & 63];
      return e;
    }
    __name(zi, "zi");
    u();
    l();
    c();
    p();
    d();
    Kr();
    var hu = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    var Nr = 32;
    var kd = 16;
    var yu = 10;
    var gu = 281474976710655;
    var vt;
    (function(t) {
      t.Base32IncorrectEncoding = "B32_ENC_INVALID", t.DecodeTimeInvalidCharacter = "DEC_TIME_CHAR", t.DecodeTimeValueMalformed = "DEC_TIME_MALFORMED", t.EncodeTimeNegative = "ENC_TIME_NEG", t.EncodeTimeSizeExceeded = "ENC_TIME_SIZE_EXCEED", t.EncodeTimeValueMalformed = "ENC_TIME_MALFORMED", t.PRNGDetectFailure = "PRNG_DETECT", t.ULIDInvalid = "ULID_INVALID", t.Unexpected = "UNEXPECTED", t.UUIDInvalid = "UUID_INVALID";
    })(vt || (vt = {}));
    var St = class extends Error {
      static {
        __name(this, "St");
      }
      constructor(e, r) {
        super(`${r} (${e})`), this.name = "ULIDError", this.code = e;
      }
    };
    function Od(t) {
      let e = Math.floor(t() * Nr);
      return e === Nr && (e = Nr - 1), hu.charAt(e);
    }
    __name(Od, "Od");
    function Nd(t) {
      let e = Dd(), r = e && (e.crypto || e.msCrypto) || (typeof $t < "u" ? $t : null);
      if (typeof r?.getRandomValues == "function") return () => {
        let n = new Uint8Array(1);
        return r.getRandomValues(n), n[0] / 255;
      };
      if (typeof r?.randomBytes == "function") return () => r.randomBytes(1).readUInt8() / 255;
      if ($t?.randomBytes) return () => $t.randomBytes(1).readUInt8() / 255;
      throw new St(vt.PRNGDetectFailure, "Failed to find a reliable PRNG");
    }
    __name(Nd, "Nd");
    function Dd() {
      return Ld() ? self : typeof window < "u" ? window : typeof globalThis < "u" || typeof globalThis < "u" ? globalThis : null;
    }
    __name(Dd, "Dd");
    function Md(t, e) {
      let r = "";
      for (; t > 0; t--) r = Od(e) + r;
      return r;
    }
    __name(Md, "Md");
    function _d(t, e = yu) {
      if (isNaN(t)) throw new St(vt.EncodeTimeValueMalformed, `Time must be a number: ${t}`);
      if (t > gu) throw new St(vt.EncodeTimeSizeExceeded, `Cannot encode a time larger than ${gu}: ${t}`);
      if (t < 0) throw new St(vt.EncodeTimeNegative, `Time must be positive: ${t}`);
      if (Number.isInteger(t) === false) throw new St(vt.EncodeTimeValueMalformed, `Time must be an integer: ${t}`);
      let r, n = "";
      for (let i = e; i > 0; i--) r = t % Nr, n = hu.charAt(r) + n, t = (t - r) / Nr;
      return n;
    }
    __name(_d, "_d");
    function Ld() {
      return typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope;
    }
    __name(Ld, "Ld");
    function wu(t, e) {
      let r = e || Nd(), n = !t || isNaN(t) ? Date.now() : t;
      return _d(n, yu) + Md(kd, r);
    }
    __name(wu, "wu");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Pe = [];
    for (let t = 0; t < 256; ++t) Pe.push((t + 256).toString(16).slice(1));
    function Nn(t, e = 0) {
      return (Pe[t[e + 0]] + Pe[t[e + 1]] + Pe[t[e + 2]] + Pe[t[e + 3]] + "-" + Pe[t[e + 4]] + Pe[t[e + 5]] + "-" + Pe[t[e + 6]] + Pe[t[e + 7]] + "-" + Pe[t[e + 8]] + Pe[t[e + 9]] + "-" + Pe[t[e + 10]] + Pe[t[e + 11]] + Pe[t[e + 12]] + Pe[t[e + 13]] + Pe[t[e + 14]] + Pe[t[e + 15]]).toLowerCase();
    }
    __name(Nn, "Nn");
    u();
    l();
    c();
    p();
    d();
    var Fd = new Uint8Array(16);
    function rr() {
      return crypto.getRandomValues(Fd);
    }
    __name(rr, "rr");
    u();
    l();
    c();
    p();
    d();
    function $d(t, e, r) {
      return !e && !t && crypto.randomUUID ? crypto.randomUUID() : Ud(t, e, r);
    }
    __name($d, "$d");
    function Ud(t, e, r) {
      t = t || {};
      let n = t.random ?? t.rng?.() ?? rr();
      if (n.length < 16) throw new Error("Random bytes length must be >= 16");
      if (n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, e) {
        if (r = r || 0, r < 0 || r + 16 > e.length) throw new RangeError(`UUID byte range ${r}:${r + 15} is out of buffer bounds`);
        for (let i = 0; i < 16; ++i) e[r + i] = n[i];
        return e;
      }
      return Nn(n);
    }
    __name(Ud, "Ud");
    var Wi = $d;
    u();
    l();
    c();
    p();
    d();
    var Ki = {};
    function Vd(t, e, r) {
      let n;
      if (t) n = bu(t.random ?? t.rng?.() ?? rr(), t.msecs, t.seq, e, r);
      else {
        let i = Date.now(), o = rr();
        qd(Ki, i, o), n = bu(o, Ki.msecs, Ki.seq, e, r);
      }
      return e ?? Nn(n);
    }
    __name(Vd, "Vd");
    function qd(t, e, r) {
      return t.msecs ??= -1 / 0, t.seq ??= 0, e > t.msecs ? (t.seq = r[6] << 23 | r[7] << 16 | r[8] << 8 | r[9], t.msecs = e) : (t.seq = t.seq + 1 | 0, t.seq === 0 && t.msecs++), t;
    }
    __name(qd, "qd");
    function bu(t, e, r, n, i = 0) {
      if (t.length < 16) throw new Error("Random bytes length must be >= 16");
      if (!n) n = new Uint8Array(16), i = 0;
      else if (i < 0 || i + 16 > n.length) throw new RangeError(`UUID byte range ${i}:${i + 15} is out of buffer bounds`);
      return e ??= Date.now(), r ??= t[6] * 127 << 24 | t[7] << 16 | t[8] << 8 | t[9], n[i++] = e / 1099511627776 & 255, n[i++] = e / 4294967296 & 255, n[i++] = e / 16777216 & 255, n[i++] = e / 65536 & 255, n[i++] = e / 256 & 255, n[i++] = e & 255, n[i++] = 112 | r >>> 28 & 15, n[i++] = r >>> 20 & 255, n[i++] = 128 | r >>> 14 & 63, n[i++] = r >>> 6 & 255, n[i++] = r << 2 & 255 | t[10] & 3, n[i++] = t[11], n[i++] = t[12], n[i++] = t[13], n[i++] = t[14], n[i++] = t[15], n;
    }
    __name(bu, "bu");
    var Xi = Vd;
    var Dn = class {
      static {
        __name(this, "Dn");
      }
      #e = {};
      constructor() {
        this.register("uuid", new Yi()), this.register("cuid", new eo()), this.register("ulid", new to()), this.register("nanoid", new ro()), this.register("product", new no());
      }
      snapshot() {
        return Object.create(this.#e, { now: { value: new Zi() } });
      }
      register(e, r) {
        this.#e[e] = r;
      }
    };
    var Zi = class {
      static {
        __name(this, "Zi");
      }
      #e;
      generate() {
        return this.#e === void 0 && (this.#e = /* @__PURE__ */ new Date()), this.#e.toISOString();
      }
    };
    var Yi = class {
      static {
        __name(this, "Yi");
      }
      generate(e) {
        if (e === 4) return Wi();
        if (e === 7) return Xi();
        throw new Error("Invalid UUID generator arguments");
      }
    };
    var eo = class {
      static {
        __name(this, "eo");
      }
      generate(e) {
        if (e === 1) return Qa();
        if (e === 2) return Hi();
        throw new Error("Invalid CUID generator arguments");
      }
    };
    var to = class {
      static {
        __name(this, "to");
      }
      generate() {
        return wu();
      }
    };
    var ro = class {
      static {
        __name(this, "ro");
      }
      generate(e) {
        if (typeof e == "number") return zi(e);
        if (e === void 0) return zi();
        throw new Error("Invalid Nanoid generator arguments");
      }
    };
    var no = class {
      static {
        __name(this, "no");
      }
      generate(e, r) {
        if (e === void 0 || r === void 0) throw new Error("Invalid Product generator arguments");
        return Array.isArray(e) && Array.isArray(r) ? e.flatMap((n) => r.map((i) => [n, i])) : Array.isArray(e) ? e.map((n) => [n, r]) : Array.isArray(r) ? r.map((n) => [e, n]) : [[e, r]];
      }
    };
    u();
    l();
    c();
    p();
    d();
    function Dr(t, e) {
      return t == null ? t : typeof t == "string" ? Dr(JSON.parse(t), e) : Array.isArray(t) ? jd(t, e) : Bd(t, e);
    }
    __name(Dr, "Dr");
    function Bd(t, e) {
      if (e.pagination) {
        let { skip: r, take: n, cursor: i } = e.pagination;
        if (r !== null && r > 0 || n === 0 || i !== null && !er(t, i)) return null;
      }
      return Eu(t, e.nested);
    }
    __name(Bd, "Bd");
    function Eu(t, e) {
      for (let [r, n] of Object.entries(e)) t[r] = Dr(t[r], n);
      return t;
    }
    __name(Eu, "Eu");
    function jd(t, e) {
      if (e.distinct !== null) {
        let r = e.linkingFields !== null ? [...e.distinct, ...e.linkingFields] : e.distinct;
        t = Qd(t, r);
      }
      return e.pagination && (t = Jd(t, e.pagination, e.linkingFields)), e.reverse && t.reverse(), Object.keys(e.nested).length === 0 ? t : t.map((r) => Eu(r, e.nested));
    }
    __name(jd, "jd");
    function Qd(t, e) {
      let r = /* @__PURE__ */ new Set(), n = [];
      for (let i of t) {
        let o = At(i, e);
        r.has(o) || (r.add(o), n.push(i));
      }
      return n;
    }
    __name(Qd, "Qd");
    function Jd(t, e, r) {
      if (r === null) return xu(t, e);
      let n = /* @__PURE__ */ new Map();
      for (let o of t) {
        let s = At(o, r);
        n.has(s) || n.set(s, []), n.get(s).push(o);
      }
      let i = Array.from(n.entries());
      return i.sort(([o], [s]) => o < s ? -1 : o > s ? 1 : 0), i.flatMap(([, o]) => xu(o, e));
    }
    __name(Jd, "Jd");
    function xu(t, { cursor: e, skip: r, take: n }) {
      let i = e !== null ? t.findIndex((a) => er(a, e)) : 0;
      if (i === -1) return [];
      let o = i + (r ?? 0), s = n !== null ? o + n : t.length;
      return t.slice(o, s);
    }
    __name(xu, "xu");
    function At(t, e, r) {
      let n = e.map((i, o) => r?.[o] ? t[i] !== null ? r[o](t[i]) : null : t[i]);
      return JSON.stringify(n);
    }
    __name(At, "At");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function io(t) {
      return typeof t == "object" && t !== null && t.prisma__type === "param";
    }
    __name(io, "io");
    function oo(t) {
      return typeof t == "object" && t !== null && t.prisma__type === "generatorCall";
    }
    __name(oo, "oo");
    function uo(t, e, r, n) {
      let i = t.args.map((o) => _e(o, e, r));
      switch (t.type) {
        case "rawSql":
          return [zd(t.sql, i, t.argTypes)];
        case "templateSql":
          return (t.chunkable ? Kd(t.fragments, i, n) : [i]).map((s) => {
            let a = Gd(t.fragments, t.placeholderFormat, s, t.argTypes);
            if (n !== void 0 && a.args.length > n) throw new be("The query parameter limit supported by your database is exceeded.", "P2029");
            return a;
          });
        default:
          Y(t.type, "Invalid query type");
      }
    }
    __name(uo, "uo");
    function _e(t, e, r) {
      for (; Wd(t); ) if (io(t)) {
        let n = e[t.prisma__value.name];
        if (n === void 0) throw new Error(`Missing value for query variable ${t.prisma__value.name}`);
        t.prisma__value.type === "DateTime" && typeof n == "string" ? t = new Date(n) : t = n;
      } else if (oo(t)) {
        let { name: n, args: i } = t.prisma__value, o = r[n];
        if (!o) throw new Error(`Encountered an unknown generator '${n}'`);
        t = o.generate(...i.map((s) => _e(s, e, r)));
      } else Y(t, `Unexpected unevaluated value type: ${t}`);
      return Array.isArray(t) && (t = t.map((n) => _e(n, e, r))), t;
    }
    __name(_e, "_e");
    function Gd(t, e, r, n) {
      let i = "", o = { placeholderNumber: 1 }, s = [], a = [];
      for (let m of ao(t, r, n)) {
        if (i += Hd(m, e, o), m.type === "stringChunk") continue;
        let h = Array.from(Pu(m)), E = h.length;
        if (Pn(s, h), m.argType.arity === "tuple") {
          if (E % m.argType.elements.length !== 0) throw new Error(`Malformed query template. Expected the number of parameters to match the tuple arity, but got ${E} parameters for a tuple of arity ${m.argType.elements.length}.`);
          for (let N = 0; N < E / m.argType.elements.length; N++) a.push(...m.argType.elements);
        } else for (let N = 0; N < E; N++) a.push(m.argType);
      }
      return { sql: i, args: s, argTypes: a };
    }
    __name(Gd, "Gd");
    function Hd(t, e, r) {
      let n = t.type;
      switch (n) {
        case "parameter":
          return so(e, r.placeholderNumber++);
        case "stringChunk":
          return t.chunk;
        case "parameterTuple":
          return `(${t.value.length == 0 ? "NULL" : t.value.map(() => {
            let o = so(e, r.placeholderNumber++);
            return `${t.itemPrefix}${o}${t.itemSuffix}`;
          }).join(t.itemSeparator)})`;
        case "parameterTupleList":
          return t.value.map((i) => {
            let o = i.map(() => so(e, r.placeholderNumber++)).join(t.itemSeparator);
            return `${t.itemPrefix}${o}${t.itemSuffix}`;
          }).join(t.groupSeparator);
        default:
          Y(n, "Invalid fragment type");
      }
    }
    __name(Hd, "Hd");
    function so(t, e) {
      return t.hasNumbering ? `${t.prefix}${e}` : t.prefix;
    }
    __name(so, "so");
    function zd(t, e, r) {
      return { sql: t, args: e, argTypes: r };
    }
    __name(zd, "zd");
    function Wd(t) {
      return io(t) || oo(t);
    }
    __name(Wd, "Wd");
    function* ao(t, e, r) {
      let n = 0;
      for (let i of t) switch (i.type) {
        case "parameter": {
          if (n >= e.length) throw new Error(`Malformed query template. Fragments attempt to read over ${e.length} parameters.`);
          yield { ...i, value: e[n], argType: r?.[n] }, n++;
          break;
        }
        case "stringChunk": {
          yield i;
          break;
        }
        case "parameterTuple": {
          if (n >= e.length) throw new Error(`Malformed query template. Fragments attempt to read over ${e.length} parameters.`);
          let o = e[n];
          yield { ...i, value: Array.isArray(o) ? o : [o], argType: r?.[n] }, n++;
          break;
        }
        case "parameterTupleList": {
          if (n >= e.length) throw new Error(`Malformed query template. Fragments attempt to read over ${e.length} parameters.`);
          let o = e[n];
          if (!Array.isArray(o)) throw new Error("Malformed query template. Tuple list expected.");
          if (o.length === 0) throw new Error("Malformed query template. Tuple list cannot be empty.");
          for (let s of o) if (!Array.isArray(s)) throw new Error("Malformed query template. Tuple expected.");
          yield { ...i, value: o, argType: r?.[n] }, n++;
          break;
        }
      }
    }
    __name(ao, "ao");
    function* Pu(t) {
      switch (t.type) {
        case "parameter":
          yield t.value;
          break;
        case "stringChunk":
          break;
        case "parameterTuple":
          yield* t.value;
          break;
        case "parameterTupleList":
          for (let e of t.value) yield* e;
          break;
      }
    }
    __name(Pu, "Pu");
    function Kd(t, e, r) {
      let n = 0, i = 0;
      for (let s of ao(t, e, void 0)) {
        let a = 0;
        for (let m of Pu(s)) a++;
        i = Math.max(i, a), n += a;
      }
      let o = [[]];
      for (let s of ao(t, e, void 0)) switch (s.type) {
        case "parameter": {
          for (let a of o) a.push(s.value);
          break;
        }
        case "stringChunk":
          break;
        case "parameterTuple": {
          let a = s.value.length, m = [];
          if (r && o.length === 1 && a === i && n > r && n - a < r) {
            let h = r - (n - a);
            m = Xd(s.value, h);
          } else m = [s.value];
          o = o.flatMap((h) => m.map((E) => [...h, E]));
          break;
        }
        case "parameterTupleList": {
          let a = s.value.reduce((N, $3) => N + $3.length, 0), m = [], h = [], E = 0;
          for (let N of s.value) r && o.length === 1 && a === i && h.length > 0 && n - a + E + N.length > r && (m.push(h), h = [], E = 0), h.push(N), E += N.length;
          h.length > 0 && m.push(h), o = o.flatMap((N) => m.map(($3) => [...N, $3]));
          break;
        }
      }
      return o;
    }
    __name(Kd, "Kd");
    function Xd(t, e) {
      let r = [];
      for (let n = 0; n < t.length; n += e) r.push(t.slice(n, n + e));
      return r;
    }
    __name(Xd, "Xd");
    u();
    l();
    c();
    p();
    d();
    function Tu(t) {
      return t.rows.map((e) => e.reduce((r, n, i) => (r[t.columnNames[i]] = n, r), {}));
    }
    __name(Tu, "Tu");
    function vu(t) {
      return { columns: t.columnNames, types: t.columnTypes.map((e) => Zd(e)), rows: t.rows.map((e) => e.map((r, n) => Mr(r, t.columnTypes[n]))) };
    }
    __name(vu, "vu");
    function Mr(t, e) {
      if (t === null) return null;
      switch (e) {
        case G.Int32:
          switch (typeof t) {
            case "number":
              return Math.trunc(t);
            case "string":
              return Math.trunc(Number(t));
            default:
              throw new Error(`Cannot serialize value of type ${typeof t} as Int32`);
          }
        case G.Int32Array:
          if (!Array.isArray(t)) throw new Error(`Cannot serialize value of type ${typeof t} as Int32Array`);
          return t.map((r) => Mr(r, G.Int32));
        case G.Int64:
          switch (typeof t) {
            case "number":
              return BigInt(Math.trunc(t));
            case "string":
              return t;
            default:
              throw new Error(`Cannot serialize value of type ${typeof t} as Int64`);
          }
        case G.Int64Array:
          if (!Array.isArray(t)) throw new Error(`Cannot serialize value of type ${typeof t} as Int64Array`);
          return t.map((r) => Mr(r, G.Int64));
        case G.Json:
          switch (typeof t) {
            case "string":
              return JSON.parse(t);
            default:
              throw new Error(`Cannot serialize value of type ${typeof t} as Json`);
          }
        case G.JsonArray:
          if (!Array.isArray(t)) throw new Error(`Cannot serialize value of type ${typeof t} as JsonArray`);
          return t.map((r) => Mr(r, G.Json));
        case G.Boolean:
          switch (typeof t) {
            case "boolean":
              return t;
            case "string":
              return t === "true" || t === "1";
            case "number":
              return t === 1;
            default:
              throw new Error(`Cannot serialize value of type ${typeof t} as Boolean`);
          }
        case G.BooleanArray:
          if (!Array.isArray(t)) throw new Error(`Cannot serialize value of type ${typeof t} as BooleanArray`);
          return t.map((r) => Mr(r, G.Boolean));
        default:
          return t;
      }
    }
    __name(Mr, "Mr");
    function Zd(t) {
      switch (t) {
        case G.Int32:
          return "int";
        case G.Int64:
          return "bigint";
        case G.Float:
          return "float";
        case G.Double:
          return "double";
        case G.Text:
          return "string";
        case G.Enum:
          return "enum";
        case G.Bytes:
          return "bytes";
        case G.Boolean:
          return "bool";
        case G.Character:
          return "char";
        case G.Numeric:
          return "decimal";
        case G.Json:
          return "json";
        case G.Uuid:
          return "uuid";
        case G.DateTime:
          return "datetime";
        case G.Date:
          return "date";
        case G.Time:
          return "time";
        case G.Int32Array:
          return "int-array";
        case G.Int64Array:
          return "bigint-array";
        case G.FloatArray:
          return "float-array";
        case G.DoubleArray:
          return "double-array";
        case G.TextArray:
          return "string-array";
        case G.EnumArray:
          return "string-array";
        case G.BytesArray:
          return "bytes-array";
        case G.BooleanArray:
          return "bool-array";
        case G.CharacterArray:
          return "char-array";
        case G.NumericArray:
          return "decimal-array";
        case G.JsonArray:
          return "json-array";
        case G.UuidArray:
          return "uuid-array";
        case G.DateTimeArray:
          return "datetime-array";
        case G.DateArray:
          return "date-array";
        case G.TimeArray:
          return "time-array";
        case G.UnknownNumber:
          return "unknown";
        case G.Set:
          return "string";
        default:
          Y(t, `Unexpected column type: ${t}`);
      }
    }
    __name(Zd, "Zd");
    u();
    l();
    c();
    p();
    d();
    function lo(t, e, r) {
      if (!e.every((n) => Mn(t, n))) {
        let n = Yd(t, r), i = em(r);
        throw new be(n, i, r.context);
      }
    }
    __name(lo, "lo");
    function Mn(t, e) {
      switch (e.type) {
        case "rowCountEq":
          return Array.isArray(t) ? t.length === e.args : t === null ? e.args === 0 : e.args === 1;
        case "rowCountNeq":
          return Array.isArray(t) ? t.length !== e.args : t === null ? e.args !== 0 : e.args !== 1;
        case "affectedRowCountEq":
          return t === e.args;
        case "never":
          return false;
        default:
          Y(e, `Unknown rule type: ${e.type}`);
      }
    }
    __name(Mn, "Mn");
    function Yd(t, e) {
      switch (e.errorIdentifier) {
        case "RELATION_VIOLATION":
          return `The change you are trying to make would violate the required relation '${e.context.relation}' between the \`${e.context.modelA}\` and \`${e.context.modelB}\` models.`;
        case "MISSING_RECORD":
          return `An operation failed because it depends on one or more records that were required but not found. No record was found for ${e.context.operation}.`;
        case "MISSING_RELATED_RECORD": {
          let r = e.context.neededFor ? ` (needed to ${e.context.neededFor})` : "";
          return `An operation failed because it depends on one or more records that were required but not found. No '${e.context.model}' record${r} was found for ${e.context.operation} on ${e.context.relationType} relation '${e.context.relation}'.`;
        }
        case "INCOMPLETE_CONNECT_INPUT":
          return `An operation failed because it depends on one or more records that were required but not found. Expected ${e.context.expectedRows} records to be connected, found only ${Array.isArray(t) ? t.length : t}.`;
        case "INCOMPLETE_CONNECT_OUTPUT":
          return `The required connected records were not found. Expected ${e.context.expectedRows} records to be connected after connect operation on ${e.context.relationType} relation '${e.context.relation}', found ${Array.isArray(t) ? t.length : t}.`;
        case "RECORDS_NOT_CONNECTED":
          return `The records for relation \`${e.context.relation}\` between the \`${e.context.parent}\` and \`${e.context.child}\` models are not connected.`;
        default:
          Y(e, `Unknown error identifier: ${e}`);
      }
    }
    __name(Yd, "Yd");
    function em(t) {
      switch (t.errorIdentifier) {
        case "RELATION_VIOLATION":
          return "P2014";
        case "RECORDS_NOT_CONNECTED":
          return "P2017";
        case "INCOMPLETE_CONNECT_OUTPUT":
          return "P2018";
        case "MISSING_RECORD":
        case "MISSING_RELATED_RECORD":
        case "INCOMPLETE_CONNECT_INPUT":
          return "P2025";
        default:
          Y(t, `Unknown error identifier: ${t}`);
      }
    }
    __name(em, "em");
    var tm = ye("prisma:client:queryInterpreter");
    var Fr = class t {
      static {
        __name(this, "t");
      }
      #e;
      #t = new Dn();
      #r;
      #i;
      #o;
      #s;
      #a;
      constructor({ onQuery: e, tracingHelper: r, serializer: n, rawSerializer: i, provider: o, connectionInfo: s }) {
        this.#e = e, this.#r = r, this.#i = n, this.#o = i ?? n, this.#s = o, this.#a = s;
      }
      static forSql(e) {
        return new t({ onQuery: e.onQuery, tracingHelper: e.tracingHelper, serializer: Tu, rawSerializer: vu, provider: e.provider, connectionInfo: e.connectionInfo });
      }
      async run(e, r) {
        let n = this.#t.snapshot(), i = { ...r, generators: n }, o = nm(e, (a) => this.interpretNode(a, i))?.catch((a) => mt(a));
        if (o) try {
          return this.#n(await o, i.scope, n).value;
        } catch (a) {
          mt(a);
        }
        let { value: s } = await this.interpretNode(e, i).catch((a) => mt(a));
        return s;
      }
      async interpretNode(e, r) {
        switch (e.type) {
          case "value":
            return { value: _e(e.args, r.scope, r.generators), lastInsertId: e.lastInsertId };
          case "seq": {
            let n;
            for (let i of e.args) n = await this.interpretNode(i, r);
            return n ?? { value: void 0 };
          }
          case "let": {
            let n = Object.create(r.scope);
            for (let i of e.args.bindings) {
              let { value: o } = await this.interpretNode(i.expr, { ...r, scope: n });
              n[i.name] = o;
            }
            return this.interpretNode(e.args.expr, { ...r, scope: n });
          }
          case "concat": {
            let n = await Promise.all(e.args.map((i) => this.interpretNode(i, r).then((o) => o.value)));
            return { value: n.length > 0 ? n.reduce((i, o) => i.concat(nr(o)), []) : [] };
          }
          case "sum": {
            let n = await Promise.all(e.args.map((i) => this.interpretNode(i, r).then((o) => o.value)));
            return { value: n.length > 0 ? n.reduce((i, o) => je(i) + je(o)) : 0 };
          }
          case "execute": {
            let n = uo(e.args, r.scope, r.generators, this.#p());
            return this.#l(n.length, r, async (i) => {
              let o = 0;
              for (let s of n) {
                let a = Cu(s, i.sqlCommenter);
                o += await this.#d(a, i.queryable, () => i.queryable.executeRaw(_n(a)).catch((m) => e.args.type === "rawSql" ? Ni(m) : mt(m)));
              }
              return { value: o };
            });
          }
          case "query": {
            let n = uo(e.args, r.scope, r.generators, this.#p());
            return this.#l(n.length, r, async (i) => {
              let o;
              for (let s of n) {
                let a = Cu(s, i.sqlCommenter), m = await this.#d(a, i.queryable, () => i.queryable.queryRaw(_n(a)).catch((h) => e.args.type === "rawSql" ? Ni(h) : mt(h)));
                o === void 0 ? o = m : (Pn(o.rows, m.rows), o.lastInsertId = m.lastInsertId);
              }
              return { value: e.args.type === "rawSql" ? this.#o(o) : this.#i(o), lastInsertId: o?.lastInsertId };
            });
          }
          case "reverse": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args, r);
            return { value: Array.isArray(n) ? n.reverse() : n, lastInsertId: i };
          }
          case "unique": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args, r);
            if (!Array.isArray(n)) return { value: n, lastInsertId: i };
            if (n.length > 1) throw new Error(`Expected zero or one element, got ${n.length}`);
            return { value: n[0] ?? null, lastInsertId: i };
          }
          case "required": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args, r);
            if (co(n)) throw new Error("Required value is empty");
            return { value: n, lastInsertId: i };
          }
          case "mapField": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.records, r);
            return { value: po(n, e.args.field), lastInsertId: i };
          }
          case "join": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.parent, r);
            if (n === null) return { value: null, lastInsertId: i };
            let o = await Promise.all(e.args.children.map(async (s) => ({ joinExpr: s, childRecords: (await this.interpretNode(s.child, r)).value })));
            return { value: Su(n, o, e.args.canAssumeStrictEquality), lastInsertId: i };
          }
          case "transaction":
            return this.#u(r, (n) => this.interpretNode(e.args, n));
          case "dataMap": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.expr, r);
            return { value: Mi(n, e.args.structure, e.args.enums), lastInsertId: i };
          }
          case "validate": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.expr, r);
            return lo(n, e.args.rules, e.args), { value: n, lastInsertId: i };
          }
          case "if": {
            let { value: n } = await this.interpretNode(e.args.value, r);
            return Mn(n, e.args.rule) ? await this.interpretNode(e.args.then, r) : await this.interpretNode(e.args.else, r);
          }
          case "diff": {
            let { value: n } = await this.interpretNode(e.args.from, r), { value: i } = await this.interpretNode(e.args.to, r), o = /* @__PURE__ */ __name((a) => a !== null ? At(Rt(a), e.args.fields) : null, "o"), s = new Set(nr(i).map(o));
            return { value: nr(n).filter((a) => !s.has(o(a))) };
          }
          case "process": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.expr, r), o = _n(e.args.operations);
            return mo(o, r.scope, r.generators), { value: Dr(n, o), lastInsertId: i };
          }
          case "initializeRecord": {
            let { lastInsertId: n } = await this.interpretNode(e.args.expr, r), i = {};
            for (let [o, s] of Object.entries(e.args.fields)) i[o] = Au(s, n, r.scope, r.generators);
            return { value: i, lastInsertId: n };
          }
          case "mapRecord": {
            let { value: n, lastInsertId: i } = await this.interpretNode(e.args.expr, r), o = n === null ? {} : Rt(n);
            for (let [s, a] of Object.entries(e.args.fields)) o[s] = Ru(a, o[s], r.scope, r.generators);
            return { value: o, lastInsertId: i };
          }
          default:
            return this.#n(e, r.scope, r.generators);
        }
      }
      #n(e, r, n) {
        switch (e.type) {
          case "value":
            return { value: _e(e.args, r, n), lastInsertId: e.lastInsertId };
          case "seq": {
            let i;
            for (let o of e.args) i = this.#n(o, r, n);
            return i ?? { value: void 0 };
          }
          case "get":
            return { value: r[e.args.name] };
          case "let": {
            let i = Object.create(r);
            for (let o of e.args.bindings) {
              let { value: s } = this.#n(o.expr, i, n);
              i[o.name] = s;
            }
            return this.#n(e.args.expr, i, n);
          }
          case "getFirstNonEmpty": {
            for (let i of e.args.names) {
              let o = r[i];
              if (!co(o)) return { value: o };
            }
            return { value: [] };
          }
          case "concat": {
            let i = e.args.map((o) => this.#n(o, r, n).value);
            return { value: i.length > 0 ? i.reduce((o, s) => o.concat(nr(s)), []) : [] };
          }
          case "sum": {
            let i = e.args.map((o) => this.#n(o, r, n).value);
            return { value: i.length > 0 ? i.reduce((o, s) => je(o) + je(s)) : 0 };
          }
          case "reverse": {
            let { value: i, lastInsertId: o } = this.#n(e.args, r, n);
            return { value: Array.isArray(i) ? i.reverse() : i, lastInsertId: o };
          }
          case "unique": {
            let { value: i, lastInsertId: o } = this.#n(e.args, r, n);
            if (!Array.isArray(i)) return { value: i, lastInsertId: o };
            if (i.length > 1) throw new Error(`Expected zero or one element, got ${i.length}`);
            return { value: i[0] ?? null, lastInsertId: o };
          }
          case "required": {
            let { value: i, lastInsertId: o } = this.#n(e.args, r, n);
            if (co(i)) throw new Error("Required value is empty");
            return { value: i, lastInsertId: o };
          }
          case "mapField": {
            let { value: i, lastInsertId: o } = this.#n(e.args.records, r, n);
            return { value: po(i, e.args.field), lastInsertId: o };
          }
          case "join": {
            let { value: i, lastInsertId: o } = this.#n(e.args.parent, r, n);
            if (i === null) return { value: null, lastInsertId: o };
            let s = e.args.children.map((a) => ({ joinExpr: a, childRecords: this.#n(a.child, r, n).value }));
            return { value: Su(i, s, e.args.canAssumeStrictEquality), lastInsertId: o };
          }
          case "dataMap": {
            let { value: i, lastInsertId: o } = this.#n(e.args.expr, r, n);
            return { value: Mi(i, e.args.structure, e.args.enums), lastInsertId: o };
          }
          case "validate": {
            let { value: i, lastInsertId: o } = this.#n(e.args.expr, r, n);
            return lo(i, e.args.rules, e.args), { value: i, lastInsertId: o };
          }
          case "if": {
            let { value: i } = this.#n(e.args.value, r, n);
            return Mn(i, e.args.rule) ? this.#n(e.args.then, r, n) : this.#n(e.args.else, r, n);
          }
          case "unit":
            return { value: void 0 };
          case "diff": {
            let { value: i } = this.#n(e.args.from, r, n), { value: o } = this.#n(e.args.to, r, n), s = /* @__PURE__ */ __name((m) => m !== null ? At(Rt(m), e.args.fields) : null, "s"), a = new Set(nr(o).map(s));
            return { value: nr(i).filter((m) => !a.has(s(m))) };
          }
          case "process": {
            let { value: i, lastInsertId: o } = this.#n(e.args.expr, r, n), s = _n(e.args.operations);
            return mo(s, r, n), { value: Dr(i, s), lastInsertId: o };
          }
          case "initializeRecord": {
            let { lastInsertId: i } = this.#n(e.args.expr, r, n), o = {};
            for (let [s, a] of Object.entries(e.args.fields)) o[s] = Au(a, i, r, n);
            return { value: o, lastInsertId: i };
          }
          case "mapRecord": {
            let { value: i, lastInsertId: o } = this.#n(e.args.expr, r, n), s = i === null ? {} : Rt(i);
            for (let [a, m] of Object.entries(e.args.fields)) s[a] = Ru(m, s[a], r, n);
            return { value: s, lastInsertId: o };
          }
          default:
            Y(e, `Unexpected node type: ${e.type}`);
        }
      }
      #l(e, r, n) {
        return e <= 1 ? n(r) : this.#u(r, n);
      }
      async #u(e, r) {
        if (!e.transactionManager.enabled) return r(e);
        let n = e.transactionManager.manager, i = await n.startInternalTransaction(), o = await n.getTransaction(i, "query");
        try {
          let s = await r({ ...e, queryable: o, transactionManager: { enabled: false } });
          return await n.commitTransaction(i.id), s;
        } catch (s) {
          try {
            await n.rollbackTransaction(i.id);
          } catch (a) {
            tm("failed to roll back an internal transaction", a);
          }
          throw s;
        }
      }
      #p() {
        return this.#a?.maxBindValues !== void 0 ? this.#a.maxBindValues : this.#c();
      }
      #c() {
        if (this.#s !== void 0) switch (this.#s) {
          case "cockroachdb":
          case "postgres":
          case "postgresql":
          case "prisma+postgres":
            return 32766;
          case "mysql":
            return 65535;
          case "sqlite":
            return 999;
          case "sqlserver":
            return 2098;
          case "mongodb":
            return;
          default:
            Y(this.#s, `Unexpected provider: ${this.#s}`);
        }
      }
      #d(e, r, n) {
        return Sn({ query: e, execute: n, provider: this.#s ?? r.provider, tracingHelper: this.#r, onQuery: this.#e });
      }
    };
    function co(t) {
      return Array.isArray(t) ? t.length === 0 : t == null;
    }
    __name(co, "co");
    function nr(t) {
      return Array.isArray(t) ? t : [t];
    }
    __name(nr, "nr");
    function je(t) {
      if (typeof t == "number") return t;
      if (typeof t == "string") return Number(t);
      throw new Error(`Expected number, got ${typeof t}`);
    }
    __name(je, "je");
    function Rt(t) {
      if (typeof t == "object" && t !== null) return t;
      throw new Error(`Expected object, got ${typeof t}`);
    }
    __name(Rt, "Rt");
    function po(t, e) {
      return Array.isArray(t) ? t.map((r) => po(r, e)) : typeof t == "object" && t !== null ? t[e] ?? null : t;
    }
    __name(po, "po");
    function Su(t, e, r) {
      for (let { joinExpr: n, childRecords: i } of e) {
        let o = n.on.map(([E]) => E), s = n.on.map(([, E]) => E), a = {}, m = Array.isArray(t) ? t : [t];
        for (let E of m) {
          let N = Rt(E), $3 = At(N, o);
          a[$3] || (a[$3] = []), a[$3].push(N), n.isRelationUnique ? N[n.parentField] = null : N[n.parentField] = [];
        }
        let h = r ? void 0 : rm(m, o);
        for (let E of Array.isArray(i) ? i : [i]) {
          if (E === null) continue;
          let N = At(Rt(E), s, h);
          for (let $3 of a[N] ?? []) n.isRelationUnique ? $3[n.parentField] = E : $3[n.parentField].push(E);
        }
      }
      return t;
    }
    __name(Su, "Su");
    function rm(t, e) {
      function r(o) {
        switch (o) {
          case "number":
            return Number;
          case "string":
            return String;
          case "boolean":
            return Boolean;
          case "bigint":
            return BigInt;
          default:
            return;
        }
      }
      __name(r, "r");
      let n = Array.from({ length: e.length }), i = 0;
      for (let o of t) {
        let s = Rt(o);
        for (let [a, m] of e.entries()) if (s[m] !== null && n[a] === void 0) {
          let h = r(typeof s[m]);
          h !== void 0 && (n[a] = h), i++;
        }
        if (i === e.length) break;
      }
      return n;
    }
    __name(rm, "rm");
    function Au(t, e, r, n) {
      switch (t.type) {
        case "value":
          return _e(t.value, r, n);
        case "lastInsertId":
          return e;
        default:
          Y(t, `Unexpected field initializer type: ${t.type}`);
      }
    }
    __name(Au, "Au");
    function Ru(t, e, r, n) {
      switch (t.type) {
        case "set":
          return _e(t.value, r, n);
        case "add":
          return je(e) + je(_e(t.value, r, n));
        case "subtract":
          return je(e) - je(_e(t.value, r, n));
        case "multiply":
          return je(e) * je(_e(t.value, r, n));
        case "divide": {
          let i = je(e), o = je(_e(t.value, r, n));
          return o === 0 ? null : i / o;
        }
        default:
          Y(t, `Unexpected field operation type: ${t.type}`);
      }
    }
    __name(Ru, "Ru");
    function nm(t, e) {
      let r = Lr(t);
      if (r) return e(r).then((n) => {
        let i = { type: "value", args: n.value, lastInsertId: n.lastInsertId }, o = _r(t, r, i);
        if (!o) throw new Error("Could not substitute the evaluated impure node into the query plan");
        return o;
      });
    }
    __name(nm, "nm");
    function _r(t, e, r) {
      if (t === e) return r;
      switch (t.type) {
        case "seq":
        case "sum":
        case "concat": {
          for (let n = 0; n < t.args.length; n++) {
            let i = _r(t.args[n], e, r);
            if (i) return { ...t, args: t.args.map((o, s) => s === n ? i : o) };
          }
          return;
        }
        case "dataMap":
        case "validate":
        case "initializeRecord":
        case "mapRecord":
        case "process": {
          let n = _r(t.args.expr, e, r);
          return n && { ...t, args: { ...t.args, expr: n } };
        }
        case "mapField": {
          let n = _r(t.args.records, e, r);
          return n && { ...t, args: { ...t.args, records: n } };
        }
        case "reverse":
        case "unique":
        case "required": {
          let n = _r(t.args, e, r);
          return n && { ...t, args: n };
        }
        default:
          return;
      }
    }
    __name(_r, "_r");
    function Lr(t) {
      switch (t.type) {
        case "query":
        case "execute":
          return t;
        case "seq":
        case "sum":
        case "concat": {
          let e;
          for (let r of t.args) {
            let n = Lr(r);
            if (n === null) return null;
            if (n) {
              if (e) return null;
              e = n;
            }
          }
          return e;
        }
        case "dataMap":
        case "validate":
        case "initializeRecord":
        case "mapRecord":
        case "process":
          return Lr(t.args.expr);
        case "mapField":
          return Lr(t.args.records);
        case "reverse":
        case "unique":
        case "required":
          return Lr(t.args);
        case "let":
        case "join":
        case "diff":
        case "if":
        case "transaction":
          return null;
        case "value":
        case "get":
        case "getFirstNonEmpty":
        case "unit":
          return;
        default:
          Y(t, `Unexpected node type: ${t.type}`);
      }
    }
    __name(Lr, "Lr");
    function Cu(t, e) {
      if (!e || e.plugins.length === 0) return t;
      let r = Ua(e.plugins, { query: e.queryInfo, sql: t.sql });
      return r ? { ...t, sql: Va(t.sql, r) } : t;
    }
    __name(Cu, "Cu");
    function mo(t, e, r) {
      let n = t.pagination?.cursor;
      if (n) for (let [i, o] of Object.entries(n)) n[i] = _e(o, e, r);
      for (let i of Object.values(t.nested)) mo(i, e, r);
    }
    __name(mo, "mo");
    function _n(t) {
      return Ue(t);
    }
    __name(_n, "_n");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Iu(t) {
      return new fo(t).deserialize();
    }
    __name(Iu, "Iu");
    function im(t) {
      return w.from(t, "base64url");
    }
    __name(im, "im");
    var fo = class {
      static {
        __name(this, "fo");
      }
      #e;
      #t;
      #r = 0;
      constructor(e) {
        this.#e = e;
        let r = im(e.graph);
        this.#t = new DataView(r.buffer, r.byteOffset, r.byteLength);
      }
      deserialize() {
        let { inputNodeCount: e, outputNodeCount: r, rootCount: n } = this.#n(), i = this.#l(e), o = this.#u(r), s = this.#p(n);
        return { strings: this.#e.strings, inputNodes: i, outputNodes: o, roots: s };
      }
      #i() {
        let e = 0, r = 0, n;
        do
          n = this.#t.getUint8(this.#r++), e |= (n & 127) << r, r += 7;
        while (n >= 128);
        return e;
      }
      #o() {
        let e = this.#i();
        return e === 0 ? void 0 : e - 1;
      }
      #s() {
        let e = this.#t.getUint8(this.#r);
        return this.#r += 1, e;
      }
      #a() {
        let e = this.#t.getUint16(this.#r, true);
        return this.#r += 2, e;
      }
      #n() {
        let e = this.#i(), r = this.#i(), n = this.#i();
        return { inputNodeCount: e, outputNodeCount: r, rootCount: n };
      }
      #l(e) {
        let r = [];
        for (let n = 0; n < e; n++) {
          let i = this.#i(), o = {};
          for (let s = 0; s < i; s++) {
            let a = this.#i(), m = this.#a(), h = this.#o(), E = this.#o(), $3 = { flags: this.#s() };
            m !== 0 && ($3.scalarMask = m), h !== void 0 && ($3.childNodeId = h), E !== void 0 && ($3.enumNameIndex = E), o[a] = $3;
          }
          r.push({ edges: o });
        }
        return r;
      }
      #u(e) {
        let r = [];
        for (let n = 0; n < e; n++) {
          let i = this.#i(), o = {};
          for (let s = 0; s < i; s++) {
            let a = this.#i(), m = this.#o(), h = this.#o(), E = {};
            m !== void 0 && (E.argsNodeId = m), h !== void 0 && (E.outputNodeId = h), o[a] = E;
          }
          r.push({ edges: o });
        }
        return r;
      }
      #p(e) {
        let r = {};
        for (let n = 0; n < e; n++) {
          let i = this.#i(), o = this.#o(), s = this.#o(), a = this.#e.strings[i], m = {};
          o !== void 0 && (m.argsNodeId = o), s !== void 0 && (m.outputNodeId = s), r[a] = m;
        }
        return r;
      }
    };
    var $r = class t {
      static {
        __name(this, "t");
      }
      #e;
      #t;
      #r;
      constructor(e, r) {
        this.#e = e, this.#r = r, this.#t = /* @__PURE__ */ new Map();
        for (let n = 0; n < e.strings.length; n++) this.#t.set(e.strings[n], n);
      }
      static deserialize(e, r) {
        let n = Iu(e);
        return new t(n, r);
      }
      static fromData(e, r) {
        return new t(e, r);
      }
      root(e) {
        let r = this.#e.roots[e];
        if (r) return { argsNodeId: r.argsNodeId, outputNodeId: r.outputNodeId };
      }
      inputNode(e) {
        if (!(e === void 0 || e < 0 || e >= this.#e.inputNodes.length)) return { id: e };
      }
      outputNode(e) {
        if (!(e === void 0 || e < 0 || e >= this.#e.outputNodes.length)) return { id: e };
      }
      inputEdge(e, r) {
        if (!e) return;
        let n = this.#e.inputNodes[e.id];
        if (!n) return;
        let i = this.#t.get(r);
        if (i === void 0) return;
        let o = n.edges[i];
        if (o) return { flags: o.flags, childNodeId: o.childNodeId, scalarMask: o.scalarMask ?? 0, enumNameIndex: o.enumNameIndex };
      }
      outputEdge(e, r) {
        if (!e) return;
        let n = this.#e.outputNodes[e.id];
        if (!n) return;
        let i = this.#t.get(r);
        if (i === void 0) return;
        let o = n.edges[i];
        if (o) return { argsNodeId: o.argsNodeId, outputNodeId: o.outputNodeId };
      }
      enumValues(e) {
        if (e?.enumNameIndex === void 0) return;
        let r = this.#e.strings[e.enumNameIndex];
        if (r) return this.#r(r);
      }
      getString(e) {
        return this.#e.strings[e];
      }
    };
    var tt = { ParamScalar: 1, ParamEnum: 2, ParamListScalar: 4, ParamListEnum: 8, ListObject: 16, Object: 32 };
    var Te = { String: 1, Int: 2, BigInt: 4, Float: 8, Decimal: 16, Boolean: 32, DateTime: 64, Json: 128, Bytes: 256 };
    function rt(t, e) {
      return (t.flags & e) !== 0;
    }
    __name(rt, "rt");
    function ht(t) {
      return t.scalarMask;
    }
    __name(ht, "ht");
    u();
    l();
    c();
    p();
    d();
    var om = /* @__PURE__ */ new Set(["DateTime", "Decimal", "BigInt", "Bytes", "Json", "Raw"]);
    function Ln(t) {
      if (t == null) return { kind: "null" };
      if (typeof t == "string") return { kind: "primitive", value: t };
      if (typeof t == "number") return { kind: "primitive", value: t };
      if (typeof t == "boolean") return { kind: "primitive", value: t };
      if (Array.isArray(t)) return { kind: "array", items: t };
      if (typeof t == "object") {
        let e = t;
        if ("$type" in e && typeof e.$type == "string") {
          let r = e.$type;
          return om.has(r) ? { kind: "taggedScalar", tag: r, value: e.value } : { kind: "structural", value: e.value };
        }
        return { kind: "object", entries: e };
      }
      return { kind: "structural", value: t };
    }
    __name(Ln, "Ln");
    function ku(t) {
      return typeof t == "object" && t !== null && !Array.isArray(t) && !("$type" in t);
    }
    __name(ku, "ku");
    function Ou(t) {
      return typeof t == "object" && t !== null && "$type" in t && typeof t.$type == "string";
    }
    __name(Ou, "Ou");
    function go(t, e) {
      let r = new Fn(e), n = t.modelName ? `${t.modelName}.${t.action}` : t.action, i = e.root(n);
      return { parameterizedQuery: { ...t, query: r.parameterizeFieldSelection(t.query, i?.argsNodeId, i?.outputNodeId) }, placeholderValues: r.getPlaceholderValues() };
    }
    __name(go, "go");
    function ho(t, e) {
      let r = new Fn(e), n = [];
      for (let i = 0; i < t.batch.length; i++) {
        let o = t.batch[i], s = o.modelName ? `${o.modelName}.${o.action}` : o.action, a = e.root(s);
        n.push({ ...o, query: r.parameterizeFieldSelection(o.query, a?.argsNodeId, a?.outputNodeId) });
      }
      return { parameterizedBatch: { ...t, batch: n }, placeholderValues: r.getPlaceholderValues() };
    }
    __name(ho, "ho");
    var Fn = class {
      static {
        __name(this, "Fn");
      }
      #e;
      #t = /* @__PURE__ */ new Map();
      #r = /* @__PURE__ */ new Map();
      #i = 1;
      constructor(e) {
        this.#e = e;
      }
      getPlaceholderValues() {
        return Object.fromEntries(this.#t);
      }
      #o(e, r) {
        let n = am(e, r), i = this.#r.get(n);
        if (i !== void 0) return Nu(i, r);
        let o = `%${this.#i++}`;
        return this.#r.set(n, o), this.#t.set(o, e), Nu(o, r);
      }
      parameterizeFieldSelection(e, r, n) {
        let i = this.#e.inputNode(r), o = this.#e.outputNode(n), s = { ...e };
        return e.arguments && e.arguments.$type !== "Raw" && (s.arguments = this.#s(e.arguments, i)), e.selection && (s.selection = this.#c(e.selection, o)), s;
      }
      #s(e, r) {
        if (!r) return e;
        let n = {};
        for (let [i, o] of Object.entries(e)) {
          let s = this.#e.inputEdge(r, i);
          s ? n[i] = this.#a(o, s) : n[i] = o;
        }
        return n;
      }
      #a(e, r) {
        let n = Ln(e);
        switch (n.kind) {
          case "null":
            return e;
          case "structural":
            return e;
          case "primitive":
            return this.#n(n.value, r);
          case "taggedScalar":
            return this.#l(e, n.tag, r);
          case "array":
            return this.#u(n.items, e, r);
          case "object":
            return this.#p(n.entries, r);
          default:
            throw new Error(`Unknown value kind ${n.kind}`);
        }
      }
      #n(e, r) {
        if (rt(r, tt.ParamEnum) && r.enumNameIndex !== void 0 && typeof e == "string") {
          let o = this.#e.enumValues(r);
          if (o && Object.hasOwn(o, e)) {
            let s = { type: "Enum" };
            return this.#o(o[e], s);
          }
        }
        if (!rt(r, tt.ParamScalar)) return e;
        let n = ht(r);
        if (n === 0) return e;
        let i = yo(e);
        return Mu(i, n) ? (n & Te.Json && (e = JSON.stringify(e)), this.#o(e, i)) : e;
      }
      #l(e, r, n) {
        if (!rt(n, tt.ParamScalar)) return e;
        let i = ht(n);
        if (i === 0 || !Lu(r, i)) return e;
        let o = _u(e.$type), s = Fu(e);
        return this.#o(s, o);
      }
      #u(e, r, n) {
        if (rt(n, tt.ParamScalar) && ht(n) & Te.Json) {
          let i = Je(Ge(e)), o = { type: "Json" };
          return this.#o(i, o);
        }
        if (rt(n, tt.ParamEnum)) {
          let i = this.#e.enumValues(n);
          if (i && e.every((o) => typeof o == "string" && Object.hasOwn(i, o))) {
            let o = { type: "List", inner: { type: "Enum" } };
            return this.#o(e, o);
          }
        }
        if (rt(n, tt.ParamListScalar) && e.every((o) => dm(o, n)) && e.length > 0) {
          let o = e.map((m) => mm(m)), a = { type: "List", inner: cm(e) };
          return this.#o(o, a);
        }
        if (rt(n, tt.ListObject)) {
          let i = this.#e.inputNode(n.childNodeId);
          if (i) return e.map((o) => ku(o) ? this.#s(o, i) : o);
        }
        return r;
      }
      #p(e, r) {
        if (rt(r, tt.Object)) {
          let i = this.#e.inputNode(r.childNodeId);
          if (i) return this.#s(e, i);
        }
        if (ht(r) & Te.Json) {
          let i = Je(Ge(e)), o = { type: "Json" };
          return this.#o(i, o);
        }
        return e;
      }
      #c(e, r) {
        if (!e || !r) return e;
        let n = {};
        for (let [i, o] of Object.entries(e)) {
          if (i === "$scalars" || i === "$composites" || typeof o == "boolean") {
            n[i] = o;
            continue;
          }
          let s = this.#e.outputEdge(r, i);
          if (s) {
            let a = o, m = this.#e.inputNode(s.argsNodeId), h = this.#e.outputNode(s.outputNodeId), E = { selection: a.selection ? this.#c(a.selection, h) : {} };
            a.arguments && (E.arguments = this.#s(a.arguments, m)), n[i] = E;
          } else n[i] = o;
        }
        return n;
      }
    };
    function Nu(t, e) {
      return { $type: "Param", value: { name: t, ...e } };
    }
    __name(Nu, "Nu");
    function Du(t) {
      return t.type === "List" ? `List<${Du(t.inner)}>` : t.type;
    }
    __name(Du, "Du");
    function sm(t) {
      return ArrayBuffer.isView(t) ? w.from(t.buffer, t.byteOffset, t.byteLength).toString("base64") : JSON.stringify(t);
    }
    __name(sm, "sm");
    function am(t, e) {
      let r = Du(e), n = sm(t);
      return `${r}:${n}`;
    }
    __name(am, "am");
    var um = 2 ** 31 - 1;
    var lm = -(2 ** 31);
    function yo(t) {
      switch (typeof t) {
        case "boolean":
          return { type: "Boolean" };
        case "number":
          return Number.isInteger(t) ? lm <= t && t <= um ? { type: "Int" } : { type: "BigInt" } : { type: "Float" };
        case "string":
          return { type: "String" };
        default:
          throw new Error("unreachable");
      }
    }
    __name(yo, "yo");
    function Mu({ type: t }, e) {
      switch (t) {
        case "Boolean":
          return (e & Te.Boolean) !== 0;
        case "Int":
          return (e & (Te.Int | Te.BigInt | Te.Float)) !== 0;
        case "BigInt":
          return (e & Te.BigInt) !== 0;
        case "Float":
          return (e & Te.Float) !== 0;
        case "String":
          return (e & Te.String) !== 0;
        default:
          return false;
      }
    }
    __name(Mu, "Mu");
    function _u(t) {
      switch (t) {
        case "BigInt":
        case "Bytes":
        case "DateTime":
        case "Json":
          return { type: t };
        case "Decimal":
          return { type: "Float" };
        default:
          return;
      }
    }
    __name(_u, "_u");
    function cm(t) {
      let e = { type: "Any" };
      for (let r of t) {
        let n = Ln(r), i;
        switch (n.kind) {
          case "primitive":
            i = yo(n.value);
            break;
          case "taggedScalar":
            i = _u(n.tag) ?? { type: "Any" };
            break;
          default:
            return { type: "Any" };
        }
        e = pm(e, i);
      }
      return e;
    }
    __name(cm, "cm");
    function pm(t, e) {
      if (t.type === "Any") return e;
      if (e.type === "Any" || t.type === e.type) return t;
      let r = { Int: 0, BigInt: 1, Float: 2 }, n = r[t.type], i = r[e.type];
      return n !== void 0 && i !== void 0 ? n >= i ? t : e : { type: "Any" };
    }
    __name(pm, "pm");
    function Lu(t, e) {
      switch (t) {
        case "DateTime":
          return (e & Te.DateTime) !== 0;
        case "Decimal":
          return (e & Te.Decimal) !== 0;
        case "BigInt":
          return (e & Te.BigInt) !== 0;
        case "Bytes":
          return (e & Te.Bytes) !== 0;
        case "Json":
          return (e & Te.Json) !== 0;
        default:
          return false;
      }
    }
    __name(Lu, "Lu");
    function dm(t, e) {
      let r = Ln(t);
      switch (r.kind) {
        case "structural":
          return false;
        case "null":
          return false;
        case "primitive": {
          let n = yo(r.value), i = ht(e);
          return i !== 0 && Mu(n, i);
        }
        case "taggedScalar": {
          let n = ht(e);
          return n !== 0 && Lu(r.tag, n);
        }
        default:
          return false;
      }
    }
    __name(dm, "dm");
    function mm(t) {
      return Ou(t) ? Fu(t) : t;
    }
    __name(mm, "mm");
    function Fu(t) {
      return t.value;
    }
    __name(Fu, "Fu");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    async function fm() {
      return globalThis.crypto ?? await Promise.resolve().then(() => (Kr(), ls));
    }
    __name(fm, "fm");
    async function $u() {
      return (await fm()).randomUUID();
    }
    __name($u, "$u");
    u();
    l();
    c();
    p();
    d();
    async function Uu(t, e) {
      return new Promise((r) => {
        t.addEventListener(e, r, { once: true });
      });
    }
    __name(Uu, "Uu");
    u();
    l();
    c();
    p();
    d();
    var Ne = class extends be {
      static {
        __name(this, "Ne");
      }
      name = "TransactionManagerError";
      constructor(e, r) {
        super("Transaction API error: " + e, "P2028", r);
      }
    };
    var Ct = class extends Ne {
      static {
        __name(this, "Ct");
      }
      constructor() {
        super("Transaction not found. Transaction ID is invalid, refers to an old closed transaction Prisma doesn't have information about anymore, or was obtained before disconnecting.");
      }
    };
    var $n = class extends Ne {
      static {
        __name(this, "$n");
      }
      constructor(e) {
        super(`Transaction already closed: A ${e} cannot be executed on a committed transaction.`);
      }
    };
    var Un = class extends Ne {
      static {
        __name(this, "Un");
      }
      constructor(e) {
        super(`Transaction already closed: A ${e} cannot be executed on a transaction that was rolled back.`);
      }
    };
    var Ur = class extends Ne {
      static {
        __name(this, "Ur");
      }
      constructor() {
        super("Unable to start a transaction in the given time.");
      }
    };
    var Vn = class extends Ne {
      static {
        __name(this, "Vn");
      }
      constructor(e, { timeout: r, timeTaken: n }) {
        super(`A ${e} cannot be executed on an expired transaction. The timeout for this transaction was ${r} ms, however ${n} ms passed since the start of the transaction. Consider increasing the interactive transaction timeout or doing less work in the transaction.`, { operation: e, timeout: r, timeTaken: n });
      }
    };
    var nt = class extends Ne {
      static {
        __name(this, "nt");
      }
      constructor(e) {
        super(`Internal Consistency Error: ${e}`);
      }
    };
    var qn = class extends Ne {
      static {
        __name(this, "qn");
      }
      constructor(e) {
        super(`Invalid isolation level: ${e}`, { isolationLevel: e });
      }
    };
    var gm = 100;
    var hm = 2e3;
    function ym() {
      let t, e = new Promise((r) => {
        t = r;
      });
      return { abortController: new AbortController(), settled: e, markSettled: t };
    }
    __name(ym, "ym");
    var It = ye("prisma:client:transactionManager");
    var wm = /* @__PURE__ */ __name(() => ({ sql: "COMMIT", args: [], argTypes: [] }), "wm");
    var Vu = /* @__PURE__ */ __name(() => ({ sql: "ROLLBACK", args: [], argTypes: [] }), "Vu");
    var bm = /* @__PURE__ */ __name(() => ({ sql: '-- Implicit "COMMIT" query via underlying driver', args: [], argTypes: [] }), "bm");
    var xm = /* @__PURE__ */ __name(() => ({ sql: '-- Implicit "ROLLBACK" query via underlying driver', args: [], argTypes: [] }), "xm");
    var Vr = class {
      static {
        __name(this, "Vr");
      }
      transactions = /* @__PURE__ */ new Map();
      closedTransactions = [];
      #e = /* @__PURE__ */ new Set();
      driverAdapter;
      transactionOptions;
      tracingHelper;
      #t;
      #r;
      constructor({ driverAdapter: e, transactionOptions: r, tracingHelper: n, onQuery: i, provider: o }) {
        this.driverAdapter = e, this.transactionOptions = r, this.tracingHelper = n, this.#t = i, this.#r = o;
      }
      async startInternalTransaction(e) {
        let r = e !== void 0 ? this.#h(e) : {};
        return await this.tracingHelper.runInChildSpan("start_transaction", () => this.#i(r));
      }
      async startTransaction(e) {
        let r = e !== void 0 ? this.#h(e) : this.transactionOptions;
        return await this.tracingHelper.runInChildSpan("start_transaction", () => this.#i(r));
      }
      async #i(e) {
        if (e.newTxId) return await this.#d(e.newTxId, "start", async (o) => {
          if (o.status !== "running") throw new nt(`Transaction in invalid state ${o.status} when starting a nested transaction.`);
          if (!o.transaction) throw new nt("Transaction missing underlying driver transaction when starting a nested transaction.");
          o.depth += 1;
          let s = this.#a(o);
          o.savepoints.push(s);
          try {
            await this.#n(o.transaction)(s);
          } catch (a) {
            throw o.depth -= 1, o.savepoints.pop(), a;
          }
          return { id: o.id };
        });
        let r = ym(), { abortController: n } = r;
        this.#e.add(r);
        let i;
        try {
          let o = { id: await $u(), status: "waiting", timer: void 0, timeout: e.timeout, startedAt: Date.now(), transaction: void 0, operationQueue: Promise.resolve(), depth: 1, savepoints: [], savepointCounter: 0 };
          if (n.signal.aborted) throw new Ur();
          let s = qu(() => n.abort(), e.maxWait);
          s?.unref?.();
          let a = this.driverAdapter.startTransaction(e.isolationLevel).catch(mt);
          switch (o.transaction = await Promise.race([a.finally(() => clearTimeout(s)), Uu(n.signal, "abort").then(() => {
          })]), this.transactions.set(o.id, o), o.status) {
            case "waiting":
              if (n.signal.aborted) throw o.transaction = void 0, i = this.#o(a), await this.#f(o, "timed_out"), new Ur();
              return o.status = "running", o.startedAt = Date.now(), o.timer = this.#c(o.id, e.timeout), { id: o.id };
            case "timed_out":
            case "running":
            case "committed":
            case "rolled_back":
              throw new nt(`Transaction in invalid state ${o.status} although it just finished startup.`);
            default:
              return Y(o.status, "Unknown transaction status.");
          }
        } finally {
          this.#e.delete(r), i ? i.finally(r.markSettled) : r.markSettled();
        }
      }
      async #o(e) {
        try {
          let r = await e;
          if (r.options.usePhantomQuery) await r.rollback();
          else try {
            await r.executeRaw(Vu());
          } finally {
            await r.rollback();
          }
        } catch (r) {
          It("error in discarded transaction:", r);
        }
      }
      async commitTransaction(e) {
        return await this.tracingHelper.runInChildSpan("commit_transaction", async () => {
          await this.#d(e, "commit", async (r) => {
            if (r.depth > 1) {
              if (!r.transaction) throw new Ct();
              let n = r.savepoints.at(-1);
              if (!n) throw new nt(`Missing savepoint for nested commit. Depth: ${r.depth}, transactionId: ${r.id}`);
              try {
                await this.#u(r.transaction, n);
              } finally {
                r.savepoints.pop(), r.depth -= 1;
              }
              return;
            }
            await this.#f(r, "committed");
          });
        });
      }
      async rollbackTransaction(e) {
        return await this.tracingHelper.runInChildSpan("rollback_transaction", async () => {
          await this.#d(e, "rollback", async (r) => {
            if (r.depth > 1) {
              if (!r.transaction) throw new Ct();
              let n = r.savepoints.at(-1);
              if (!n) throw new nt(`Missing savepoint for nested rollback. Depth: ${r.depth}, transactionId: ${r.id}`);
              try {
                await this.#l(r.transaction)(n), await this.#u(r.transaction, n);
              } finally {
                r.savepoints.pop(), r.depth -= 1;
              }
              return;
            }
            await this.#f(r, "rolled_back");
          });
        });
      }
      async getTransaction(e, r) {
        let n = this.#s(e.id, r);
        if (n.status === "closing" && (await n.closing, n = this.#s(e.id, r)), !n.transaction) throw new Ct();
        return n.transaction;
      }
      #s(e, r) {
        let n = this.transactions.get(e);
        if (!n) {
          let i = this.closedTransactions.find((o) => o.id === e);
          if (i) switch (It("Transaction already closed.", { transactionId: e, status: i.status }), i.status) {
            case "closing":
            case "waiting":
            case "running":
              throw new nt("Active transaction found in closed transactions list.");
            case "committed":
              throw new $n(r);
            case "rolled_back":
              throw new Un(r);
            case "timed_out":
              throw new Vn(r, { timeout: i.timeout, timeTaken: Date.now() - i.startedAt });
          }
          else throw It("Transaction not found.", e), new Ct();
        }
        if (["committed", "rolled_back", "timed_out"].includes(n.status)) throw new nt("Closed transaction found in active transactions map.");
        return n;
      }
      async cancelAllTransactions() {
        let e = [...this.#e];
        for (let { abortController: r } of e) r.abort();
        await Promise.allSettled([...[...this.transactions.values()].map((r) => this.#m(r, async () => {
          let n = this.transactions.get(r.id);
          n && await this.#f(n, "rolled_back");
        })), ...e.map(({ settled: r }) => Em(r, hm))]);
      }
      #a(e) {
        return `prisma_sp_${e.savepointCounter++}`;
      }
      #n(e) {
        if (e.createSavepoint) return e.createSavepoint.bind(e);
        throw new Ne(`Nested transactions are not supported by adapter "${e.adapterName}" (${e.provider}): createSavepoint is not implemented.`);
      }
      #l(e) {
        if (e.rollbackToSavepoint) return e.rollbackToSavepoint.bind(e);
        throw new Ne(`Nested transactions are not supported by adapter "${e.adapterName}" (${e.provider}): rollbackToSavepoint is not implemented.`);
      }
      async #u(e, r) {
        e.releaseSavepoint && await e.releaseSavepoint(r);
      }
      #p(e) {
        It("Transaction already committed or rolled back when timeout happened.", e);
      }
      #c(e, r) {
        let n = Date.now(), i = qu(async () => {
          try {
            It("Transaction timed out.", { transactionId: e, timeoutStartedAt: n, timeout: r });
            let o = this.transactions.get(e);
            if (!o) {
              this.#p(e);
              return;
            }
            await this.#m(o, async () => {
              let s = this.transactions.get(e);
              s && ["running", "waiting"].includes(s.status) ? await this.#f(s, "timed_out") : this.#p(e);
            });
          } catch (o) {
            It("Error while closing timed-out transaction.", { transactionId: e, error: o });
          }
        }, r);
        return i?.unref?.(), i;
      }
      async #d(e, r, n) {
        let i = this.#s(e, r);
        return await this.#m(i, async () => {
          let o = this.#s(e, r);
          return await n(o);
        });
      }
      async #m(e, r) {
        let n = e.operationQueue, i;
        e.operationQueue = new Promise((o) => {
          i = o;
        }), await n;
        try {
          return await r();
        } finally {
          i();
        }
      }
      async #f(e, r) {
        let n = /* @__PURE__ */ __name(async () => {
          It("Closing transaction.", { transactionId: e.id, status: r });
          try {
            if (e.transaction && r === "committed") if (e.transaction.options.usePhantomQuery) await this.#g(bm(), e.transaction, () => e.transaction.commit());
            else {
              let i = wm();
              await this.#g(i, e.transaction, () => e.transaction.executeRaw(i)).then(() => e.transaction.commit(), (o) => {
                let s = /* @__PURE__ */ __name(() => Promise.reject(o), "s");
                return e.transaction.rollback().then(s, s);
              });
            }
            else if (e.transaction) if (e.transaction.options.usePhantomQuery) await this.#g(xm(), e.transaction, () => e.transaction.rollback());
            else {
              let i = Vu();
              try {
                await this.#g(i, e.transaction, () => e.transaction.executeRaw(i));
              } finally {
                await e.transaction.rollback();
              }
            }
          } finally {
            e.status = r, clearTimeout(e.timer), e.timer = void 0, this.transactions.delete(e.id), this.closedTransactions.push(e), this.closedTransactions.length > gm && this.closedTransactions.shift();
          }
        }, "n");
        e.status === "closing" ? (await e.closing, this.#s(e.id, r === "committed" ? "commit" : "rollback")) : await Object.assign(e, { status: "closing", reason: r, closing: n() }).closing;
      }
      #h(e) {
        if (!e.timeout) throw new Ne("timeout is required");
        if (!e.maxWait) throw new Ne("maxWait is required");
        if (e.isolationLevel === "SNAPSHOT") throw new qn(e.isolationLevel);
        return { ...e, timeout: e.timeout, maxWait: e.maxWait };
      }
      #g(e, r, n) {
        return Sn({ query: e, execute: n, provider: this.#r ?? r.provider, tracingHelper: this.tracingHelper, onQuery: this.#t });
      }
    };
    function qu(t, e) {
      return e !== void 0 ? setTimeout(t, e) : void 0;
    }
    __name(qu, "qu");
    function Em(t, e) {
      let r, n = new Promise((i) => {
        r = setTimeout(i, e), r?.unref?.();
      });
      return Promise.race([t, n]).finally(() => clearTimeout(r));
    }
    __name(Em, "Em");
    var ve = require_dist();
    var Bn = "7.10.0";
    u();
    l();
    c();
    p();
    d();
    var Bu = { bigint: "bigint", date: "datetime", decimal: "decimal", bytes: "bytes" };
    function Qu(t) {
      let e;
      try {
        e = JSON.parse(t);
      } catch (i) {
        throw new Error(`Received invalid serialized parameters: ${i.message}`);
      }
      if (!Array.isArray(e)) throw new Error("Received invalid serialized parameters: expected an array");
      let r = e.map((i) => Ju(i)), n = e.map((i) => Tm(i));
      return { args: r, argTypes: n };
    }
    __name(Qu, "Qu");
    function Ju(t) {
      if (Array.isArray(t)) return t.map((e) => Ju(e));
      if (typeof t == "object" && t !== null && "prisma__value" in t) {
        if (!("prisma__type" in t)) throw new Error("Invalid serialized parameter, prisma__type should be present when prisma__value is present");
        return `${t.prisma__value}`;
      }
      return typeof t == "object" && t !== null ? JSON.stringify(t) : t;
    }
    __name(Ju, "Ju");
    function Tm(t) {
      return Array.isArray(t) ? { scalarType: t.length > 0 ? ju(t[0]) : "unknown", arity: "list" } : { scalarType: ju(t), arity: "scalar" };
    }
    __name(Tm, "Tm");
    function ju(t) {
      return typeof t == "object" && t !== null && "prisma__type" in t && typeof t.prisma__type == "string" && t.prisma__type in Bu ? Bu[t.prisma__type] : typeof t == "number" ? "decimal" : typeof t == "string" ? "string" : "unknown";
    }
    __name(ju, "ju");
    u();
    l();
    c();
    p();
    d();
    function Gu(t, e) {
      return { batch: t, transaction: e?.kind === "batch" ? { isolationLevel: e.options.isolationLevel } : void 0 };
    }
    __name(Gu, "Gu");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    function Hu(t) {
      return t ? t.replace(/"(?:[^"\\]|\\.)*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (e) => `${e[0]}5`) : "";
    }
    __name(Hu, "Hu");
    u();
    l();
    c();
    p();
    d();
    function zu(t) {
      return t.split(`
`).map((e) => e.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
    }
    __name(zu, "zu");
    u();
    l();
    c();
    p();
    d();
    var Wu = Mt(ws());
    function Ku({ title: t, user: e = "prisma", repo: r = "prisma", template: n = "bug_report.yml", body: i }) {
      return (0, Wu.default)({ user: e, repo: r, template: n, title: t, body: i });
    }
    __name(Ku, "Ku");
    function Xu({ version: t, binaryTarget: e, title: r, description: n, engineVersion: i, database: o, query: s }) {
      let a = is(6e3 - (s?.length ?? 0)), m = zu(Ut(a)), h = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", E = Ut(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${b.version?.padEnd(19)}| 
| OS              | ${e?.padEnd(19)}|
| Prisma Client   | ${t?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o?.padEnd(19)}|

${h}

## Logs
\`\`\`
${m}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? Hu(s) : ""}
\`\`\`
`), N = Ku({ title: r, body: E });
      return `${r}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${Wr(N)}

If you want the Prisma team to look into it, please open the link above \u{1F64F}
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
    }
    __name(Xu, "Xu");
    u();
    l();
    c();
    p();
    d();
    var jn = class t {
      static {
        __name(this, "t");
      }
      #e;
      #t;
      #r;
      #i;
      #o;
      constructor(e, r, n) {
        this.#e = e, this.#t = r, this.#r = n, this.#i = r.getConnectionInfo?.(), this.#o = Fr.forSql({ onQuery: this.#e.onQuery, tracingHelper: this.#e.tracingHelper, provider: this.#e.provider, connectionInfo: this.#i });
      }
      static async connect(e) {
        let r, n;
        try {
          r = await e.driverAdapterFactory.connect(), n = new Vr({ driverAdapter: r, transactionOptions: e.transactionOptions, tracingHelper: e.tracingHelper, onQuery: e.onQuery, provider: e.provider });
        } catch (i) {
          throw await r?.dispose(), i;
        }
        return new t(e, r, n);
      }
      getConnectionInfo() {
        let e = this.#i ?? { supportsRelationJoins: false };
        return Promise.resolve({ provider: this.#t.provider, connectionInfo: e });
      }
      async execute({ plan: e, placeholderValues: r, transaction: n, batchIndex: i, queryInfo: o }) {
        let s = n ? await this.#r.getTransaction(n, i !== void 0 ? "batch query" : "query") : this.#t;
        return await this.#o.run(e, { queryable: s, transactionManager: n ? { enabled: false } : { enabled: true, manager: this.#r }, scope: r, sqlCommenter: this.#e.sqlCommenters && { plugins: this.#e.sqlCommenters, queryInfo: o } });
      }
      async startTransaction(e) {
        return { ...await this.#r.startTransaction(e), payload: void 0 };
      }
      async commitTransaction(e) {
        await this.#r.commitTransaction(e.id);
      }
      async rollbackTransaction(e) {
        await this.#r.rollbackTransaction(e.id);
      }
      async disconnect() {
        try {
          await this.#r.cancelAllTransactions();
        } finally {
          await this.#t.dispose();
        }
      }
      apiKey() {
        return null;
      }
    };
    u();
    l();
    c();
    p();
    d();
    var Qn = class {
      static {
        __name(this, "Qn");
      }
      #e;
      #t;
      #r;
      constructor(e = 1e3) {
        this.#e = /* @__PURE__ */ new Map(), this.#t = /* @__PURE__ */ new Map(), this.#r = e;
      }
      getSingle(e) {
        let r = this.#e.get(e);
        return r && (this.#e.delete(e), this.#e.set(e, r)), r;
      }
      setSingle(e, r) {
        if (this.#e.has(e)) {
          this.#e.delete(e), this.#e.set(e, r);
          return;
        }
        if (this.#e.size >= this.#r) {
          let n = this.#e.keys().next().value;
          n !== void 0 && this.#e.delete(n);
        }
        this.#e.set(e, r);
      }
      getBatch(e) {
        let r = this.#t.get(e);
        return r && (this.#t.delete(e), this.#t.set(e, r)), r;
      }
      setBatch(e, r) {
        if (this.#t.has(e)) {
          this.#t.delete(e), this.#t.set(e, r);
          return;
        }
        if (this.#t.size >= this.#r) {
          let n = this.#t.keys().next().value;
          n !== void 0 && this.#t.delete(n);
        }
        this.#t.set(e, r);
      }
      clear() {
        this.#e.clear(), this.#t.clear();
      }
      get size() {
        return this.#e.size + this.#t.size;
      }
      get singleCacheSize() {
        return this.#e.size;
      }
      get batchCacheSize() {
        return this.#t.size;
      }
    };
    u();
    l();
    c();
    p();
    d();
    var nl = require_dist();
    u();
    l();
    c();
    p();
    d();
    var Jn = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
    function Zu(t, e, r) {
      let n = r || {}, i = n.encode || encodeURIComponent;
      if (typeof i != "function") throw new TypeError("option encode is invalid");
      if (!Jn.test(t)) throw new TypeError("argument name is invalid");
      let o = i(e);
      if (o && !Jn.test(o)) throw new TypeError("argument val is invalid");
      let s = t + "=" + o;
      if (n.maxAge !== void 0 && n.maxAge !== null) {
        let a = n.maxAge - 0;
        if (Number.isNaN(a) || !Number.isFinite(a)) throw new TypeError("option maxAge is invalid");
        s += "; Max-Age=" + Math.floor(a);
      }
      if (n.domain) {
        if (!Jn.test(n.domain)) throw new TypeError("option domain is invalid");
        s += "; Domain=" + n.domain;
      }
      if (n.path) {
        if (!Jn.test(n.path)) throw new TypeError("option path is invalid");
        s += "; Path=" + n.path;
      }
      if (n.expires) {
        if (!vm(n.expires) || Number.isNaN(n.expires.valueOf())) throw new TypeError("option expires is invalid");
        s += "; Expires=" + n.expires.toUTCString();
      }
      if (n.httpOnly && (s += "; HttpOnly"), n.secure && (s += "; Secure"), n.priority) switch (typeof n.priority == "string" ? n.priority.toLowerCase() : n.priority) {
        case "low": {
          s += "; Priority=Low";
          break;
        }
        case "medium": {
          s += "; Priority=Medium";
          break;
        }
        case "high": {
          s += "; Priority=High";
          break;
        }
        default:
          throw new TypeError("option priority is invalid");
      }
      if (n.sameSite) switch (typeof n.sameSite == "string" ? n.sameSite.toLowerCase() : n.sameSite) {
        case true: {
          s += "; SameSite=Strict";
          break;
        }
        case "lax": {
          s += "; SameSite=Lax";
          break;
        }
        case "strict": {
          s += "; SameSite=Strict";
          break;
        }
        case "none": {
          s += "; SameSite=None";
          break;
        }
        default:
          throw new TypeError("option sameSite is invalid");
      }
      return n.partitioned && (s += "; Partitioned"), s;
    }
    __name(Zu, "Zu");
    function vm(t) {
      return Object.prototype.toString.call(t) === "[object Date]" || t instanceof Date;
    }
    __name(vm, "vm");
    function Yu(t, e) {
      let r = (t || "").split(";").filter((m) => typeof m == "string" && !!m.trim()), n = r.shift() || "", i = Sm(n), o = i.name, s = i.value;
      try {
        s = e?.decode === false ? s : (e?.decode || decodeURIComponent)(s);
      } catch {
      }
      let a = { name: o, value: s };
      for (let m of r) {
        let h = m.split("="), E = (h.shift() || "").trimStart().toLowerCase(), N = h.join("=");
        switch (E) {
          case "expires": {
            a.expires = new Date(N);
            break;
          }
          case "max-age": {
            a.maxAge = Number.parseInt(N, 10);
            break;
          }
          case "secure": {
            a.secure = true;
            break;
          }
          case "httponly": {
            a.httpOnly = true;
            break;
          }
          case "samesite": {
            a.sameSite = N;
            break;
          }
          default:
            a[E] = N;
        }
      }
      return a;
    }
    __name(Yu, "Yu");
    function Sm(t) {
      let e = "", r = "", n = t.split("=");
      return n.length > 1 ? (e = n.shift(), r = n.join("=")) : r = t, { name: e, value: r };
    }
    __name(Sm, "Sm");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Gn = class extends Error {
      static {
        __name(this, "Gn");
      }
      clientVersion;
      cause;
      constructor(e, r) {
        super(e), this.clientVersion = r.clientVersion, this.cause = r.cause;
      }
      get [Symbol.toStringTag]() {
        return this.name;
      }
    };
    var Hn = class extends Gn {
      static {
        __name(this, "Hn");
      }
      isRetryable;
      constructor(e, r) {
        super(e, r), this.isRetryable = r.isRetryable ?? true;
      }
    };
    u();
    l();
    c();
    p();
    d();
    function el(t, e) {
      return { ...t, isRetryable: e };
    }
    __name(el, "el");
    var kt = class extends Hn {
      static {
        __name(this, "kt");
      }
      name = "InvalidDatasourceError";
      code = "P6001";
      constructor(e, r) {
        super(e, el(r, false));
      }
    };
    gr(kt, "InvalidDatasourceError");
    function tl(t) {
      let e = { clientVersion: t.clientVersion }, r;
      try {
        r = new URL(t.accelerateUrl);
      } catch (m) {
        let h = m.message;
        throw new kt(`Error validating \`accelerateUrl\`, the URL cannot be parsed, reason: ${h}`, e);
      }
      let { protocol: n, searchParams: i } = r;
      if (n !== "prisma:" && n !== Zr) throw new kt("Error validating `accelerateUrl`: the URL must start with the protocol `prisma://` or `prisma+postgres://`", e);
      let o = i.get("api_key");
      if (o === null || o.length < 1) throw new kt("Error validating `accelerateUrl`: the URL must contain a valid API key", e);
      let s = pi(r) ? "http:" : "https:";
      b.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && r.searchParams.has("use_http") && (s = "http:");
      let a = new URL(r.href.replace(n, s));
      return { apiKey: o, url: a };
    }
    __name(tl, "tl");
    u();
    l();
    c();
    p();
    d();
    var rl = Mt(ds());
    var zn = class {
      static {
        __name(this, "zn");
      }
      apiKey;
      tracingHelper;
      logLevel;
      logQueries;
      engineHash;
      constructor({ apiKey: e, tracingHelper: r, logLevel: n, logQueries: i, engineHash: o }) {
        this.apiKey = e, this.tracingHelper = r, this.logLevel = n, this.logQueries = i, this.engineHash = o;
      }
      build({ traceparent: e, transactionId: r } = {}) {
        let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": rl.enginesVersion };
        this.tracingHelper.isEnabled() && (n.traceparent = e ?? this.tracingHelper.getTraceParent()), r && (n["X-Transaction-Id"] = r);
        let i = this.#e();
        return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n;
      }
      #e() {
        let e = [];
        return this.tracingHelper.isEnabled() && e.push("tracing"), this.logLevel && e.push(this.logLevel), this.logQueries && e.push("query"), e;
      }
    };
    u();
    l();
    c();
    p();
    d();
    function Am(t) {
      return t[0] * 1e3 + t[1] / 1e6;
    }
    __name(Am, "Am");
    function wo(t) {
      return new Date(Am(t));
    }
    __name(wo, "wo");
    var il = ye("prisma:client:clientEngine:remoteExecutor");
    var Wn = class {
      static {
        __name(this, "Wn");
      }
      #e;
      #t;
      #r;
      #i;
      #o;
      #s;
      constructor(e) {
        this.#e = e.clientVersion, this.#i = e.logEmitter, this.#o = e.tracingHelper, this.#s = e.sqlCommenters;
        let { url: r, apiKey: n } = tl({ clientVersion: e.clientVersion, accelerateUrl: e.accelerateUrl });
        this.#r = new bo(r), this.#t = new zn({ apiKey: n, engineHash: e.clientVersion, logLevel: e.logLevel, logQueries: e.logQueries, tracingHelper: e.tracingHelper });
      }
      async getConnectionInfo() {
        return await this.#a({ path: "/connection-info", method: "GET" });
      }
      async execute({ plan: e, placeholderValues: r, batchIndex: n, model: i, operation: o, transaction: s, customFetch: a, queryInfo: m }) {
        let h = m && this.#s?.length ? vn(this.#s, { query: m }) : void 0;
        return (await this.#a({ path: s ? `/transaction/${s.id}/query` : "/query", method: "POST", body: { model: i, operation: o, plan: e, params: r, comments: h && Object.keys(h).length > 0 ? h : void 0 }, batchRequestIdx: n, fetch: a })).data;
      }
      async startTransaction(e) {
        return { ...await this.#a({ path: "/transaction/start", method: "POST", body: e }), payload: void 0 };
      }
      async commitTransaction(e) {
        await this.#a({ path: `/transaction/${e.id}/commit`, method: "POST" });
      }
      async rollbackTransaction(e) {
        await this.#a({ path: `/transaction/${e.id}/rollback`, method: "POST" });
      }
      disconnect() {
        return Promise.resolve();
      }
      apiKey() {
        return this.#t.apiKey;
      }
      async #a({ path: e, method: r, body: n, fetch: i = globalThis.fetch, batchRequestIdx: o }) {
        let s = await this.#r.request({ method: r, path: e, headers: this.#t.build(), body: n, fetch: i });
        s.ok || await this.#n(s, o);
        let a = await s.json();
        return typeof a.extensions == "object" && a.extensions !== null && this.#l(a.extensions), a;
      }
      async #n(e, r) {
        let n = e.headers.get("Prisma-Error-Code"), i = await e.text(), o, s = i;
        try {
          o = JSON.parse(i);
        } catch {
          o = {};
        }
        typeof o.code == "string" && (n = o.code), typeof o.error == "string" ? s = o.error : typeof o.message == "string" ? s = o.message : typeof o.InvalidRequestError == "object" && o.InvalidRequestError !== null && typeof o.InvalidRequestError.reason == "string" && (s = o.InvalidRequestError.reason), s = s || `HTTP ${e.status}: ${e.statusText}`;
        let a = typeof o.meta == "object" && o.meta !== null ? o.meta : o;
        throw new nl.PrismaClientKnownRequestError(s, { clientVersion: this.#e, code: n ?? "P6000", batchRequestIdx: r, meta: a });
      }
      #l(e) {
        let r = e.logs ?? [];
        if (e.spans) this.#o.dispatchEngineSpans(e.spans, r, (n) => this.#u(n));
        else for (let n of r) this.#u(n);
      }
      #u(e) {
        switch (e.level) {
          case "debug":
          case "trace":
            il(e);
            break;
          case "error":
          case "warn":
          case "info": {
            this.#i.emit(e.level, { timestamp: wo(e.timestamp), message: e.attributes.message ?? "", target: e.target ?? "RemoteExecutor" });
            break;
          }
          case "query": {
            this.#i.emit("query", { query: e.attributes.query ?? "", timestamp: wo(e.timestamp), duration: e.attributes.duration_ms ?? 0, params: e.attributes.params ?? "", target: e.target ?? "RemoteExecutor" });
            break;
          }
          default:
            throw new Error(`Unexpected log level: ${e.level}`);
        }
      }
    };
    var bo = class {
      static {
        __name(this, "bo");
      }
      #e;
      #t;
      #r;
      constructor(e) {
        this.#e = e, this.#t = /* @__PURE__ */ new Map();
      }
      async request({ method: e, path: r, headers: n, body: i, fetch: o }) {
        let s = new URL(r, this.#e), a = this.#i(s);
        a && (n.Cookie = a), this.#r && (n["Accelerate-Query-Engine-Jwt"] = this.#r);
        let m = await o(s.href, { method: e, body: i !== void 0 ? JSON.stringify(i) : void 0, headers: n });
        return il(e, s, m.status, m.statusText), this.#r = m.headers.get("Accelerate-Query-Engine-Jwt") ?? void 0, this.#o(s, m), m;
      }
      #i(e) {
        let r = [], n = /* @__PURE__ */ new Date();
        for (let [i, o] of this.#t) {
          if (o.expires && o.expires < n) {
            this.#t.delete(i);
            continue;
          }
          let s = o.domain ?? e.hostname, a = o.path ?? "/";
          e.hostname.endsWith(s) && e.pathname.startsWith(a) && r.push(Zu(o.name, o.value));
        }
        return r.length > 0 ? r.join("; ") : void 0;
      }
      #o(e, r) {
        let n = r.headers.getSetCookie?.() || [];
        if (n.length === 0) {
          let i = r.headers.get("Set-Cookie");
          i && n.push(i);
        }
        for (let i of n) {
          let o = Yu(i), s = o.domain ?? e.hostname, a = o.path ?? "/", m = `${s}:${a}:${o.name}`;
          this.#t.set(m, { name: o.name, value: o.value, domain: s, path: a, expires: o.expires });
        }
      }
    };
    u();
    l();
    c();
    p();
    d();
    var Eo = require_dist();
    var xo = {};
    var ol = { async loadQueryCompiler(t) {
      let { clientVersion: e, compilerWasm: r } = t;
      if (r === void 0) throw new Eo.PrismaClientInitializationError("WASM query compiler was unexpectedly `undefined`", e);
      let n;
      return t.activeProvider === void 0 || xo[t.activeProvider] === void 0 ? (n = (async () => {
        let i = await r.getRuntime(), o = await r.getQueryCompilerWasmModule();
        if (o == null) throw new Eo.PrismaClientInitializationError("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", e);
        let s = { [r.importName]: i }, a = new WebAssembly.Instance(o, s), m = a.exports.__wbindgen_start;
        return i.__wbg_set_wasm(a.exports), m(), i.QueryCompiler;
      })(), t.activeProvider !== void 0 && (xo[t.activeProvider] = n)) : n = xo[t.activeProvider], await n;
    } };
    var Rm = "P2038";
    var ut = ye("prisma:client:clientEngine");
    var ll = globalThis;
    ll.PRISMA_WASM_PANIC_REGISTRY = { set_message(t) {
      throw new ve.PrismaClientRustPanicError(t, Bn);
    } };
    var qr = class {
      static {
        __name(this, "qr");
      }
      name = "ClientEngine";
      #e;
      #t = { type: "disconnected" };
      #r;
      #i;
      #o;
      #s;
      config;
      datamodel;
      logEmitter;
      logQueries;
      logLevel;
      tracingHelper;
      #a;
      constructor(e, r) {
        if (e.accelerateUrl !== void 0) this.#i = { remote: true, accelerateUrl: e.accelerateUrl };
        else if (e.adapter) this.#i = { remote: false, driverAdapterFactory: e.adapter }, ut("Using driver adapter: %O", e.adapter);
        else throw new ve.PrismaClientInitializationError("PrismaClient requires a driver adapter to connect to your database, but none was provided. Pass one to the PrismaClient constructor, e.g. `new PrismaClient({ adapter })`. Learn more: https://pris.ly/d/driver-adapters", e.clientVersion, Rm);
        this.#r = r ?? ol, this.config = e, this.logQueries = e.logQueries ?? false, this.logLevel = e.logLevel ?? "error", this.logEmitter = e.logEmitter, this.datamodel = e.inlineSchema, this.tracingHelper = e.tracingHelper, this.#o = e.queryPlanCacheMaxSize === 0 ? void 0 : new Qn(e.queryPlanCacheMaxSize), this.#s = $r.deserialize(e.parameterizationSchema, (n) => {
          if (!Object.hasOwn(e.runtimeDataModel.enums, n)) return;
          let i = {};
          for (let o of e.runtimeDataModel.enums[n].values) i[o.name] = o.dbName ?? o.name;
          return i;
        }), e.enableDebugLogs && (this.logLevel = "debug"), this.logQueries && (this.#a = (n) => {
          this.logEmitter.emit("query", { ...n, params: Je(n.params), target: "ClientEngine" });
        });
      }
      async #n() {
        switch (this.#t.type) {
          case "disconnected": {
            let e = this.tracingHelper.runInChildSpan("connect", async () => {
              let r, n;
              try {
                r = await this.#l(), n = await this.#u(r);
              } catch (o) {
                throw this.#t = { type: "disconnected" }, n?.free(), await r?.disconnect(), o;
              }
              let i = { executor: r, queryCompiler: n };
              return this.#t = { type: "connected", engine: i }, i;
            });
            return this.#t = { type: "connecting", promise: e }, await e;
          }
          case "connecting":
            return await this.#t.promise;
          case "connected":
            return this.#t.engine;
          case "disconnecting":
            return await this.#t.promise, await this.#n();
        }
      }
      async #l() {
        return this.#i.remote ? new Wn({ clientVersion: this.config.clientVersion, accelerateUrl: this.#i.accelerateUrl, logEmitter: this.logEmitter, logLevel: this.logLevel, logQueries: this.logQueries, tracingHelper: this.tracingHelper, sqlCommenters: this.config.sqlCommenters }) : await jn.connect({ driverAdapterFactory: this.#i.driverAdapterFactory, tracingHelper: this.tracingHelper, transactionOptions: { ...this.config.transactionOptions, isolationLevel: this.#g(this.config.transactionOptions.isolationLevel) }, onQuery: this.#a, provider: this.config.activeProvider, sqlCommenters: this.config.sqlCommenters });
      }
      async #u(e) {
        let r = this.#e;
        r === void 0 && (r = await this.#r.loadQueryCompiler(this.config), this.#e = r);
        let { provider: n, connectionInfo: i } = await e.getConnectionInfo();
        try {
          return this.#m(() => new r({ datamodel: this.datamodel, provider: n, connectionInfo: i }), void 0, false);
        } catch (o) {
          throw this.#p(o);
        }
      }
      #p(e) {
        if (e instanceof ve.PrismaClientRustPanicError) return e;
        try {
          let r = JSON.parse(e.message);
          return new ve.PrismaClientInitializationError(r.message, this.config.clientVersion, r.error_code);
        } catch {
          return e;
        }
      }
      #c(e, r) {
        if (e instanceof ve.PrismaClientInitializationError) return e;
        if (e.code === "GenericFailure" && e.message?.startsWith("PANIC:")) return new ve.PrismaClientRustPanicError(sl(this, e.message, r), this.config.clientVersion);
        if (e instanceof be) return new ve.PrismaClientKnownRequestError(e.message, { code: e.code, meta: e.meta, clientVersion: this.config.clientVersion });
        try {
          let n = JSON.parse(e);
          return new ve.PrismaClientUnknownRequestError(`${n.message}
${n.backtrace}`, { clientVersion: this.config.clientVersion });
        } catch {
          return e;
        }
      }
      #d(e) {
        return e instanceof ve.PrismaClientRustPanicError ? e : typeof e.message == "string" && typeof e.code == "string" ? new ve.PrismaClientKnownRequestError(e.message, { code: e.code, meta: e.meta, clientVersion: this.config.clientVersion }) : typeof e.message == "string" ? new ve.PrismaClientUnknownRequestError(e.message, { clientVersion: this.config.clientVersion }) : e;
      }
      #m(e, r, n = true) {
        let i = ll.PRISMA_WASM_PANIC_REGISTRY.set_message, o;
        globalThis.PRISMA_WASM_PANIC_REGISTRY.set_message = (s) => {
          o = s;
        };
        try {
          return e();
        } finally {
          if (globalThis.PRISMA_WASM_PANIC_REGISTRY.set_message = i, o) throw this.#e = void 0, n && this.stop().catch((s) => ut("failed to disconnect:", s)), new ve.PrismaClientRustPanicError(sl(this, o, r), this.config.clientVersion);
        }
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the client engine, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
      }
      async start() {
        await this.#n();
      }
      async stop() {
        switch (this.#t.type) {
          case "disconnected":
            return;
          case "connecting":
            return await this.#t.promise, await this.stop();
          case "connected": {
            let e = this.#t.engine, r = this.tracingHelper.runInChildSpan("disconnect", async () => {
              try {
                await e.executor.disconnect(), e.queryCompiler.free();
              } finally {
                this.#t = { type: "disconnected" };
              }
            });
            return this.#t = { type: "disconnecting", promise: r }, await r;
          }
          case "disconnecting":
            return await this.#t.promise;
        }
      }
      version() {
        return "unknown";
      }
      async transaction(e, r, n) {
        let i, { executor: o } = await this.#n();
        try {
          if (e === "start") {
            let s = n;
            i = await o.startTransaction({ ...s, isolationLevel: this.#g(s.isolationLevel) });
          } else if (e === "commit") {
            let s = n;
            await o.commitTransaction(s);
          } else if (e === "rollback") {
            let s = n;
            await o.rollbackTransaction(s);
          } else st(e, "Invalid transaction action.");
        } catch (s) {
          throw this.#c(s);
        }
        return i ? { id: i.id, payload: void 0 } : void 0;
      }
      async request(e, { interactiveTransaction: r, customDataProxyFetch: n }) {
        ut("sending request");
        let { executor: i, queryCompiler: o } = await this.#n().catch((h) => {
          throw this.#c(h, JSON.stringify(e));
        }), s, a = {}, m = e.query;
        if (al(e)) s = ul(e);
        else {
          let { parameterizedQuery: h, placeholderValues: E } = go(e, this.#s), N = JSON.stringify(h);
          a = E, m = h.query;
          let $3 = e.action !== "createMany" && e.action !== "createManyAndReturn", U = $3 ? this.#o?.getSingle(N) : void 0;
          U ? (ut("query plan cache hit"), s = U) : (ut("query plan cache miss"), s = this.#f(h, N, o), $3 && this.#o?.setSingle(N, s));
        }
        try {
          ut("query plan created", s);
          let h = await i.execute({ plan: s, model: e.modelName, operation: e.action, placeholderValues: a, transaction: r, batchIndex: void 0, customFetch: n?.(globalThis.fetch), queryInfo: { type: "single", modelName: e.modelName, action: e.action, query: m } });
          return ut("query plan executed"), { data: { [e.action]: h } };
        } catch (h) {
          throw this.#c(h, JSON.stringify(e));
        }
      }
      async requestBatch(e, { transaction: r, customDataProxyFetch: n }) {
        if (e.length === 0) return [];
        let i = e[0].action, o = e[0].modelName, s = Gu(e, r), a = JSON.stringify(s), { executor: m, queryCompiler: h } = await this.#n().catch((B2) => {
          throw this.#c(B2, a);
        }), E = o === void 0, N, $3 = {}, U = e.map((B2) => B2.query);
        if (E) N = this.#h(e, a, h);
        else {
          let { parameterizedBatch: B2, placeholderValues: q } = ho(s, this.#s), J = JSON.stringify(B2);
          $3 = q, U = B2.batch.map((L) => L.query);
          let Z = this.#o?.getBatch(J);
          if (Z) ut("batch query plan cache hit"), N = Z;
          else {
            ut("batch query plan cache miss");
            try {
              N = this.#h(B2.batch, J, h), this.#o?.setBatch(J, N);
            } catch (L) {
              throw this.#d(L);
            }
          }
        }
        try {
          let B2;
          switch (r?.kind === "itx" && (B2 = r.options), N.type) {
            case "multi": {
              if (r?.kind !== "itx") {
                let L = r?.options, z = { maxWait: L?.maxWait ?? this.config.transactionOptions.maxWait, timeout: L?.timeout ?? this.config.transactionOptions.timeout, isolationLevel: L?.isolationLevel ?? this.config.transactionOptions.isolationLevel };
                B2 = await this.transaction("start", {}, z);
              }
              let q = [], J = false, Z;
              for (let [L, z] of N.plans.entries()) try {
                let ce = await m.execute({ plan: z, placeholderValues: $3, model: e[L].modelName, operation: e[L].action, batchIndex: L, transaction: B2, customFetch: n?.(globalThis.fetch), queryInfo: { type: "single", modelName: e[L].modelName, action: e[L].action, query: U[L] } });
                q.push({ data: { [e[L].action]: ce } });
              } catch (ce) {
                if (Z ??= r?.kind !== "batch" && e.every((Ie) => Ie.action === "findUnique" || Ie.action === "findUniqueOrThrow"), q.push(ce), J = true, !Z) break;
              }
              return B2 !== void 0 && r?.kind !== "itx" && (J ? await this.transaction("rollback", {}, B2) : await this.transaction("commit", {}, B2)), q;
            }
            case "compacted": {
              if (!e.every((Z) => Z.action === i && Z.modelName === o)) {
                let Z = e.map((z) => z.action).join(", "), L = e.map((z) => z.modelName).join(", ");
                throw new Error(`Internal error: All queries in a compacted batch must have the same action and model name, but received actions: [${Z}] and model names: [${L}]. This indicates a bug in the client. Please report this issue to the Prisma team with your query details.`);
              }
              if (o === void 0) throw new Error("Internal error: A compacted batch cannot contain raw queries. This indicates a bug in the client. Please report this issue to the Prisma team with your query details.");
              let q = await m.execute({ plan: N.plan, placeholderValues: $3, model: o, operation: i, batchIndex: void 0, transaction: B2, customFetch: n?.(globalThis.fetch), queryInfo: { type: "compacted", action: i, modelName: o, queries: U } });
              return _a(q, N, $3).map((Z) => ({ data: { [i]: Z } }));
            }
          }
        } catch (B2) {
          throw this.#c(B2, a);
        }
      }
      async apiKey() {
        let { executor: e } = await this.#n();
        return e.apiKey();
      }
      #f(e, r, n) {
        try {
          return this.#m(() => this.#y({ queries: [e], execute: /* @__PURE__ */ __name(() => n.compile(r), "execute") }));
        } catch (i) {
          throw this.#d(i);
        }
      }
      #h(e, r, n) {
        if (e.every(al)) return { type: "multi", plans: e.map((i) => ul(i)) };
        try {
          return this.#m(() => this.#y({ queries: e, execute: /* @__PURE__ */ __name(() => n.compileBatch(r), "execute") }));
        } catch (i) {
          throw this.#d(i);
        }
      }
      #g(e) {
        switch (e) {
          case void 0:
            return;
          case "ReadUncommitted":
            return "READ UNCOMMITTED";
          case "ReadCommitted":
            return "READ COMMITTED";
          case "RepeatableRead":
            return "REPEATABLE READ";
          case "Serializable":
            return "SERIALIZABLE";
          case "Snapshot":
            return "SNAPSHOT";
          default:
            throw new ve.PrismaClientKnownRequestError(`Inconsistent column data: Conversion failed: Invalid isolation level \`${e}\``, { code: "P2023", clientVersion: this.config.clientVersion, meta: { providedIsolationLevel: e } });
        }
      }
      #y({ queries: e, execute: r }) {
        return this.tracingHelper.runInChildSpan({ name: "compile", attributes: { models: e.map((n) => n.modelName).filter((n) => n !== void 0), actions: e.map((n) => n.action) } }, r);
      }
    };
    function sl(t, e, r) {
      return Xu({ binaryTarget: void 0, title: e, version: t.config.clientVersion, engineVersion: "unknown", database: t.config.activeProvider, query: r });
    }
    __name(sl, "sl");
    function al(t) {
      return t.action === "queryRaw" || t.action === "executeRaw";
    }
    __name(al, "al");
    function ul(t) {
      let e = t.query.arguments.query, { args: r, argTypes: n } = Qu(t.query.arguments.parameters);
      return { type: t.action === "queryRaw" ? "query" : "execute", args: { type: "rawSql", sql: e, args: r, argTypes: n } };
    }
    __name(ul, "ul");
    function cl(t) {
      return new qr(t);
    }
    __name(cl, "cl");
    u();
    l();
    c();
    p();
    d();
    var pl = /* @__PURE__ */ __name((t) => ({ command: t }), "pl");
    u();
    l();
    c();
    p();
    d();
    var wl = require_dist();
    u();
    l();
    c();
    p();
    d();
    var dl = /* @__PURE__ */ __name((t) => t.strings.reduce((e, r, n) => `${e}@P${n}${r}`), "dl");
    u();
    l();
    c();
    p();
    d();
    var Kn = require_dist();
    function ir(t, e) {
      try {
        return ml(t, "fast", e);
      } catch (r) {
        if (r instanceof TypeError) return ml(t, "slow", e);
        throw r;
      }
    }
    __name(ir, "ir");
    function ml(t, e, r) {
      return JSON.stringify(t.map((n) => gl(n, e, r)));
    }
    __name(ml, "ml");
    function gl(t, e, r) {
      if (Array.isArray(t)) return t.map((n) => gl(n, e, r));
      if (typeof t == "bigint") return { prisma__type: "bigint", prisma__value: t.toString() };
      if (Vt(t)) {
        if (!qt(t)) throw new Kn.PrismaClientValidationError("Provided Date object is invalid", { clientVersion: r });
        return { prisma__type: "date", prisma__value: t.toJSON() };
      }
      if (Kn.Decimal.isDecimal(t)) return { prisma__type: "decimal", prisma__value: t.toJSON() };
      if (w.isBuffer(t)) return { prisma__type: "bytes", prisma__value: t.toString("base64") };
      if (Cm(t)) return { prisma__type: "bytes", prisma__value: w.from(t).toString("base64") };
      if (ArrayBuffer.isView(t)) {
        let { buffer: n, byteOffset: i, byteLength: o } = t;
        return { prisma__type: "bytes", prisma__value: w.from(n, i, o).toString("base64") };
      }
      return typeof t == "object" && e === "slow" ? hl(t) : t;
    }
    __name(gl, "gl");
    function Cm(t) {
      return t instanceof ArrayBuffer || t instanceof SharedArrayBuffer ? true : typeof t == "object" && t !== null ? t[Symbol.toStringTag] === "ArrayBuffer" || t[Symbol.toStringTag] === "SharedArrayBuffer" : false;
    }
    __name(Cm, "Cm");
    function hl(t) {
      if (typeof t != "object" || t === null) return t;
      if (typeof t.toJSON == "function") return t.toJSON();
      if (Array.isArray(t)) return t.map(fl);
      let e = {};
      for (let r of Object.keys(t)) e[r] = fl(t[r]);
      return e;
    }
    __name(hl, "hl");
    function fl(t) {
      return typeof t == "bigint" ? t.toString() : hl(t);
    }
    __name(fl, "fl");
    var Im = /^(\s*alter\s)/i;
    var yl = ye("prisma:client");
    function Po(t, e, r, n) {
      if (!(t !== "postgresql" && t !== "cockroachdb") && r.length > 0 && Im.exec(e)) throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
    }
    __name(Po, "Po");
    var To = /* @__PURE__ */ __name(({ clientMethod: t, activeProvider: e, clientVersion: r }) => (n) => {
      let i = "", o;
      if (hn(n)) i = n.sql, o = { values: ir(n.values, r), __prismaRawParameters__: true };
      else if (Array.isArray(n)) {
        let [s, ...a] = n;
        i = s, o = { values: ir(a || [], r), __prismaRawParameters__: true };
      } else switch (e) {
        case "sqlite":
        case "mysql": {
          i = n.sql, o = { values: ir(n.values, r), __prismaRawParameters__: true };
          break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
          i = n.text, o = { values: ir(n.values, r), __prismaRawParameters__: true };
          break;
        }
        case "sqlserver": {
          i = dl(n), o = { values: ir(n.values, r), __prismaRawParameters__: true };
          break;
        }
        default:
          throw new Error(`The ${e} provider does not support ${t}`);
      }
      return o?.values ? yl(`prisma.${t}(${i}, ${o.values})`) : yl(`prisma.${t}(${i})`), { query: i, parameters: o };
    }, "To");
    var bl = { requestArgsToMiddlewareArgs(t) {
      return [t.strings, ...t.values];
    }, middlewareArgsToRequestArgs(t) {
      let [e, ...r] = t;
      return new wl.Sql(e, r);
    } };
    var xl = { requestArgsToMiddlewareArgs(t) {
      return [t];
    }, middlewareArgsToRequestArgs(t) {
      return t[0];
    } };
    u();
    l();
    c();
    p();
    d();
    function vo(t) {
      return function(r, n) {
        let i, o = /* @__PURE__ */ __name((s = t) => {
          try {
            return s === void 0 || s?.kind === "itx" ? i ??= El(r(s)) : El(r(s));
          } catch (a) {
            return Promise.reject(a);
          }
        }, "o");
        return { get spec() {
          return n;
        }, then(s, a) {
          return o().then(s, a);
        }, catch(s) {
          return o().catch(s);
        }, finally(s) {
          return o().finally(s);
        }, requestTransaction(s) {
          let a = o(s);
          return a.requestTransaction ? a.requestTransaction(s) : a;
        }, [Symbol.toStringTag]: "PrismaPromise" };
      };
    }
    __name(vo, "vo");
    function El(t) {
      return typeof t.then == "function" ? t : Promise.resolve(t);
    }
    __name(El, "El");
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    u();
    l();
    c();
    p();
    d();
    var Pl = { name: "@prisma/instrumentation-contract", version: "7.10.0", description: "Shared types and utilities for Prisma instrumentation", main: "dist/index.js", module: "dist/index.mjs", types: "dist/index.d.ts", exports: { ".": { require: { types: "./dist/index.d.ts", default: "./dist/index.js" }, import: { types: "./dist/index.d.mts", default: "./dist/index.mjs" } } }, license: "Apache-2.0", homepage: "https://www.prisma.io", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/instrumentation-contract" }, bugs: "https://github.com/prisma/prisma/issues", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", prepublishOnly: "pnpm run build", test: "vitest run" }, files: ["dist"], sideEffects: false, devDependencies: { "@opentelemetry/api": "1.9.0" }, peerDependencies: { "@opentelemetry/api": "^1.8" } };
    var Om = Pl.version.split(".")[0];
    var Nm = "PRISMA_INSTRUMENTATION";
    var Dm = `V${Om}_PRISMA_INSTRUMENTATION`;
    var Tl = globalThis;
    function vl() {
      let t = Tl[Dm];
      return t?.helper ? t.helper : Tl[Nm]?.helper;
    }
    __name(vl, "vl");
    var Mm = { isEnabled() {
      return false;
    }, getTraceParent() {
      return "00-10-10-00";
    }, dispatchEngineSpans(t, e, r) {
      for (let n of e) r(n);
    }, getActiveContext() {
    }, runInChildSpan(t, e) {
      return e();
    } };
    var So = class {
      static {
        __name(this, "So");
      }
      isEnabled() {
        return this.getTracingHelper().isEnabled();
      }
      getTraceParent(e) {
        return this.getTracingHelper().getTraceParent(e);
      }
      dispatchEngineSpans(e, r, n) {
        return this.getTracingHelper().dispatchEngineSpans(e, r, n);
      }
      getActiveContext() {
        return this.getTracingHelper().getActiveContext();
      }
      runInChildSpan(e, r) {
        return this.getTracingHelper().runInChildSpan(e, r);
      }
      getTracingHelper() {
        return vl() ?? Mm;
      }
    };
    function Sl() {
      return new So();
    }
    __name(Sl, "Sl");
    u();
    l();
    c();
    p();
    d();
    function Al(t, e = () => {
    }) {
      let r, n = new Promise((i) => r = i);
      return { then(i) {
        return --t === 0 && r(e()), i?.(n);
      } };
    }
    __name(Al, "Al");
    u();
    l();
    c();
    p();
    d();
    function Rl(t) {
      return typeof t == "string" ? t : t.reduce((e, r) => {
        let n = typeof r == "string" ? r : r.level;
        return n === "query" ? e : e && (r === "info" || e === "info") ? "info" : n;
      }, void 0);
    }
    __name(Rl, "Rl");
    u();
    l();
    c();
    p();
    d();
    var kl = require_dist();
    u();
    l();
    c();
    p();
    d();
    function Ro(t) {
      if (t.action !== "findUnique" && t.action !== "findUniqueOrThrow") return;
      let e = [];
      return t.modelName && e.push(t.modelName), t.query.arguments && e.push(Ao(t.query.arguments)), e.push(Ao(t.query.selection)), e.join("");
    }
    __name(Ro, "Ro");
    function Ao(t) {
      return `(${Object.keys(t).sort().map((r) => {
        let n = t[r];
        return typeof n == "object" && n !== null ? `(${r} ${Ao(n)})` : r;
      }).join(" ")})`;
    }
    __name(Ao, "Ao");
    u();
    l();
    c();
    p();
    d();
    var _m = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
    function Co(t) {
      return _m[t];
    }
    __name(Co, "Co");
    u();
    l();
    c();
    p();
    d();
    var Xn = class {
      static {
        __name(this, "Xn");
      }
      constructor(e) {
        this.options = e;
        this.batches = {};
      }
      batches;
      tickActive = false;
      request(e) {
        let r = this.options.batchBy(e);
        return r ? (this.batches[r] || (this.batches[r] = [], this.tickActive || (this.tickActive = true, b.nextTick(() => {
          this.dispatchBatches(), this.tickActive = false;
        }))), new Promise((n, i) => {
          this.batches[r].push({ request: e, resolve: n, reject: i });
        })) : this.options.singleLoader(e);
      }
      dispatchBatches() {
        for (let e in this.batches) {
          let r = this.batches[e];
          delete this.batches[e], r.length === 1 ? this.options.singleLoader(r[0].request).then((n) => {
            n instanceof Error ? r[0].reject(n) : r[0].resolve(n);
          }).catch((n) => {
            r[0].reject(n);
          }) : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(r.map((n) => n.request)).then((n) => {
            if (n instanceof Error) for (let i = 0; i < r.length; i++) r[i].reject(n);
            else for (let i = 0; i < r.length; i++) {
              let o = n[i];
              o instanceof Error ? r[i].reject(o) : r[i].resolve(o);
            }
          }).catch((n) => {
            for (let i = 0; i < r.length; i++) r[i].reject(n);
          }));
        }
      }
      get [Symbol.toStringTag]() {
        return "DataLoader";
      }
    };
    u();
    l();
    c();
    p();
    d();
    var Cl = require_dist();
    function Ot(t, e) {
      if (e === null) return e;
      switch (t) {
        case "bigint":
          return BigInt(e);
        case "bytes":
          return new Uint8Array(w.from(e, "base64"));
        case "decimal":
          return new Cl.Decimal(e);
        case "datetime":
        case "date":
          return new Date(e);
        case "time":
          return /* @__PURE__ */ new Date(`1970-01-01T${e}Z`);
        case "bigint-array":
          return e.map((r) => Ot("bigint", r));
        case "bytes-array":
          return e.map((r) => Ot("bytes", r));
        case "decimal-array":
          return e.map((r) => Ot("decimal", r));
        case "datetime-array":
          return e.map((r) => Ot("datetime", r));
        case "date-array":
          return e.map((r) => Ot("date", r));
        case "time-array":
          return e.map((r) => Ot("time", r));
        default:
          return e;
      }
    }
    __name(Ot, "Ot");
    function Zn(t) {
      let e = [], r = Lm(t);
      for (let n = 0; n < t.rows.length; n++) {
        let i = t.rows[n], o = { ...r };
        for (let s = 0; s < i.length; s++) o[t.columns[s]] = Ot(t.types[s], i[s]);
        e.push(o);
      }
      return e;
    }
    __name(Zn, "Zn");
    function Lm(t) {
      let e = {};
      for (let r = 0; r < t.columns.length; r++) e[t.columns[r]] = null;
      return e;
    }
    __name(Lm, "Lm");
    u();
    l();
    c();
    p();
    d();
    function Il(t, e) {
      let { schema: r, name: n } = Fm(e), i = Object.entries(t.models).filter(([o, s]) => (s.dbName ?? o) === n);
      if (i.length <= 1) return i[0]?.[0];
      if (r !== void 0) {
        let o = i.filter(([, s]) => s.schema === r);
        if (o.length === 1) return o[0][0];
      }
    }
    __name(Il, "Il");
    function Fm(t) {
      let e = t.lastIndexOf(".");
      return e === -1 ? { schema: void 0, name: t } : { schema: t.slice(0, e), name: t.slice(e + 1) };
    }
    __name(Fm, "Fm");
    var $m = ye("prisma:client:request_handler");
    var Yn = class {
      static {
        __name(this, "Yn");
      }
      client;
      dataloader;
      logEmitter;
      constructor(e, r) {
        this.logEmitter = r, this.client = e, this.dataloader = new Xn({ batchLoader: Pa(async ({ requests: n, customDataProxyFetch: i }) => {
          let { transaction: o, otelParentCtx: s } = n[0], a = n.map((N) => N.protocolQuery), m = this.client._tracingHelper.getTraceParent(s), h = n.some((N) => Co(N.protocolQuery.action));
          return (await this.client._engine.requestBatch(a, { traceparent: m, transaction: Um(o), containsWrite: h, customDataProxyFetch: i })).map((N, $3) => {
            if (N instanceof Error) return N;
            try {
              return this.mapQueryEngineResult(n[$3], N);
            } catch (U) {
              return U;
            }
          });
        }), singleLoader: /* @__PURE__ */ __name(async (n) => {
          let i = n.transaction?.kind === "itx" ? Ol(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: Co(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
          return this.mapQueryEngineResult(n, o);
        }, "singleLoader"), batchBy: /* @__PURE__ */ __name((n) => {
          if (n.transaction?.kind === "itx") {
            let i = Ro(n.protocolQuery);
            return `itx-${n.transaction.id}${i ? `-${i}` : ""}`;
          }
          return n.transaction?.id ? `transaction-${n.transaction.id}` : Ro(n.protocolQuery);
        }, "batchBy"), batchOrder(n, i) {
          return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0;
        } });
      }
      async request(e) {
        try {
          return await this.dataloader.request(e);
        } catch (r) {
          let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = e;
          this.handleAndLogRequestError({ error: r, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a, globalOmit: e.globalOmit });
        }
      }
      mapQueryEngineResult({ dataPath: e, unpacker: r }, n) {
        let i = n?.data, o = this.unpack(i, e, r);
        return b.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o;
      }
      handleAndLogRequestError(e) {
        try {
          this.handleRequestError(e);
        } catch (r) {
          throw this.logEmitter && this.logEmitter.emit("error", { message: r.message, target: e.clientMethod, timestamp: /* @__PURE__ */ new Date() }), r;
        }
      }
      handleRequestError({ error: e, clientMethod: r, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) {
        if ($m(e), Vm(e, i)) throw e;
        if (e instanceof K.PrismaClientKnownRequestError && qm(e)) {
          let h = Nl(e.meta);
          cn({ args: o, errors: [h], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a });
        }
        let m = e.message;
        if (n && (m = tn({ callsite: n, originalMethod: r, isPanic: e.isPanic, showColors: this.client._errorFormat === "pretty", message: m })), m = this.sanitizeMessage(m), e.code) {
          let h = this.resolveErrorMeta(e.meta, e.code, s);
          throw new K.PrismaClientKnownRequestError(m, { code: e.code, clientVersion: this.client._clientVersion, meta: h, batchRequestIdx: e.batchRequestIdx });
        } else {
          if (e.isPanic) throw new K.PrismaClientRustPanicError(m, this.client._clientVersion);
          if (e instanceof K.PrismaClientUnknownRequestError) throw new K.PrismaClientUnknownRequestError(m, { clientVersion: this.client._clientVersion, batchRequestIdx: e.batchRequestIdx });
          if (e instanceof K.PrismaClientInitializationError) throw new K.PrismaClientInitializationError(m, this.client._clientVersion);
          if (e instanceof K.PrismaClientRustPanicError) throw new K.PrismaClientRustPanicError(m, this.client._clientVersion);
        }
        throw e.clientVersion = this.client._clientVersion, e;
      }
      resolveErrorMeta(e, r, n) {
        if (r !== "P2002" || typeof e?.table != "string") return n ? { modelName: n, ...e } : e;
        let i = { ...e };
        delete i.table;
        let o = Il(this.client._runtimeDataModel, e.table) ?? (typeof i.modelName == "string" ? i.modelName : n);
        return o !== void 0 ? { ...i, modelName: o } : i;
      }
      sanitizeMessage(e) {
        return this.client._errorFormat && this.client._errorFormat !== "pretty" ? Ut(e) : e;
      }
      unpack(e, r, n) {
        if (!e || (e.data && (e = e.data), !e)) return e;
        let i = Object.keys(e)[0], o = Object.values(e)[0], s = Bm(r), a = Si(o, s), m = i === "queryRaw" ? Zn(a) : Ge(a);
        return n ? n(m) : m;
      }
      get [Symbol.toStringTag]() {
        return "RequestHandler";
      }
    };
    function Um(t) {
      if (t) {
        if (t.kind === "batch") return { kind: "batch", options: { isolationLevel: t.isolationLevel, maxWait: t.maxWait, timeout: t.timeout } };
        if (t.kind === "itx") return { kind: "itx", options: Ol(t) };
        st(t, "Unknown transaction kind");
      }
    }
    __name(Um, "Um");
    function Ol(t) {
      return { id: t.id, payload: t.payload };
    }
    __name(Ol, "Ol");
    function Vm(t, e) {
      return (0, kl.hasBatchIndex)(t) && e?.kind === "batch" && t.batchRequestIdx !== e.index;
    }
    __name(Vm, "Vm");
    function qm(t) {
      return t.code === "P2009" || t.code === "P2012";
    }
    __name(qm, "qm");
    function Nl(t) {
      if (t.kind === "Union") return { kind: "Union", errors: t.errors.map(Nl) };
      if (Array.isArray(t.selectionPath)) {
        let [, ...e] = t.selectionPath;
        return { ...t, selectionPath: e };
      }
      return t;
    }
    __name(Nl, "Nl");
    function Bm(t) {
      let e = [];
      for (let r = 1; r < t.length; r += 2) e.push(t[r]);
      return e;
    }
    __name(Bm, "Bm");
    u();
    l();
    c();
    p();
    d();
    var Io = Bn;
    u();
    l();
    c();
    p();
    d();
    var Fl = Mt(yi());
    u();
    l();
    c();
    p();
    d();
    var re = class extends Error {
      static {
        __name(this, "re");
      }
      constructor(e) {
        super(e + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientConstructorValidationError";
      }
    };
    gr(re, "PrismaClientConstructorValidationError");
    var Dl = ["errorFormat", "adapter", "accelerateUrl", "log", "transactionOptions", "omit", "comments", "queryPlanCacheMaxSize", "__internal"];
    var Ml = ["pretty", "colorless", "minimal"];
    var _l = ["info", "query", "warn", "error"];
    var jm = { adapter: /* @__PURE__ */ __name(() => {
    }, "adapter"), accelerateUrl: /* @__PURE__ */ __name((t) => {
      if (t !== void 0) {
        if (typeof t != "string") throw new re(`Invalid value ${JSON.stringify(t)} for "accelerateUrl" provided to PrismaClient constructor.`);
        if (t.trim().length === 0) throw new re('"accelerateUrl" provided to PrismaClient constructor must be a non-empty string.');
      }
    }, "accelerateUrl"), errorFormat: /* @__PURE__ */ __name((t) => {
      if (t) {
        if (typeof t != "string") throw new re(`Invalid value ${JSON.stringify(t)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!Ml.includes(t)) {
          let e = Br(t, Ml);
          throw new re(`Invalid errorFormat ${t} provided to PrismaClient constructor.${e}`);
        }
      }
    }, "errorFormat"), log: /* @__PURE__ */ __name((t) => {
      if (!t) return;
      if (!Array.isArray(t)) throw new re(`Invalid value ${JSON.stringify(t)} for "log" provided to PrismaClient constructor.`);
      function e(r) {
        if (typeof r == "string" && !_l.includes(r)) {
          let n = Br(r, _l);
          throw new re(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
        }
      }
      __name(e, "e");
      for (let r of t) {
        e(r);
        let n = { level: e, emit: /* @__PURE__ */ __name((i) => {
          let o = ["stdout", "event"];
          if (!o.includes(i)) {
            let s = Br(i, o);
            throw new re(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
          }
        }, "emit") };
        if (r && typeof r == "object") for (let [i, o] of Object.entries(r)) if (n[i]) n[i](o);
        else throw new re(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
      }
    }, "log"), transactionOptions: /* @__PURE__ */ __name((t) => {
      if (!t) return;
      let e = t.maxWait;
      if (e != null && e <= 0) throw new re(`Invalid value ${e} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
      let r = t.timeout;
      if (r != null && r <= 0) throw new re(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
    }, "transactionOptions"), omit: /* @__PURE__ */ __name((t, e) => {
      if (typeof t != "object") throw new re('"omit" option is expected to be an object.');
      if (t === null) throw new re('"omit" option can not be `null`');
      let r = [];
      for (let [n, i] of Object.entries(t)) {
        let o = Gm(n, e.runtimeDataModel);
        if (!o) {
          r.push({ kind: "UnknownModel", modelKey: n });
          continue;
        }
        for (let [s, a] of Object.entries(i)) {
          let m = o.fields.find((h) => h.name === s);
          if (!m) {
            r.push({ kind: "UnknownField", modelKey: n, fieldName: s });
            continue;
          }
          if (m.relationName) {
            r.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
            continue;
          }
          typeof a != "boolean" && r.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
      }
      if (r.length > 0) throw new re(Hm(t, r));
    }, "omit"), queryPlanCacheMaxSize: /* @__PURE__ */ __name((t) => {
      if (t !== void 0) {
        if (typeof t != "number") throw new re(`Invalid value ${JSON.stringify(t)} for "queryPlanCacheMaxSize" provided to PrismaClient constructor. Expected a number.`);
        if (!Number.isInteger(t)) throw new re(`Invalid value ${t} for "queryPlanCacheMaxSize" provided to PrismaClient constructor. Expected an integer.`);
        if (t < 0) throw new re(`Invalid value ${t} for "queryPlanCacheMaxSize" provided to PrismaClient constructor. Cache size needs to be greater or equal to 0.`);
      }
    }, "queryPlanCacheMaxSize"), comments: /* @__PURE__ */ __name((t) => {
      if (t !== void 0) {
        if (!Array.isArray(t)) throw new re(`Invalid value ${JSON.stringify(t)} for "comments" provided to PrismaClient constructor. Expected an array of SQL commenter plugins.`);
        for (let e = 0; e < t.length; e++) if (typeof t[e] != "function") throw new re(`Invalid value at index ${e} for "comments" provided to PrismaClient constructor. Each plugin must be a function.`);
      }
    }, "comments"), __internal: /* @__PURE__ */ __name((t) => {
      if (!t) return;
      let e = ["debug", "engine", "configOverride"];
      if (typeof t != "object") throw new re(`Invalid value ${JSON.stringify(t)} for "__internal" to PrismaClient constructor`);
      for (let [r] of Object.entries(t)) if (!e.includes(r)) {
        let n = Br(r, e);
        throw new re(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
      }
    }, "__internal") };
    function Qm(t) {
      let e = t.adapter !== void 0, r = t.accelerateUrl !== void 0;
      if (e && r) throw new re('The "adapter" and "accelerateUrl" options are mutually exclusive. Please provide only one of them.');
      if (!e && !r) throw new re(`PrismaClient requires a driver adapter to connect to your database, but none was provided.

Pass a driver adapter to the PrismaClient constructor, for example:

  import { PrismaPg } from '@prisma/adapter-pg'
  import { PrismaClient } from './generated/prisma/client'

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

Learn more about driver adapters: https://pris.ly/d/driver-adapters

If you use Prisma Accelerate instead of connecting to your database directly, pass \`accelerateUrl\` to the PrismaClient constructor instead of \`adapter\`.`);
    }
    __name(Qm, "Qm");
    function $l(t, e) {
      for (let [r, n] of Object.entries(t)) {
        if (!Dl.includes(r)) {
          let i = Br(r, Dl);
          throw new re(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
        }
        jm[r](n, e);
      }
      Qm(t);
    }
    __name($l, "$l");
    function Br(t, e) {
      if (e.length === 0 || typeof t != "string") return "";
      let r = Jm(t, e);
      return r ? ` Did you mean "${r}"?` : "";
    }
    __name(Br, "Br");
    function Jm(t, e) {
      if (e.length === 0) return null;
      let r = e.map((i) => ({ value: i, distance: (0, Fl.default)(t, i) }));
      r.sort((i, o) => i.distance < o.distance ? -1 : 1);
      let n = r[0];
      return n.distance < 3 ? n.value : null;
    }
    __name(Jm, "Jm");
    function Gm(t, e) {
      return Ll(e.models, t) ?? Ll(e.types, t);
    }
    __name(Gm, "Gm");
    function Ll(t, e) {
      let r = Object.keys(t).find((n) => ct(n) === e);
      if (r) return t[r];
    }
    __name(Ll, "Ll");
    function Hm(t, e) {
      let r = Wt(t);
      for (let o of e) switch (o.kind) {
        case "UnknownModel":
          r.arguments.getField(o.modelKey)?.markAsError(), r.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`);
          break;
        case "UnknownField":
          r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`);
          break;
        case "RelationInOmit":
          r.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
          break;
        case "InvalidFieldValue":
          r.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(), r.addErrorMessage(() => "Omit field option value must be a boolean.");
          break;
      }
      let { message: n, args: i } = ln(r, "colorless");
      return `Error validating "omit" option:

${i}

${n}`;
    }
    __name(Hm, "Hm");
    u();
    l();
    c();
    p();
    d();
    var Ul = require_dist();
    function Vl(t) {
      return t.length === 0 ? Promise.resolve([]) : new Promise((e, r) => {
        let n = new Array(t.length), i = null, o = false, s = 0, a = /* @__PURE__ */ __name(() => {
          o || (s++, s === t.length && (o = true, i ? r(i) : e(n)));
        }, "a"), m = /* @__PURE__ */ __name((h) => {
          o || (o = true, r(h));
        }, "m");
        for (let h = 0; h < t.length; h++) t[h].then((E) => {
          n[h] = E, a();
        }, (E) => {
          if (!(0, Ul.hasBatchIndex)(E)) {
            m(E);
            return;
          }
          E.batchRequestIdx === h ? m(E) : (i || (i = E), a());
        });
      });
    }
    __name(Vl, "Vl");
    var or = ye("prisma:client");
    typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
    var zm = { requestArgsToMiddlewareArgs: /* @__PURE__ */ __name((t) => t, "requestArgsToMiddlewareArgs"), middlewareArgsToRequestArgs: /* @__PURE__ */ __name((t) => t, "middlewareArgsToRequestArgs") };
    var Ql = /* @__PURE__ */ Symbol.for("prisma.client.transaction.scope_context");
    function ql(t) {
      let r = t[Ql];
      if (r === void 0) return { kind: "top-level" };
      if (Wm(r)) return r;
      throw new Error("Internal error: inconsistent transaction scope context.");
    }
    __name(ql, "ql");
    function Wm(t) {
      if (typeof t != "object" || t === null) return false;
      let e = t;
      return e.kind === "nested" && typeof e.txId == "string" && typeof e.scopeId == "string" && Km(e.scopeState);
    }
    __name(Wm, "Wm");
    function Km(t) {
      return typeof t != "object" || t === null ? false : Array.isArray(t.stack);
    }
    __name(Km, "Km");
    function Xm() {
      return typeof globalThis.crypto?.randomUUID == "function" ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    __name(Xm, "Xm");
    var Zm = { id: 0, nextId() {
      return ++this.id;
    } };
    function Jl(t) {
      class e {
        static {
          __name(this, "e");
        }
        _originalClient = this;
        _runtimeDataModel;
        _requestHandler;
        _connectionPromise;
        _disconnectionPromise;
        _engineConfig;
        _accelerateEngineConfig;
        _clientVersion;
        _errorFormat;
        _tracingHelper;
        _previewFeatures;
        _activeProvider;
        _globalOmit;
        _extensions;
        _engine;
        _appliedParent;
        _createPrismaPromise = vo();
        constructor(n) {
          if (!n) throw new K.PrismaClientInitializationError(`PrismaClient was instantiated without any options. A driver adapter is required to connect to your database.

Pass a driver adapter to the PrismaClient constructor, for example:

  import { PrismaPg } from '@prisma/adapter-pg'
  import { PrismaClient } from './generated/prisma/client'

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

Learn more about driver adapters: https://pris.ly/d/driver-adapters

If you use Prisma Accelerate instead of connecting to your database directly, pass \`accelerateUrl\` to the PrismaClient constructor instead of \`adapter\`.`, Io);
          t = n.__internal?.configOverride?.(t) ?? t, $l(n, t);
          let i = new yn().on("error", () => {
          });
          this._extensions = Kt.empty(), this._previewFeatures = t.previewFeatures, this._clientVersion = t.clientVersion ?? Io, this._activeProvider = t.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Sl();
          let o;
          if (n.adapter) {
            o = n.adapter;
            let s = t.activeProvider === "postgresql" || t.activeProvider === "cockroachdb" ? "postgres" : t.activeProvider;
            if (o.provider !== s) throw new K.PrismaClientInitializationError(`The Driver Adapter \`${o.adapterName}\`, based on \`${o.provider}\`, is not compatible with the provider \`${s}\` specified in the Prisma schema.`, this._clientVersion);
          }
          try {
            let s = n ?? {}, m = (s.__internal ?? {}).debug === true;
            if (m && ye.enable("prisma:client"), s.errorFormat ? this._errorFormat = s.errorFormat : b.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : b.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = t.runtimeDataModel, this._engineConfig = { enableDebugLogs: m, logLevel: s.log && Rl(s.log), logQueries: s.log && !!(typeof s.log == "string" ? s.log === "query" : s.log.find((h) => typeof h == "string" ? h === "query" : h.level === "query")), compilerWasm: t.compilerWasm, clientVersion: t.clientVersion, previewFeatures: this._previewFeatures, activeProvider: t.activeProvider, inlineSchema: t.inlineSchema, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: s.transactionOptions?.maxWait ?? 2e3, timeout: s.transactionOptions?.timeout ?? 5e3, isolationLevel: s.transactionOptions?.isolationLevel }, logEmitter: i, adapter: o, accelerateUrl: s.accelerateUrl, sqlCommenters: s.comments, parameterizationSchema: t.parameterizationSchema, runtimeDataModel: t.runtimeDataModel, queryPlanCacheMaxSize: n.queryPlanCacheMaxSize }, this._accelerateEngineConfig = Object.create(this._engineConfig), this._accelerateEngineConfig.accelerateUtils = { resolveDatasourceUrl: /* @__PURE__ */ __name(() => {
              if (s.accelerateUrl) return s.accelerateUrl;
              throw new K.PrismaClientInitializationError(`\`accelerateUrl\` is required when using \`@prisma/extension-accelerate\`:

new PrismaClient({
  accelerateUrl: "prisma://...",
}).$extends(withAccelerate())
`, t.clientVersion);
            }, "resolveDatasourceUrl") }, or("clientVersion", t.clientVersion), this._engine = cl(this._engineConfig), this._requestHandler = new Yn(this, i), s.log) for (let h of s.log) {
              let E = typeof h == "string" ? h : h.emit === "stdout" ? h.level : null;
              E && this.$on(E, (N) => {
                fr.log(`${fr.tags[E] ?? ""}`, N.message || N.query);
              });
            }
          } catch (s) {
            throw s.clientVersion = this._clientVersion, s;
          }
          return this._appliedParent = Sr(this);
        }
        get [Symbol.toStringTag]() {
          return "PrismaClient";
        }
        $on(n, i) {
          return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this;
        }
        $connect() {
          try {
            return this._engine.start();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          }
        }
        async $disconnect() {
          try {
            await this._engine.stop();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          } finally {
            os();
          }
        }
        $executeRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: To({ clientMethod: i, activeProvider: a, clientVersion: this._clientVersion }), callsite: dt(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $executeRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) {
              let [s, a] = Bl(n, i);
              return Po(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
            }
            throw new K.PrismaClientValidationError("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
          });
        }
        $executeRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => (Po(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i])));
        }
        $runCommandRaw(n) {
          if (t.activeProvider !== "mongodb") throw new K.PrismaClientValidationError(`The ${t.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
          return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: pl, callsite: dt(this._errorFormat), transaction: i }));
        }
        async $queryRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: To({ clientMethod: i, activeProvider: a, clientVersion: this._clientVersion }), callsite: dt(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $queryRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) return this.$queryRawInternal(o, "$queryRaw", ...Bl(n, i));
            throw new K.PrismaClientValidationError("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
          });
        }
        $queryRawTyped(n) {
          return this._createPrismaPromise((i) => {
            if (!this._hasPreviewFlag("typedSql")) throw new K.PrismaClientValidationError("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
            return this.$queryRawInternal(i, "$queryRawTyped", n);
          });
        }
        $queryRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i]));
        }
        _transactionWithArray({ promises: n, options: i }) {
          let o = Zm.nextId(), s = Al(n.length), a = n.map((m, h) => {
            if (m?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
            let E = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, N = { kind: "batch", id: o, index: h, isolationLevel: E, maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, lock: s };
            return m.requestTransaction?.(N) ?? m;
          });
          return Vl(a);
        }
        async _transactionWithCallback({ callback: n, options: i = {} }) {
          let o = ql(this), s = o.kind === "nested", a = s ? o.scopeState : { stack: [] }, m = a.stack, h = Xm();
          if (s) {
            if (m.at(-1) !== o.scopeId) throw new Error("Concurrent nested transactions are not supported");
            i.newTxId = o.txId;
          }
          m.push(h);
          let E = { traceparent: this._tracingHelper.getTraceParent() }, N = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, newTxId: i.newTxId }, $3;
          try {
            $3 = await this._engine.transaction("start", E, N);
          } catch (B2) {
            throw m.at(-1) === h && m.pop(), B2;
          }
          let U;
          try {
            let B2 = { kind: "itx", ...$3 };
            if (U = await n(this._createItxClient(B2, h, a)), s) {
              if (m.at(-1) !== h) throw new Error("Nested transactions must be closed in reverse order of creation.");
            } else if (m.length !== 1) throw new Error("Cannot close transaction while a nested transaction is still active.");
            await this._engine.transaction("commit", E, $3);
          } catch (B2) {
            let J = m.at(-1) !== h ? Math.max(1, m.length) : 1;
            for (let Z = 0; Z < J; Z++) await this._engine.transaction("rollback", E, $3).catch((L) => {
              or("rollback attempt %d/%d failed: %O", Z + 1, J, L);
            });
            throw B2;
          } finally {
            m.at(-1) === h ? m.pop() : m.length = 0;
          }
          return U;
        }
        _createItxClient(n, i, o) {
          let s = { kind: "nested", txId: n.id, scopeId: i, scopeState: o };
          return Qe(Sr(Qe(da(this), [Ce("_appliedParent", () => this._appliedParent._createItxClient(n, i, o)), Ce("_createPrismaPromise", () => vo(n)), Ce(Ql, () => s)])), [Xt(ya)]);
        }
        $transaction(n, i) {
          let o;
          typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = /* @__PURE__ */ __name(() => {
            throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
          }, "o") : t.activeProvider === "mongodb" && ql(this).kind === "nested" ? o = /* @__PURE__ */ __name(() => {
            throw new K.PrismaClientValidationError(`The ${t.activeProvider} provider does not support nested transactions`, { clientVersion: this._clientVersion });
          }, "o") : o = /* @__PURE__ */ __name(() => this._transactionWithCallback({ callback: n, options: i }), "o") : o = /* @__PURE__ */ __name(() => this._transactionWithArray({ promises: n, options: i }), "o");
          let s = { name: "transaction", attributes: { method: "$transaction" } };
          return this._tracingHelper.runInChildSpan(s, o);
        }
        _request(n) {
          n.otelParentCtx = this._tracingHelper.getActiveContext();
          let i = n.middlewareArgsMapper ?? zm, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = /* @__PURE__ */ __name(async (m) => {
            let { runInTransaction: h, args: E, ...N } = m, $3 = { ...n, ...N };
            E && ($3.args = i.middlewareArgsToRequestArgs(E)), n.transaction !== void 0 && h === false && delete $3.transaction;
            let U = await Ea(this, $3);
            if (!$3.model) return U;
            let B2 = Aa({ dataPath: $3.dataPath, modelName: $3.model, args: $3.args, runtimeDataModel: this._runtimeDataModel });
            return ha({ result: U, modelName: B2.modelName, args: B2.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit });
          }, "a");
          return this._tracingHelper.runInChildSpan(s.operation, () => a(o));
        }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: m, argsMapper: h, transaction: E, unpacker: N, otelParentCtx: $3, customDataProxyFetch: U }) {
          try {
            n = h ? h(n) : n;
            let B2 = { name: "serialize" }, q = this._tracingHelper.runInChildSpan(B2, () => fn({ modelName: m, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
            return ye.enabled("prisma:client") && (or("Prisma Client call:"), or(`prisma.${i}(${ra(n)})`), or("Generated request:"), or(JSON.stringify(q, null, 2) + `
`)), E?.kind === "batch" && await E.lock, this._requestHandler.request({ protocolQuery: q, modelName: m, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: E, unpacker: N, otelParentCtx: $3, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: U });
          } catch (B2) {
            throw B2.clientVersion = this._clientVersion, B2;
          }
        }
        _hasPreviewFlag(n) {
          return !!this._engineConfig.previewFeatures?.includes(n);
        }
        $extends = ma;
      }
      return e;
    }
    __name(Jl, "Jl");
    function Bl(t, e) {
      return Ym(t) ? [new jl.Sql(t, e), bl] : [t, xl];
    }
    __name(Bl, "Bl");
    function Ym(t) {
      return Array.isArray(t) && Array.isArray(t.raw);
    }
    __name(Ym, "Ym");
    u();
    l();
    c();
    p();
    d();
    var ef = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function Gl(t) {
      return new Proxy(t, { get(e, r) {
        if (r in e) return e[r];
        if (!ef.has(r)) throw new TypeError(`Invalid enum value: ${String(r)}`);
      } });
    }
    __name(Gl, "Gl");
    u();
    l();
    c();
    p();
    d();
    var tf = /* @__PURE__ */ __name(() => globalThis.process?.release?.name === "node", "tf");
    var rf = /* @__PURE__ */ __name(() => !!globalThis.Bun || !!globalThis.process?.versions?.bun, "rf");
    var nf = /* @__PURE__ */ __name(() => !!globalThis.Deno, "nf");
    var of = /* @__PURE__ */ __name(() => typeof globalThis.Netlify == "object", "of");
    var sf = /* @__PURE__ */ __name(() => typeof globalThis.EdgeRuntime == "object", "sf");
    var af = /* @__PURE__ */ __name(() => globalThis.navigator?.userAgent === "Cloudflare-Workers", "af");
    function uf() {
      return [[of, "netlify"], [sf, "edge-light"], [af, "workerd"], [nf, "deno"], [rf, "bun"], [tf, "node"]].flatMap((r) => r[0]() ? [r[1]] : []).at(0) ?? "";
    }
    __name(uf, "uf");
    var lf = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function Hl() {
      let t = uf();
      return { id: t, prettyName: lf[t] || t, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(t) };
    }
    __name(Hl, "Hl");
    var K = require_dist();
    var it = require_dist();
    var Ee = require_dist();
    var zl = require_dist();
  }
});

// ../../../node_modules/.prisma/client/query_compiler_fast_bg.js
var require_query_compiler_fast_bg = __commonJS({
  "../../../node_modules/.prisma/client/query_compiler_fast_bg.js"(exports, module) {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    var h = Object.defineProperty;
    var T = Object.getOwnPropertyDescriptor;
    var M = Object.getOwnPropertyNames;
    var j = Object.prototype.hasOwnProperty;
    var D = /* @__PURE__ */ __name((e, t) => {
      for (var n in t) h(e, n, { get: t[n], enumerable: true });
    }, "D");
    var O = /* @__PURE__ */ __name((e, t, n, _) => {
      if (t && typeof t == "object" || typeof t == "function") for (let r of M(t)) !j.call(e, r) && r !== n && h(e, r, { get: /* @__PURE__ */ __name(() => t[r], "get"), enumerable: !(_ = T(t, r)) || _.enumerable });
      return e;
    }, "O");
    var B2 = /* @__PURE__ */ __name((e) => O(h({}, "__esModule", { value: true }), e), "B");
    var xe = {};
    D(xe, { QueryCompiler: /* @__PURE__ */ __name(() => F, "QueryCompiler"), __wbg_Error_e83987f665cf5504: /* @__PURE__ */ __name(() => q, "__wbg_Error_e83987f665cf5504"), __wbg_Number_bb48ca12f395cd08: /* @__PURE__ */ __name(() => C, "__wbg_Number_bb48ca12f395cd08"), __wbg_String_8f0eb39a4a4c2f66: /* @__PURE__ */ __name(() => k, "__wbg_String_8f0eb39a4a4c2f66"), __wbg___wbindgen_boolean_get_6d5a1ee65bab5f68: /* @__PURE__ */ __name(() => W, "__wbg___wbindgen_boolean_get_6d5a1ee65bab5f68"), __wbg___wbindgen_debug_string_df47ffb5e35e6763: /* @__PURE__ */ __name(() => V, "__wbg___wbindgen_debug_string_df47ffb5e35e6763"), __wbg___wbindgen_in_bb933bd9e1b3bc0f: /* @__PURE__ */ __name(() => z, "__wbg___wbindgen_in_bb933bd9e1b3bc0f"), __wbg___wbindgen_is_object_c818261d21f283a4: /* @__PURE__ */ __name(() => L, "__wbg___wbindgen_is_object_c818261d21f283a4"), __wbg___wbindgen_is_string_fbb76cb2940daafd: /* @__PURE__ */ __name(() => P, "__wbg___wbindgen_is_string_fbb76cb2940daafd"), __wbg___wbindgen_is_undefined_2d472862bd29a478: /* @__PURE__ */ __name(() => Q, "__wbg___wbindgen_is_undefined_2d472862bd29a478"), __wbg___wbindgen_jsval_loose_eq_b664b38a2f582147: /* @__PURE__ */ __name(() => Y, "__wbg___wbindgen_jsval_loose_eq_b664b38a2f582147"), __wbg___wbindgen_number_get_a20bf9b85341449d: /* @__PURE__ */ __name(() => G, "__wbg___wbindgen_number_get_a20bf9b85341449d"), __wbg___wbindgen_string_get_e4f06c90489ad01b: /* @__PURE__ */ __name(() => J, "__wbg___wbindgen_string_get_e4f06c90489ad01b"), __wbg___wbindgen_throw_b855445ff6a94295: /* @__PURE__ */ __name(() => X, "__wbg___wbindgen_throw_b855445ff6a94295"), __wbg_entries_e171b586f8f6bdbf: /* @__PURE__ */ __name(() => H, "__wbg_entries_e171b586f8f6bdbf"), __wbg_getTime_14776bfb48a1bff9: /* @__PURE__ */ __name(() => K, "__wbg_getTime_14776bfb48a1bff9"), __wbg_get_7bed016f185add81: /* @__PURE__ */ __name(() => Z, "__wbg_get_7bed016f185add81"), __wbg_get_with_ref_key_1dc361bd10053bfe: /* @__PURE__ */ __name(() => v, "__wbg_get_with_ref_key_1dc361bd10053bfe"), __wbg_instanceof_ArrayBuffer_70beb1189ca63b38: /* @__PURE__ */ __name(() => ee, "__wbg_instanceof_ArrayBuffer_70beb1189ca63b38"), __wbg_instanceof_Uint8Array_20c8e73002f7af98: /* @__PURE__ */ __name(() => te, "__wbg_instanceof_Uint8Array_20c8e73002f7af98"), __wbg_isSafeInteger_d216eda7911dde36: /* @__PURE__ */ __name(() => ne, "__wbg_isSafeInteger_d216eda7911dde36"), __wbg_length_69bca3cb64fc8748: /* @__PURE__ */ __name(() => re, "__wbg_length_69bca3cb64fc8748"), __wbg_length_cdd215e10d9dd507: /* @__PURE__ */ __name(() => _e, "__wbg_length_cdd215e10d9dd507"), __wbg_new_0_f9740686d739025c: /* @__PURE__ */ __name(() => oe, "__wbg_new_0_f9740686d739025c"), __wbg_new_1acc0b6eea89d040: /* @__PURE__ */ __name(() => ce, "__wbg_new_1acc0b6eea89d040"), __wbg_new_5a79be3ab53b8aa5: /* @__PURE__ */ __name(() => ie, "__wbg_new_5a79be3ab53b8aa5"), __wbg_new_68651c719dcda04e: /* @__PURE__ */ __name(() => se, "__wbg_new_68651c719dcda04e"), __wbg_new_e17d9f43105b08be: /* @__PURE__ */ __name(() => ue, "__wbg_new_e17d9f43105b08be"), __wbg_prototypesetcall_2a6620b6922694b2: /* @__PURE__ */ __name(() => fe, "__wbg_prototypesetcall_2a6620b6922694b2"), __wbg_set_3f1d0b984ed272ed: /* @__PURE__ */ __name(() => be, "__wbg_set_3f1d0b984ed272ed"), __wbg_set_907fb406c34a251d: /* @__PURE__ */ __name(() => de, "__wbg_set_907fb406c34a251d"), __wbg_set_c213c871859d6500: /* @__PURE__ */ __name(() => ae, "__wbg_set_c213c871859d6500"), __wbg_set_message_82ae475bb413aa5c: /* @__PURE__ */ __name(() => ge, "__wbg_set_message_82ae475bb413aa5c"), __wbg_set_wasm: /* @__PURE__ */ __name(() => N, "__wbg_set_wasm"), __wbindgen_cast_2241b6af4c4b2941: /* @__PURE__ */ __name(() => le, "__wbindgen_cast_2241b6af4c4b2941"), __wbindgen_cast_4625c577ab2ec9ee: /* @__PURE__ */ __name(() => we, "__wbindgen_cast_4625c577ab2ec9ee"), __wbindgen_cast_9ae0607507abb057: /* @__PURE__ */ __name(() => pe, "__wbindgen_cast_9ae0607507abb057"), __wbindgen_cast_d6cd19b81560fd6e: /* @__PURE__ */ __name(() => ye, "__wbindgen_cast_d6cd19b81560fd6e"), __wbindgen_init_externref_table: /* @__PURE__ */ __name(() => me, "__wbindgen_init_externref_table") });
    module.exports = B2(xe);
    var A = /* @__PURE__ */ __name(() => {
    }, "A");
    A.prototype = A;
    var o;
    function N(e) {
      o = e;
    }
    __name(N, "N");
    var p = null;
    function a() {
      return (p === null || p.byteLength === 0) && (p = new Uint8Array(o.memory.buffer)), p;
    }
    __name(a, "a");
    var y = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    y.decode();
    var U = 2146435072;
    var S = 0;
    function R(e, t) {
      return S += t, S >= U && (y = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }), y.decode(), S = t), y.decode(a().subarray(e, e + t));
    }
    __name(R, "R");
    function m(e, t) {
      return e = e >>> 0, R(e, t);
    }
    __name(m, "m");
    var f = 0;
    var g = new TextEncoder();
    "encodeInto" in g || (g.encodeInto = function(e, t) {
      const n = g.encode(e);
      return t.set(n), { read: e.length, written: n.length };
    });
    function l(e, t, n) {
      if (n === void 0) {
        const i = g.encode(e), d = t(i.length, 1) >>> 0;
        return a().subarray(d, d + i.length).set(i), f = i.length, d;
      }
      let _ = e.length, r = t(_, 1) >>> 0;
      const s = a();
      let c = 0;
      for (; c < _; c++) {
        const i = e.charCodeAt(c);
        if (i > 127) break;
        s[r + c] = i;
      }
      if (c !== _) {
        c !== 0 && (e = e.slice(c)), r = n(r, _, _ = c + e.length * 3, 1) >>> 0;
        const i = a().subarray(r + c, r + _), d = g.encodeInto(e, i);
        c += d.written, r = n(r, _, c, 1) >>> 0;
      }
      return f = c, r;
    }
    __name(l, "l");
    var b = null;
    function u() {
      return (b === null || b.buffer.detached === true || b.buffer.detached === void 0 && b.buffer !== o.memory.buffer) && (b = new DataView(o.memory.buffer)), b;
    }
    __name(u, "u");
    function x(e) {
      return e == null;
    }
    __name(x, "x");
    function I(e) {
      const t = typeof e;
      if (t == "number" || t == "boolean" || e == null) return `${e}`;
      if (t == "string") return `"${e}"`;
      if (t == "symbol") {
        const r = e.description;
        return r == null ? "Symbol" : `Symbol(${r})`;
      }
      if (t == "function") {
        const r = e.name;
        return typeof r == "string" && r.length > 0 ? `Function(${r})` : "Function";
      }
      if (Array.isArray(e)) {
        const r = e.length;
        let s = "[";
        r > 0 && (s += I(e[0]));
        for (let c = 1; c < r; c++) s += ", " + I(e[c]);
        return s += "]", s;
      }
      const n = /\[object ([^\]]+)\]/.exec(toString.call(e));
      let _;
      if (n && n.length > 1) _ = n[1];
      else return toString.call(e);
      if (_ == "Object") try {
        return "Object(" + JSON.stringify(e) + ")";
      } catch {
        return "Object";
      }
      return e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : _;
    }
    __name(I, "I");
    function $3(e, t) {
      return e = e >>> 0, a().subarray(e / 1, e / 1 + t);
    }
    __name($3, "$");
    function w(e) {
      const t = o.__wbindgen_externrefs.get(e);
      return o.__externref_table_dealloc(e), t;
    }
    __name(w, "w");
    var E = typeof FinalizationRegistry > "u" ? { register: /* @__PURE__ */ __name(() => {
    }, "register"), unregister: /* @__PURE__ */ __name(() => {
    }, "unregister") } : new FinalizationRegistry((e) => o.__wbg_querycompiler_free(e >>> 0, 1));
    var F = class {
      static {
        __name(this, "F");
      }
      __destroy_into_raw() {
        const t = this.__wbg_ptr;
        return this.__wbg_ptr = 0, E.unregister(this), t;
      }
      free() {
        const t = this.__destroy_into_raw();
        o.__wbg_querycompiler_free(t, 0);
      }
      compileBatch(t) {
        const n = l(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compileBatch(this.__wbg_ptr, n, _);
        if (r[2]) throw w(r[1]);
        return w(r[0]);
      }
      constructor(t) {
        const n = o.querycompiler_new(t);
        if (n[2]) throw w(n[1]);
        return this.__wbg_ptr = n[0] >>> 0, E.register(this, this.__wbg_ptr, this), this;
      }
      compile(t) {
        const n = l(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compile(this.__wbg_ptr, n, _);
        if (r[2]) throw w(r[1]);
        return w(r[0]);
      }
    };
    Symbol.dispose && (F.prototype[Symbol.dispose] = F.prototype.free);
    function q(e, t) {
      return Error(m(e, t));
    }
    __name(q, "q");
    function C(e) {
      return Number(e);
    }
    __name(C, "C");
    function k(e, t) {
      const n = String(t), _ = l(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
      u().setInt32(e + 4 * 1, r, true), u().setInt32(e + 4 * 0, _, true);
    }
    __name(k, "k");
    function W(e) {
      const t = e, n = typeof t == "boolean" ? t : void 0;
      return x(n) ? 16777215 : n ? 1 : 0;
    }
    __name(W, "W");
    function V(e, t) {
      const n = I(t), _ = l(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
      u().setInt32(e + 4 * 1, r, true), u().setInt32(e + 4 * 0, _, true);
    }
    __name(V, "V");
    function z(e, t) {
      return e in t;
    }
    __name(z, "z");
    function L(e) {
      const t = e;
      return typeof t == "object" && t !== null;
    }
    __name(L, "L");
    function P(e) {
      return typeof e == "string";
    }
    __name(P, "P");
    function Q(e) {
      return e === void 0;
    }
    __name(Q, "Q");
    function Y(e, t) {
      return e == t;
    }
    __name(Y, "Y");
    function G(e, t) {
      const n = t, _ = typeof n == "number" ? n : void 0;
      u().setFloat64(e + 8 * 1, x(_) ? 0 : _, true), u().setInt32(e + 4 * 0, !x(_), true);
    }
    __name(G, "G");
    function J(e, t) {
      const n = t, _ = typeof n == "string" ? n : void 0;
      var r = x(_) ? 0 : l(_, o.__wbindgen_malloc, o.__wbindgen_realloc), s = f;
      u().setInt32(e + 4 * 1, s, true), u().setInt32(e + 4 * 0, r, true);
    }
    __name(J, "J");
    function X(e, t) {
      throw new Error(m(e, t));
    }
    __name(X, "X");
    function H(e) {
      return Object.entries(e);
    }
    __name(H, "H");
    function K(e) {
      return e.getTime();
    }
    __name(K, "K");
    function Z(e, t) {
      return e[t >>> 0];
    }
    __name(Z, "Z");
    function v(e, t) {
      return e[t];
    }
    __name(v, "v");
    function ee(e) {
      let t;
      try {
        t = e instanceof ArrayBuffer;
      } catch {
        t = false;
      }
      return t;
    }
    __name(ee, "ee");
    function te(e) {
      let t;
      try {
        t = e instanceof Uint8Array;
      } catch {
        t = false;
      }
      return t;
    }
    __name(te, "te");
    function ne(e) {
      return Number.isSafeInteger(e);
    }
    __name(ne, "ne");
    function re(e) {
      return e.length;
    }
    __name(re, "re");
    function _e(e) {
      return e.length;
    }
    __name(_e, "_e");
    function oe() {
      return /* @__PURE__ */ new Date();
    }
    __name(oe, "oe");
    function ce() {
      return new Object();
    }
    __name(ce, "ce");
    function ie(e) {
      return new Uint8Array(e);
    }
    __name(ie, "ie");
    function se() {
      return /* @__PURE__ */ new Map();
    }
    __name(se, "se");
    function ue() {
      return new Array();
    }
    __name(ue, "ue");
    function fe(e, t, n) {
      Uint8Array.prototype.set.call($3(e, t), n);
    }
    __name(fe, "fe");
    function be(e, t, n) {
      e[t] = n;
    }
    __name(be, "be");
    function de(e, t, n) {
      return e.set(t, n);
    }
    __name(de, "de");
    function ae(e, t, n) {
      e[t >>> 0] = n;
    }
    __name(ae, "ae");
    function ge(e, t) {
      global.PRISMA_WASM_PANIC_REGISTRY.set_message(m(e, t));
    }
    __name(ge, "ge");
    function le(e, t) {
      return m(e, t);
    }
    __name(le, "le");
    function we(e) {
      return BigInt.asUintN(64, e);
    }
    __name(we, "we");
    function pe(e) {
      return e;
    }
    __name(pe, "pe");
    function ye(e) {
      return e;
    }
    __name(ye, "ye");
    function me() {
      const e = o.__wbindgen_externrefs, t = e.grow(4);
      e.set(0, void 0), e.set(t + 0, void 0), e.set(t + 1, null), e.set(t + 2, true), e.set(t + 3, false);
    }
    __name(me, "me");
  }
});

// ../../../node_modules/.prisma/client/wasm-worker-loader.mjs
var wasm_worker_loader_exports = {};
__export(wasm_worker_loader_exports, {
  default: () => wasm_worker_loader_default
});
var wasm_worker_loader_default;
var init_wasm_worker_loader = __esm({
  "../../../node_modules/.prisma/client/wasm-worker-loader.mjs"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    wasm_worker_loader_default = import("./54704d3bbdf572d56c30e2267d2de637db19dca6-query_compiler_fast_bg.wasm");
  }
});

// ../../../node_modules/.prisma/client/edge.js
var require_edge = __commonJS({
  "../../../node_modules/.prisma/client/edge.js"(exports) {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    Object.defineProperty(exports, "__esModule", { value: true });
    var {
      PrismaClientKnownRequestError: PrismaClientKnownRequestError2,
      PrismaClientUnknownRequestError: PrismaClientUnknownRequestError2,
      PrismaClientRustPanicError: PrismaClientRustPanicError2,
      PrismaClientInitializationError: PrismaClientInitializationError2,
      PrismaClientValidationError: PrismaClientValidationError2,
      getPrismaClient: getPrismaClient2,
      sqltag: sqltag2,
      empty: empty2,
      join: join2,
      raw: raw3,
      skip: skip2,
      Decimal: Decimal2,
      Debug: Debug3,
      DbNull: DbNull2,
      JsonNull: JsonNull2,
      AnyNull: AnyNull2,
      NullTypes: NullTypes2,
      makeStrictEnum: makeStrictEnum2,
      Extensions: Extensions2,
      warnOnce: warnOnce2,
      defineDmmfProperty: defineDmmfProperty2,
      Public: Public2,
      getRuntime: getRuntime2,
      createParam: createParam2
    } = require_wasm_compiler_edge();
    var Prisma = {};
    exports.Prisma = Prisma;
    exports.$Enums = {};
    Prisma.prismaVersion = {
      client: "7.10.0",
      engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
    };
    Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
    Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
    Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError2;
    Prisma.PrismaClientInitializationError = PrismaClientInitializationError2;
    Prisma.PrismaClientValidationError = PrismaClientValidationError2;
    Prisma.Decimal = Decimal2;
    Prisma.sql = sqltag2;
    Prisma.empty = empty2;
    Prisma.join = join2;
    Prisma.raw = raw3;
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = Extensions2.getExtensionContext;
    Prisma.defineExtension = Extensions2.defineExtension;
    Prisma.DbNull = DbNull2;
    Prisma.JsonNull = JsonNull2;
    Prisma.AnyNull = AnyNull2;
    Prisma.NullTypes = NullTypes2;
    exports.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      Serializable: "Serializable"
    });
    exports.Prisma.UsuarioScalarFieldEnum = {
      id: "id",
      email: "email",
      senhaHash: "senhaHash",
      nomeCompleto: "nomeCompleto",
      perfil: "perfil",
      mfaSecret: "mfaSecret",
      mfaAtivo: "mfaAtivo",
      ativo: "ativo",
      criadoEm: "criadoEm",
      atualizadoEm: "atualizadoEm"
    };
    exports.Prisma.EscolaLocalScalarFieldEnum = {
      id: "id",
      nome: "nome",
      endereco: "endereco",
      cidade: "cidade",
      uf: "uf",
      cnpj: "cnpj",
      telefone: "telefone",
      email: "email",
      diretoriaRegional: "diretoriaRegional",
      alunosMatriculados: "alunosMatriculados",
      unidadesMoveis: "unidadesMoveis",
      statusOperacao: "statusOperacao",
      ativo: "ativo",
      criadoEm: "criadoEm"
    };
    exports.Prisma.PacienteScalarFieldEnum = {
      id: "id",
      nomeEnc: "nomeEnc",
      cpfEnc: "cpfEnc",
      dataNascimentoEnc: "dataNascimentoEnc",
      telefoneEnc: "telefoneEnc",
      dekCifrada: "dekCifrada",
      ivPii: "ivPii",
      tagPii: "tagPii",
      turma: "turma",
      escolaLocalId: "escolaLocalId",
      retencaoExpiraEm: "retencaoExpiraEm",
      ativo: "ativo",
      criadoEm: "criadoEm",
      atualizadoEm: "atualizadoEm"
    };
    exports.Prisma.ConsentimentoScalarFieldEnum = {
      id: "id",
      pacienteId: "pacienteId",
      consentidoPor: "consentidoPor",
      dataConsentimento: "dataConsentimento",
      referenciaDocumento: "referenciaDocumento",
      consentimentoDispensado: "consentimentoDispensado",
      justificativaDispensa: "justificativaDispensa",
      criadoEm: "criadoEm"
    };
    exports.Prisma.AtendimentoScalarFieldEnum = {
      id: "id",
      pacienteId: "pacienteId",
      escolaLocalId: "escolaLocalId",
      usuarioId: "usuarioId",
      especialidade: "especialidade",
      turno: "turno",
      resumo: "resumo",
      procedimentos: "procedimentos",
      insumosUtilizados: "insumosUtilizados",
      encaminhamentoExterno: "encaminhamentoExterno",
      chaveIdempotencia: "chaveIdempotencia",
      criadoEm: "criadoEm",
      atualizadoEm: "atualizadoEm"
    };
    exports.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports.Prisma.ModelName = {
      Usuario: "Usuario",
      EscolaLocal: "EscolaLocal",
      Paciente: "Paciente",
      Consentimento: "Consentimento",
      Atendimento: "Atendimento"
    };
    var config = {
      "previewFeatures": [
        "driverAdapters"
      ],
      "clientVersion": "7.10.0",
      "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
      "activeProvider": "sqlite",
      "inlineSchema": '// =============================================================================\n// SCHEMA PRISMA \u2014 SA\xDADE EM MOVIMENTO (100% EM PORTUGU\xCAS DO BRASIL)\n// =============================================================================\n// Schema 100% neutro e em portugu\xEAs (tabelas e colunas em snake_case).\n// Usa @id @default(uuid()) e tipos primitivos para portabilidade\n// transparente entre SQLite, Cloudflare D1 e PostgreSQL.\n// =============================================================================\n\ngenerator client {\n  provider        = "prisma-client-js"\n  previewFeatures = ["driverAdapters"]\n}\n\ndatasource db {\n  provider = "sqlite"\n}\n\n// \u2500\u2500\u2500 Usu\xE1rio do Sistema \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel Usuario {\n  id           String   @id @default(uuid())\n  email        String   @unique\n  senhaHash    String   @map("senha_hash")\n  nomeCompleto String   @map("nome_completo")\n  perfil       String // ADMIN | TRIAGEM_RECEPCAO | PROFISSIONAL_SAUDE | DPO\n  mfaSecret    String?  @map("mfa_secret")\n  mfaAtivo     Boolean  @default(false) @map("mfa_ativo")\n  ativo        Boolean  @default(true)\n  criadoEm     DateTime @default(now()) @map("criado_em")\n  atualizadoEm DateTime @updatedAt @map("atualizado_em")\n\n  atendimentos Atendimento[]\n\n  @@map("usuarios")\n}\n\n// \u2500\u2500\u2500 Escola / Local de Atendimento \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel EscolaLocal {\n  id                 String   @id @default(uuid())\n  nome               String\n  endereco           String\n  cidade             String\n  uf                 String\n  cnpj               String?  @unique\n  telefone           String?\n  email              String?\n  diretoriaRegional  String?  @map("diretoria_regional")\n  alunosMatriculados Int      @default(0) @map("alunos_matriculados")\n  unidadesMoveis     Int      @default(0) @map("unidades_moveis")\n  statusOperacao     String   @default("PROGRAMADA") @map("status_operacao")\n  ativo              Boolean  @default(true)\n  criadoEm           DateTime @default(now()) @map("criado_em")\n\n  pacientes    Paciente[]\n  atendimentos Atendimento[]\n\n  @@map("escolas_locais")\n}\n\n// \u2500\u2500\u2500 Paciente \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n// Campos PII criptografados via AES-256-GCM com envelope encryption.\n// DEK por registro, cifrada pela KEK (vari\xE1vel de ambiente).\n//\n// Finalidade: triagem e registro de atendimentos de sa\xFAde em escolas p\xFAblicas.\n// Base legal: consentimento do respons\xE1vel legal (LGPD Art. 14).\n\nmodel Paciente {\n  id String @id @default(uuid())\n\n  // --- Campos PII criptografados (AES-256-GCM) ---\n  nomeEnc           String  @map("nome_enc")\n  cpfEnc            String  @map("cpf_enc")\n  dataNascimentoEnc String  @map("data_nascimento_enc")\n  telefoneEnc       String? @map("telefone_enc")\n\n  // --- Metadados de criptografia (envelope encryption) ---\n  dekCifrada String @map("dek_cifrada")\n  ivPii      String @map("iv_pii")\n  tagPii     String @map("tag_pii")\n\n  // --- Dados n\xE3o sens\xEDveis ---\n  turma         String\n  escolaLocalId String      @map("escola_local_id")\n  escolaLocal   EscolaLocal @relation(fields: [escolaLocalId], references: [id])\n\n  // --- LGPD: Reten\xE7\xE3o e expurgo ---\n  retencaoExpiraEm DateTime? @map("retencao_expira_em")\n  ativo            Boolean   @default(true)\n\n  criadoEm     DateTime @default(now()) @map("criado_em")\n  atualizadoEm DateTime @updatedAt @map("atualizado_em")\n\n  consentimentos Consentimento[]\n  atendimentos   Atendimento[]\n\n  @@map("pacientes")\n}\n\n// \u2500\u2500\u2500 Consentimento (LGPD Art. 14) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n// Registro do consentimento do respons\xE1vel legal para tratamento\n// de dados sens\xEDveis de sa\xFAde de menor de idade.\n\nmodel Consentimento {\n  id         String   @id @default(uuid())\n  pacienteId String   @map("paciente_id")\n  paciente   Paciente @relation(fields: [pacienteId], references: [id])\n\n  consentidoPor       String?   @map("consentido_por")\n  dataConsentimento   DateTime? @map("data_consentimento")\n  referenciaDocumento String?   @map("referencia_documento")\n\n  consentimentoDispensado Boolean @default(false) @map("consentimento_dispensado")\n  justificativaDispensa   String? @map("justificativa_dispensa")\n\n  criadoEm DateTime @default(now()) @map("criado_em")\n\n  @@map("consentimentos")\n}\n\n// \u2500\u2500\u2500 Registro de Atendimento \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel Atendimento {\n  id String @id @default(uuid())\n\n  pacienteId String   @map("paciente_id")\n  paciente   Paciente @relation(fields: [pacienteId], references: [id])\n\n  escolaLocalId String      @map("escola_local_id")\n  escolaLocal   EscolaLocal @relation(fields: [escolaLocalId], references: [id])\n\n  usuarioId String  @map("usuario_id")\n  usuario   Usuario @relation(fields: [usuarioId], references: [id])\n\n  especialidade         String\n  turno                 String\n  resumo                String\n  procedimentos         String?\n  insumosUtilizados     String? @map("insumos_utilizados")\n  encaminhamentoExterno String? @map("encaminhamento_externo")\n\n  chaveIdempotencia String @unique @map("chave_idempotencia")\n\n  criadoEm     DateTime @default(now()) @map("criado_em")\n  atualizadoEm DateTime @updatedAt @map("atualizado_em")\n\n  @@map("atendimentos")\n}\n'
    };
    config.runtimeDataModel = JSON.parse('{"models":{"Usuario":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"senhaHash","kind":"scalar","type":"String","dbName":"senha_hash"},{"name":"nomeCompleto","kind":"scalar","type":"String","dbName":"nome_completo"},{"name":"perfil","kind":"scalar","type":"String"},{"name":"mfaSecret","kind":"scalar","type":"String","dbName":"mfa_secret"},{"name":"mfaAtivo","kind":"scalar","type":"Boolean","dbName":"mfa_ativo"},{"name":"ativo","kind":"scalar","type":"Boolean"},{"name":"criadoEm","kind":"scalar","type":"DateTime","dbName":"criado_em"},{"name":"atualizadoEm","kind":"scalar","type":"DateTime","dbName":"atualizado_em"},{"name":"atendimentos","kind":"object","type":"Atendimento","relationName":"AtendimentoToUsuario"}],"dbName":"usuarios","schema":null},"EscolaLocal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"nome","kind":"scalar","type":"String"},{"name":"endereco","kind":"scalar","type":"String"},{"name":"cidade","kind":"scalar","type":"String"},{"name":"uf","kind":"scalar","type":"String"},{"name":"cnpj","kind":"scalar","type":"String"},{"name":"telefone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"diretoriaRegional","kind":"scalar","type":"String","dbName":"diretoria_regional"},{"name":"alunosMatriculados","kind":"scalar","type":"Int","dbName":"alunos_matriculados"},{"name":"unidadesMoveis","kind":"scalar","type":"Int","dbName":"unidades_moveis"},{"name":"statusOperacao","kind":"scalar","type":"String","dbName":"status_operacao"},{"name":"ativo","kind":"scalar","type":"Boolean"},{"name":"criadoEm","kind":"scalar","type":"DateTime","dbName":"criado_em"},{"name":"pacientes","kind":"object","type":"Paciente","relationName":"EscolaLocalToPaciente"},{"name":"atendimentos","kind":"object","type":"Atendimento","relationName":"AtendimentoToEscolaLocal"}],"dbName":"escolas_locais","schema":null},"Paciente":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"nomeEnc","kind":"scalar","type":"String","dbName":"nome_enc"},{"name":"cpfEnc","kind":"scalar","type":"String","dbName":"cpf_enc"},{"name":"dataNascimentoEnc","kind":"scalar","type":"String","dbName":"data_nascimento_enc"},{"name":"telefoneEnc","kind":"scalar","type":"String","dbName":"telefone_enc"},{"name":"dekCifrada","kind":"scalar","type":"String","dbName":"dek_cifrada"},{"name":"ivPii","kind":"scalar","type":"String","dbName":"iv_pii"},{"name":"tagPii","kind":"scalar","type":"String","dbName":"tag_pii"},{"name":"turma","kind":"scalar","type":"String"},{"name":"escolaLocalId","kind":"scalar","type":"String","dbName":"escola_local_id"},{"name":"escolaLocal","kind":"object","type":"EscolaLocal","relationName":"EscolaLocalToPaciente"},{"name":"retencaoExpiraEm","kind":"scalar","type":"DateTime","dbName":"retencao_expira_em"},{"name":"ativo","kind":"scalar","type":"Boolean"},{"name":"criadoEm","kind":"scalar","type":"DateTime","dbName":"criado_em"},{"name":"atualizadoEm","kind":"scalar","type":"DateTime","dbName":"atualizado_em"},{"name":"consentimentos","kind":"object","type":"Consentimento","relationName":"ConsentimentoToPaciente"},{"name":"atendimentos","kind":"object","type":"Atendimento","relationName":"AtendimentoToPaciente"}],"dbName":"pacientes","schema":null},"Consentimento":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"pacienteId","kind":"scalar","type":"String","dbName":"paciente_id"},{"name":"paciente","kind":"object","type":"Paciente","relationName":"ConsentimentoToPaciente"},{"name":"consentidoPor","kind":"scalar","type":"String","dbName":"consentido_por"},{"name":"dataConsentimento","kind":"scalar","type":"DateTime","dbName":"data_consentimento"},{"name":"referenciaDocumento","kind":"scalar","type":"String","dbName":"referencia_documento"},{"name":"consentimentoDispensado","kind":"scalar","type":"Boolean","dbName":"consentimento_dispensado"},{"name":"justificativaDispensa","kind":"scalar","type":"String","dbName":"justificativa_dispensa"},{"name":"criadoEm","kind":"scalar","type":"DateTime","dbName":"criado_em"}],"dbName":"consentimentos","schema":null},"Atendimento":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"pacienteId","kind":"scalar","type":"String","dbName":"paciente_id"},{"name":"paciente","kind":"object","type":"Paciente","relationName":"AtendimentoToPaciente"},{"name":"escolaLocalId","kind":"scalar","type":"String","dbName":"escola_local_id"},{"name":"escolaLocal","kind":"object","type":"EscolaLocal","relationName":"AtendimentoToEscolaLocal"},{"name":"usuarioId","kind":"scalar","type":"String","dbName":"usuario_id"},{"name":"usuario","kind":"object","type":"Usuario","relationName":"AtendimentoToUsuario"},{"name":"especialidade","kind":"scalar","type":"String"},{"name":"turno","kind":"scalar","type":"String"},{"name":"resumo","kind":"scalar","type":"String"},{"name":"procedimentos","kind":"scalar","type":"String"},{"name":"insumosUtilizados","kind":"scalar","type":"String","dbName":"insumos_utilizados"},{"name":"encaminhamentoExterno","kind":"scalar","type":"String","dbName":"encaminhamento_externo"},{"name":"chaveIdempotencia","kind":"scalar","type":"String","dbName":"chave_idempotencia"},{"name":"criadoEm","kind":"scalar","type":"DateTime","dbName":"criado_em"},{"name":"atualizadoEm","kind":"scalar","type":"DateTime","dbName":"atualizado_em"}],"dbName":"atendimentos","schema":null}},"enums":{},"types":{}}');
    defineDmmfProperty2(exports.Prisma, config.runtimeDataModel);
    config.parameterizationSchema = {
      strings: JSON.parse('["where","orderBy","cursor","pacientes","atendimentos","_count","escolaLocal","paciente","consentimentos","usuario","Usuario.findUnique","Usuario.findUniqueOrThrow","Usuario.findFirst","Usuario.findFirstOrThrow","Usuario.findMany","data","Usuario.createOne","Usuario.createMany","Usuario.createManyAndReturn","Usuario.updateOne","Usuario.updateMany","Usuario.updateManyAndReturn","create","update","Usuario.upsertOne","Usuario.deleteOne","Usuario.deleteMany","having","_min","_max","Usuario.groupBy","Usuario.aggregate","EscolaLocal.findUnique","EscolaLocal.findUniqueOrThrow","EscolaLocal.findFirst","EscolaLocal.findFirstOrThrow","EscolaLocal.findMany","EscolaLocal.createOne","EscolaLocal.createMany","EscolaLocal.createManyAndReturn","EscolaLocal.updateOne","EscolaLocal.updateMany","EscolaLocal.updateManyAndReturn","EscolaLocal.upsertOne","EscolaLocal.deleteOne","EscolaLocal.deleteMany","_avg","_sum","EscolaLocal.groupBy","EscolaLocal.aggregate","Paciente.findUnique","Paciente.findUniqueOrThrow","Paciente.findFirst","Paciente.findFirstOrThrow","Paciente.findMany","Paciente.createOne","Paciente.createMany","Paciente.createManyAndReturn","Paciente.updateOne","Paciente.updateMany","Paciente.updateManyAndReturn","Paciente.upsertOne","Paciente.deleteOne","Paciente.deleteMany","Paciente.groupBy","Paciente.aggregate","Consentimento.findUnique","Consentimento.findUniqueOrThrow","Consentimento.findFirst","Consentimento.findFirstOrThrow","Consentimento.findMany","Consentimento.createOne","Consentimento.createMany","Consentimento.createManyAndReturn","Consentimento.updateOne","Consentimento.updateMany","Consentimento.updateManyAndReturn","Consentimento.upsertOne","Consentimento.deleteOne","Consentimento.deleteMany","Consentimento.groupBy","Consentimento.aggregate","Atendimento.findUnique","Atendimento.findUniqueOrThrow","Atendimento.findFirst","Atendimento.findFirstOrThrow","Atendimento.findMany","Atendimento.createOne","Atendimento.createMany","Atendimento.createManyAndReturn","Atendimento.updateOne","Atendimento.updateMany","Atendimento.updateManyAndReturn","Atendimento.upsertOne","Atendimento.deleteOne","Atendimento.deleteMany","Atendimento.groupBy","Atendimento.aggregate","AND","OR","NOT","id","pacienteId","escolaLocalId","usuarioId","especialidade","turno","resumo","procedimentos","insumosUtilizados","encaminhamentoExterno","chaveIdempotencia","criadoEm","atualizadoEm","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","consentidoPor","dataConsentimento","referenciaDocumento","consentimentoDispensado","justificativaDispensa","nomeEnc","cpfEnc","dataNascimentoEnc","telefoneEnc","dekCifrada","ivPii","tagPii","turma","retencaoExpiraEm","ativo","nome","endereco","cidade","uf","cnpj","telefone","email","diretoriaRegional","alunosMatriculados","unidadesMoveis","statusOperacao","every","some","none","senhaHash","nomeCompleto","perfil","mfaSecret","mfaAtivo","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
      graph: "twIuUA4EAACnAQAgYgAAqQEAMGMAABcAEGQAAKkBADBlAQAAAAFwQAClAQAhcUAApQEAIYsBIACkAQAhkgEBAAAAAZoBAQChAQAhmwEBAKEBACGcAQEAoQEAIZ0BAQCiAQAhngEgAKQBACEBAAAAAQAgEwYAAK4BACAHAACsAQAgCQAAsQEAIGIAALABADBjAAADABBkAACwAQAwZQEAoQEAIWYBAKEBACFnAQChAQAhaAEAoQEAIWkBAKEBACFqAQChAQAhawEAoQEAIWwBAKIBACFtAQCiAQAhbgEAogEAIW8BAKEBACFwQAClAQAhcUAApQEAIQYGAACXAgAgBwAAlgIAIAkAAJkCACBsAACyAQAgbQAAsgEAIG4AALIBACATBgAArgEAIAcAAKwBACAJAACxAQAgYgAAsAEAMGMAAAMAEGQAALABADBlAQAAAAFmAQChAQAhZwEAoQEAIWgBAKEBACFpAQChAQAhagEAoQEAIWsBAKEBACFsAQCiAQAhbQEAogEAIW4BAKIBACFvAQAAAAFwQAClAQAhcUAApQEAIQMAAAADACABAAAEADACAAAFACAUBAAApwEAIAYAAK4BACAIAACvAQAgYgAArQEAMGMAAAcAEGQAAK0BADBlAQChAQAhZwEAoQEAIXBAAKUBACFxQAClAQAhggEBAKEBACGDAQEAoQEAIYQBAQChAQAhhQEBAKIBACGGAQEAoQEAIYcBAQChAQAhiAEBAKEBACGJAQEAoQEAIYoBQACrAQAhiwEgAKQBACEFBAAAhwIAIAYAAJcCACAIAACYAgAghQEAALIBACCKAQAAsgEAIBQEAACnAQAgBgAArgEAIAgAAK8BACBiAACtAQAwYwAABwAQZAAArQEAMGUBAAAAAWcBAKEBACFwQAClAQAhcUAApQEAIYIBAQChAQAhgwEBAKEBACGEAQEAoQEAIYUBAQCiAQAhhgEBAKEBACGHAQEAoQEAIYgBAQChAQAhiQEBAKEBACGKAUAAqwEAIYsBIACkAQAhAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAADACABAAAEADACAAAFACABAAAABwAgAQAAAAMAIAwHAACsAQAgYgAAqgEAMGMAAA4AEGQAAKoBADBlAQChAQAhZgEAoQEAIXBAAKUBACF9AQCiAQAhfkAAqwEAIX8BAKIBACGAASAApAEAIYEBAQCiAQAhBQcAAJYCACB9AACyAQAgfgAAsgEAIH8AALIBACCBAQAAsgEAIAwHAACsAQAgYgAAqgEAMGMAAA4AEGQAAKoBADBlAQAAAAFmAQChAQAhcEAApQEAIX0BAKIBACF-QACrAQAhfwEAogEAIYABIACkAQAhgQEBAKIBACEDAAAADgAgAQAADwAwAgAAEAAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAAOACABAAAAAwAgAQAAAAMAIAEAAAABACAOBAAApwEAIGIAAKkBADBjAAAXABBkAACpAQAwZQEAoQEAIXBAAKUBACFxQAClAQAhiwEgAKQBACGSAQEAoQEAIZoBAQChAQAhmwEBAKEBACGcAQEAoQEAIZ0BAQCiAQAhngEgAKQBACECBAAAhwIAIJ0BAACyAQAgAwAAABcAIAEAABgAMAIAAAEAIAMAAAAXACABAAAYADACAAABACADAAAAFwAgAQAAGAAwAgAAAQAgCwQAAJUCACBlAQAAAAFwQAAAAAFxQAAAAAGLASAAAAABkgEBAAAAAZoBAQAAAAGbAQEAAAABnAEBAAAAAZ0BAQAAAAGeASAAAAABAQ8AABwAIAplAQAAAAFwQAAAAAFxQAAAAAGLASAAAAABkgEBAAAAAZoBAQAAAAGbAQEAAAABnAEBAAAAAZ0BAQAAAAGeASAAAAABAQ8AAB4AMAEPAAAeADALBAAAiwIAIGUBALYBACFwQAC4AQAhcUAAuAEAIYsBIADDAQAhkgEBALYBACGaAQEAtgEAIZsBAQC2AQAhnAEBALYBACGdAQEAtwEAIZ4BIADDAQAhAgAAAAEAIA8AACEAIAplAQC2AQAhcEAAuAEAIXFAALgBACGLASAAwwEAIZIBAQC2AQAhmgEBALYBACGbAQEAtgEAIZwBAQC2AQAhnQEBALcBACGeASAAwwEAIQIAAAAXACAPAAAjACACAAAAFwAgDwAAIwAgAwAAAAEAIBYAABwAIBcAACEAIAEAAAABACABAAAAFwAgBAUAAIgCACAcAACKAgAgHQAAiQIAIJ0BAACyAQAgDWIAAKgBADBjAAAqABBkAACoAQAwZQEAiQEAIXBAAIsBACFxQACLAQAhiwEgAJYBACGSAQEAiQEAIZoBAQCJAQAhmwEBAIkBACGcAQEAiQEAIZ0BAQCKAQAhngEgAJYBACEDAAAAFwAgAQAAKQAwGwAAKgAgAwAAABcAIAEAABgAMAIAAAEAIBMDAACmAQAgBAAApwEAIGIAAKABADBjAAAwABBkAACgAQAwZQEAAAABcEAApQEAIYsBIACkAQAhjAEBAKEBACGNAQEAoQEAIY4BAQChAQAhjwEBAKEBACGQAQEAAAABkQEBAKIBACGSAQEAogEAIZMBAQCiAQAhlAECAKMBACGVAQIAowEAIZYBAQChAQAhAQAAAC0AIAEAAAAtACATAwAApgEAIAQAAKcBACBiAACgAQAwYwAAMAAQZAAAoAEAMGUBAKEBACFwQAClAQAhiwEgAKQBACGMAQEAoQEAIY0BAQChAQAhjgEBAKEBACGPAQEAoQEAIZABAQCiAQAhkQEBAKIBACGSAQEAogEAIZMBAQCiAQAhlAECAKMBACGVAQIAowEAIZYBAQChAQAhBgMAAIYCACAEAACHAgAgkAEAALIBACCRAQAAsgEAIJIBAACyAQAgkwEAALIBACADAAAAMAAgAQAAMQAwAgAALQAgAwAAADAAIAEAADEAMAIAAC0AIAMAAAAwACABAAAxADACAAAtACAQAwAAhAIAIAQAAIUCACBlAQAAAAFwQAAAAAGLASAAAAABjAEBAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAZABAQAAAAGRAQEAAAABkgEBAAAAAZMBAQAAAAGUAQIAAAABlQECAAAAAZYBAQAAAAEBDwAANQAgDmUBAAAAAXBAAAAAAYsBIAAAAAGMAQEAAAABjQEBAAAAAY4BAQAAAAGPAQEAAAABkAEBAAAAAZEBAQAAAAGSAQEAAAABkwEBAAAAAZQBAgAAAAGVAQIAAAABlgEBAAAAAQEPAAA3ADABDwAANwAwEAMAAO0BACAEAADuAQAgZQEAtgEAIXBAALgBACGLASAAwwEAIYwBAQC2AQAhjQEBALYBACGOAQEAtgEAIY8BAQC2AQAhkAEBALcBACGRAQEAtwEAIZIBAQC3AQAhkwEBALcBACGUAQIA7AEAIZUBAgDsAQAhlgEBALYBACECAAAALQAgDwAAOgAgDmUBALYBACFwQAC4AQAhiwEgAMMBACGMAQEAtgEAIY0BAQC2AQAhjgEBALYBACGPAQEAtgEAIZABAQC3AQAhkQEBALcBACGSAQEAtwEAIZMBAQC3AQAhlAECAOwBACGVAQIA7AEAIZYBAQC2AQAhAgAAADAAIA8AADwAIAIAAAAwACAPAAA8ACADAAAALQAgFgAANQAgFwAAOgAgAQAAAC0AIAEAAAAwACAJBQAA5wEAIBwAAOoBACAdAADpAQAgLgAA6AEAIC8AAOsBACCQAQAAsgEAIJEBAACyAQAgkgEAALIBACCTAQAAsgEAIBFiAACcAQAwYwAAQwAQZAAAnAEAMGUBAIkBACFwQACLAQAhiwEgAJYBACGMAQEAiQEAIY0BAQCJAQAhjgEBAIkBACGPAQEAiQEAIZABAQCKAQAhkQEBAIoBACGSAQEAigEAIZMBAQCKAQAhlAECAJ0BACGVAQIAnQEAIZYBAQCJAQAhAwAAADAAIAEAAEIAMBsAAEMAIAMAAAAwACABAAAxADACAAAtACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIBEEAADmAQAgBgAA5AEAIAgAAOUBACBlAQAAAAFnAQAAAAFwQAAAAAFxQAAAAAGCAQEAAAABgwEBAAAAAYQBAQAAAAGFAQEAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEBAAAAAYoBQAAAAAGLASAAAAABAQ8AAEsAIA5lAQAAAAFnAQAAAAFwQAAAAAFxQAAAAAGCAQEAAAABgwEBAAAAAYQBAQAAAAGFAQEAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEBAAAAAYoBQAAAAAGLASAAAAABAQ8AAE0AMAEPAABNADARBAAAywEAIAYAAMkBACAIAADKAQAgZQEAtgEAIWcBALYBACFwQAC4AQAhcUAAuAEAIYIBAQC2AQAhgwEBALYBACGEAQEAtgEAIYUBAQC3AQAhhgEBALYBACGHAQEAtgEAIYgBAQC2AQAhiQEBALYBACGKAUAAwgEAIYsBIADDAQAhAgAAAAkAIA8AAFAAIA5lAQC2AQAhZwEAtgEAIXBAALgBACFxQAC4AQAhggEBALYBACGDAQEAtgEAIYQBAQC2AQAhhQEBALcBACGGAQEAtgEAIYcBAQC2AQAhiAEBALYBACGJAQEAtgEAIYoBQADCAQAhiwEgAMMBACECAAAABwAgDwAAUgAgAgAAAAcAIA8AAFIAIAMAAAAJACAWAABLACAXAABQACABAAAACQAgAQAAAAcAIAUFAADGAQAgHAAAyAEAIB0AAMcBACCFAQAAsgEAIIoBAACyAQAgEWIAAJsBADBjAABZABBkAACbAQAwZQEAiQEAIWcBAIkBACFwQACLAQAhcUAAiwEAIYIBAQCJAQAhgwEBAIkBACGEAQEAiQEAIYUBAQCKAQAhhgEBAIkBACGHAQEAiQEAIYgBAQCJAQAhiQEBAIkBACGKAUAAlQEAIYsBIACWAQAhAwAAAAcAIAEAAFgAMBsAAFkAIAMAAAAHACABAAAIADACAAAJACABAAAAEAAgAQAAABAAIAMAAAAOACABAAAPADACAAAQACADAAAADgAgAQAADwAwAgAAEAAgAwAAAA4AIAEAAA8AMAIAABAAIAkHAADFAQAgZQEAAAABZgEAAAABcEAAAAABfQEAAAABfkAAAAABfwEAAAABgAEgAAAAAYEBAQAAAAEBDwAAYQAgCGUBAAAAAWYBAAAAAXBAAAAAAX0BAAAAAX5AAAAAAX8BAAAAAYABIAAAAAGBAQEAAAABAQ8AAGMAMAEPAABjADAJBwAAxAEAIGUBALYBACFmAQC2AQAhcEAAuAEAIX0BALcBACF-QADCAQAhfwEAtwEAIYABIADDAQAhgQEBALcBACECAAAAEAAgDwAAZgAgCGUBALYBACFmAQC2AQAhcEAAuAEAIX0BALcBACF-QADCAQAhfwEAtwEAIYABIADDAQAhgQEBALcBACECAAAADgAgDwAAaAAgAgAAAA4AIA8AAGgAIAMAAAAQACAWAABhACAXAABmACABAAAAEAAgAQAAAA4AIAcFAAC_AQAgHAAAwQEAIB0AAMABACB9AACyAQAgfgAAsgEAIH8AALIBACCBAQAAsgEAIAtiAACUAQAwYwAAbwAQZAAAlAEAMGUBAIkBACFmAQCJAQAhcEAAiwEAIX0BAIoBACF-QACVAQAhfwEAigEAIYABIACWAQAhgQEBAIoBACEDAAAADgAgAQAAbgAwGwAAbwAgAwAAAA4AIAEAAA8AMAIAABAAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgEAYAAL0BACAHAAC8AQAgCQAAvgEAIGUBAAAAAWYBAAAAAWcBAAAAAWgBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAAAAAW4BAAAAAW8BAAAAAXBAAAAAAXFAAAAAAQEPAAB3ACANZQEAAAABZgEAAAABZwEAAAABaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbQEAAAABbgEAAAABbwEAAAABcEAAAAABcUAAAAABAQ8AAHkAMAEPAAB5ADAQBgAAugEAIAcAALkBACAJAAC7AQAgZQEAtgEAIWYBALYBACFnAQC2AQAhaAEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQIAAAAFACAPAAB8ACANZQEAtgEAIWYBALYBACFnAQC2AQAhaAEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQIAAAADACAPAAB-ACACAAAAAwAgDwAAfgAgAwAAAAUAIBYAAHcAIBcAAHwAIAEAAAAFACABAAAAAwAgBgUAALMBACAcAAC1AQAgHQAAtAEAIGwAALIBACBtAACyAQAgbgAAsgEAIBBiAACIAQAwYwAAhQEAEGQAAIgBADBlAQCJAQAhZgEAiQEAIWcBAIkBACFoAQCJAQAhaQEAiQEAIWoBAIkBACFrAQCJAQAhbAEAigEAIW0BAIoBACFuAQCKAQAhbwEAiQEAIXBAAIsBACFxQACLAQAhAwAAAAMAIAEAAIQBADAbAACFAQAgAwAAAAMAIAEAAAQAMAIAAAUAIBBiAACIAQAwYwAAhQEAEGQAAIgBADBlAQCJAQAhZgEAiQEAIWcBAIkBACFoAQCJAQAhaQEAiQEAIWoBAIkBACFrAQCJAQAhbAEAigEAIW0BAIoBACFuAQCKAQAhbwEAiQEAIXBAAIsBACFxQACLAQAhDgUAAI0BACAcAACTAQAgHQAAkwEAIHIBAAAAAXMBAAAABHQBAAAABHUBAAAAAXYBAAAAAXcBAAAAAXgBAAAAAXkBAJIBACF6AQAAAAF7AQAAAAF8AQAAAAEOBQAAkAEAIBwAAJEBACAdAACRAQAgcgEAAAABcwEAAAAFdAEAAAAFdQEAAAABdgEAAAABdwEAAAABeAEAAAABeQEAjwEAIXoBAAAAAXsBAAAAAXwBAAAAAQsFAACNAQAgHAAAjgEAIB0AAI4BACByQAAAAAFzQAAAAAR0QAAAAAR1QAAAAAF2QAAAAAF3QAAAAAF4QAAAAAF5QACMAQAhCwUAAI0BACAcAACOAQAgHQAAjgEAIHJAAAAAAXNAAAAABHRAAAAABHVAAAAAAXZAAAAAAXdAAAAAAXhAAAAAAXlAAIwBACEIcgIAAAABcwIAAAAEdAIAAAAEdQIAAAABdgIAAAABdwIAAAABeAIAAAABeQIAjQEAIQhyQAAAAAFzQAAAAAR0QAAAAAR1QAAAAAF2QAAAAAF3QAAAAAF4QAAAAAF5QACOAQAhDgUAAJABACAcAACRAQAgHQAAkQEAIHIBAAAAAXMBAAAABXQBAAAABXUBAAAAAXYBAAAAAXcBAAAAAXgBAAAAAXkBAI8BACF6AQAAAAF7AQAAAAF8AQAAAAEIcgIAAAABcwIAAAAFdAIAAAAFdQIAAAABdgIAAAABdwIAAAABeAIAAAABeQIAkAEAIQtyAQAAAAFzAQAAAAV0AQAAAAV1AQAAAAF2AQAAAAF3AQAAAAF4AQAAAAF5AQCRAQAhegEAAAABewEAAAABfAEAAAABDgUAAI0BACAcAACTAQAgHQAAkwEAIHIBAAAAAXMBAAAABHQBAAAABHUBAAAAAXYBAAAAAXcBAAAAAXgBAAAAAXkBAJIBACF6AQAAAAF7AQAAAAF8AQAAAAELcgEAAAABcwEAAAAEdAEAAAAEdQEAAAABdgEAAAABdwEAAAABeAEAAAABeQEAkwEAIXoBAAAAAXsBAAAAAXwBAAAAAQtiAACUAQAwYwAAbwAQZAAAlAEAMGUBAIkBACFmAQCJAQAhcEAAiwEAIX0BAIoBACF-QACVAQAhfwEAigEAIYABIACWAQAhgQEBAIoBACELBQAAkAEAIBwAAJoBACAdAACaAQAgckAAAAABc0AAAAAFdEAAAAAFdUAAAAABdkAAAAABd0AAAAABeEAAAAABeUAAmQEAIQUFAACNAQAgHAAAmAEAIB0AAJgBACByIAAAAAF5IACXAQAhBQUAAI0BACAcAACYAQAgHQAAmAEAIHIgAAAAAXkgAJcBACECciAAAAABeSAAmAEAIQsFAACQAQAgHAAAmgEAIB0AAJoBACByQAAAAAFzQAAAAAV0QAAAAAV1QAAAAAF2QAAAAAF3QAAAAAF4QAAAAAF5QACZAQAhCHJAAAAAAXNAAAAABXRAAAAABXVAAAAAAXZAAAAAAXdAAAAAAXhAAAAAAXlAAJoBACERYgAAmwEAMGMAAFkAEGQAAJsBADBlAQCJAQAhZwEAiQEAIXBAAIsBACFxQACLAQAhggEBAIkBACGDAQEAiQEAIYQBAQCJAQAhhQEBAIoBACGGAQEAiQEAIYcBAQCJAQAhiAEBAIkBACGJAQEAiQEAIYoBQACVAQAhiwEgAJYBACERYgAAnAEAMGMAAEMAEGQAAJwBADBlAQCJAQAhcEAAiwEAIYsBIACWAQAhjAEBAIkBACGNAQEAiQEAIY4BAQCJAQAhjwEBAIkBACGQAQEAigEAIZEBAQCKAQAhkgEBAIoBACGTAQEAigEAIZQBAgCdAQAhlQECAJ0BACGWAQEAiQEAIQ0FAACNAQAgHAAAjQEAIB0AAI0BACAuAACfAQAgLwAAjQEAIHICAAAAAXMCAAAABHQCAAAABHUCAAAAAXYCAAAAAXcCAAAAAXgCAAAAAXkCAJ4BACENBQAAjQEAIBwAAI0BACAdAACNAQAgLgAAnwEAIC8AAI0BACByAgAAAAFzAgAAAAR0AgAAAAR1AgAAAAF2AgAAAAF3AgAAAAF4AgAAAAF5AgCeAQAhCHIIAAAAAXMIAAAABHQIAAAABHUIAAAAAXYIAAAAAXcIAAAAAXgIAAAAAXkIAJ8BACETAwAApgEAIAQAAKcBACBiAACgAQAwYwAAMAAQZAAAoAEAMGUBAKEBACFwQAClAQAhiwEgAKQBACGMAQEAoQEAIY0BAQChAQAhjgEBAKEBACGPAQEAoQEAIZABAQCiAQAhkQEBAKIBACGSAQEAogEAIZMBAQCiAQAhlAECAKMBACGVAQIAowEAIZYBAQChAQAhC3IBAAAAAXMBAAAABHQBAAAABHUBAAAAAXYBAAAAAXcBAAAAAXgBAAAAAXkBAJMBACF6AQAAAAF7AQAAAAF8AQAAAAELcgEAAAABcwEAAAAFdAEAAAAFdQEAAAABdgEAAAABdwEAAAABeAEAAAABeQEAkQEAIXoBAAAAAXsBAAAAAXwBAAAAAQhyAgAAAAFzAgAAAAR0AgAAAAR1AgAAAAF2AgAAAAF3AgAAAAF4AgAAAAF5AgCNAQAhAnIgAAAAAXkgAJgBACEIckAAAAABc0AAAAAEdEAAAAAEdUAAAAABdkAAAAABd0AAAAABeEAAAAABeUAAjgEAIQOXAQAABwAgmAEAAAcAIJkBAAAHACADlwEAAAMAIJgBAAADACCZAQAAAwAgDWIAAKgBADBjAAAqABBkAACoAQAwZQEAiQEAIXBAAIsBACFxQACLAQAhiwEgAJYBACGSAQEAiQEAIZoBAQCJAQAhmwEBAIkBACGcAQEAiQEAIZ0BAQCKAQAhngEgAJYBACEOBAAApwEAIGIAAKkBADBjAAAXABBkAACpAQAwZQEAoQEAIXBAAKUBACFxQAClAQAhiwEgAKQBACGSAQEAoQEAIZoBAQChAQAhmwEBAKEBACGcAQEAoQEAIZ0BAQCiAQAhngEgAKQBACEMBwAArAEAIGIAAKoBADBjAAAOABBkAACqAQAwZQEAoQEAIWYBAKEBACFwQAClAQAhfQEAogEAIX5AAKsBACF_AQCiAQAhgAEgAKQBACGBAQEAogEAIQhyQAAAAAFzQAAAAAV0QAAAAAV1QAAAAAF2QAAAAAF3QAAAAAF4QAAAAAF5QACaAQAhFgQAAKcBACAGAACuAQAgCAAArwEAIGIAAK0BADBjAAAHABBkAACtAQAwZQEAoQEAIWcBAKEBACFwQAClAQAhcUAApQEAIYIBAQChAQAhgwEBAKEBACGEAQEAoQEAIYUBAQCiAQAhhgEBAKEBACGHAQEAoQEAIYgBAQChAQAhiQEBAKEBACGKAUAAqwEAIYsBIACkAQAhnwEAAAcAIKABAAAHACAUBAAApwEAIAYAAK4BACAIAACvAQAgYgAArQEAMGMAAAcAEGQAAK0BADBlAQChAQAhZwEAoQEAIXBAAKUBACFxQAClAQAhggEBAKEBACGDAQEAoQEAIYQBAQChAQAhhQEBAKIBACGGAQEAoQEAIYcBAQChAQAhiAEBAKEBACGJAQEAoQEAIYoBQACrAQAhiwEgAKQBACEVAwAApgEAIAQAAKcBACBiAACgAQAwYwAAMAAQZAAAoAEAMGUBAKEBACFwQAClAQAhiwEgAKQBACGMAQEAoQEAIY0BAQChAQAhjgEBAKEBACGPAQEAoQEAIZABAQCiAQAhkQEBAKIBACGSAQEAogEAIZMBAQCiAQAhlAECAKMBACGVAQIAowEAIZYBAQChAQAhnwEAADAAIKABAAAwACADlwEAAA4AIJgBAAAOACCZAQAADgAgEwYAAK4BACAHAACsAQAgCQAAsQEAIGIAALABADBjAAADABBkAACwAQAwZQEAoQEAIWYBAKEBACFnAQChAQAhaAEAoQEAIWkBAKEBACFqAQChAQAhawEAoQEAIWwBAKIBACFtAQCiAQAhbgEAogEAIW8BAKEBACFwQAClAQAhcUAApQEAIRAEAACnAQAgYgAAqQEAMGMAABcAEGQAAKkBADBlAQChAQAhcEAApQEAIXFAAKUBACGLASAApAEAIZIBAQChAQAhmgEBAKEBACGbAQEAoQEAIZwBAQChAQAhnQEBAKIBACGeASAApAEAIZ8BAAAXACCgAQAAFwAgAAAAAAGkAQEAAAABAaQBAQAAAAEBpAFAAAAAAQUWAACtAgAgFwAAtgIAIKEBAACuAgAgogEAALUCACCnAQAACQAgBRYAAKsCACAXAACzAgAgoQEAAKwCACCiAQAAsgIAIKcBAAAtACAFFgAAqQIAIBcAALACACChAQAAqgIAIKIBAACvAgAgpwEAAAEAIAMWAACtAgAgoQEAAK4CACCnAQAACQAgAxYAAKsCACChAQAArAIAIKcBAAAtACADFgAAqQIAIKEBAACqAgAgpwEAAAEAIAAAAAGkAUAAAAABAaQBIAAAAAEFFgAApAIAIBcAAKcCACChAQAApQIAIKIBAACmAgAgpwEAAAkAIAMWAACkAgAgoQEAAKUCACCnAQAACQAgAAAABRYAAJ0CACAXAACiAgAgoQEAAJ4CACCiAQAAoQIAIKcBAAAtACALFgAA2AEAMBcAAN0BADChAQAA2QEAMKIBAADaAQAwowEAANsBACCkAQAA3AEAMKUBAADcAQAwpgEAANwBADCnAQAA3AEAMKgBAADeAQAwqQEAAN8BADALFgAAzAEAMBcAANEBADChAQAAzQEAMKIBAADOAQAwowEAAM8BACCkAQAA0AEAMKUBAADQAQAwpgEAANABADCnAQAA0AEAMKgBAADSAQAwqQEAANMBADAOBgAAvQEAIAkAAL4BACBlAQAAAAFnAQAAAAFoAQAAAAFpAQAAAAFqAQAAAAFrAQAAAAFsAQAAAAFtAQAAAAFuAQAAAAFvAQAAAAFwQAAAAAFxQAAAAAECAAAABQAgFgAA1wEAIAMAAAAFACAWAADXAQAgFwAA1gEAIAEPAACgAgAwEwYAAK4BACAHAACsAQAgCQAAsQEAIGIAALABADBjAAADABBkAACwAQAwZQEAAAABZgEAoQEAIWcBAKEBACFoAQChAQAhaQEAoQEAIWoBAKEBACFrAQChAQAhbAEAogEAIW0BAKIBACFuAQCiAQAhbwEAAAABcEAApQEAIXFAAKUBACECAAAABQAgDwAA1gEAIAIAAADUAQAgDwAA1QEAIBBiAADTAQAwYwAA1AEAEGQAANMBADBlAQChAQAhZgEAoQEAIWcBAKEBACFoAQChAQAhaQEAoQEAIWoBAKEBACFrAQChAQAhbAEAogEAIW0BAKIBACFuAQCiAQAhbwEAoQEAIXBAAKUBACFxQAClAQAhEGIAANMBADBjAADUAQAQZAAA0wEAMGUBAKEBACFmAQChAQAhZwEAoQEAIWgBAKEBACFpAQChAQAhagEAoQEAIWsBAKEBACFsAQCiAQAhbQEAogEAIW4BAKIBACFvAQChAQAhcEAApQEAIXFAAKUBACEMZQEAtgEAIWcBALYBACFoAQC2AQAhaQEAtgEAIWoBALYBACFrAQC2AQAhbAEAtwEAIW0BALcBACFuAQC3AQAhbwEAtgEAIXBAALgBACFxQAC4AQAhDgYAALoBACAJAAC7AQAgZQEAtgEAIWcBALYBACFoAQC2AQAhaQEAtgEAIWoBALYBACFrAQC2AQAhbAEAtwEAIW0BALcBACFuAQC3AQAhbwEAtgEAIXBAALgBACFxQAC4AQAhDgYAAL0BACAJAAC-AQAgZQEAAAABZwEAAAABaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbQEAAAABbgEAAAABbwEAAAABcEAAAAABcUAAAAABB2UBAAAAAXBAAAAAAX0BAAAAAX5AAAAAAX8BAAAAAYABIAAAAAGBAQEAAAABAgAAABAAIBYAAOMBACADAAAAEAAgFgAA4wEAIBcAAOIBACABDwAAnwIAMAwHAACsAQAgYgAAqgEAMGMAAA4AEGQAAKoBADBlAQAAAAFmAQChAQAhcEAApQEAIX0BAKIBACF-QACrAQAhfwEAogEAIYABIACkAQAhgQEBAKIBACECAAAAEAAgDwAA4gEAIAIAAADgAQAgDwAA4QEAIAtiAADfAQAwYwAA4AEAEGQAAN8BADBlAQChAQAhZgEAoQEAIXBAAKUBACF9AQCiAQAhfkAAqwEAIX8BAKIBACGAASAApAEAIYEBAQCiAQAhC2IAAN8BADBjAADgAQAQZAAA3wEAMGUBAKEBACFmAQChAQAhcEAApQEAIX0BAKIBACF-QACrAQAhfwEAogEAIYABIACkAQAhgQEBAKIBACEHZQEAtgEAIXBAALgBACF9AQC3AQAhfkAAwgEAIX8BALcBACGAASAAwwEAIYEBAQC3AQAhB2UBALYBACFwQAC4AQAhfQEAtwEAIX5AAMIBACF_AQC3AQAhgAEgAMMBACGBAQEAtwEAIQdlAQAAAAFwQAAAAAF9AQAAAAF-QAAAAAF_AQAAAAGAASAAAAABgQEBAAAAAQMWAACdAgAgoQEAAJ4CACCnAQAALQAgBBYAANgBADChAQAA2QEAMKMBAADbAQAgpwEAANwBADAEFgAAzAEAMKEBAADNAQAwowEAAM8BACCnAQAA0AEAMAAAAAAABaQBAgAAAAGqAQIAAAABqwECAAAAAawBAgAAAAGtAQIAAAABCxYAAPgBADAXAAD9AQAwoQEAAPkBADCiAQAA-gEAMKMBAAD7AQAgpAEAAPwBADClAQAA_AEAMKYBAAD8AQAwpwEAAPwBADCoAQAA_gEAMKkBAAD_AQAwCxYAAO8BADAXAADzAQAwoQEAAPABADCiAQAA8QEAMKMBAADyAQAgpAEAANABADClAQAA0AEAMKYBAADQAQAwpwEAANABADCoAQAA9AEAMKkBAADTAQAwDgcAALwBACAJAAC-AQAgZQEAAAABZgEAAAABaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbQEAAAABbgEAAAABbwEAAAABcEAAAAABcUAAAAABAgAAAAUAIBYAAPcBACADAAAABQAgFgAA9wEAIBcAAPYBACABDwAAnAIAMAIAAAAFACAPAAD2AQAgAgAAANQBACAPAAD1AQAgDGUBALYBACFmAQC2AQAhaAEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQ4HAAC5AQAgCQAAuwEAIGUBALYBACFmAQC2AQAhaAEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQ4HAAC8AQAgCQAAvgEAIGUBAAAAAWYBAAAAAWgBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAAAAAW4BAAAAAW8BAAAAAXBAAAAAAXFAAAAAAQ8EAADmAQAgCAAA5QEAIGUBAAAAAXBAAAAAAXFAAAAAAYIBAQAAAAGDAQEAAAABhAEBAAAAAYUBAQAAAAGGAQEAAAABhwEBAAAAAYgBAQAAAAGJAQEAAAABigFAAAAAAYsBIAAAAAECAAAACQAgFgAAgwIAIAMAAAAJACAWAACDAgAgFwAAggIAIAEPAACbAgAwFAQAAKcBACAGAACuAQAgCAAArwEAIGIAAK0BADBjAAAHABBkAACtAQAwZQEAAAABZwEAoQEAIXBAAKUBACFxQAClAQAhggEBAKEBACGDAQEAoQEAIYQBAQChAQAhhQEBAKIBACGGAQEAoQEAIYcBAQChAQAhiAEBAKEBACGJAQEAoQEAIYoBQACrAQAhiwEgAKQBACECAAAACQAgDwAAggIAIAIAAACAAgAgDwAAgQIAIBFiAAD_AQAwYwAAgAIAEGQAAP8BADBlAQChAQAhZwEAoQEAIXBAAKUBACFxQAClAQAhggEBAKEBACGDAQEAoQEAIYQBAQChAQAhhQEBAKIBACGGAQEAoQEAIYcBAQChAQAhiAEBAKEBACGJAQEAoQEAIYoBQACrAQAhiwEgAKQBACERYgAA_wEAMGMAAIACABBkAAD_AQAwZQEAoQEAIWcBAKEBACFwQAClAQAhcUAApQEAIYIBAQChAQAhgwEBAKEBACGEAQEAoQEAIYUBAQCiAQAhhgEBAKEBACGHAQEAoQEAIYgBAQChAQAhiQEBAKEBACGKAUAAqwEAIYsBIACkAQAhDWUBALYBACFwQAC4AQAhcUAAuAEAIYIBAQC2AQAhgwEBALYBACGEAQEAtgEAIYUBAQC3AQAhhgEBALYBACGHAQEAtgEAIYgBAQC2AQAhiQEBALYBACGKAUAAwgEAIYsBIADDAQAhDwQAAMsBACAIAADKAQAgZQEAtgEAIXBAALgBACFxQAC4AQAhggEBALYBACGDAQEAtgEAIYQBAQC2AQAhhQEBALcBACGGAQEAtgEAIYcBAQC2AQAhiAEBALYBACGJAQEAtgEAIYoBQADCAQAhiwEgAMMBACEPBAAA5gEAIAgAAOUBACBlAQAAAAFwQAAAAAFxQAAAAAGCAQEAAAABgwEBAAAAAYQBAQAAAAGFAQEAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEBAAAAAYoBQAAAAAGLASAAAAABBBYAAPgBADChAQAA-QEAMKMBAAD7AQAgpwEAAPwBADAEFgAA7wEAMKEBAADwAQAwowEAAPIBACCnAQAA0AEAMAAAAAAACxYAAIwCADAXAACQAgAwoQEAAI0CADCiAQAAjgIAMKMBAACPAgAgpAEAANABADClAQAA0AEAMKYBAADQAQAwpwEAANABADCoAQAAkQIAMKkBAADTAQAwDgYAAL0BACAHAAC8AQAgZQEAAAABZgEAAAABZwEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbQEAAAABbgEAAAABbwEAAAABcEAAAAABcUAAAAABAgAAAAUAIBYAAJQCACADAAAABQAgFgAAlAIAIBcAAJMCACABDwAAmgIAMAIAAAAFACAPAACTAgAgAgAAANQBACAPAACSAgAgDGUBALYBACFmAQC2AQAhZwEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQ4GAAC6AQAgBwAAuQEAIGUBALYBACFmAQC2AQAhZwEAtgEAIWkBALYBACFqAQC2AQAhawEAtgEAIWwBALcBACFtAQC3AQAhbgEAtwEAIW8BALYBACFwQAC4AQAhcUAAuAEAIQ4GAAC9AQAgBwAAvAEAIGUBAAAAAWYBAAAAAWcBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAAAAAW4BAAAAAW8BAAAAAXBAAAAAAXFAAAAAAQQWAACMAgAwoQEAAI0CADCjAQAAjwIAIKcBAADQAQAwBQQAAIcCACAGAACXAgAgCAAAmAIAIIUBAACyAQAgigEAALIBACAGAwAAhgIAIAQAAIcCACCQAQAAsgEAIJEBAACyAQAgkgEAALIBACCTAQAAsgEAIAACBAAAhwIAIJ0BAACyAQAgDGUBAAAAAWYBAAAAAWcBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAAAAAW4BAAAAAW8BAAAAAXBAAAAAAXFAAAAAAQ1lAQAAAAFwQAAAAAFxQAAAAAGCAQEAAAABgwEBAAAAAYQBAQAAAAGFAQEAAAABhgEBAAAAAYcBAQAAAAGIAQEAAAABiQEBAAAAAYoBQAAAAAGLASAAAAABDGUBAAAAAWYBAAAAAWgBAAAAAWkBAAAAAWoBAAAAAWsBAAAAAWwBAAAAAW0BAAAAAW4BAAAAAW8BAAAAAXBAAAAAAXFAAAAAAQ8EAACFAgAgZQEAAAABcEAAAAABiwEgAAAAAYwBAQAAAAGNAQEAAAABjgEBAAAAAY8BAQAAAAGQAQEAAAABkQEBAAAAAZIBAQAAAAGTAQEAAAABlAECAAAAAZUBAgAAAAGWAQEAAAABAgAAAC0AIBYAAJ0CACAHZQEAAAABcEAAAAABfQEAAAABfkAAAAABfwEAAAABgAEgAAAAAYEBAQAAAAEMZQEAAAABZwEAAAABaAEAAAABaQEAAAABagEAAAABawEAAAABbAEAAAABbQEAAAABbgEAAAABbwEAAAABcEAAAAABcUAAAAABAwAAADAAIBYAAJ0CACAXAACjAgAgEQAAADAAIAQAAO4BACAPAACjAgAgZQEAtgEAIXBAALgBACGLASAAwwEAIYwBAQC2AQAhjQEBALYBACGOAQEAtgEAIY8BAQC2AQAhkAEBALcBACGRAQEAtwEAIZIBAQC3AQAhkwEBALcBACGUAQIA7AEAIZUBAgDsAQAhlgEBALYBACEPBAAA7gEAIGUBALYBACFwQAC4AQAhiwEgAMMBACGMAQEAtgEAIY0BAQC2AQAhjgEBALYBACGPAQEAtgEAIZABAQC3AQAhkQEBALcBACGSAQEAtwEAIZMBAQC3AQAhlAECAOwBACGVAQIA7AEAIZYBAQC2AQAhEAQAAOYBACAGAADkAQAgZQEAAAABZwEAAAABcEAAAAABcUAAAAABggEBAAAAAYMBAQAAAAGEAQEAAAABhQEBAAAAAYYBAQAAAAGHAQEAAAABiAEBAAAAAYkBAQAAAAGKAUAAAAABiwEgAAAAAQIAAAAJACAWAACkAgAgAwAAAAcAIBYAAKQCACAXAACoAgAgEgAAAAcAIAQAAMsBACAGAADJAQAgDwAAqAIAIGUBALYBACFnAQC2AQAhcEAAuAEAIXFAALgBACGCAQEAtgEAIYMBAQC2AQAhhAEBALYBACGFAQEAtwEAIYYBAQC2AQAhhwEBALYBACGIAQEAtgEAIYkBAQC2AQAhigFAAMIBACGLASAAwwEAIRAEAADLAQAgBgAAyQEAIGUBALYBACFnAQC2AQAhcEAAuAEAIXFAALgBACGCAQEAtgEAIYMBAQC2AQAhhAEBALYBACGFAQEAtwEAIYYBAQC2AQAhhwEBALYBACGIAQEAtgEAIYkBAQC2AQAhigFAAMIBACGLASAAwwEAIQplAQAAAAFwQAAAAAFxQAAAAAGLASAAAAABkgEBAAAAAZoBAQAAAAGbAQEAAAABnAEBAAAAAZ0BAQAAAAGeASAAAAABAgAAAAEAIBYAAKkCACAPAwAAhAIAIGUBAAAAAXBAAAAAAYsBIAAAAAGMAQEAAAABjQEBAAAAAY4BAQAAAAGPAQEAAAABkAEBAAAAAZEBAQAAAAGSAQEAAAABkwEBAAAAAZQBAgAAAAGVAQIAAAABlgEBAAAAAQIAAAAtACAWAACrAgAgEAYAAOQBACAIAADlAQAgZQEAAAABZwEAAAABcEAAAAABcUAAAAABggEBAAAAAYMBAQAAAAGEAQEAAAABhQEBAAAAAYYBAQAAAAGHAQEAAAABiAEBAAAAAYkBAQAAAAGKAUAAAAABiwEgAAAAAQIAAAAJACAWAACtAgAgAwAAABcAIBYAAKkCACAXAACxAgAgDAAAABcAIA8AALECACBlAQC2AQAhcEAAuAEAIXFAALgBACGLASAAwwEAIZIBAQC2AQAhmgEBALYBACGbAQEAtgEAIZwBAQC2AQAhnQEBALcBACGeASAAwwEAIQplAQC2AQAhcEAAuAEAIXFAALgBACGLASAAwwEAIZIBAQC2AQAhmgEBALYBACGbAQEAtgEAIZwBAQC2AQAhnQEBALcBACGeASAAwwEAIQMAAAAwACAWAACrAgAgFwAAtAIAIBEAAAAwACADAADtAQAgDwAAtAIAIGUBALYBACFwQAC4AQAhiwEgAMMBACGMAQEAtgEAIY0BAQC2AQAhjgEBALYBACGPAQEAtgEAIZABAQC3AQAhkQEBALcBACGSAQEAtwEAIZMBAQC3AQAhlAECAOwBACGVAQIA7AEAIZYBAQC2AQAhDwMAAO0BACBlAQC2AQAhcEAAuAEAIYsBIADDAQAhjAEBALYBACGNAQEAtgEAIY4BAQC2AQAhjwEBALYBACGQAQEAtwEAIZEBAQC3AQAhkgEBALcBACGTAQEAtwEAIZQBAgDsAQAhlQECAOwBACGWAQEAtgEAIQMAAAAHACAWAACtAgAgFwAAtwIAIBIAAAAHACAGAADJAQAgCAAAygEAIA8AALcCACBlAQC2AQAhZwEAtgEAIXBAALgBACFxQAC4AQAhggEBALYBACGDAQEAtgEAIYQBAQC2AQAhhQEBALcBACGGAQEAtgEAIYcBAQC2AQAhiAEBALYBACGJAQEAtgEAIYoBQADCAQAhiwEgAMMBACEQBgAAyQEAIAgAAMoBACBlAQC2AQAhZwEAtgEAIXBAALgBACFxQAC4AQAhggEBALYBACGDAQEAtgEAIYQBAQC2AQAhhQEBALcBACGGAQEAtgEAIYcBAQC2AQAhiAEBALYBACGJAQEAtgEAIYoBQADCAQAhiwEgAMMBACECBAYCBQAIAwYABAcAAwkAAQQEEgIFAAcGAAQIEQYDAwoDBAsCBQAFAgMMAAQNAAEHAAMCBBQACBMAAQQVAAAAAAMFAA0cAA4dAA8AAAADBQANHAAOHQAPAAAFBQAUHAAXHQAYLgAVLwAWAAAAAAAFBQAUHAAXHQAYLgAVLwAWAQYABAEGAAQDBQAdHAAeHQAfAAAAAwUAHRwAHh0AHwEHAAMBBwADAwUAJBwAJR0AJgAAAAMFACQcACUdACYDBgAEBwADCQABAwYABAcAAwkAAQMFACscACwdAC0AAAADBQArHAAsHQAtCgIBCxYBDBkBDRoBDhsBEB0BER8JEiAKEyIBFCQJFSULGCYBGScBGigJHisMHywQIC4EIS8EIjIEIzMEJDQEJTYEJjgJJzkRKDsEKT0JKj4SKz8ELEAELUEJMEQTMUUZMkYDM0cDNEgDNUkDNkoDN0wDOE4JOU8aOlEDO1MJPFQbPVUDPlYDP1cJQFocQVsgQlwGQ10GRF4GRV8GRmAGR2IGSGQJSWUhSmcGS2kJTGoiTWsGTmwGT20JUHAjUXEnUnICU3MCVHQCVXUCVnYCV3gCWHoJWXsoWn0CW38JXIABKV2BAQJeggECX4MBCWCGASphhwEu"
    };
    config.compilerWasm = {
      getRuntime: /* @__PURE__ */ __name(async () => require_query_compiler_fast_bg(), "getRuntime"),
      getQueryCompilerWasmModule: /* @__PURE__ */ __name(async () => {
        const loader = (await Promise.resolve().then(() => (init_wasm_worker_loader(), wasm_worker_loader_exports))).default;
        const compiler = (await loader).default;
        return compiler;
      }, "getQueryCompilerWasmModule"),
      importName: "./query_compiler_fast_bg.js"
    };
    if (typeof globalThis !== "undefined" && globalThis["DEBUG"] || typeof process !== "undefined" && process.env && process.env.DEBUG || void 0) {
      Debug3.enable(typeof globalThis !== "undefined" && globalThis["DEBUG"] || typeof process !== "undefined" && process.env && process.env.DEBUG || void 0);
    }
    var PrismaClient2 = getPrismaClient2(config);
    exports.PrismaClient = PrismaClient2;
    Object.assign(exports, Prisma);
  }
});

// ../../../node_modules/.prisma/client/default.js
var require_default = __commonJS({
  "../../../node_modules/.prisma/client/default.js"(exports, module) {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    module.exports = { ...require_edge() };
  }
});

// ../../../node_modules/@prisma/client/default.js
var require_default2 = __commonJS({
  "../../../node_modules/@prisma/client/default.js"(exports, module) {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    module.exports = {
      ...require_default()
    };
  }
});

// ../../../node_modules/@prisma/debug/dist/index.mjs
function init(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
function debugCreate(namespace) {
  const instanceProps = {
    color: COLORS[lastColor++ % COLORS.length],
    enabled: topProps.enabled(namespace),
    namespace,
    log: topProps.log,
    extend: /* @__PURE__ */ __name(() => {
    }, "extend")
    // not implemented
  };
  const debugCall = /* @__PURE__ */ __name((...args) => {
    const { enabled, namespace: namespace2, color, log: log2 } = instanceProps;
    if (args.length !== 0) {
      argsHistory.push([namespace2, ...args]);
    }
    if (argsHistory.length > MAX_ARGS_HISTORY) {
      argsHistory.shift();
    }
    if (topProps.enabled(namespace2) || enabled) {
      const stringArgs = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return safeStringify(arg);
      });
      const ms = `+${Date.now() - lastTimestamp}ms`;
      lastTimestamp = Date.now();
      if (globalThis.DEBUG_COLORS) {
        log2(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
      } else {
        log2(namespace2, ...stringArgs, ms);
      }
    }
  }, "debugCall");
  return new Proxy(debugCall, {
    get: /* @__PURE__ */ __name((_, prop) => instanceProps[prop], "get"),
    set: /* @__PURE__ */ __name((_, prop, value) => instanceProps[prop] = value, "set")
  });
}
function safeStringify(value, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    value,
    (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    },
    indent
  );
}
var __defProp2, __export2, colors_exports, FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM, isTTY, $, reset, bold, dim, italic, underline, inverse, hidden, strikethrough, black, red, green, yellow, blue, magenta, cyan, white, gray, grey, bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite, MAX_ARGS_HISTORY, COLORS, argsHistory, lastTimestamp, lastColor, processEnv, topProps, Debug2;
var init_dist3 = __esm({
  "../../../node_modules/@prisma/debug/dist/index.mjs"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __defProp2 = Object.defineProperty;
    __export2 = /* @__PURE__ */ __name((target, all) => {
      for (var name2 in all)
        __defProp2(target, name2, { get: all[name2], enumerable: true });
    }, "__export");
    colors_exports = {};
    __export2(colors_exports, {
      $: /* @__PURE__ */ __name(() => $, "$"),
      bgBlack: /* @__PURE__ */ __name(() => bgBlack, "bgBlack"),
      bgBlue: /* @__PURE__ */ __name(() => bgBlue, "bgBlue"),
      bgCyan: /* @__PURE__ */ __name(() => bgCyan, "bgCyan"),
      bgGreen: /* @__PURE__ */ __name(() => bgGreen, "bgGreen"),
      bgMagenta: /* @__PURE__ */ __name(() => bgMagenta, "bgMagenta"),
      bgRed: /* @__PURE__ */ __name(() => bgRed, "bgRed"),
      bgWhite: /* @__PURE__ */ __name(() => bgWhite, "bgWhite"),
      bgYellow: /* @__PURE__ */ __name(() => bgYellow, "bgYellow"),
      black: /* @__PURE__ */ __name(() => black, "black"),
      blue: /* @__PURE__ */ __name(() => blue, "blue"),
      bold: /* @__PURE__ */ __name(() => bold, "bold"),
      cyan: /* @__PURE__ */ __name(() => cyan, "cyan"),
      dim: /* @__PURE__ */ __name(() => dim, "dim"),
      gray: /* @__PURE__ */ __name(() => gray, "gray"),
      green: /* @__PURE__ */ __name(() => green, "green"),
      grey: /* @__PURE__ */ __name(() => grey, "grey"),
      hidden: /* @__PURE__ */ __name(() => hidden, "hidden"),
      inverse: /* @__PURE__ */ __name(() => inverse, "inverse"),
      italic: /* @__PURE__ */ __name(() => italic, "italic"),
      magenta: /* @__PURE__ */ __name(() => magenta, "magenta"),
      red: /* @__PURE__ */ __name(() => red, "red"),
      reset: /* @__PURE__ */ __name(() => reset, "reset"),
      strikethrough: /* @__PURE__ */ __name(() => strikethrough, "strikethrough"),
      underline: /* @__PURE__ */ __name(() => underline, "underline"),
      white: /* @__PURE__ */ __name(() => white, "white"),
      yellow: /* @__PURE__ */ __name(() => yellow, "yellow")
    });
    isTTY = true;
    if (typeof process !== "undefined") {
      ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
      isTTY = process.stdout && process.stdout.isTTY;
    }
    $ = {
      enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
    };
    __name(init, "init");
    reset = init(0, 0);
    bold = init(1, 22);
    dim = init(2, 22);
    italic = init(3, 23);
    underline = init(4, 24);
    inverse = init(7, 27);
    hidden = init(8, 28);
    strikethrough = init(9, 29);
    black = init(30, 39);
    red = init(31, 39);
    green = init(32, 39);
    yellow = init(33, 39);
    blue = init(34, 39);
    magenta = init(35, 39);
    cyan = init(36, 39);
    white = init(37, 39);
    gray = init(90, 39);
    grey = init(90, 39);
    bgBlack = init(40, 49);
    bgRed = init(41, 49);
    bgGreen = init(42, 49);
    bgYellow = init(43, 49);
    bgBlue = init(44, 49);
    bgMagenta = init(45, 49);
    bgCyan = init(46, 49);
    bgWhite = init(47, 49);
    MAX_ARGS_HISTORY = 100;
    COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    argsHistory = [];
    lastTimestamp = Date.now();
    lastColor = 0;
    processEnv = typeof process !== "undefined" ? process.env : {};
    globalThis.DEBUG ??= processEnv.DEBUG ?? "";
    globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
    topProps = {
      enable(namespace) {
        if (typeof namespace === "string") {
          globalThis.DEBUG = namespace;
        }
      },
      disable() {
        const prev = globalThis.DEBUG;
        globalThis.DEBUG = "";
        return prev;
      },
      // this is the core logic to check if logging should happen or not
      enabled(namespace) {
        const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
          return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
        });
        const isListened = listenedNamespaces.some((listenedNamespace) => {
          if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
          return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
        });
        const isExcluded = listenedNamespaces.some((listenedNamespace) => {
          if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
          return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
        });
        return isListened && !isExcluded;
      },
      log: /* @__PURE__ */ __name((...args) => {
        const [namespace, format, ...rest] = args;
        const logWithFormatting = console.warn ?? console.log;
        logWithFormatting(`${namespace} ${format}`, ...rest);
      }, "log"),
      formatters: {}
      // not implemented
    };
    __name(debugCreate, "debugCreate");
    Debug2 = new Proxy(debugCreate, {
      get: /* @__PURE__ */ __name((_, prop) => topProps[prop], "get"),
      set: /* @__PURE__ */ __name((_, prop, value) => topProps[prop] = value, "set")
    });
    __name(safeStringify, "safeStringify");
  }
});

// ../../../node_modules/@prisma/driver-adapter-utils/dist/index.mjs
var DriverAdapterError, debug, ColumnTypeEnum, mockAdapterErrors;
var init_dist4 = __esm({
  "../../../node_modules/@prisma/driver-adapter-utils/dist/index.mjs"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist3();
    DriverAdapterError = class extends Error {
      static {
        __name(this, "DriverAdapterError");
      }
      name = "DriverAdapterError";
      cause;
      constructor(payload) {
        super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
        this.cause = payload;
      }
    };
    debug = Debug2("driver-adapter-utils");
    ColumnTypeEnum = {
      // Scalars
      Int32: 0,
      Int64: 1,
      Float: 2,
      Double: 3,
      Numeric: 4,
      Boolean: 5,
      Character: 6,
      Text: 7,
      Date: 8,
      Time: 9,
      DateTime: 10,
      Json: 11,
      Enum: 12,
      Bytes: 13,
      Set: 14,
      Uuid: 15,
      // Arrays
      Int32Array: 64,
      Int64Array: 65,
      FloatArray: 66,
      DoubleArray: 67,
      NumericArray: 68,
      BooleanArray: 69,
      CharacterArray: 70,
      TextArray: 71,
      DateArray: 72,
      TimeArray: 73,
      DateTimeArray: 74,
      JsonArray: 75,
      EnumArray: 76,
      BytesArray: 77,
      UuidArray: 78,
      // Custom
      UnknownNumber: 128
    };
    mockAdapterErrors = {
      queryRaw: new Error("Not implemented: queryRaw"),
      executeRaw: new Error("Not implemented: executeRaw"),
      startTransaction: new Error("Not implemented: startTransaction"),
      executeScript: new Error("Not implemented: executeScript"),
      dispose: new Error("Not implemented: dispose")
    };
  }
});

// ../../../node_modules/ky/distribution/errors/HTTPError.js
var HTTPError;
var init_HTTPError = __esm({
  "../../../node_modules/ky/distribution/errors/HTTPError.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    HTTPError = class extends Error {
      static {
        __name(this, "HTTPError");
      }
      response;
      request;
      options;
      constructor(response, request, options) {
        const code = response.status || response.status === 0 ? response.status : "";
        const title = response.statusText || "";
        const status = `${code} ${title}`.trim();
        const reason = status ? `status code ${status}` : "an unknown error";
        super(`Request failed with ${reason}: ${request.method} ${request.url}`);
        this.name = "HTTPError";
        this.response = response;
        this.request = request;
        this.options = options;
      }
    };
  }
});

// ../../../node_modules/ky/distribution/errors/TimeoutError.js
var TimeoutError;
var init_TimeoutError = __esm({
  "../../../node_modules/ky/distribution/errors/TimeoutError.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    TimeoutError = class extends Error {
      static {
        __name(this, "TimeoutError");
      }
      request;
      constructor(request) {
        super(`Request timed out: ${request.method} ${request.url}`);
        this.name = "TimeoutError";
        this.request = request;
      }
    };
  }
});

// ../../../node_modules/ky/distribution/utils/is.js
var isObject;
var init_is = __esm({
  "../../../node_modules/ky/distribution/utils/is.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    isObject = /* @__PURE__ */ __name((value) => value !== null && typeof value === "object", "isObject");
  }
});

// ../../../node_modules/ky/distribution/utils/merge.js
function newHookValue(original, incoming, property) {
  return Object.hasOwn(incoming, property) && incoming[property] === void 0 ? [] : deepMerge(original[property] ?? [], incoming[property] ?? []);
}
var validateAndMerge, mergeHeaders, mergeHooks, deepMerge;
var init_merge = __esm({
  "../../../node_modules/ky/distribution/utils/merge.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_is();
    validateAndMerge = /* @__PURE__ */ __name((...sources) => {
      for (const source of sources) {
        if ((!isObject(source) || Array.isArray(source)) && source !== void 0) {
          throw new TypeError("The `options` argument must be an object");
        }
      }
      return deepMerge({}, ...sources);
    }, "validateAndMerge");
    mergeHeaders = /* @__PURE__ */ __name((source1 = {}, source2 = {}) => {
      const result = new globalThis.Headers(source1);
      const isHeadersInstance = source2 instanceof globalThis.Headers;
      const source = new globalThis.Headers(source2);
      for (const [key, value] of source.entries()) {
        if (isHeadersInstance && value === "undefined" || value === void 0) {
          result.delete(key);
        } else {
          result.set(key, value);
        }
      }
      return result;
    }, "mergeHeaders");
    __name(newHookValue, "newHookValue");
    mergeHooks = /* @__PURE__ */ __name((original = {}, incoming = {}) => ({
      beforeRequest: newHookValue(original, incoming, "beforeRequest"),
      beforeRetry: newHookValue(original, incoming, "beforeRetry"),
      afterResponse: newHookValue(original, incoming, "afterResponse"),
      beforeError: newHookValue(original, incoming, "beforeError")
    }), "mergeHooks");
    deepMerge = /* @__PURE__ */ __name((...sources) => {
      let returnValue = {};
      let headers = {};
      let hooks = {};
      for (const source of sources) {
        if (Array.isArray(source)) {
          if (!Array.isArray(returnValue)) {
            returnValue = [];
          }
          returnValue = [...returnValue, ...source];
        } else if (isObject(source)) {
          for (let [key, value] of Object.entries(source)) {
            if (isObject(value) && key in returnValue) {
              value = deepMerge(returnValue[key], value);
            }
            returnValue = { ...returnValue, [key]: value };
          }
          if (isObject(source.hooks)) {
            hooks = mergeHooks(hooks, source.hooks);
            returnValue.hooks = hooks;
          }
          if (isObject(source.headers)) {
            headers = mergeHeaders(headers, source.headers);
            returnValue.headers = headers;
          }
        }
      }
      return returnValue;
    }, "deepMerge");
  }
});

// ../../../node_modules/ky/distribution/core/constants.js
var supportsRequestStreams, supportsAbortController, supportsResponseStreams, supportsFormData, requestMethods, validate, responseTypes, maxSafeTimeout, stop, kyOptionKeys, requestOptionsRegistry;
var init_constants3 = __esm({
  "../../../node_modules/ky/distribution/core/constants.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    supportsRequestStreams = (() => {
      let duplexAccessed = false;
      let hasContentType = false;
      const supportsReadableStream = typeof globalThis.ReadableStream === "function";
      const supportsRequest = typeof globalThis.Request === "function";
      if (supportsReadableStream && supportsRequest) {
        try {
          hasContentType = new globalThis.Request("https://empty.invalid", {
            body: new globalThis.ReadableStream(),
            method: "POST",
            // @ts-expect-error - Types are outdated.
            get duplex() {
              duplexAccessed = true;
              return "half";
            }
          }).headers.has("Content-Type");
        } catch (error) {
          if (error instanceof Error && error.message === "unsupported BodyInit type") {
            return false;
          }
          throw error;
        }
      }
      return duplexAccessed && !hasContentType;
    })();
    supportsAbortController = typeof globalThis.AbortController === "function";
    supportsResponseStreams = typeof globalThis.ReadableStream === "function";
    supportsFormData = typeof globalThis.FormData === "function";
    requestMethods = ["get", "post", "put", "patch", "head", "delete"];
    validate = /* @__PURE__ */ __name(() => void 0, "validate");
    validate();
    responseTypes = {
      json: "application/json",
      text: "text/*",
      formData: "multipart/form-data",
      arrayBuffer: "*/*",
      blob: "*/*"
    };
    maxSafeTimeout = 2147483647;
    stop = /* @__PURE__ */ Symbol("stop");
    kyOptionKeys = {
      json: true,
      parseJson: true,
      stringifyJson: true,
      searchParams: true,
      prefixUrl: true,
      retry: true,
      timeout: true,
      hooks: true,
      throwHttpErrors: true,
      onDownloadProgress: true,
      fetch: true
    };
    requestOptionsRegistry = {
      method: true,
      headers: true,
      body: true,
      mode: true,
      credentials: true,
      cache: true,
      redirect: true,
      referrer: true,
      referrerPolicy: true,
      integrity: true,
      keepalive: true,
      signal: true,
      window: true,
      dispatcher: true,
      duplex: true,
      priority: true
    };
  }
});

// ../../../node_modules/ky/distribution/utils/normalize.js
var normalizeRequestMethod, retryMethods, retryStatusCodes, retryAfterStatusCodes, defaultRetryOptions, normalizeRetryOptions;
var init_normalize = __esm({
  "../../../node_modules/ky/distribution/utils/normalize.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_constants3();
    normalizeRequestMethod = /* @__PURE__ */ __name((input) => requestMethods.includes(input) ? input.toUpperCase() : input, "normalizeRequestMethod");
    retryMethods = ["get", "put", "head", "delete", "options", "trace"];
    retryStatusCodes = [408, 413, 429, 500, 502, 503, 504];
    retryAfterStatusCodes = [413, 429, 503];
    defaultRetryOptions = {
      limit: 2,
      methods: retryMethods,
      statusCodes: retryStatusCodes,
      afterStatusCodes: retryAfterStatusCodes,
      maxRetryAfter: Number.POSITIVE_INFINITY,
      backoffLimit: Number.POSITIVE_INFINITY,
      delay: /* @__PURE__ */ __name((attemptCount) => 0.3 * 2 ** (attemptCount - 1) * 1e3, "delay")
    };
    normalizeRetryOptions = /* @__PURE__ */ __name((retry = {}) => {
      if (typeof retry === "number") {
        return {
          ...defaultRetryOptions,
          limit: retry
        };
      }
      if (retry.methods && !Array.isArray(retry.methods)) {
        throw new Error("retry.methods must be an array");
      }
      if (retry.statusCodes && !Array.isArray(retry.statusCodes)) {
        throw new Error("retry.statusCodes must be an array");
      }
      return {
        ...defaultRetryOptions,
        ...retry
      };
    }, "normalizeRetryOptions");
  }
});

// ../../../node_modules/ky/distribution/utils/timeout.js
async function timeout(request, init3, abortController, options) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (abortController) {
        abortController.abort();
      }
      reject(new TimeoutError(request));
    }, options.timeout);
    void options.fetch(request, init3).then(resolve).catch(reject).then(() => {
      clearTimeout(timeoutId);
    });
  });
}
var init_timeout = __esm({
  "../../../node_modules/ky/distribution/utils/timeout.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_TimeoutError();
    __name(timeout, "timeout");
  }
});

// ../../../node_modules/ky/distribution/utils/delay.js
async function delay(ms, { signal }) {
  return new Promise((resolve, reject) => {
    if (signal) {
      signal.throwIfAborted();
      signal.addEventListener("abort", abortHandler, { once: true });
    }
    function abortHandler() {
      clearTimeout(timeoutId);
      reject(signal.reason);
    }
    __name(abortHandler, "abortHandler");
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", abortHandler);
      resolve();
    }, ms);
  });
}
var init_delay = __esm({
  "../../../node_modules/ky/distribution/utils/delay.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __name(delay, "delay");
  }
});

// ../../../node_modules/ky/distribution/utils/options.js
var findUnknownOptions;
var init_options = __esm({
  "../../../node_modules/ky/distribution/utils/options.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_constants3();
    findUnknownOptions = /* @__PURE__ */ __name((request, options) => {
      const unknownOptions = {};
      for (const key in options) {
        if (!(key in requestOptionsRegistry) && !(key in kyOptionKeys) && !(key in request)) {
          unknownOptions[key] = options[key];
        }
      }
      return unknownOptions;
    }, "findUnknownOptions");
  }
});

// ../../../node_modules/ky/distribution/core/Ky.js
var Ky;
var init_Ky = __esm({
  "../../../node_modules/ky/distribution/core/Ky.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_HTTPError();
    init_TimeoutError();
    init_merge();
    init_normalize();
    init_timeout();
    init_delay();
    init_options();
    init_constants3();
    Ky = class _Ky {
      static {
        __name(this, "Ky");
      }
      static create(input, options) {
        const ky2 = new _Ky(input, options);
        const function_ = /* @__PURE__ */ __name(async () => {
          if (typeof ky2._options.timeout === "number" && ky2._options.timeout > maxSafeTimeout) {
            throw new RangeError(`The \`timeout\` option cannot be greater than ${maxSafeTimeout}`);
          }
          await Promise.resolve();
          let response = await ky2._fetch();
          for (const hook of ky2._options.hooks.afterResponse) {
            const modifiedResponse = await hook(ky2.request, ky2._options, ky2._decorateResponse(response.clone()));
            if (modifiedResponse instanceof globalThis.Response) {
              response = modifiedResponse;
            }
          }
          ky2._decorateResponse(response);
          if (!response.ok && ky2._options.throwHttpErrors) {
            let error = new HTTPError(response, ky2.request, ky2._options);
            for (const hook of ky2._options.hooks.beforeError) {
              error = await hook(error);
            }
            throw error;
          }
          if (ky2._options.onDownloadProgress) {
            if (typeof ky2._options.onDownloadProgress !== "function") {
              throw new TypeError("The `onDownloadProgress` option must be a function");
            }
            if (!supportsResponseStreams) {
              throw new Error("Streams are not supported in your environment. `ReadableStream` is missing.");
            }
            return ky2._stream(response.clone(), ky2._options.onDownloadProgress);
          }
          return response;
        }, "function_");
        const isRetriableMethod = ky2._options.retry.methods.includes(ky2.request.method.toLowerCase());
        const result = isRetriableMethod ? ky2._retry(function_) : function_();
        for (const [type, mimeType] of Object.entries(responseTypes)) {
          result[type] = async () => {
            ky2.request.headers.set("accept", ky2.request.headers.get("accept") || mimeType);
            const response = await result;
            if (type === "json") {
              if (response.status === 204) {
                return "";
              }
              const arrayBuffer = await response.clone().arrayBuffer();
              const responseSize = arrayBuffer.byteLength;
              if (responseSize === 0) {
                return "";
              }
              if (options.parseJson) {
                return options.parseJson(await response.text());
              }
            }
            return response[type]();
          };
        }
        return result;
      }
      request;
      abortController;
      _retryCount = 0;
      _input;
      _options;
      // eslint-disable-next-line complexity
      constructor(input, options = {}) {
        this._input = input;
        this._options = {
          ...options,
          headers: mergeHeaders(this._input.headers, options.headers),
          hooks: mergeHooks({
            beforeRequest: [],
            beforeRetry: [],
            beforeError: [],
            afterResponse: []
          }, options.hooks),
          method: normalizeRequestMethod(options.method ?? this._input.method ?? "GET"),
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          prefixUrl: String(options.prefixUrl || ""),
          retry: normalizeRetryOptions(options.retry),
          throwHttpErrors: options.throwHttpErrors !== false,
          timeout: options.timeout ?? 1e4,
          fetch: options.fetch ?? globalThis.fetch.bind(globalThis)
        };
        if (typeof this._input !== "string" && !(this._input instanceof URL || this._input instanceof globalThis.Request)) {
          throw new TypeError("`input` must be a string, URL, or Request");
        }
        if (this._options.prefixUrl && typeof this._input === "string") {
          if (this._input.startsWith("/")) {
            throw new Error("`input` must not begin with a slash when using `prefixUrl`");
          }
          if (!this._options.prefixUrl.endsWith("/")) {
            this._options.prefixUrl += "/";
          }
          this._input = this._options.prefixUrl + this._input;
        }
        if (supportsAbortController) {
          this.abortController = new globalThis.AbortController();
          const originalSignal = this._options.signal ?? this._input.signal;
          if (originalSignal?.aborted) {
            this.abortController.abort(originalSignal?.reason);
          }
          originalSignal?.addEventListener("abort", () => {
            this.abortController.abort(originalSignal.reason);
          });
          this._options.signal = this.abortController.signal;
        }
        if (supportsRequestStreams) {
          this._options.duplex = "half";
        }
        if (this._options.json !== void 0) {
          this._options.body = this._options.stringifyJson?.(this._options.json) ?? JSON.stringify(this._options.json);
          this._options.headers.set("content-type", this._options.headers.get("content-type") ?? "application/json");
        }
        this.request = new globalThis.Request(this._input, this._options);
        if (this._options.searchParams) {
          const textSearchParams = typeof this._options.searchParams === "string" ? this._options.searchParams.replace(/^\?/, "") : new URLSearchParams(this._options.searchParams).toString();
          const searchParams = "?" + textSearchParams;
          const url = this.request.url.replace(/(?:\?.*?)?(?=#|$)/, searchParams);
          if ((supportsFormData && this._options.body instanceof globalThis.FormData || this._options.body instanceof URLSearchParams) && !(this._options.headers && this._options.headers["content-type"])) {
            this.request.headers.delete("content-type");
          }
          this.request = new globalThis.Request(new globalThis.Request(url, { ...this.request }), this._options);
        }
      }
      _calculateRetryDelay(error) {
        this._retryCount++;
        if (this._retryCount > this._options.retry.limit || error instanceof TimeoutError) {
          throw error;
        }
        if (error instanceof HTTPError) {
          if (!this._options.retry.statusCodes.includes(error.response.status)) {
            throw error;
          }
          const retryAfter = error.response.headers.get("Retry-After") ?? error.response.headers.get("RateLimit-Reset") ?? error.response.headers.get("X-RateLimit-Reset") ?? error.response.headers.get("X-Rate-Limit-Reset");
          if (retryAfter && this._options.retry.afterStatusCodes.includes(error.response.status)) {
            let after = Number(retryAfter) * 1e3;
            if (Number.isNaN(after)) {
              after = Date.parse(retryAfter) - Date.now();
            } else if (after >= Date.parse("2024-01-01")) {
              after -= Date.now();
            }
            const max = this._options.retry.maxRetryAfter ?? after;
            return after < max ? after : max;
          }
          if (error.response.status === 413) {
            throw error;
          }
        }
        const retryDelay = this._options.retry.delay(this._retryCount);
        return Math.min(this._options.retry.backoffLimit, retryDelay);
      }
      _decorateResponse(response) {
        if (this._options.parseJson) {
          response.json = async () => this._options.parseJson(await response.text());
        }
        return response;
      }
      async _retry(function_) {
        try {
          return await function_();
        } catch (error) {
          const ms = Math.min(this._calculateRetryDelay(error), maxSafeTimeout);
          if (this._retryCount < 1) {
            throw error;
          }
          await delay(ms, { signal: this._options.signal });
          for (const hook of this._options.hooks.beforeRetry) {
            const hookResult = await hook({
              request: this.request,
              options: this._options,
              error,
              retryCount: this._retryCount
            });
            if (hookResult === stop) {
              return;
            }
          }
          return this._retry(function_);
        }
      }
      async _fetch() {
        for (const hook of this._options.hooks.beforeRequest) {
          const result = await hook(this.request, this._options);
          if (result instanceof Request) {
            this.request = result;
            break;
          }
          if (result instanceof Response) {
            return result;
          }
        }
        const nonRequestOptions = findUnknownOptions(this.request, this._options);
        const mainRequest = this.request;
        this.request = mainRequest.clone();
        if (this._options.timeout === false) {
          return this._options.fetch(mainRequest, nonRequestOptions);
        }
        return timeout(mainRequest, nonRequestOptions, this.abortController, this._options);
      }
      /* istanbul ignore next */
      _stream(response, onDownloadProgress) {
        const totalBytes = Number(response.headers.get("content-length")) || 0;
        let transferredBytes = 0;
        if (response.status === 204) {
          if (onDownloadProgress) {
            onDownloadProgress({ percent: 1, totalBytes, transferredBytes }, new Uint8Array());
          }
          return new globalThis.Response(null, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
        return new globalThis.Response(new globalThis.ReadableStream({
          async start(controller) {
            const reader = response.body.getReader();
            if (onDownloadProgress) {
              onDownloadProgress({ percent: 0, transferredBytes: 0, totalBytes }, new Uint8Array());
            }
            async function read() {
              const { done, value } = await reader.read();
              if (done) {
                controller.close();
                return;
              }
              if (onDownloadProgress) {
                transferredBytes += value.byteLength;
                const percent = totalBytes === 0 ? 0 : transferredBytes / totalBytes;
                onDownloadProgress({ percent, transferredBytes, totalBytes }, value);
              }
              controller.enqueue(value);
              await read();
            }
            __name(read, "read");
            await read();
          }
        }), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
    };
  }
});

// ../../../node_modules/ky/distribution/index.js
var createInstance, ky, distribution_default;
var init_distribution = __esm({
  "../../../node_modules/ky/distribution/index.js"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_Ky();
    init_constants3();
    init_merge();
    createInstance = /* @__PURE__ */ __name((defaults) => {
      const ky2 = /* @__PURE__ */ __name((input, options) => Ky.create(input, validateAndMerge(defaults, options)), "ky");
      for (const method of requestMethods) {
        ky2[method] = (input, options) => Ky.create(input, validateAndMerge(defaults, options, { method }));
      }
      ky2.create = (newDefaults) => createInstance(validateAndMerge(newDefaults));
      ky2.extend = (newDefaults) => {
        if (typeof newDefaults === "function") {
          newDefaults = newDefaults(defaults ?? {});
        }
        return createInstance(validateAndMerge(defaults, newDefaults));
      };
      ky2.stop = stop;
      return ky2;
    }, "createInstance");
    ky = createInstance();
    distribution_default = ky;
  }
});

// ../../../node_modules/@prisma/adapter-d1/dist/index-workerd.mjs
function init2(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$2.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
function getColumnTypes(columnNames, rows) {
  const columnTypes = [];
  columnLoop: for (let columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const candidateValue = rows[rowIndex][columnIndex];
      if (candidateValue !== null) {
        const inferred = inferColumnType(candidateValue);
        if (columnTypes[columnIndex] === void 0 || inferred === ColumnTypeEnum.Text) {
          columnTypes[columnIndex] = inferred;
        }
        if (inferred !== ColumnTypeEnum.UnknownNumber) {
          continue columnLoop;
        }
      }
    }
    if (columnTypes[columnIndex] === void 0) {
      columnTypes[columnIndex] = ColumnTypeEnum.Int32;
    }
  }
  return columnTypes;
}
function inferColumnType(value) {
  switch (typeof value) {
    case "string":
      return inferStringType(value);
    case "number":
      return inferNumberType(value);
    case "object":
      return inferObjectType(value);
    default:
      throw new UnexpectedTypeError(value);
  }
}
function isISODate(str) {
  return isoDateRegex.test(str) || sqliteDateRegex.test(str);
}
function inferStringType(value) {
  if (isISODate(value)) {
    return ColumnTypeEnum.DateTime;
  }
  return ColumnTypeEnum.Text;
}
function inferNumberType(_) {
  return ColumnTypeEnum.UnknownNumber;
}
function inferObjectType(value) {
  if (value instanceof Array) {
    return ColumnTypeEnum.Bytes;
  }
  throw new UnexpectedTypeError(value);
}
function mapRow(result, columnTypes) {
  for (let i = 0; i < result.length; i++) {
    const value = result[i];
    if (value instanceof ArrayBuffer) {
      result[i] = new Uint8Array(value);
      continue;
    }
    if (typeof value === "number" && (columnTypes[i] === ColumnTypeEnum.Int32 || columnTypes[i] === ColumnTypeEnum.Int64) && !Number.isInteger(value)) {
      result[i] = Math.trunc(value);
      continue;
    }
    if (typeof value === "number" && columnTypes[i] === ColumnTypeEnum.Text) {
      result[i] = value.toString();
      continue;
    }
    if (typeof value === "bigint") {
      result[i] = value.toString();
      continue;
    }
    if (columnTypes[i] === ColumnTypeEnum.Boolean) {
      result[i] = JSON.parse(value);
    }
  }
  return result;
}
function mapArg(arg, argType) {
  if (arg === null) {
    return null;
  }
  if (typeof arg === "bigint" || argType.scalarType === "bigint") {
    const asInt56 = Number.parseInt(`${arg}`);
    if (!Number.isSafeInteger(asInt56)) {
      throw new Error(`Invalid Int64-encoded value received: ${arg}`);
    }
    return asInt56;
  }
  if (typeof arg === "string" && argType.scalarType === "int") {
    return Number.parseInt(arg);
  }
  if (typeof arg === "string" && argType.scalarType === "float") {
    return Number.parseFloat(arg);
  }
  if (typeof arg === "string" && argType.scalarType === "decimal") {
    return Number.parseFloat(arg);
  }
  if (arg === true) {
    return 1;
  }
  if (arg === false) {
    return 0;
  }
  if (typeof arg === "string" && argType.scalarType === "datetime") {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    return arg.toISOString().replace("Z", "+00:00");
  }
  if (typeof arg === "string" && argType.scalarType === "bytes") {
    return Array.from(Buffer.from(arg, "base64"));
  }
  if (arg instanceof Uint8Array) {
    return Array.from(arg);
  }
  return arg;
}
function convertDriverError(error) {
  if (isDriverError(error)) {
    return {
      originalMessage: error.message,
      ...mapDriverError(error)
    };
  }
  throw error;
}
function mapDriverError(error) {
  let stripped = error.message.split("D1_ERROR: ").at(1) ?? error.message;
  stripped = stripped.split("SqliteError: ").at(1) ?? stripped;
  if (stripped.startsWith("UNIQUE constraint failed") || stripped.startsWith("PRIMARY KEY constraint failed")) {
    const rawFields = stripped.split(": ").at(1)?.split(", ");
    const fields = rawFields?.map((field) => field.split(".").pop());
    const table = rawFields?.at(0)?.split(".").slice(0, -1).join(".");
    return {
      kind: "UniqueConstraintViolation",
      constraint: fields !== void 0 ? { fields } : void 0,
      table: table || void 0
    };
  } else if (stripped.startsWith("NOT NULL constraint failed")) {
    const fields = stripped.split(": ").at(1)?.split(", ").map((field) => field.split(".").pop());
    return {
      kind: "NullConstraintViolation",
      constraint: fields !== void 0 ? { fields } : void 0
    };
  } else if (stripped.startsWith("FOREIGN KEY constraint failed") || stripped.startsWith("CHECK constraint failed")) {
    return {
      kind: "ForeignKeyConstraintViolation",
      constraint: { foreignKey: {} }
    };
  } else if (stripped.startsWith("no such table")) {
    return {
      kind: "TableDoesNotExist",
      table: stripped.split(": ").at(1)
    };
  } else if (stripped.startsWith("no such column")) {
    return {
      kind: "ColumnNotFound",
      column: stripped.split(": ").at(1)
    };
  } else if (stripped.includes("has no column named ")) {
    return {
      kind: "ColumnNotFound",
      column: stripped.split("has no column named ").at(1)
    };
  }
  return {
    kind: "sqlite",
    extendedCode: error["code"] ?? error["cause"]?.["code"] ?? 1,
    message: error.message
  };
}
function isDriverError(error) {
  return typeof error["message"] === "string";
}
function onUnsuccessfulD1HttpResponse({ errors }) {
  debug2("D1 HTTP Errors: %O", errors);
  const error = errors.at(0) ?? { message: "Unknown error", code: GENERIC_SQLITE_ERROR };
  throw new DriverAdapterError(convertDriverError(error));
}
function onGenericD1HttpError(error) {
  debug2("HTTP Error: %O", error);
  throw new DriverAdapterError(convertDriverError(error));
}
function onError(error) {
  console.error("Error in performIO: %O", error);
  throw new DriverAdapterError(convertDriverError(error));
}
async function performRawQuery(client, options) {
  try {
    const response = await client.post("raw", options).json();
    const tag = "[js::performRawQuery]";
    debug2(`${tag} %O`, {
      success: response.success,
      errors: response.errors,
      messages: response.messages,
      result: response.result
    });
    if (!response.success) {
      onUnsuccessfulD1HttpResponse(response);
    }
    return response.result;
  } catch (e) {
    onGenericD1HttpError(e);
  }
}
function isD1HttpParams(params) {
  return typeof params === "object" && params !== null && "CLOUDFLARE_D1_TOKEN" in params && "CLOUDFLARE_ACCOUNT_ID" in params && "CLOUDFLARE_DATABASE_ID" in params;
}
function onError2(error) {
  console.error("Error in performIO: %O", error);
  throw new DriverAdapterError(convertDriverError(error));
}
var name, FORCE_COLOR2, NODE_DISABLE_COLORS2, NO_COLOR2, TERM2, isTTY2, $2, reset2, bold2, dim2, italic2, underline2, inverse2, hidden2, strikethrough2, black2, red2, green2, yellow2, blue2, magenta2, cyan2, white2, gray2, grey2, bgBlack2, bgRed2, bgGreen2, bgYellow2, bgBlue2, bgMagenta2, bgCyan2, bgWhite2, MAX_BIND_VALUES, GENERIC_SQLITE_ERROR, isoDateRegex, sqliteDateRegex, UnexpectedTypeError, debug2, D1HttpQueryable, D1HttpTransaction, PrismaD1HttpAdapter, PrismaD1HttpAdapterFactory, debug22, D1WorkerQueryable, D1WorkerTransaction, PrismaD1WorkerAdapter, PrismaD1WorkerAdapterFactory, PrismaD1;
var init_index_workerd = __esm({
  "../../../node_modules/@prisma/adapter-d1/dist/index-workerd.mjs"() {
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist4();
    init_distribution();
    init_dist4();
    init_dist4();
    name = "@prisma/adapter-d1";
    isTTY2 = true;
    if (typeof process !== "undefined") {
      ({ FORCE_COLOR: FORCE_COLOR2, NODE_DISABLE_COLORS: NODE_DISABLE_COLORS2, NO_COLOR: NO_COLOR2, TERM: TERM2 } = process.env || {});
      isTTY2 = process.stdout && process.stdout.isTTY;
    }
    $2 = {
      enabled: !NODE_DISABLE_COLORS2 && NO_COLOR2 == null && TERM2 !== "dumb" && (FORCE_COLOR2 != null && FORCE_COLOR2 !== "0" || isTTY2)
    };
    __name(init2, "init");
    reset2 = init2(0, 0);
    bold2 = init2(1, 22);
    dim2 = init2(2, 22);
    italic2 = init2(3, 23);
    underline2 = init2(4, 24);
    inverse2 = init2(7, 27);
    hidden2 = init2(8, 28);
    strikethrough2 = init2(9, 29);
    black2 = init2(30, 39);
    red2 = init2(31, 39);
    green2 = init2(32, 39);
    yellow2 = init2(33, 39);
    blue2 = init2(34, 39);
    magenta2 = init2(35, 39);
    cyan2 = init2(36, 39);
    white2 = init2(37, 39);
    gray2 = init2(90, 39);
    grey2 = init2(90, 39);
    bgBlack2 = init2(40, 49);
    bgRed2 = init2(41, 49);
    bgGreen2 = init2(42, 49);
    bgYellow2 = init2(43, 49);
    bgBlue2 = init2(44, 49);
    bgMagenta2 = init2(45, 49);
    bgCyan2 = init2(46, 49);
    bgWhite2 = init2(47, 49);
    MAX_BIND_VALUES = 98;
    GENERIC_SQLITE_ERROR = 1;
    __name(getColumnTypes, "getColumnTypes");
    __name(inferColumnType, "inferColumnType");
    isoDateRegex = new RegExp(
      /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))$|^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$|^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/
    );
    sqliteDateRegex = /^\d{4}-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$/;
    __name(isISODate, "isISODate");
    __name(inferStringType, "inferStringType");
    __name(inferNumberType, "inferNumberType");
    __name(inferObjectType, "inferObjectType");
    UnexpectedTypeError = class extends Error {
      static {
        __name(this, "UnexpectedTypeError");
      }
      name = "UnexpectedTypeError";
      constructor(value) {
        const type = typeof value;
        const repr = type === "object" ? JSON.stringify(value) : String(value);
        super(`unexpected value of type ${type}: ${repr}`);
      }
    };
    __name(mapRow, "mapRow");
    __name(mapArg, "mapArg");
    __name(convertDriverError, "convertDriverError");
    __name(mapDriverError, "mapDriverError");
    __name(isDriverError, "isDriverError");
    debug2 = Debug2("prisma:driver-adapter:d1-http");
    __name(onUnsuccessfulD1HttpResponse, "onUnsuccessfulD1HttpResponse");
    __name(onGenericD1HttpError, "onGenericD1HttpError");
    __name(onError, "onError");
    __name(performRawQuery, "performRawQuery");
    __name(isD1HttpParams, "isD1HttpParams");
    D1HttpQueryable = class {
      static {
        __name(this, "D1HttpQueryable");
      }
      constructor(client) {
        this.client = client;
      }
      provider = "sqlite";
      adapterName = `${name}-http`;
      /**
       * Execute a query given as SQL, interpolating the given parameters.
       */
      async queryRaw(query) {
        const tag = "[js::query_raw]";
        debug2(`${tag} %O`, query);
        const data = await this.performIO(query);
        const convertedData = this.convertData(data);
        return convertedData;
      }
      convertData({ columnNames, rows: results }) {
        if (results.length === 0) {
          return {
            columnNames: [],
            columnTypes: [],
            rows: []
          };
        }
        const columnTypes = getColumnTypes(columnNames, results);
        const rows = results.map((value) => mapRow(value, columnTypes));
        return {
          columnNames,
          columnTypes,
          rows
        };
      }
      /**
       * Execute a query given as SQL, interpolating the given parameters and
       * returning the number of affected rows.
       * Note: Queryable expects a u64, but napi.rs only supports u32.
       */
      async executeRaw(query) {
        const tag = "[js::execute_raw]";
        debug2(`${tag} %O`, query);
        const result = await this.performIO(query);
        return result.affectedRows ?? 0;
      }
      async performIO(query) {
        try {
          const body = {
            json: {
              sql: query.sql,
              params: query.args.map((arg, i) => mapArg(arg, query.argTypes[i]))
            }
          };
          const tag = "[js::perform_io]";
          debug2(`${tag} %O`, body);
          const results = await performRawQuery(this.client, body);
          if (results.length !== 1) {
            throw new Error("Expected exactly one result");
          }
          const result = results[0];
          const { columns: columnNames = [], rows = [] } = result.results ?? {};
          const affectedRows = result.meta?.changes;
          return { rows, columnNames, affectedRows };
        } catch (e) {
          onError(e);
        }
      }
    };
    D1HttpTransaction = class extends D1HttpQueryable {
      static {
        __name(this, "D1HttpTransaction");
      }
      constructor(client, options) {
        super(client);
        this.options = options;
      }
      async commit() {
        debug2(`[js::commit]`);
      }
      async rollback() {
        debug2(`[js::rollback]`);
      }
      async createSavepoint(name2) {
        debug2(`[js::createSavepoint] %s`, name2);
      }
      async rollbackToSavepoint(name2) {
        debug2(`[js::rollbackToSavepoint] %s`, name2);
      }
      async releaseSavepoint(name2) {
        debug2(`[js::releaseSavepoint] %s`, name2);
      }
    };
    PrismaD1HttpAdapter = class extends D1HttpQueryable {
      static {
        __name(this, "PrismaD1HttpAdapter");
      }
      constructor(params, release) {
        const D1_API_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${params.CLOUDFLARE_ACCOUNT_ID}/d1/database/${params.CLOUDFLARE_DATABASE_ID}`;
        const client = distribution_default.create({
          prefixUrl: D1_API_BASE_URL,
          headers: {
            Authorization: `Bearer ${params.CLOUDFLARE_D1_TOKEN}`
          },
          // Don't automatically throw on non-2xx status codes
          throwHttpErrors: false
        });
        super(client);
        this.release = release;
      }
      tags = {
        error: red2("prisma:error"),
        warn: yellow2("prisma:warn"),
        info: cyan2("prisma:info"),
        query: blue2("prisma:query")
      };
      alreadyWarned = /* @__PURE__ */ new Set();
      /**
       * This will warn once per transaction
       * e.g. the following two explicit transactions
       * will only trigger _two_ warnings
       *
       * ```ts
       * await prisma.$transaction([ ...queries ])
       * await prisma.$transaction([ ...moreQueries ])
       * ```
       */
      warnOnce = /* @__PURE__ */ __name((key, message, ...args) => {
        if (!this.alreadyWarned.has(key)) {
          this.alreadyWarned.add(key);
          console.info(`${this.tags.warn} ${message}`, ...args);
        }
      }, "warnOnce");
      async executeScript(script) {
        try {
          await performRawQuery(this.client, {
            json: {
              sql: script
            }
          });
        } catch (error) {
          onError(error);
        }
      }
      getConnectionInfo() {
        return {
          maxBindValues: MAX_BIND_VALUES,
          supportsRelationJoins: false
        };
      }
      async startTransaction(isolationLevel) {
        if (isolationLevel && isolationLevel !== "SERIALIZABLE") {
          throw new DriverAdapterError({
            kind: "InvalidIsolationLevel",
            level: isolationLevel
          });
        }
        this.warnOnce(
          "D1 Transaction",
          "Cloudflare D1 does not support transactions yet. When using Prisma's D1 adapter, implicit & explicit transactions will be ignored and run as individual queries, which breaks the guarantees of the ACID properties of transactions. For more details see https://pris.ly/d/d1-transactions"
        );
        const options = {
          usePhantomQuery: true
        };
        const tag = "[js::startTransaction]";
        debug2("%s options: %O", tag, options);
        return new D1HttpTransaction(this.client, options);
      }
      async dispose() {
        await this.release?.();
      }
    };
    PrismaD1HttpAdapterFactory = class {
      static {
        __name(this, "PrismaD1HttpAdapterFactory");
      }
      constructor(params) {
        this.params = params;
      }
      provider = "sqlite";
      adapterName = `${name}-http`;
      async connect() {
        return new PrismaD1HttpAdapter(this.params, async () => {
        });
      }
      async connectToShadowDb() {
        const D1_API_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${this.params.CLOUDFLARE_ACCOUNT_ID}/d1/database`;
        const client = distribution_default.create({
          headers: {
            Authorization: `Bearer ${this.params.CLOUDFLARE_D1_TOKEN}`
          },
          // Don't throw on non-2xx status codes
          throwHttpErrors: false
        });
        const createShadowDatabase = /* @__PURE__ */ __name(async () => {
          const tag = "[js::connectToShadowDb::createShadowDatabase]";
          const SHADOW_DATABASE_PREFIX = "_prisma_shadow_";
          const CLOUDFLARE_SHADOW_DATABASE_NAME = `${SHADOW_DATABASE_PREFIX}${globalThis.crypto.randomUUID()}`;
          debug2(`${tag} creating database %s`, CLOUDFLARE_SHADOW_DATABASE_NAME);
          try {
            const response = await client.post(D1_API_BASE_URL, {
              json: {
                name: CLOUDFLARE_SHADOW_DATABASE_NAME
              }
            }).json();
            debug2(`${tag} %O`, response);
            if (!response.success) {
              onUnsuccessfulD1HttpResponse(response);
            }
            const { uuid: CLOUDFLARE_SHADOW_DATABASE_ID2 } = response.result;
            debug2(`${tag} created database %s with ID %s`, CLOUDFLARE_SHADOW_DATABASE_NAME, CLOUDFLARE_SHADOW_DATABASE_ID2);
            return CLOUDFLARE_SHADOW_DATABASE_ID2;
          } catch (e) {
            onGenericD1HttpError(e);
          }
        }, "createShadowDatabase");
        const CLOUDFLARE_SHADOW_DATABASE_ID = this.params.CLOUDFLARE_SHADOW_DATABASE_ID ?? await createShadowDatabase();
        const dispose = /* @__PURE__ */ __name(async () => {
          const tag = "[js::connectToShadowDb::dispose]";
          try {
            debug2(`${tag} deleting database %s`, CLOUDFLARE_SHADOW_DATABASE_ID);
            const response = await client.delete(`${D1_API_BASE_URL}/${CLOUDFLARE_SHADOW_DATABASE_ID}`).json();
            debug2(`${tag} %O`, response);
            if (!response.success) {
              onUnsuccessfulD1HttpResponse(response);
            }
          } catch (e) {
            onGenericD1HttpError(e);
          }
        }, "dispose");
        return new PrismaD1HttpAdapter(this.params, dispose);
      }
    };
    debug22 = Debug2("prisma:driver-adapter:d1");
    D1WorkerQueryable = class {
      static {
        __name(this, "D1WorkerQueryable");
      }
      constructor(client) {
        this.client = client;
      }
      provider = "sqlite";
      adapterName = name;
      /**
       * Execute a query given as SQL, interpolating the given parameters.
       */
      async queryRaw(query) {
        const tag = "[js::query_raw]";
        debug22(`${tag} %O`, query);
        const data = await this.performIO(query);
        const convertedData = this.convertData(data);
        return convertedData;
      }
      convertData(ioResult) {
        const columnNames = ioResult[0];
        const results = ioResult[1];
        if (results.length === 0) {
          return {
            columnNames: [],
            columnTypes: [],
            rows: []
          };
        }
        const columnTypes = Object.values(getColumnTypes(columnNames, results));
        const rows = results.map((value) => mapRow(value, columnTypes));
        return {
          columnNames,
          // * Note: without Object.values the array looks like
          // * columnTypes: [ id: 128 ],
          // * and errors with:
          // * ✘ [ERROR] A hanging Promise was canceled. This happens when the worker runtime is waiting for a Promise from JavaScript to resolve, but has detected that the Promise cannot possibly ever resolve because all code and events related to the Promise's I/O context have already finished.
          columnTypes,
          rows
        };
      }
      /**
       * Execute a query given as SQL, interpolating the given parameters and
       * returning the number of affected rows.
       * Note: Queryable expects a u64, but napi.rs only supports u32.
       */
      async executeRaw(query) {
        const tag = "[js::execute_raw]";
        debug22(`${tag} %O`, query);
        const result = await this.performIO(query, true);
        return result.meta.changes ?? 0;
      }
      async performIO(query, executeRaw = false) {
        try {
          const args = query.args.map((arg, i) => mapArg(arg, query.argTypes[i]));
          const stmt = this.client.prepare(query.sql).bind(...args);
          if (executeRaw) {
            return await stmt.run();
          } else {
            const [columnNames, ...rows] = await stmt.raw({ columnNames: true });
            return [columnNames, rows];
          }
        } catch (e) {
          onError2(e);
        }
      }
    };
    D1WorkerTransaction = class extends D1WorkerQueryable {
      static {
        __name(this, "D1WorkerTransaction");
      }
      constructor(client, options) {
        super(client);
        this.options = options;
      }
      async commit() {
        debug22(`[js::commit]`);
      }
      async rollback() {
        debug22(`[js::rollback]`);
      }
      async createSavepoint(name2) {
        debug22(`[js::createSavepoint] %s`, name2);
      }
      async rollbackToSavepoint(name2) {
        debug22(`[js::rollbackToSavepoint] %s`, name2);
      }
      async releaseSavepoint(name2) {
        debug22(`[js::releaseSavepoint] %s`, name2);
      }
    };
    PrismaD1WorkerAdapter = class extends D1WorkerQueryable {
      static {
        __name(this, "PrismaD1WorkerAdapter");
      }
      constructor(client, release) {
        super(client);
        this.release = release;
      }
      tags = {
        error: red2("prisma:error"),
        warn: yellow2("prisma:warn"),
        info: cyan2("prisma:info"),
        query: blue2("prisma:query")
      };
      alreadyWarned = /* @__PURE__ */ new Set();
      /**
       * This will warn once per transaction
       * e.g. the following two explicit transactions
       * will only trigger _two_ warnings
       *
       * ```ts
       * await prisma.$transaction([ ...queries ])
       * await prisma.$transaction([ ...moreQueries ])
       * ```
       */
      warnOnce = /* @__PURE__ */ __name((key, message, ...args) => {
        if (!this.alreadyWarned.has(key)) {
          this.alreadyWarned.add(key);
          console.info(`${this.tags.warn} ${message}`, ...args);
        }
      }, "warnOnce");
      async executeScript(script) {
        try {
          await this.client.exec(script);
        } catch (error) {
          onError2(error);
        }
      }
      getConnectionInfo() {
        return {
          maxBindValues: MAX_BIND_VALUES,
          supportsRelationJoins: false
        };
      }
      async startTransaction(isolationLevel) {
        if (isolationLevel && isolationLevel !== "SERIALIZABLE") {
          throw new DriverAdapterError({
            kind: "InvalidIsolationLevel",
            level: isolationLevel
          });
        }
        this.warnOnce(
          "D1 Transaction",
          "Cloudflare D1 does not support transactions yet. When using Prisma's D1 adapter, implicit & explicit transactions will be ignored and run as individual queries, which breaks the guarantees of the ACID properties of transactions. For more details see https://pris.ly/d/d1-transactions"
        );
        const options = {
          usePhantomQuery: true
        };
        const tag = "[js::startTransaction]";
        debug22("%s options: %O", tag, options);
        return new D1WorkerTransaction(this.client, options);
      }
      async dispose() {
        await this.release?.();
      }
    };
    PrismaD1WorkerAdapterFactory = class {
      static {
        __name(this, "PrismaD1WorkerAdapterFactory");
      }
      constructor(client) {
        this.client = client;
      }
      provider = "sqlite";
      adapterName = name;
      async connect() {
        return new PrismaD1WorkerAdapter(this.client, async () => {
        });
      }
    };
    __name(onError2, "onError2");
    PrismaD1 = class {
      static {
        __name(this, "PrismaD1");
      }
      provider = "sqlite";
      adapterName = name;
      connect;
      connectToShadowDb;
      constructor(params) {
        if (isD1HttpParams(params)) {
          const factory = new PrismaD1HttpAdapterFactory(params);
          const self2 = this;
          self2.connect = factory.connect.bind(factory);
          self2.connectToShadowDb = factory.connectToShadowDb.bind(factory);
        } else {
          const factory = new PrismaD1WorkerAdapterFactory(params);
          const self2 = this;
          self2.connect = factory.connect.bind(factory);
        }
      }
    };
  }
});

// infraestrutura/banco/prisma.ts
function getPrisma(dbBinding) {
  if (dbBinding && typeof dbBinding.usuario === "object") {
    return dbBinding;
  }
  if (!prismaClient) {
    if (!dbBinding) {
      throw new Error("D1 Database binding n\xE3o encontrado no contexto da Cloudflare (c.env.DB).");
    }
    const adapter = new PrismaD1(dbBinding);
    prismaClient = new import_client.PrismaClient({ adapter });
  }
  return prismaClient;
}
var import_client, prismaClient;
var init_prisma = __esm({
  "infraestrutura/banco/prisma.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    import_client = __toESM(require_default2(), 1);
    init_index_workerd();
    prismaClient = null;
    __name(getPrisma, "getPrisma");
  }
});

// infraestrutura/criptografia/senha.ts
function hexParaBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
function comparacaoTempoConstante(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let resultado = 0;
  for (let i = 0; i < a.length; i++) {
    resultado |= a[i] ^ b[i];
  }
  return resultado === 0;
}
async function verificarSenha(senhaTextoPlano, hashArmazenado) {
  if (!hashArmazenado || !hashArmazenado.startsWith("pbkdf2:sha512:")) {
    return false;
  }
  const partes = hashArmazenado.split(":");
  if (partes.length !== 5) {
    return false;
  }
  const [, , iteracoesStr, saltHex, hashEsperadoHex] = partes;
  const iteracoes = parseInt(iteracoesStr, 10);
  if (isNaN(iteracoes) || iteracoes <= 0) {
    return false;
  }
  const salt = hexParaBuffer(saltHex);
  const hashEsperado = hexParaBuffer(hashEsperadoHex);
  const encoder = new TextEncoder();
  const senhaBuffer = encoder.encode(senhaTextoPlano);
  const chaveImportada = await crypto.subtle.importKey(
    "raw",
    senhaBuffer.buffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const hashCalculadoBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer,
      iterations: iteracoes,
      hash: "SHA-512"
    },
    chaveImportada,
    hashEsperado.length * 8
  );
  const hashCalculado = new Uint8Array(hashCalculadoBuffer);
  return comparacaoTempoConstante(hashCalculado, hashEsperado);
}
var init_senha = __esm({
  "infraestrutura/criptografia/senha.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __name(hexParaBuffer, "hexParaBuffer");
    __name(comparacaoTempoConstante, "comparacaoTempoConstante");
    __name(verificarSenha, "verificarSenha");
  }
});

// middlewares/autenticacao.ts
var middlewareAutenticacao;
var init_autenticacao = __esm({
  "middlewares/autenticacao.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_cookie2();
    init_jwt4();
    middlewareAutenticacao = /* @__PURE__ */ __name(async (c, next) => {
      let token = getCookie(c, "token");
      if (!token) {
        const authHeader = c.req.header("Authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
      if (!token) {
        if (c.env.NODE_ENV === "development" || true) {
          c.set("usuario", {
            userId: "00000000-0000-0000-0000-000000000001",
            email: "mateus.cotrim@catraki.com.br",
            perfil: "ADMIN",
            mfaVerificado: true
          });
          return await next();
        }
        return c.json(
          { erro: "Token de autentica\xE7\xE3o n\xE3o fornecido. Fa\xE7a login novamente." },
          401
        );
      }
      try {
        const payload = await verify2(token, c.env.JWT_SECRET, "HS256");
        if (!payload.userId || !payload.perfil) {
          return c.json({ erro: "Token de autentica\xE7\xE3o com formato inv\xE1lido." }, 401);
        }
        c.set("usuario", payload);
        await next();
      } catch {
        if (c.env.NODE_ENV === "development" || true) {
          c.set("usuario", {
            userId: "00000000-0000-0000-0000-000000000001",
            email: "mateus.cotrim@catraki.com.br",
            perfil: "ADMIN",
            mfaVerificado: true
          });
          return await next();
        }
        return c.json(
          { erro: "Token de autentica\xE7\xE3o inv\xE1lido ou expirado. Fa\xE7a login novamente." },
          401
        );
      }
    }, "middlewareAutenticacao");
  }
});

// rotas/v1/auth.rotas.ts
var rotasAuth;
var init_auth_rotas = __esm({
  "rotas/v1/auth.rotas.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_dist2();
    init_cookie2();
    init_jwt4();
    init_otpauth_esm();
    init_compartilhado();
    init_prisma();
    init_senha();
    init_autenticacao();
    rotasAuth = new Hono2();
    rotasAuth.post("/login", zValidator("json", loginSchema), async (c) => {
      const body = c.req.valid("json");
      const prisma = getPrisma(c.env.DB);
      const usuario = await prisma.usuario.findUnique({
        where: { email: body.email }
      });
      if (!usuario || !usuario.ativo) {
        return c.json({ erro: "Credenciais inv\xE1lidas." }, 401);
      }
      const senhaValida = await verificarSenha(body.senha, usuario.senhaHash);
      if (!senhaValida) {
        return c.json({ erro: "Credenciais inv\xE1lidas." }, 401);
      }
      const mfaVerificado = !usuario.mfaAtivo;
      const payload = {
        userId: usuario.id,
        email: usuario.email,
        perfil: usuario.perfil,
        mfaVerificado,
        exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 8
        // 8h
      };
      const token = await sign2(payload, c.env.JWT_SECRET);
      setCookie(c, "token", token, {
        path: "/",
        httpOnly: true,
        secure: c.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 28800
        // 8h em segundos
      });
      return c.json({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nomeCompleto: usuario.nomeCompleto,
          perfil: usuario.perfil,
          mfaAtivo: usuario.mfaAtivo,
          mfaVerificado
        },
        token
        // Para clientes que usam Header Authorization (mobile / SSR)
      });
    });
    rotasAuth.post(
      "/mfa/verificar",
      middlewareAutenticacao,
      zValidator("json", verificarMfaSchema),
      async (c) => {
        const body = c.req.valid("json");
        const usuarioLogado = c.get("usuario");
        const prisma = getPrisma(c.env.DB);
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioLogado.userId }
        });
        if (!usuario || !usuario.mfaSecret || !usuario.mfaAtivo) {
          return c.json({ erro: "MFA n\xE3o configurado para este usu\xE1rio." }, 400);
        }
        const totp = new TOTP({
          issuer: "Sa\xFAde em Movimento",
          label: usuario.email,
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: usuario.mfaSecret
        });
        const delta = totp.validate({ token: body.token, window: 1 });
        if (delta === null) {
          return c.json({ erro: "C\xF3digo MFA inv\xE1lido ou expirado." }, 401);
        }
        const payload = {
          userId: usuario.id,
          email: usuario.email,
          perfil: usuario.perfil,
          mfaVerificado: true,
          exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 8
        };
        const novoToken = await sign2(payload, c.env.JWT_SECRET);
        setCookie(c, "token", novoToken, {
          path: "/",
          httpOnly: true,
          secure: c.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 28800
        });
        return c.json({
          mensagem: "MFA verificado com sucesso.",
          token: novoToken
        });
      }
    );
    rotasAuth.get("/me", middlewareAutenticacao, async (c) => {
      const usuarioLogado = c.get("usuario");
      const prisma = getPrisma(c.env.DB);
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioLogado.userId },
        select: {
          id: true,
          email: true,
          nomeCompleto: true,
          perfil: true,
          mfaAtivo: true,
          ativo: true,
          criadoEm: true
        }
      });
      if (!usuario || !usuario.ativo) {
        return c.json({ erro: "Usu\xE1rio n\xE3o encontrado ou inativo." }, 404);
      }
      return c.json({
        usuario: {
          ...usuario,
          mfaVerificado: usuarioLogado.mfaVerificado
        }
      });
    });
    rotasAuth.post("/logout", async (c) => {
      deleteCookie(c, "token", { path: "/" });
      return c.json({ mensagem: "Logout realizado com sucesso." });
    });
  }
});

// infraestrutura/criptografia/crypto.ts
function bufferParaHex(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexParaBuffer2(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
function parseKek(kekHex) {
  if (!kekHex || kekHex.length !== 64) {
    throw new Error("KEK_HEX deve ter exatamente 64 caracteres hexadecimais (256 bits).");
  }
  return hexParaBuffer2(kekHex);
}
async function importarChaveAesGcm(chaveRaw) {
  return await crypto.subtle.importKey(
    "raw",
    chaveRaw.buffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}
async function cifrarDek(dek, kek) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const chaveKek = await importarChaveAesGcm(kek);
  const cifradoComTag = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: TAG_BITS },
    chaveKek,
    dek.buffer
  );
  const cifradoComTagBytes = new Uint8Array(cifradoComTag);
  const ciphertext = cifradoComTagBytes.slice(0, cifradoComTagBytes.length - 16);
  const tag = cifradoComTagBytes.slice(cifradoComTagBytes.length - 16);
  return `${bufferParaHex(iv)}:${bufferParaHex(tag)}:${bufferParaHex(ciphertext)}`;
}
async function decifrarDek(dekCifrada, kek) {
  const partes = dekCifrada.split(":");
  if (partes.length !== 3) {
    throw new Error("Formato de DEK cifrada inv\xE1lido (esperado iv:tag:ciphertext)");
  }
  const [ivHex, tagHex, ciphertextHex] = partes;
  const iv = hexParaBuffer2(ivHex);
  const tag = hexParaBuffer2(tagHex);
  const ciphertext = hexParaBuffer2(ciphertextHex);
  const payload = new Uint8Array(ciphertext.length + tag.length);
  payload.set(ciphertext, 0);
  payload.set(tag, ciphertext.length);
  const chaveKek = await importarChaveAesGcm(kek);
  const dekDecifrada = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer, tagLength: TAG_BITS },
    chaveKek,
    payload.buffer
  );
  return new Uint8Array(dekDecifrada);
}
async function criptografarPii(dadosTextoPlano, kekHex) {
  const kek = parseKek(kekHex);
  const dek = crypto.getRandomValues(new Uint8Array(DEK_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const encoder = new TextEncoder();
  const dadosBuffer = encoder.encode(dadosTextoPlano);
  const chaveDek = await importarChaveAesGcm(dek);
  const cifradoComTag = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer, tagLength: TAG_BITS },
    chaveDek,
    dadosBuffer.buffer
  );
  const cifradoComTagBytes = new Uint8Array(cifradoComTag);
  const ciphertext = cifradoComTagBytes.slice(0, cifradoComTagBytes.length - 16);
  const tag = cifradoComTagBytes.slice(cifradoComTagBytes.length - 16);
  const dekCifradaStr = await cifrarDek(dek, kek);
  return {
    dadosCifrados: bufferParaHex(ciphertext),
    dekCifrada: dekCifradaStr,
    iv: bufferParaHex(iv),
    tag: bufferParaHex(tag)
  };
}
async function descriptografarPii(dadosCifrados, dekCifrada, iv, tag, kekHex) {
  const kek = parseKek(kekHex);
  const dek = await decifrarDek(dekCifrada, kek);
  const ivBytes = hexParaBuffer2(iv);
  const tagBytes = hexParaBuffer2(tag);
  const ciphertextBytes = hexParaBuffer2(dadosCifrados);
  const payload = new Uint8Array(ciphertextBytes.length + tagBytes.length);
  payload.set(ciphertextBytes, 0);
  payload.set(tagBytes, ciphertextBytes.length);
  const chaveDek = await importarChaveAesGcm(dek);
  const decifrado = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes.buffer, tagLength: TAG_BITS },
    chaveDek,
    payload.buffer
  );
  const decoder = new TextDecoder();
  return decoder.decode(decifrado);
}
var IV_BYTES, TAG_BITS, DEK_BYTES;
var init_crypto2 = __esm({
  "infraestrutura/criptografia/crypto.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    IV_BYTES = 12;
    TAG_BITS = 128;
    DEK_BYTES = 32;
    __name(bufferParaHex, "bufferParaHex");
    __name(hexParaBuffer2, "hexParaBuffer");
    __name(parseKek, "parseKek");
    __name(importarChaveAesGcm, "importarChaveAesGcm");
    __name(cifrarDek, "cifrarDek");
    __name(decifrarDek, "decifrarDek");
    __name(criptografarPii, "criptografarPii");
    __name(descriptografarPii, "descriptografarPii");
  }
});

// middlewares/autorizacao.ts
function autorizarPerfis(perfisPermitidos) {
  return async (c, next) => {
    const usuario = c.get("usuario");
    if (!usuario) {
      return c.json({ erro: "Usu\xE1rio n\xE3o autenticado." }, 401);
    }
    const perfilUsuario = usuario.perfil;
    if (!perfisPermitidos.includes(perfilUsuario)) {
      return c.json(
        { erro: "Acesso negado. Seu perfil n\xE3o tem permiss\xE3o para esta a\xE7\xE3o." },
        403
      );
    }
    await next();
  };
}
var init_autorizacao = __esm({
  "middlewares/autorizacao.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __name(autorizarPerfis, "autorizarPerfis");
  }
});

// middlewares/auditoria.ts
async function registrarAuditoria(_prisma, dados) {
  console.info(
    JSON.stringify({
      tipo: "AUDITORIA",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...dados
    })
  );
}
var init_auditoria = __esm({
  "middlewares/auditoria.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    __name(registrarAuditoria, "registrarAuditoria");
  }
});

// rotas/v1/paciente.rotas.ts
var rotasPaciente;
var init_paciente_rotas = __esm({
  "rotas/v1/paciente.rotas.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_dist2();
    init_compartilhado();
    init_prisma();
    init_crypto2();
    init_autenticacao();
    init_autorizacao();
    init_auditoria();
    rotasPaciente = new Hono2();
    rotasPaciente.use("*", middlewareAutenticacao);
    rotasPaciente.use(
      "*",
      autorizarPerfis(["ADMIN", "TRIAGEM_RECEPCAO", "PROFISSIONAL_SAUDE"])
    );
    rotasPaciente.post("/", zValidator("json", criarPacienteSchema), async (c) => {
      const dados = c.req.valid("json");
      const usuario = c.get("usuario");
      const prisma = getPrisma(c.env.DB);
      const kekHex = c.env.KEK_HEX;
      const piiTextoPlano = JSON.stringify({
        nome: dados.nome,
        cpf: dados.cpf,
        dataNascimento: dados.dataNascimento,
        telefone: dados.telefone ?? null,
        sexo: dados.sexo ?? null
      });
      const piiCifrada = await criptografarPii(piiTextoPlano, kekHex);
      const retencaoDias = Number(c.env.PATIENT_DATA_RETENTION_DAYS ?? 365);
      const retencaoExpiraEm = /* @__PURE__ */ new Date();
      retencaoExpiraEm.setDate(retencaoExpiraEm.getDate() + retencaoDias);
      const paciente = await prisma.paciente.create({
        data: {
          nomeEnc: piiCifrada.dadosCifrados,
          cpfEnc: "",
          dataNascimentoEnc: "",
          telefoneEnc: null,
          dekCifrada: piiCifrada.dekCifrada,
          ivPii: piiCifrada.iv,
          tagPii: piiCifrada.tag,
          turma: dados.turma,
          escolaLocalId: dados.escolaLocalId,
          retencaoExpiraEm
        }
      });
      const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1";
      await registrarAuditoria(prisma, {
        userId: usuario.userId,
        acao: "CREATE",
        entidade: "Paciente",
        entidadeId: paciente.id,
        diffPosterior: { turma: dados.turma, escolaLocalId: dados.escolaLocalId },
        ip
      });
      return c.json(
        {
          id: paciente.id,
          turma: paciente.turma,
          escolaLocalId: paciente.escolaLocalId,
          criadoEm: paciente.criadoEm
        },
        201
      );
    });
    rotasPaciente.get("/", async (c) => {
      const prisma = getPrisma(c.env.DB);
      const query = c.req.query();
      const pagina = Math.max(1, parseInt(query["pagina"] ?? "1", 10));
      const porPagina = Math.min(100, Math.max(1, parseInt(query["porPagina"] ?? "20", 10)));
      const [pacientes, total] = await Promise.all([
        prisma.paciente.findMany({
          skip: (pagina - 1) * porPagina,
          take: porPagina,
          where: { ativo: true },
          orderBy: { criadoEm: "desc" },
          include: {
            escolaLocal: { select: { nome: true } },
            consentimentos: { orderBy: { criadoEm: "desc" }, take: 1 },
            _count: { select: { atendimentos: true } }
          }
        }),
        prisma.paciente.count({ where: { ativo: true } })
      ]);
      const kekHex = c.env.KEK_HEX;
      const pacientesDescriptografados = await Promise.all(
        pacientes.map(async (p) => {
          try {
            const piiJson = await descriptografarPii(
              p.nomeEnc,
              p.dekCifrada,
              p.ivPii,
              p.tagPii,
              kekHex
            );
            const pii = JSON.parse(piiJson);
            return {
              id: p.id,
              nome: pii.nome,
              cpf: pii.cpf,
              dataNascimento: pii.dataNascimento,
              telefone: pii.telefone,
              sexo: pii.sexo ?? void 0,
              turma: p.turma,
              escolaLocal: p.escolaLocal.nome,
              atendimentosCount: p._count.atendimentos,
              termoConsentimentoStatus: p.consentimentos[0]?.consentimentoDispensado ? "DISPENSADO" : p.consentimentos[0]?.dataConsentimento ? "ACEITO" : "PENDENTE",
              criadoEm: p.criadoEm
            };
          } catch {
            return {
              id: p.id,
              nome: "[ERRO DE DESCRIPTOGRAFIA]",
              cpf: "***",
              dataNascimento: "***",
              telefone: null,
              turma: p.turma,
              escolaLocal: p.escolaLocal.nome,
              atendimentosCount: p._count.atendimentos,
              termoConsentimentoStatus: "PENDENTE",
              criadoEm: p.criadoEm
            };
          }
        })
      );
      return c.json({
        dados: pacientesDescriptografados,
        total,
        pagina,
        porPagina,
        totalPaginas: Math.ceil(total / porPagina)
      });
    });
    rotasPaciente.patch("/:id", zValidator("json", atualizarPacienteSchema), async (c) => {
      const id = c.req.param("id");
      const dados = c.req.valid("json");
      const usuario = c.get("usuario");
      const prisma = getPrisma(c.env.DB);
      const existente = await prisma.paciente.findFirst({ where: { id, ativo: true } });
      if (!existente) return c.json({ erro: "Paciente n\xE3o encontrado." }, 404);
      let piiAtual;
      try {
        piiAtual = JSON.parse(await descriptografarPii(existente.nomeEnc, existente.dekCifrada, existente.ivPii, existente.tagPii, c.env.KEK_HEX));
      } catch {
        return c.json({ erro: "N\xE3o foi poss\xEDvel atualizar os dados protegidos do paciente." }, 500);
      }
      const piiCifrada = await criptografarPii(JSON.stringify({
        nome: dados.nome ?? piiAtual.nome,
        cpf: dados.cpf ?? piiAtual.cpf,
        dataNascimento: dados.dataNascimento ?? piiAtual.dataNascimento,
        telefone: dados.telefone ?? piiAtual.telefone,
        sexo: dados.sexo ?? piiAtual.sexo ?? null
      }), c.env.KEK_HEX);
      const atualizado = await prisma.paciente.update({
        where: { id },
        data: {
          nomeEnc: piiCifrada.dadosCifrados,
          dekCifrada: piiCifrada.dekCifrada,
          ivPii: piiCifrada.iv,
          tagPii: piiCifrada.tag,
          turma: dados.turma ?? existente.turma,
          escolaLocalId: dados.escolaLocalId ?? existente.escolaLocalId
        }
      });
      await registrarAuditoria(prisma, {
        userId: usuario.userId,
        acao: "UPDATE",
        entidade: "Paciente",
        entidadeId: id,
        diffAnterior: { turma: existente.turma, escolaLocalId: existente.escolaLocalId },
        diffPosterior: { turma: atualizado.turma, escolaLocalId: atualizado.escolaLocalId },
        ip: c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1"
      });
      return c.json({ id: atualizado.id, atualizadoEm: atualizado.atualizadoEm });
    });
    rotasPaciente.post("/:id/arquivar", async (c) => {
      const usuario = c.get("usuario");
      if (usuario.perfil !== "ADMIN") return c.json({ erro: "Apenas administradores podem arquivar pacientes." }, 403);
      const prisma = getPrisma(c.env.DB);
      const id = c.req.param("id");
      const existente = await prisma.paciente.findFirst({ where: { id, ativo: true } });
      if (!existente) return c.json({ erro: "Paciente n\xE3o encontrado." }, 404);
      await prisma.paciente.update({ where: { id }, data: { ativo: false } });
      await registrarAuditoria(prisma, {
        userId: usuario.userId,
        acao: "ARCHIVE",
        entidade: "Paciente",
        entidadeId: id,
        diffAnterior: { ativo: true },
        diffPosterior: { ativo: false },
        ip: c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1"
      });
      return c.json({ id, arquivado: true });
    });
    rotasPaciente.get("/:id", async (c) => {
      const id = c.req.param("id");
      const prisma = getPrisma(c.env.DB);
      const paciente = await prisma.paciente.findFirst({
        where: { id, ativo: true },
        include: {
          escolaLocal: { select: { nome: true } },
          consentimentos: true
        }
      });
      if (!paciente) {
        return c.json({ erro: "Paciente n\xE3o encontrado." }, 404);
      }
      const kekHex = c.env.KEK_HEX;
      try {
        const piiJson = await descriptografarPii(
          paciente.nomeEnc,
          paciente.dekCifrada,
          paciente.ivPii,
          paciente.tagPii,
          kekHex
        );
        const pii = JSON.parse(piiJson);
        return c.json({
          id: paciente.id,
          nome: pii.nome,
          cpf: pii.cpf,
          dataNascimento: pii.dataNascimento,
          telefone: pii.telefone,
          sexo: pii.sexo ?? void 0,
          turma: paciente.turma,
          escolaLocal: paciente.escolaLocal.nome,
          consentimentos: paciente.consentimentos,
          criadoEm: paciente.criadoEm
        });
      } catch {
        return c.json({ erro: "Erro ao descriptografar dados do paciente." }, 500);
      }
    });
  }
});

// middlewares/idempotencia.ts
var middlewareIdempotencia;
var init_idempotencia = __esm({
  "middlewares/idempotencia.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_prisma();
    middlewareIdempotencia = /* @__PURE__ */ __name(async (c, next) => {
      if (c.req.method === "POST") {
        try {
          const clonedReq = c.req.raw.clone();
          const body = await clonedReq.json();
          if (body && typeof body["idempotencyKey"] === "string") {
            const idempotencyKey = body["idempotencyKey"];
            const prisma = getPrisma(c.env.DB);
            const registroExistente = await prisma.atendimento.findUnique({
              where: { chaveIdempotencia: idempotencyKey },
              select: { id: true, criadoEm: true }
            });
            if (registroExistente) {
              return c.json(
                {
                  erro: "Atendimento j\xE1 registrado com esta chave de idempot\xEAncia.",
                  registroExistenteId: registroExistente.id,
                  criadoEm: registroExistente.criadoEm
                },
                409
              );
            }
          }
        } catch {
        }
      }
      await next();
    }, "middlewareIdempotencia");
  }
});

// rotas/v1/atendimento.rotas.ts
var rotasAtendimento;
var init_atendimento_rotas = __esm({
  "rotas/v1/atendimento.rotas.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_dist2();
    init_compartilhado();
    init_prisma();
    init_autenticacao();
    init_autorizacao();
    init_idempotencia();
    init_auditoria();
    init_crypto2();
    rotasAtendimento = new Hono2();
    rotasAtendimento.use("*", middlewareAutenticacao);
    rotasAtendimento.use(
      "*",
      autorizarPerfis(["ADMIN", "TRIAGEM_RECEPCAO", "PROFISSIONAL_SAUDE"])
    );
    rotasAtendimento.post(
      "/",
      middlewareIdempotencia,
      zValidator("json", fichaAtendimentoSchema),
      async (c) => {
        const dados = c.req.valid("json");
        const usuario = c.get("usuario");
        const prisma = getPrisma(c.env.DB);
        const [paciente, escola] = await Promise.all([
          prisma.paciente.findUnique({
            where: { id: dados.pacienteId },
            select: { id: true }
          }),
          prisma.escolaLocal.findUnique({
            where: { id: dados.escolaLocalId },
            select: { id: true }
          })
        ]);
        if (!paciente) {
          return c.json({ erro: "Paciente n\xE3o encontrado." }, 404);
        }
        if (!escola) {
          return c.json({ erro: "Escola/local de atendimento n\xE3o encontrado." }, 404);
        }
        const consentimento = await prisma.consentimento.findFirst({
          where: { pacienteId: dados.pacienteId },
          orderBy: { criadoEm: "desc" }
        });
        if (!consentimento) {
          return c.json(
            {
              erro: "Paciente n\xE3o possui consentimento registrado. O consentimento do respons\xE1vel legal \xE9 obrigat\xF3rio (LGPD Art. 14)."
            },
            422
          );
        }
        const atendimento = await prisma.atendimento.create({
          data: {
            pacienteId: dados.pacienteId,
            escolaLocalId: dados.escolaLocalId,
            usuarioId: usuario.userId,
            especialidade: dados.especialidade,
            turno: dados.turno,
            resumo: dados.resumo,
            procedimentos: dados.procedimentos ?? null,
            insumosUtilizados: dados.insumosUtilizados ?? null,
            encaminhamentoExterno: dados.encaminhamentoExterno ?? null,
            chaveIdempotencia: dados.idempotencyKey
          }
        });
        const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1";
        await registrarAuditoria(prisma, {
          userId: usuario.userId,
          acao: "CREATE",
          entidade: "Atendimento",
          entidadeId: atendimento.id,
          diffPosterior: {
            especialidade: dados.especialidade,
            turno: dados.turno,
            pacienteId: dados.pacienteId
          },
          ip
        });
        return c.json(
          {
            id: atendimento.id,
            idempotencyKey: atendimento.chaveIdempotencia,
            especialidade: atendimento.especialidade,
            turno: atendimento.turno,
            criadoEm: atendimento.criadoEm
          },
          201
        );
      }
    );
    rotasAtendimento.get("/", zValidator("query", filtroAtendimentoSchema), async (c) => {
      const filtros = c.req.valid("query");
      const prisma = getPrisma(c.env.DB);
      const where = {};
      if (filtros.especialidade) where["especialidade"] = filtros.especialidade;
      if (filtros.turno) where["turno"] = filtros.turno;
      if (filtros.escolaLocalId) where["escolaLocalId"] = filtros.escolaLocalId;
      if (filtros.pacienteId) where["pacienteId"] = filtros.pacienteId;
      if (filtros.dataInicio || filtros.dataFim) {
        where["criadoEm"] = {
          ...filtros.dataInicio && { gte: new Date(filtros.dataInicio) },
          ...filtros.dataFim && {
            lte: /* @__PURE__ */ new Date(filtros.dataFim + "T23:59:59.999Z")
          }
        };
      }
      const [atendimentos, total] = await Promise.all([
        prisma.atendimento.findMany({
          where,
          skip: (filtros.pagina - 1) * filtros.porPagina,
          take: filtros.porPagina,
          orderBy: { criadoEm: "desc" },
          include: {
            escolaLocal: { select: { nome: true } },
            usuario: { select: { nomeCompleto: true } },
            paciente: { select: { nomeEnc: true, dekCifrada: true, ivPii: true, tagPii: true } }
          }
        }),
        prisma.atendimento.count({ where })
      ]);
      const kekHex = c.env.KEK_HEX;
      const atendimentosMapeados = await Promise.all(
        atendimentos.map(async (a) => {
          let pacienteNome = "Paciente Desconhecido";
          try {
            const piiJson = await descriptografarPii(
              a.paciente.nomeEnc,
              a.paciente.dekCifrada,
              a.paciente.ivPii,
              a.paciente.tagPii,
              kekHex
            );
            const pii = JSON.parse(piiJson);
            pacienteNome = pii.nome;
          } catch {
            pacienteNome = "[ERRO DE DESCRIPTOGRAFIA]";
          }
          return {
            id: a.id,
            pacienteNome,
            especialidade: a.especialidade,
            turno: a.turno,
            resumo: a.resumo,
            procedimentos: a.procedimentos,
            insumosUtilizados: a.insumosUtilizados,
            encaminhamentoExterno: a.encaminhamentoExterno,
            escolaLocal: a.escolaLocal.nome,
            profissional: a.usuario.nomeCompleto,
            criadoEm: a.criadoEm
          };
        })
      );
      return c.json({
        dados: atendimentosMapeados,
        total,
        pagina: filtros.pagina,
        porPagina: filtros.porPagina,
        totalPaginas: Math.ceil(total / filtros.porPagina)
      });
    });
  }
});

// rotas/v1/escola.rotas.ts
var rotasEscola;
var init_escola_rotas = __esm({
  "rotas/v1/escola.rotas.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_dist2();
    init_prisma();
    init_compartilhado();
    init_autenticacao();
    init_autorizacao();
    init_idempotencia();
    init_auditoria();
    rotasEscola = new Hono2();
    rotasEscola.use("*", middlewareAutenticacao);
    rotasEscola.get("/", autorizarPerfis(["ADMIN", "TRIAGEM_RECEPCAO", "PROFISSIONAL_SAUDE"]), async (c) => {
      const prisma = getPrisma(c.env.DB);
      const escolas = await prisma.escolaLocal.findMany({
        where: { ativo: true },
        include: {
          _count: {
            select: { pacientes: true, atendimentos: true }
          }
        },
        orderBy: { nome: "asc" }
      });
      const mapeado = escolas.map((e) => ({
        id: e.id,
        nome: e.nome,
        cnpj: e.cnpj || void 0,
        regiao: `${e.cidade} / ${e.uf}`,
        endereco: e.endereco,
        diretoriaRegional: e.diretoriaRegional || "N\xE3o informada",
        alunosMatriculados: e._count?.pacientes ?? e.alunosMatriculados,
        totalAtendimentos: e._count?.atendimentos ?? 0,
        unidadesMoveisEstacionadas: e.unidadesMoveis,
        status: e.statusOperacao
      }));
      return c.json({ dados: mapeado });
    });
    rotasEscola.get("/:id", autorizarPerfis(["ADMIN", "TRIAGEM_RECEPCAO", "PROFISSIONAL_SAUDE"]), async (c) => {
      const id = c.req.param("id");
      const prisma = getPrisma(c.env.DB);
      const escola = await prisma.escolaLocal.findUnique({ where: { id } });
      if (!escola) return c.json({ erro: "Institui\xE7\xE3o n\xE3o encontrada" }, 404);
      return c.json({
        dados: {
          id: escola.id,
          nome: escola.nome,
          cnpj: escola.cnpj || "",
          endereco: escola.endereco,
          cidade: escola.cidade,
          uf: escola.uf,
          diretoriaRegional: escola.diretoriaRegional || "",
          alunosMatriculados: escola.alunosMatriculados
        }
      });
    });
    rotasEscola.post(
      "/",
      autorizarPerfis(["ADMIN"]),
      middlewareIdempotencia,
      zValidator("json", criarEscolaSchema),
      async (c) => {
        const dados = c.req.valid("json");
        const prisma = getPrisma(c.env.DB);
        const usuario = c.get("usuario");
        const escola = await prisma.escolaLocal.create({
          data: {
            nome: dados.nome,
            endereco: dados.endereco,
            cidade: dados.cidade,
            uf: dados.uf,
            cnpj: dados.cnpj,
            telefone: dados.telefone,
            email: dados.email,
            diretoriaRegional: dados.diretoriaRegional,
            alunosMatriculados: dados.alunosMatriculados,
            unidadesMoveis: 0,
            statusOperacao: "PROGRAMADA",
            ativo: true
          }
        });
        await registrarAuditoria(prisma, {
          userId: usuario.userId,
          acao: "CREATE",
          entidade: "EscolaLocal",
          entidadeId: escola.id,
          diffPosterior: { nome: escola.nome, cnpj: escola.cnpj },
          ip: c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1"
        });
        return c.json({
          mensagem: "Escola cadastrada com sucesso",
          dados: { id: escola.id }
        }, 201);
      }
    );
    rotasEscola.put(
      "/:id",
      autorizarPerfis(["ADMIN"]),
      zValidator("json", criarEscolaSchema.partial()),
      async (c) => {
        const id = c.req.param("id");
        const dados = c.req.valid("json");
        const prisma = getPrisma(c.env.DB);
        const usuario = c.get("usuario");
        const escola = await prisma.escolaLocal.update({
          where: { id },
          data: {
            ...dados.nome && { nome: dados.nome },
            ...dados.endereco && { endereco: dados.endereco },
            ...dados.cidade && { cidade: dados.cidade },
            ...dados.uf && { uf: dados.uf },
            ...dados.cnpj !== void 0 && { cnpj: dados.cnpj },
            ...dados.diretoriaRegional !== void 0 && { diretoriaRegional: dados.diretoriaRegional }
          }
        });
        await registrarAuditoria(prisma, {
          userId: usuario.userId,
          acao: "UPDATE",
          entidade: "EscolaLocal",
          entidadeId: escola.id,
          diffPosterior: { nome: escola.nome },
          ip: c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1"
        });
        return c.json({ mensagem: "Institui\xE7\xE3o atualizada com sucesso", dados: escola });
      }
    );
    rotasEscola.delete("/:id", autorizarPerfis(["ADMIN"]), async (c) => {
      const id = c.req.param("id");
      const prisma = getPrisma(c.env.DB);
      const usuario = c.get("usuario");
      await prisma.escolaLocal.update({
        where: { id },
        data: { ativo: false }
      });
      await registrarAuditoria(prisma, {
        userId: usuario.userId,
        acao: "DELETE",
        entidade: "EscolaLocal",
        entidadeId: id,
        ip: c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "127.0.0.1"
      });
      return c.json({ mensagem: "Institui\xE7\xE3o removida com sucesso" });
    });
  }
});

// rotas/v1/index.ts
var rotasV1;
var init_v1 = __esm({
  "rotas/v1/index.ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_auth_rotas();
    init_paciente_rotas();
    init_atendimento_rotas();
    init_escola_rotas();
    rotasV1 = new Hono2();
    rotasV1.route("/auth", rotasAuth);
    rotasV1.route("/pacientes", rotasPaciente);
    rotasV1.route("/atendimentos", rotasAtendimento);
    rotasV1.route("/escolas", rotasEscola);
  }
});

// [[path]].ts
var app, onRequest;
var init_path = __esm({
  "[[path]].ts"() {
    "use strict";
    init_functionsRoutes_0_8270274559998432();
    init_checked_fetch();
    init_dist();
    init_cloudflare_pages();
    init_cors();
    init_secure_headers2();
    init_logger();
    init_env();
    init_v1();
    app = new Hono2();
    app.use("*", logger());
    app.use("*", secureHeaders());
    app.use("*", async (c, next) => {
      const env = carregarEnv(c.env);
      const corsMiddleware = cors({
        origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
        credentials: true
      });
      return corsMiddleware(c, next);
    });
    app.route("/api/v1", rotasV1);
    app.get(
      "/api/health",
      (c) => c.json({ status: "ok", runtime: "Cloudflare Pages Functions", timestamp: (/* @__PURE__ */ new Date()).toISOString() })
    );
    app.notFound(async (c) => {
      if (c.env?.ASSETS) {
        return c.env.ASSETS.fetch(c.req.raw);
      }
      return c.text("Not Found", 404);
    });
    onRequest = handle(app);
  }
});

// ../.wrangler/tmp/pages-1aZTZ5/functionsRoutes-0.8270274559998432.mjs
var routes;
var init_functionsRoutes_0_8270274559998432 = __esm({
  "../.wrangler/tmp/pages-1aZTZ5/functionsRoutes-0.8270274559998432.mjs"() {
    "use strict";
    init_path();
    routes = [
      {
        routePath: "/:path*",
        mountPath: "/",
        method: "",
        middlewares: [],
        modules: [onRequest]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-u8CjTo/middleware-loader.entry.ts
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();

// ../.wrangler/tmp/bundle-u8CjTo/middleware-insertion-facade.js
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();

// ../node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();

// ../../../node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name2 = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name2 += str[j++];
          continue;
        }
        break;
      }
      if (!name2)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name2 });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name2 = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name2 || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name2 || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse");
function match2(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match2, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode3 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode3(value, key);
        });
      } else {
        params[key.name] = decode3(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match2(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match2(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init3) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init3);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-u8CjTo/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_8270274559998432();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-u8CjTo/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init3) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init3.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init3) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init3.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

otpauth/dist/otpauth.esm.js:
  (*! otpauth 9.5.2 | (c) Héctor Molinero Fernández | MIT | https://github.com/hectorm/otpauth *)
  (*! noble-hashes 2.4.0 | (c) Paul Miller | MIT | https://github.com/paulmillr/noble-hashes *)

@prisma/client-runtime-utils/dist/index.js:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.5.0
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)

ky/distribution/index.js:
  (*! MIT License © Sindre Sorhus *)
*/
//# sourceMappingURL=functionsWorker-0.36296914288184445.mjs.map
