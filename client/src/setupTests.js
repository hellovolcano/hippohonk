// jest-dom adds custom matchers for asserting on DOM nodes, e.g.
// expect(element).toHaveTextContent(/react/i) — see
// https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom (the test environment) has no fetch implementation. A lot of
// components fetch data in a useEffect on mount (auth check, band lists,
// etc.) — without a stub, any test that renders them throws
// "fetch is not defined" instead of whatever it was actually testing.
// Individual tests can still override this with their own mock per-call.
if (!global.fetch) {
  global.fetch = () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
      text: () => Promise.resolve(''),
    });
}
