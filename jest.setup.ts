import "@testing-library/jest-dom";

// Existing product tests use Korean; language tests override this explicitly.
Object.defineProperty(navigator, "languages", {
  configurable: true,
  value: ["ko-KR"],
});
